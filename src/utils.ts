import { path as root_directory } from 'app-root-path';
import * as os from 'os';
import { resolve } from 'path';
import { versions, env } from 'process';
import { isMainThread, threadId } from 'worker_threads';
import type {
  SdkInfo,
  SdkMetadata,
  StackParser,
  StackFrame,
  DynamicSamplingContext,
  DsnComponents,
  Event,
  EventItem,
  Envelope,
  EventEnvelope,
  EventEnvelopeHeaders
} from '@sentry/types';

import * as Sentry from '@sentry/node';
import { GLOBAL_OBJ, createEnvelope, dropUndefinedKeys, dsnToString, logger, forEachEnvelopeItem } from '@sentry/utils';

import type { ThreadCpuProfile, RawThreadCpuProfile } from './cpu_profiler';
import { isDebugBuild } from './env';

// We require the file because if we import it, it will be included in the bundle.
// I guess tsc does not check file contents when it's imported.
// eslint-disable-next-line
const THREAD_ID_STRING = String(threadId);
const THREAD_NAME = isMainThread ? 'main' : 'worker';
const FORMAT_VERSION = '1';

// Machine properties (eval only once)
const PLATFORM = os.platform();
const RELEASE = os.release();
const VERSION = os.version();
const TYPE = os.type();
const MODEL = os.machine ? os.machine() : os.arch();
const ARCH = os.arch();

interface DebugImage {
  code_file: string;
  type: string;
  debug_id: string;
  image_addr?: string;
  image_size?: number;
  image_vmaddr?: string;
}

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
    images: DebugImage[];
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
 * @returns {Profile | null}
 */
export function createProfilingEventFromTransaction(event: ProfiledEvent): Profile | null {
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
    throw new TypeError(
      `Cannot construct profiling event envelope without a valid profile id. Got ${rawProfile.profile_id} instead.`
    );
  }

  if (!isValidProfile(rawProfile)) {
    return null;
  }

  return createProfilePayload(rawProfile, {
    release: event.release || '',
    environment: event.environment || '',
    event_id: event.event_id || '',
    transaction: event.transaction || '',
    start_timestamp: event.start_timestamp ? event.start_timestamp * 1000 : Date.now(),
    // @ts-expect-error trace id is unknown
    trace_id: event?.contexts?.trace?.trace_id ?? '',
    profile_id: rawProfile.profile_id
  });
}

/**
 * Creates a profiling envelope item, if the profile does not pass validation, returns null.
 * @param event
 * @returns {Profile | null}
 */
export function createProfilingEvent(profile: RawThreadCpuProfile, event: Event): Profile | null {
  if (!isValidProfile(profile)) {
    return null;
  }

  return createProfilePayload(profile, {
    release: event.release || '',
    environment: event.environment || '',
    event_id: event.event_id || '',
    transaction: event.transaction || '',
    start_timestamp: event.start_timestamp ? event.start_timestamp * 1000 : Date.now(),
    // @ts-expect-error accessing private property
    trace_id: event?.contexts?.trace?.trace_id ?? '',
    profile_id: profile.profile_id
  });
}

/**
 * Create a profile
 * @param profile
 * @param options
 * @returns
 */
function createProfilePayload(
  cpuProfile: RawThreadCpuProfile,
  {
    release,
    environment,
    event_id,
    transaction,
    start_timestamp,
    trace_id,
    profile_id
  }: {
    release: string;
    environment: string;
    event_id: string;
    transaction: string;
    start_timestamp: number;
    trace_id: string | undefined;
    profile_id: string;
  }
): Profile {
  // Log a warning if the profile has an invalid traceId (should be uuidv4).
  // All profiles and transactions are rejected if this is the case and we want to
  // warn users that this is happening if they enable debug flag
  if (trace_id && trace_id.length !== 32) {
    if (isDebugBuild()) {
      logger.log('[Profiling] Invalid traceId: ' + trace_id + ' on profiled event');
    }
  }

  const enrichedThreadProfile = enrichWithThreadInformation(cpuProfile);

  const profile: Profile = {
    event_id: profile_id,
    timestamp: new Date(start_timestamp).toISOString(),
    platform: 'node',
    version: FORMAT_VERSION,
    release: release,
    environment: environment,
    runtime: {
      name: 'node',
      version: versions.node || ''
    },
    os: {
      name: PLATFORM,
      version: RELEASE,
      build_number: VERSION
    },
    device: {
      locale: (env['LC_ALL'] || env['LC_MESSAGES'] || env['LANG'] || env['LANGUAGE']) ?? '',
      model: MODEL,
      manufacturer: TYPE,
      architecture: ARCH,
      is_emulator: false
    },
    debug_meta: {
      images: applyDebugMetadata(cpuProfile.resources)
    },
    profile: enrichedThreadProfile,
    transaction: {
      name: transaction,
      id: event_id,
      trace_id: trace_id || '',
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
  const profile = createProfilingEventFromTransaction(event);

  if (!profile) {
    return null;
  }

  const envelopeItem: EventItem = [
    {
      type: 'profile'
    },
    // @ts-expect-error profile is not part of EventItem yet
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

export function getProjectRootDirectory(): string | null {
  const components = resolve(root_directory).split('/node_modules');
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

  // Boolean sample rates are always valid
  if (rate === true || rate === false) {
    return true;
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

export function isValidProfile(profile: RawThreadCpuProfile): profile is RawThreadCpuProfile & { profile_id: string } {
  if (profile.samples.length <= 1) {
    if (isDebugBuild()) {
      // Log a warning if the profile has less than 2 samples so users can know why
      // they are not seeing any profiling data and we cant avoid the back and forth
      // of asking them to provide us with a dump of the profile data.
      logger.log('[Profiling] Discarding profile because it contains less than 2 samples');
    }
    return false;
  }

  if (!profile.profile_id) {
    return false;
  }

  return true;
}

/**
 * Adds items to envelope if they are not already present - mutates the envelope.
 * @param envelope
 */
export function addProfilesToEnvelope(envelope: Envelope, profiles: Profile[]): Envelope {
  if (!profiles.length) {
    return envelope;
  }

  for (const profile of profiles) {
    // @ts-expect-error untyped envelope
    envelope[1].push([{ type: 'profile' }, profile]);
  }
  return envelope;
}

/**
 * Finds transactions with profile_id context in the envelope
 * @param envelope
 * @returns
 */
export function findProfiledTransactionsFromEnvelope(envelope: Envelope): Event[] {
  const events: Event[] = [];

  forEachEnvelopeItem(envelope, (item, type) => {
    if (type !== 'transaction') {
      return;
    }

    // First item is the type
    for (let j = 1; j < item.length; j++) {
      const event = item[j];

      // @ts-expect-error accessing private property
      if (event && event.contexts && event.contexts['profile'] && event.contexts['profile']['profile_id']) {
        events.push(item[j] as Event);
      }
    }
  });

  return events;
}

const debugIdStackParserCache = new WeakMap<StackParser, Map<string, StackFrame[]>>();
export function applyDebugMetadata(resource_paths: ReadonlyArray<string>): DebugImage[] {
  const debugIdMap = GLOBAL_OBJ._sentryDebugIds;

  if (!debugIdMap) {
    return [];
  }

  const stackParser = Sentry.getCurrentHub?.()?.getClient()?.getOptions()?.stackParser;

  if (!stackParser) {
    return [];
  }

  let debugIdStackFramesCache: Map<string, StackFrame[]>;
  const cachedDebugIdStackFrameCache = debugIdStackParserCache.get(stackParser);
  if (cachedDebugIdStackFrameCache) {
    debugIdStackFramesCache = cachedDebugIdStackFrameCache;
  } else {
    debugIdStackFramesCache = new Map<string, StackFrame[]>();
    debugIdStackParserCache.set(stackParser, debugIdStackFramesCache);
  }

  // Build a map of filename -> debug_id
  const filenameDebugIdMap = Object.keys(debugIdMap).reduce<Record<string, string>>((acc, debugIdStackTrace) => {
    let parsedStack: StackFrame[];

    const cachedParsedStack = debugIdStackFramesCache.get(debugIdStackTrace);
    if (cachedParsedStack) {
      parsedStack = cachedParsedStack;
    } else {
      parsedStack = stackParser(debugIdStackTrace);
      debugIdStackFramesCache.set(debugIdStackTrace, parsedStack);
    }

    for (let i = parsedStack.length - 1; i >= 0; i--) {
      const stackFrame = parsedStack[i];
      const file = stackFrame?.filename;

      if (stackFrame && file) {
        acc[file] = debugIdMap[debugIdStackTrace] as string;
        break;
      }
    }
    return acc;
  }, {});

  const images: DebugImage[] = [];

  for (let i = 0; i < resource_paths.length; i++) {
    const path = resource_paths[i];

    if (path && filenameDebugIdMap[path]) {
      images.push({
        type: 'sourcemap',
        code_file: path,
        debug_id: filenameDebugIdMap[path] as string
      });
    }
  }

  return images;
}
