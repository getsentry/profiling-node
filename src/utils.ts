import os from 'os';
import { threadId } from 'worker_threads';
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
import type { ThreadCpuProfile } from './cpu_profiler';

export interface Profile<T extends ThreadCpuProfile | ProcessedThreadCpuProfile> {
  platform: string;
  profile_id: string;
  profile: [T, unknown];
  device_locale: string;
  device_manufacturer: string;
  device_model: string;
  device_os_name: string;
  device_os_version: string;
  device_is_emulator: false;
  transaction_name: string;
  duration_ns: string;
  environment: string;
  version_code: string;
  version_name: string;
  trace_id: string;
  transaction_id: string;
}

export interface ProcessedThreadCpuProfile extends ThreadCpuProfile {
  duration_ns: number;
  thread_id: number;
}

function isProcessedThreadCpuProfile(
  profile: ThreadCpuProfile | ProcessedThreadCpuProfile
): profile is ProcessedThreadCpuProfile {
  return !!(profile as ProcessedThreadCpuProfile)?.thread_id;
}

// Enriches the profile with threadId of the current thread.
// This is done in node as we seem to not be able to get the info from C native code.
export function enrichWithThreadId(profile: ThreadCpuProfile): ProcessedThreadCpuProfile {
  if (isProcessedThreadCpuProfile(profile)) {
    return profile;
  }

  profile.thread_id = threadId;
  return profile as ProcessedThreadCpuProfile;
}

// Profile is marked as optional because it is deleted from the metadata
// by the integration before the event is processed by other integrations.
export interface ProfiledEvent extends Event {
  sdkProcessingMetadata: {
    profile?: ThreadCpuProfile;
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

  if (rawProfile === undefined || rawProfile === null) {
    throw new TypeError(
      `Cannot construct profiling event envelope without a valid profile. Got ${rawProfile} instead.`
    );
  }

  enhanceEventWithSdkInfo(event, metadata && metadata.sdk);
  const envelopeHeaders = createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn);
  const enrichedThreadProfile = enrichWithThreadId(rawProfile);

  const profile: Profile<ProcessedThreadCpuProfile> = {
    platform: 'typescript',
    profile_id: uuid4(),
    profile: [enrichedThreadProfile, {}],
    device_locale:
      (process.env['LC_ALL'] || process.env['LC_MESSAGES'] || process.env['LANG'] || process.env['LANGUAGE']) ??
      'unknown locale',
    device_manufacturer: os.type(),
    device_model: os.arch(),
    device_os_name: os.platform(),
    device_os_version: os.release(),
    device_is_emulator: false,
    environment: process.env['NODE_ENV'] ?? 'unknown environment',
    transaction_name: event.transaction ?? 'unknown transaction',
    duration_ns: `${rawProfile.duration_ns}`,
    version_code: sdkInfo?.version ?? 'unknown version',
    version_name: sdkInfo?.name ?? 'unknown name',
    trace_id: envelopeHeaders.trace?.trace_id ?? 'unknown trace id',
    transaction_id: envelopeHeaders.event_id
  };

  const envelopeItem: EventItem = [
    {
      // @ts-expect-error profile is not yet a type in @sentry/types
      type: 'profile'
    },
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
