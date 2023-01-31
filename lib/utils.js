"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectRootDirectory = exports.maybeRemoveProfileFromSdkMetadata = exports.isProfiledTransactionEvent = exports.createProfilingEventEnvelope = exports.enrichWithThreadInformation = void 0;
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const worker_threads_1 = require("worker_threads");
const utils_1 = require("@sentry/utils");
const env_1 = require("./env");
// We require the file because if we import it, it will be included in the bundle.
// I guess tsc does not check file contents when it's imported.
// eslint-disable-next-line
const { root_directory } = require('./../root.js');
const THREAD_ID_STRING = String(worker_threads_1.threadId);
const THREAD_NAME = worker_threads_1.isMainThread ? 'main' : 'worker';
// Machine properties (eval only once)
const PLATFORM = os_1.default.platform();
const RELEASE = os_1.default.release();
const VERSION = os_1.default.version();
const TYPE = os_1.default.type();
const MODEL = os_1.default.machine ? os_1.default.machine() : os_1.default.arch();
const ARCH = os_1.default.arch();
function isRawThreadCpuProfile(profile) {
    return !('thread_metadata' in profile);
}
// Enriches the profile with threadId of the current thread.
// This is done in node as we seem to not be able to get the info from C native code.
function enrichWithThreadInformation(profile) {
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
exports.enrichWithThreadInformation = enrichWithThreadInformation;
/** Extract sdk info from from the API metadata */
function getSdkMetadataForEnvelopeHeader(metadata) {
    if (!metadata || !metadata.sdk) {
        return undefined;
    }
    return { name: metadata.sdk.name, version: metadata.sdk.version };
}
/**
 * Apply SdkInfo (name, version, packages, integrations) to the corresponding event key.
 * Merge with existing data if any.
 **/
function enhanceEventWithSdkInfo(event, sdkInfo) {
    var _a, _b;
    if (!sdkInfo) {
        return event;
    }
    event.sdk = event.sdk || {};
    event.sdk.name = (_a = (event.sdk.name || sdkInfo.name)) !== null && _a !== void 0 ? _a : 'unknown sdk';
    event.sdk.version = (_b = (event.sdk.version || sdkInfo.version)) !== null && _b !== void 0 ? _b : 'unknown sdk version';
    event.sdk.integrations = [...(event.sdk.integrations || []), ...(sdkInfo.integrations || [])];
    event.sdk.packages = [...(event.sdk.packages || []), ...(sdkInfo.packages || [])];
    return event;
}
function createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn) {
    const dynamicSamplingContext = event.sdkProcessingMetadata && event.sdkProcessingMetadata['dynamicSamplingContext'];
    return Object.assign(Object.assign(Object.assign({ event_id: event.event_id, sent_at: new Date().toISOString() }, (sdkInfo && { sdk: sdkInfo })), (!!tunnel && { dsn: (0, utils_1.dsnToString)(dsn) })), (event.type === 'transaction' &&
        dynamicSamplingContext && {
        trace: (0, utils_1.dropUndefinedKeys)(Object.assign({}, dynamicSamplingContext))
    }));
}
/**
 * Creates a profiling event envelope from a Sentry event. If profile does not pass
 * validation, returns null.
 * @param event
 * @param dsn
 * @param metadata
 * @param tunnel
 * @returns {EventEnvelope | null}
 */
function createProfilingEventEnvelope(event, dsn, metadata, tunnel) {
    var _a, _b, _c, _d;
    if (event.type !== 'transaction') {
        // createProfilingEventEnvelope should only be called for transactions,
        // we type guard this behavior with isProfiledTransactionEvent.
        throw new TypeError('Profiling events may only be attached to transactions, this should never occur.');
    }
    const rawProfile = event.sdkProcessingMetadata['profile'];
    if (rawProfile === undefined || rawProfile === null) {
        throw new TypeError(`Cannot construct profiling event envelope without a valid profile. Got ${rawProfile} instead.`);
    }
    if (!rawProfile.profile_id) {
        throw new TypeError('Profile is missing profile_id');
    }
    if (rawProfile.samples.length <= 1) {
        if ((0, env_1.isDebugBuild)()) {
            // Log a warning if the profile has less than 2 samples so users can know why
            // they are not seeing any profiling data and we cant avoid the back and forth
            // of asking them to provide us with a dump of the profile data.
            utils_1.logger.log('[Profiling] Discarding profile because it contains less than 2 samples');
        }
        return null;
    }
    const sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
    enhanceEventWithSdkInfo(event, metadata && metadata.sdk);
    const envelopeHeaders = createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn);
    const enrichedThreadProfile = enrichWithThreadInformation(rawProfile);
    const transactionStartMs = typeof event.start_timestamp === 'number' ? event.start_timestamp * 1000 : Date.now();
    const transactionEndMs = typeof event.timestamp === 'number' ? event.timestamp * 1000 : Date.now();
    const traceId = (_c = (_b = (_a = event === null || event === void 0 ? void 0 : event.contexts) === null || _a === void 0 ? void 0 : _a['trace']) === null || _b === void 0 ? void 0 : _b['trace_id']) !== null && _c !== void 0 ? _c : '';
    // Log a warning if the profile has an invalid traceId (should be uuidv4).
    // All profiles and transactions are rejected if this is the case and we want to
    // warn users that this is happening if they enable debug flag
    if (traceId.length !== 32) {
        if ((0, env_1.isDebugBuild)()) {
            utils_1.logger.log('[Profiling] Invalid traceId: ' + traceId + ' on profiled event');
        }
    }
    const profile = {
        event_id: rawProfile.profile_id,
        timestamp: new Date(transactionStartMs).toISOString(),
        platform: 'node',
        version: '1',
        release: event.release || '',
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
            locale: (_d = (process.env['LC_ALL'] || process.env['LC_MESSAGES'] || process.env['LANG'] || process.env['LANGUAGE'])) !== null && _d !== void 0 ? _d : '',
            model: MODEL,
            manufacturer: TYPE,
            architecture: ARCH,
            is_emulator: false
        },
        profile: enrichedThreadProfile,
        transactions: [
            {
                name: event.transaction || '',
                id: event.event_id || (0, utils_1.uuid4)(),
                trace_id: traceId,
                active_thread_id: THREAD_ID_STRING,
                relative_start_ns: '0',
                relative_end_ns: ((transactionEndMs - transactionStartMs) * 1e6).toFixed(0)
            }
        ]
    };
    const envelopeItem = [
        {
            type: 'profile'
        },
        // @ts-expect-error profile is not yet a type in @sentry/types
        profile
    ];
    return (0, utils_1.createEnvelope)(envelopeHeaders, [envelopeItem]);
}
exports.createProfilingEventEnvelope = createProfilingEventEnvelope;
function isProfiledTransactionEvent(event) {
    return !!(event.sdkProcessingMetadata && event.sdkProcessingMetadata['profile']);
}
exports.isProfiledTransactionEvent = isProfiledTransactionEvent;
// Due to how profiles are attached to event metadata, we may sometimes want to remove them to ensure
// they are not processed by other Sentry integrations. This can be the case when we cannot construct a valid
// profile from the data we have or some of the mechanisms to send the event (Hub, Transport etc) are not available to us.
function maybeRemoveProfileFromSdkMetadata(event) {
    if (!isProfiledTransactionEvent(event)) {
        return event;
    }
    delete event.sdkProcessingMetadata['profile'];
    return event;
}
exports.maybeRemoveProfileFromSdkMetadata = maybeRemoveProfileFromSdkMetadata;
// Requires the root.js file which exports __dirname, this is then forwarded to our native
// addon where we remove the absolute path from each frame to generate a project relatvie filename
function getProjectRootDirectory() {
    var _a;
    const components = path_1.default.resolve(root_directory).split('/node_modules');
    return (_a = components === null || components === void 0 ? void 0 : components[0]) !== null && _a !== void 0 ? _a : null;
}
exports.getProjectRootDirectory = getProjectRootDirectory;
