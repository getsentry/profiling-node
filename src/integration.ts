import type { NodeClient } from '@sentry/node';
import type { Integration, EventProcessor, Hub, Event, Transaction } from '@sentry/types';

import { logger } from '@sentry/utils';
import { isDebugBuild } from './env';
import { addProfilingExtensionMethods, maybeProfileTransaction, stopTransactionProfile, MAX_PROFILE_DURATION_MS } from './hubextensions';

import type { RawThreadCpuProfile } from './cpu_profiler';
import { Profile, addProfilesToEnvelope } from './utils';
import {
  maybeRemoveProfileFromSdkMetadata,
  createProfilingEventEnvelope,
  createProfilingEvent,
  isProfiledTransactionEvent,
  findProfiledTransactionsFromEnvelope
} from './utils';

const MAX_PROFILE_QUEUE_LENGTH = 50;
const PROFILE_QUEUE: RawThreadCpuProfile[] = [];
const PROFILE_TIMEOUTS: Record<string, NodeJS.Timeout> = {};

function addToProfileQueue(profile: RawThreadCpuProfile): void {
  PROFILE_QUEUE.push(profile);

  // We only want to keep the last n profiles in the queue.
  if (PROFILE_QUEUE.length > MAX_PROFILE_QUEUE_LENGTH) {
    PROFILE_QUEUE.shift();
  }
}

// We need this integration in order to actually send data to Sentry. We hook into the event processor
// and inspect each event to see if it is a transaction event and if that transaction event
// contains a profile on it's metadata. If that is the case, we create a profiling event envelope
// and delete the profile from the transaction metadata.
export class ProfilingIntegration implements Integration {
  name = 'ProfilingIntegration';
  getCurrentHub?: () => Hub = undefined;

  setupOnce(addGlobalEventProcessor: (callback: EventProcessor) => void, getCurrentHub: () => Hub): void {
    this.getCurrentHub = getCurrentHub;
    const client = this.getCurrentHub().getClient() as NodeClient;

    if (client && typeof client.on === 'function') {
      client.on('startTransaction', (transaction: Transaction) => {
        const profile_id = maybeProfileTransaction(client, transaction, undefined);

        if (profile_id) {
          const options = client.getOptions();
          // Not intended for external use, hence missing types, but we want to profile a couple of things at Sentry that
          // currently exceed the default timeout set by the SDKs.
          const maxProfileDurationMs =
            // @ts-expect-error maxProfileDurationMs is not intended for external use
            (options._experiments && options._experiments.maxProfileDurationMs) || MAX_PROFILE_DURATION_MS;

          // Enqueue a timeout to prevent profiles from running over max duration.
          if (PROFILE_TIMEOUTS[profile_id]) {
            global.clearTimeout(PROFILE_TIMEOUTS[profile_id]);
            delete PROFILE_TIMEOUTS[profile_id];
          }

          PROFILE_TIMEOUTS[profile_id] = global.setTimeout(() => {
            if (isDebugBuild()) {
              logger.log('[Profiling] max profile duration elapsed, stopping profiling for:', transaction.name);
            }

            const profile = stopTransactionProfile(transaction, profile_id);
            if (profile) {
              addToProfileQueue(profile);
            }
          }, maxProfileDurationMs);

          transaction.setContext('profile', { profile_id });
          // @ts-expect-error profile is not part of txn metadata
          transaction.setMetadata({ profile_id: profile_id });
        }
      });

      client.on('finishTransaction', (transaction) => {
        // @ts-expect-error profile is not part of txn metadata)
        const profile_id = transaction && transaction.metadata && transaction.metadata.profile_id;
        if (profile_id) {
          if (PROFILE_TIMEOUTS[profile_id]) {
            global.clearTimeout(PROFILE_TIMEOUTS[profile_id]);
            delete PROFILE_TIMEOUTS[profile_id];
          }
          const profile = stopTransactionProfile(transaction, profile_id);

          if (profile) {
            addToProfileQueue(profile);
          }
        }
      });

      client.on('beforeEnvelope', (envelope): void => {
        // if not profiles are in queue, there is nothing to add to the envelope.
        if (!PROFILE_QUEUE.length) {
          return;
        }

        const profiledTransactionEvents = findProfiledTransactionsFromEnvelope(envelope);
        if (!profiledTransactionEvents.length) {
          return;
        }

        const profilesToAddToEnvelope: Profile[] = [];

        for (let i = 0; i < profiledTransactionEvents.length; i++) {
          const profiledTransaction = profiledTransactionEvents[i];
          const profile_id = profiledTransaction?.contexts?.['profile']?.['profile_id'];

          if (!profile_id) {
            throw new TypeError('[Profiling] cannot find profile for a transaction without a profile context');
          }

          // We need to find both a profile and a transaction event for the same profile_id.
          const profileIndex = PROFILE_QUEUE.findIndex((p) => p.profile_id === profile_id);
          if (profileIndex === -1) {
            if (isDebugBuild()) {
              logger.log(`[Profiling] Could not retrieve profile for transaction: ${profile_id}`);
            }
            continue;
          }

          const cpuProfile = PROFILE_QUEUE[profileIndex];
          if (!cpuProfile) {
            if (isDebugBuild()) {
              logger.log(`[Profiling] Could not retrieve profile for transaction: ${profile_id}`);
            }
            continue;
          }

          // Remove the profile from the queue.
          PROFILE_QUEUE.splice(profileIndex, 1);
          const profile = createProfilingEvent(cpuProfile, profiledTransaction);

          if (profile) {
            profilesToAddToEnvelope.push(profile);
          }
        }

        addProfilesToEnvelope(envelope, profilesToAddToEnvelope);
      });
    } else {
      // Patch the carrier methods and add the event processor.
      addProfilingExtensionMethods();
      addGlobalEventProcessor(this.handleGlobalEvent.bind(this));
    }
  }

  handleGlobalEvent(event: Event): Event {
    if (this.getCurrentHub === undefined) {
      return maybeRemoveProfileFromSdkMetadata(event);
    }

    if (isProfiledTransactionEvent(event)) {
      // Client, Dsn and Transport are all required to be able to send the profiling event to Sentry.
      // If either of them is not available, we remove the profile from the transaction event.
      // and forward it to the next event processor.
      const hub = this.getCurrentHub();
      const client = hub.getClient();
      if (!client) {
        if (isDebugBuild()) {
          logger.log(
            '[Profiling] getClient did not return a Client, removing profile from event and forwarding to next event processors.'
          );
        }
        return maybeRemoveProfileFromSdkMetadata(event);
      }

      const dsn = client.getDsn();
      if (!dsn) {
        if (isDebugBuild()) {
          logger.log(
            '[Profiling] getDsn did not return a Dsn, removing profile from event and forwarding to next event processors.'
          );
        }
        return maybeRemoveProfileFromSdkMetadata(event);
      }

      const transport = client.getTransport();
      if (!transport) {
        if (isDebugBuild()) {
          logger.log(
            '[Profiling] getTransport did not return a Transport, removing profile from event and forwarding to next event processors.'
          );
        }
        return maybeRemoveProfileFromSdkMetadata(event);
      }

      // If all required components are available, we construct a profiling event envelope and send it to Sentry.
      if (isDebugBuild()) {
        logger.log('[Profiling] Preparing envelope and sending a profiling event');
      }
      const envelope = createProfilingEventEnvelope(event, dsn);

      if (envelope) {
        transport.send(envelope);
      }
    }

    // Ensure sdkProcessingMetadata["profile"] is removed from the event before forwarding it to the next event processor.
    return maybeRemoveProfileFromSdkMetadata(event);
  }
}
