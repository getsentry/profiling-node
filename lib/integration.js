"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilingIntegration = void 0;
const os_1 = __importDefault(require("os"));
const utils_1 = require("@sentry/utils");
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
    if (!sdkInfo) {
        return event;
    }
    event.sdk = event.sdk || {};
    // @ts-ignore
    event.sdk.name = event.sdk.name || sdkInfo.name;
    // @ts-ignore
    event.sdk.version = event.sdk.version || sdkInfo.version;
    event.sdk.integrations = [...(event.sdk.integrations || []), ...(sdkInfo.integrations || [])];
    event.sdk.packages = [...(event.sdk.packages || []), ...(sdkInfo.packages || [])];
    return event;
}
function createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn) {
    const baggage = event.sdkProcessingMetadata && event.sdkProcessingMetadata['baggage'];
    const dynamicSamplingContext = baggage && (0, utils_1.getSentryBaggageItems)(baggage);
    return Object.assign(Object.assign(Object.assign({ event_id: event.event_id, sent_at: new Date().toISOString() }, (sdkInfo && { sdk: sdkInfo })), (!!tunnel && { dsn: (0, utils_1.dsnToString)(dsn) })), (event.type === 'transaction' &&
        dynamicSamplingContext && {
        trace: (0, utils_1.dropUndefinedKeys)(Object.assign({}, dynamicSamplingContext)),
    }));
}
function createProfilingEventEnvelope(event, dsn, metadata, tunnel) {
    var _a, _b;
    const sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
    const rawProfile = (_a = event.sdkProcessingMetadata) === null || _a === void 0 ? void 0 : _a['profile'];
    if (!rawProfile) {
        throw new Error('Cannot construct profiling event envelope without a profile');
    }
    enhanceEventWithSdkInfo(event, metadata && metadata.sdk);
    const envelopeHeaders = createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn);
    const profile = {
        platform: 'typescript',
        profile_id: (0, utils_1.uuid4)(),
        profile: [rawProfile, {}],
        device_locale: process.env['LC_ALL'] || process.env['LC_MESSAGES'] || process.env['LANG'] || process.env['LANGUAGE'],
        device_manufacturer: os_1.default.type(),
        device_model: os_1.default.arch(),
        device_os_name: os_1.default.platform(),
        device_os_version: os_1.default.release(),
        device_is_emulator: false,
        transaction_name: event.transaction,
        duration_ns: `${rawProfile.duration_ns}`,
        environment: '',
        version_code: '',
        version_name: '',
        trace_id: (_b = envelopeHeaders.trace) === null || _b === void 0 ? void 0 : _b.trace_id,
        transaction_id: envelopeHeaders.event_id,
    };
    // Only cleanup the profile from the transaction and forward the pristine event so that the actual transaction event can be sent.
    if (event.sdkProcessingMetadata && 'profile' in event.sdkProcessingMetadata) {
        delete event.sdkProcessingMetadata['profile'];
    }
    const envelopeItem = [
        {
            // @ts-ignore
            type: 'profile',
        },
        profile,
    ];
    return (0, utils_1.createEnvelope)(envelopeHeaders, [envelopeItem]);
}
function isProfiledTransactionEvent(event) {
    return !!(event.sdkProcessingMetadata &&
        'profile' in event.sdkProcessingMetadata &&
        event.sdkProcessingMetadata['profile'] !== undefined);
}
function toPristineEvent(event) {
    if (!event.sdkProcessingMetadata || (event.sdkProcessingMetadata && !event.sdkProcessingMetadata['profile'])) {
        return event;
    }
    delete event.sdkProcessingMetadata['profile'];
    return event;
}
class ProfilingIntegration {
    constructor() {
        this.name = 'ProfilingNode';
        this.getCurrentHub = () => void 0;
    }
    setupOnce(addGlobalEventProcessor, getCurrentHub) {
        this.getCurrentHub = getCurrentHub;
        addGlobalEventProcessor(this.handleGlobalEvent.bind(this));
    }
    handleGlobalEvent(event) {
        if (isProfiledTransactionEvent(event)) {
            // The following are all required to be able to send the event to Sentry.
            // If either of them is not available, we remove the profile from the transaction event.
            // and forward it to other processors.
            const hub = this.getCurrentHub();
            if (!hub) {
                utils_1.logger.log('[Profiling] getCurrentHub did not return a Hub, removing profile and forwarding event to other processors.');
                return toPristineEvent(event);
            }
            const client = hub.getClient();
            if (!client) {
                utils_1.logger.log('[Profiling] getClient did not return a Client, removing profile and forwarding event to other processors.');
                return toPristineEvent(event);
            }
            const dsn = client.getDsn();
            if (!dsn) {
                utils_1.logger.log('[Profiling] getDsn did not return a Dsn, removing profile and forwarding event to other processors.');
                return toPristineEvent(event);
            }
            const envelope = createProfilingEventEnvelope(event, dsn, client.getOptions()._metadata);
            const transport = client.getTransport();
            if (transport) {
                utils_1.logger.log('[Profiling] Sending profiling event to Sentry');
                transport.send(envelope);
                console.log(JSON.stringify(envelope));
            }
        }
        return event;
    }
}
exports.ProfilingIntegration = ProfilingIntegration;
