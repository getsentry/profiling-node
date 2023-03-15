import type { NodeClient } from '@sentry/node';
import type { Integration, EventProcessor, Hub, Event, Transaction } from '@sentry/types';

import { logger, addItemToEnvelope } from '@sentry/utils';
import { isDebugBuild } from './env';
import { addProfilingExtensionMethods, maybeProfileTransaction, stopTransactionProfile } from './hubextensions';
import {
  maybeRemoveProfileFromSdkMetadata,
  createProfilingEvent,
  createProfilingEventEnvelope,
  isProfiledTransactionEvent
} from './utils';

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
          transaction.setContext('profile', { profile_id });
          // @ts-expect-error profile_id is not part of transaction types
          transaction.setMetadata({ profile_id });
        }
      });

      client.on('finishTransaction', (transaction) => {
        // @ts-expect-error profile_id is
        const profile_id = transaction && transaction.metadata && transaction.metadata.profile_id;
        if (profile_id) {
          const profile = stopTransactionProfile(transaction, profile_id);
          // @ts-expect-error profile is not allowed on transaction metadata
          transaction.setMetadata({ profile });
        }
      });

      client.on('beforeEnvelope', (envelope) => {
        // @ts-expect-error profile_id is
        const profiledEvent = createProfilingEvent({});
        if (profiledEvent) {
          // @ts-expect-error profile_id is
          void addItemToEnvelope(envelope, profiledEvent);
        }
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
