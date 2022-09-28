import os from 'os';
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

import { createEnvelope, dropUndefinedKeys, dsnToString, uuid4 } from '@sentry/utils';
import type { ThreadCpuProfile, RawThreadCpuProfile } from './cpu_profiler';

const THREAD_ID_STRING = String(threadId);
const THREAD_NAME = isMainThread ? 'main' : 'worker';

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
  transactions?: {
    name: string;
    trace_id: string;
    id: string;
    active_thread_id: string;
    relative_start_ns: string;
    relative_end_ns: string;
  }[];
}

function isRawThreadCpuProfile(profile: ThreadCpuProfile | RawThreadCpuProfile): profile is RawThreadCpuProfile {
  return 'profile_start_ms' in profile && 'profile_end_ms' in profile;
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

export function createProfilingEventEnvelope(
  event: ProfiledEvent,
  dsn: DsnComponents,
  metadata?: SdkMetadata,
  tunnel?: string
): EventEnvelope {
  const sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
  const rawProfile = event.sdkProcessingMetadata['profile'];

  if (event.type !== 'transaction') {
    // createProfilingEventEnvelope should only be called for transactions,
    // we type guard this behavior with isProfiledTransactionEvent.
    throw new TypeError('Profiling events may only be attached to transactions, this should never occur.');
  }

  if (rawProfile === undefined || rawProfile === null) {
    throw new TypeError(
      `Cannot construct profiling event envelope without a valid profile. Got ${rawProfile} instead.`
    );
  }

  enhanceEventWithSdkInfo(event, metadata && metadata.sdk);
  const envelopeHeaders = createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn);
  const enrichedThreadProfile = enrichWithThreadInformation(rawProfile);
  const transactionStartMs = typeof event.start_timestamp === 'number' ? event.start_timestamp * 1000 : Date.now();
  const transactionEndMs = typeof event.timestamp === 'number' ? event.timestamp * 1000 : Date.now();

  const profile: Profile = {
    event_id: uuid4(),
    timestamp: new Date(transactionStartMs).toISOString(),
    platform: 'node',
    version: '1',
    release: event.sdk?.version || 'unknown',
    runtime: {
      name: 'node',
      version: process.versions.node
    },
    os: {
      name: os.platform(),
      version: os.release(),
      build_number: os.version()
    },
    device: {
      locale:
        (process.env['LC_ALL'] || process.env['LC_MESSAGES'] || process.env['LANG'] || process.env['LANGUAGE']) ??
        'unknown locale',
      // os.machine is new in node18
      model: os.machine ? os.machine() : os.arch(),
      manufacturer: os.type(),
      architecture: os.arch(),
      is_emulator: false
    },
    profile: enrichedThreadProfile,
    transactions: [
      {
        name: event.transaction ?? '',
        id: event.event_id ?? uuid4(),
        trace_id: (event?.contexts?.['trace']?.['trace_id'] as string) ?? '',
        active_thread_id: THREAD_ID_STRING,
        // relative_start_ns and relative_end_ns values are not accurate. In real world, a transaction is started after
        // the profiling is started and there is some delay (hopefully small). V8 does not expose a ts format, we instead get elapsed time
        // from some unspecified point in time when we call profile->getStartTime(). We fallback to transaction start and end, but
        // essentially loose visibility into how much of a delay there is between the profiler start/stop
        // and transaction start/finish. This should be fine for now, but it should be improved so that we keep that information.
        relative_start_ns: '0',
        relative_end_ns: ((transactionEndMs - transactionStartMs) * 1e6).toFixed(0)
      }
    ]
  };

  const envelopeItem: EventItem = [
    {
      // @ts-expect-error profile is not yet a type in @sentry/types
      type: 'profile'
    },
    // @ts-expect-error profile is not yet a type in @sentry/types
    profile
  ];

  return createEnvelope<EventEnvelope>(envelopeHeaders, [envelopeItem]);
}

export function isProfiledTransactionEvent(event: Event): event is ProfiledEvent {
  return !!(
    event.sdkProcessingMetadata &&
    'profile' in event.sdkProcessingMetadata &&
    event.sdkProcessingMetadata['profile'] !== undefined
  );
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
