"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.maybeRemoveProfileFromSdkMetadata = exports.isProfiledTransactionEvent = exports.createProfilingEventEnvelope = exports.enrichWithThreadId = void 0;
const os_1 = __importDefault(require("os"));
const worker_threads_1 = require("worker_threads");
const utils_1 = require("@sentry/utils");
const THREAD_ID_STRING = String(worker_threads_1.threadId);
function isRawThreadCpuProfile(profile) {
    var _a, _b;
    return 'samples' in profile && ((_b = (_a = profile.samples) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.thread_id) === undefined;
}
// Enriches the profile with threadId of the current thread.
// This is done in node as we seem to not be able to get the info from C native code.
function enrichWithThreadId(profile) {
    if (!isRawThreadCpuProfile(profile)) {
        return profile;
    }
    for (let i = 0; i < profile.samples.length; i++) {
        const sample = profile.samples[i];
        if (sample) {
            sample.thread_id = THREAD_ID_STRING;
        }
    }
    return {
        samples: profile.samples,
        frames: profile.frames,
        stacks: profile.stacks,
        thread_metadata: {
            [THREAD_ID_STRING]: {
                priority: worker_threads_1.isMainThread ? 0 : 1
            }
        }
    };
}
exports.enrichWithThreadId = enrichWithThreadId;
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
function createProfilingEventEnvelope(event, dsn, metadata, tunnel) {
    var _a, _b;
    const sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
    const rawProfile = event.sdkProcessingMetadata['profile'];
    if (rawProfile === undefined || rawProfile === null) {
        throw new TypeError(`Cannot construct profiling event envelope without a valid profile. Got ${rawProfile} instead.`);
    }
    enhanceEventWithSdkInfo(event, metadata && metadata.sdk);
    const envelopeHeaders = createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn);
    const enrichedThreadProfile = enrichWithThreadId(rawProfile);
    const profile = {
        event_id: event.event_id || (0, utils_1.uuid4)(),
        timestamp: (event.timestamp || Date.now()).toString(),
        platform: 'nodejs',
        version: '1',
        release: ((_a = event.sdk) === null || _a === void 0 ? void 0 : _a.version) || 'unknown',
        os: {
            name: os_1.default.platform(),
            version: os_1.default.release(),
            build_number: os_1.default.version()
        },
        device: {
            locale: (_b = (process.env['LC_ALL'] || process.env['LC_MESSAGES'] || process.env['LANG'] || process.env['LANGUAGE'])) !== null && _b !== void 0 ? _b : 'unknown locale',
            // os.machine is new in node18
            model: os_1.default.machine ? os_1.default.machine() : os_1.default.arch(),
            manufacturer: os_1.default.type(),
            architecture: os_1.default.arch(),
            is_emulator: false
        },
        profile: enrichedThreadProfile,
        transaction: []
    };
    const envelopeItem = [
        {
            // @ts-expect-error profile is not yet a type in @sentry/types
            type: 'profile'
        },
        // @ts-expect-error profile is not yet a type in @sentry/types
        profile
    ];
    return (0, utils_1.createEnvelope)(envelopeHeaders, [envelopeItem]);
}
exports.createProfilingEventEnvelope = createProfilingEventEnvelope;
function isProfiledTransactionEvent(event) {
    return !!(event.sdkProcessingMetadata &&
        'profile' in event.sdkProcessingMetadata &&
        event.sdkProcessingMetadata['profile'] !== undefined);
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
