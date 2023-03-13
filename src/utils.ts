import os from 'os';
import path from 'path';
import { isMainThread, threadId } from 'worker_threads';
import type {
  SdkInfo,
  SdkMetadata,
  DynamicSamplingContext,
  DsnComponents,
  Event,
  EventItem,
  EventEnvelope,
  EventEnvelopeHeaders
} from '@sentry/types';

import { createEnvelope, dropUndefinedKeys, dsnToString, uuid4, logger } from '@sentry/utils';
import type { ThreadCpuProfile, RawThreadCpuProfile } from './cpu_profiler';
import { isDebugBuild } from './env';

// We require the file because if we import it, it will be included in the bundle.
// I guess tsc does not check file contents when it's imported.
// eslint-disable-next-line
const { root_directory } = require('./../root.js');

const THREAD_ID_STRING = String(threadId);
const THREAD_NAME = isMainThread ? 'main' : 'worker';

// Machine properties (eval only once)
const PLATFORM = os.platform();
const RELEASE = os.release();
const VERSION = os.version();
const TYPE = os.type();
const MODEL = os.machine ? os.machine() : os.arch();
const ARCH = os.arch();
export interface Profile {
  event_id: string;
  version: string;
  os: {
    name: string;
    version: string;
    build_number: string;
  };
  runtime: {
    name: string;
    version: string;
  };
  device: {
    architecture: string;
    is_emulator: boolean;
    locale: string;
    manufacturer: string;
    model: string;
  };
  timestamp: string;
  release: string;
  environment: string;
  platform: string;
  profile: ThreadCpuProfile;
  debug_meta?: {
    images: {
      debug_id: string;
      image_addr: string;
      code_file: string;
      type: string;
      image_size: number;
      image_vmaddr: string;
    }[];
  };
  transaction: {
    name: string;
    id: string;
    trace_id: string;
    active_thread_id: string;
  };
}

function isRawThreadCpuProfile(profile: ThreadCpuProfile | RawThreadCpuProfile): profile is RawThreadCpuProfile {
  return !('thread_metadata' in profile);
}

// Enriches the profile with threadId of the current thread.
// This is done in node as we seem to not be able to get the info from C native code.
export function enrichWithThreadInformation(profile: ThreadCpuProfile | RawThreadCpuProfile): ThreadCpuProfile {
  if (!isRawThreadCpuProfile(profile)) {
    return profile;
  }

  return {
    samples: profile.samples,
    frames: profile.frames,
    stacks: profile.stacks,
    thread_metadata: {
      [THREAD_ID_STRING]: {
        name: THREAD_NAME
      }
    }
  };
}

// Profile is marked as optional because it is deleted from the metadata
// by the integration before the event is processed by other integrations.
export interface ProfiledEvent extends Event {
  sdkProcessingMetadata: {
    profile?: RawThreadCpuProfile;
  };
}

/** Extract sdk info from from the API metadata */
function getSdkMetadataForEnvelopeHeader(metadata?: SdkMetadata): SdkInfo | undefined {
  if (!metadata || !metadata.sdk) {
    return undefined;
  }

  return { name: metadata.sdk.name, version: metadata.sdk.version } as SdkInfo;
}

/**
 * Apply SdkInfo (name, version, packages, integrations) to the corresponding event key.
 * Merge with existing data if any.
 **/
function enhanceEventWithSdkInfo(event: Event, sdkInfo?: SdkInfo): Event {
  if (!sdkInfo) {
    return event;
  }
  event.sdk = event.sdk || {};
  event.sdk.name = (event.sdk.name || sdkInfo.name) ?? 'unknown sdk';
  event.sdk.version = (event.sdk.version || sdkInfo.version) ?? 'unknown sdk version';
  event.sdk.integrations = [...(event.sdk.integrations || []), ...(sdkInfo.integrations || [])];
  event.sdk.packages = [...(event.sdk.packages || []), ...(sdkInfo.packages || [])];
  return event;
}

function createEventEnvelopeHeaders(
  event: Event,
  sdkInfo: SdkInfo | undefined,
  tunnel: string | undefined,
  dsn: DsnComponents
): EventEnvelopeHeaders {
  const dynamicSamplingContext = event.sdkProcessingMetadata && event.sdkProcessingMetadata['dynamicSamplingContext'];

  return {
    event_id: event.event_id as string,
    sent_at: new Date().toISOString(),
    ...(sdkInfo && { sdk: sdkInfo }),
    ...(!!tunnel && { dsn: dsnToString(dsn) }),
    ...(event.type === 'transaction' &&
      dynamicSamplingContext && {
        trace: dropUndefinedKeys({ ...dynamicSamplingContext }) as DynamicSamplingContext
      })
  };
}

/**
 * Creates a profiling event envelope from a Sentry event. If profile does not pass
 * validation, returns null.
 * @param event
 * @param dsn
 * @param metadata
 * @param tunnel
 * @returns {Profile | null}
 */
export function createProfilingEvent(event: ProfiledEvent): Profile | null {
  if (event.type !== 'transaction') {
    // createProfilingEventEnvelope should only be called for transactions,
    // we type guard this behavior with isProfiledTransactionEvent.
    throw new TypeError('Profiling events may only be attached to transactions, this should never occur.');
  }

  const rawProfile = event.sdkProcessingMetadata['profile'];

  if (rawProfile === undefined || rawProfile === null) {
    throw new TypeError(
      `Cannot construct profiling event envelope without a valid profile. Got ${rawProfile} instead.`
    );
  }

  if (!rawProfile.profile_id) {
    throw new TypeError('Profile is missing profile_id');
  }

  if (rawProfile.samples.length <= 1) {
    if (isDebugBuild()) {
      // Log a warning if the profile has less than 2 samples so users can know why
      // they are not seeing any profiling data and we cant avoid the back and forth
      // of asking them to provide us with a dump of the profile data.
      logger.log('[Profiling] Discarding profile because it contains less than 2 samples');
    }
    return null;
  }

  const enrichedThreadProfile = enrichWithThreadInformation(rawProfile);
  const transactionStartMs = typeof event.start_timestamp === 'number' ? event.start_timestamp * 1000 : Date.now();

  const traceId = (event?.contexts?.['trace']?.['trace_id'] as string) ?? '';
  // Log a warning if the profile has an invalid traceId (should be uuidv4).
  // All profiles and transactions are rejected if this is the case and we want to
  // warn users that this is happening if they enable debug flag
  if (traceId.length !== 32) {
    if (isDebugBuild()) {
      logger.log('[Profiling] Invalid traceId: ' + traceId + ' on profiled event');
    }
  }

  const profile: Profile = {
    event_id: rawProfile.profile_id,
    timestamp: new Date(transactionStartMs).toISOString(),
    platform: 'node',
    version: '1',
    release: event.release || '',
    environment: event.environment || '',
    runtime: {
      name: 'node',
      version: process.versions.node || ''
    },
    os: {
      name: PLATFORM,
      version: RELEASE,
      build_number: VERSION
    },
    device: {
      locale:
        (process.env['LC_ALL'] || process.env['LC_MESSAGES'] || process.env['LANG'] || process.env['LANGUAGE']) ?? '',
      model: MODEL,
      manufacturer: TYPE,
      architecture: ARCH,
      is_emulator: false
    },
    profile: enrichedThreadProfile,
    transaction: {
      name: event.transaction || '',
      id: event.event_id || uuid4(),
      trace_id: traceId,
      active_thread_id: THREAD_ID_STRING
    }
  };

  return profile;
}

/**
 * Creates an envelope from a profiling event.
 * @param event Profile
 * @param dsn
 * @param metadata
 * @param tunnel
 * @returns
 */
export function createProfilingEventEnvelope(
  event: ProfiledEvent,
  dsn: DsnComponents,
  metadata?: SdkMetadata,
  tunnel?: string
): EventEnvelope | null {
  const sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
  enhanceEventWithSdkInfo(event, metadata && metadata.sdk);

  const envelopeHeaders = createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn);
  const envelopeItem: EventItem = [
    {
      type: 'profile'
    },
    // @ts-expect-error profile is not yet a type in @sentry/types
    profile
  ];

  return createEnvelope<EventEnvelope>(envelopeHeaders, [envelopeItem]);
}

export function isProfiledTransactionEvent(event: Event): event is ProfiledEvent {
  return !!(event.sdkProcessingMetadata && event.sdkProcessingMetadata['profile']);
}

// Due to how profiles are attached to event metadata, we may sometimes want to remove them to ensure
// they are not processed by other Sentry integrations. This can be the case when we cannot construct a valid
// profile from the data we have or some of the mechanisms to send the event (Hub, Transport etc) are not available to us.
export function maybeRemoveProfileFromSdkMetadata(event: Event | ProfiledEvent): Event {
  if (!isProfiledTransactionEvent(event)) {
    return event;
  }

  delete event.sdkProcessingMetadata['profile'];
  return event;
}

// Requires the root.js file which exports __dirname, this is then forwarded to our native
// addon where we remove the absolute path from each frame to generate a project relatvie filename
export function getProjectRootDirectory(): string | null {
  const components = path.resolve(root_directory).split('/node_modules');
  return components?.[0] ?? null;
}

/**
 * Checks the given sample rate to make sure it is valid type and value (a boolean, or a number between 0 and 1).
 */
export function isValidSampleRate(rate: unknown): boolean {
  // we need to check NaN explicitly because it's of type 'number' and therefore wouldn't get caught by this typecheck
  if ((typeof rate !== 'number' && typeof rate !== 'boolean') || (typeof rate === 'number' && isNaN(rate))) {
    if (isDebugBuild()) {
      logger.warn(
        `[Profiling] Invalid sample rate. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(
          rate
        )} of type ${JSON.stringify(typeof rate)}.`
      );
    }
    return false;
  }

  // in case sampleRate is a boolean, it will get automatically cast to 1 if it's true and 0 if it's false
  if (rate < 0 || rate > 1) {
    if (isDebugBuild()) {
      logger.warn(`[Profiling] Invalid sample rate. Sample rate must be between 0 and 1. Got ${rate}.`);
    }
    return false;
  }
  return true;
}
