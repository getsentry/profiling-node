'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.maybeRemoveProfileFromSdkMetadata =
  exports.isProfiledTransactionEvent =
  exports.createProfilingEventEnvelope =
    void 0;
const os_1 = __importDefault(require('os'));
const utils_1 = require('@sentry/utils');
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
  event.sdk.name = (_a = event.sdk.name || sdkInfo.name) !== null && _a !== void 0 ? _a : 'unknown sdk';
  event.sdk.version =
    (_b = event.sdk.version || sdkInfo.version) !== null && _b !== void 0 ? _b : 'unknown sdk version';
  event.sdk.integrations = [...(event.sdk.integrations || []), ...(sdkInfo.integrations || [])];
  event.sdk.packages = [...(event.sdk.packages || []), ...(sdkInfo.packages || [])];
  return event;
}
function createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn) {
  const baggage = event.sdkProcessingMetadata && event.sdkProcessingMetadata['baggage'];
  const dynamicSamplingContext = baggage && (0, utils_1.getSentryBaggageItems)(baggage);
  return Object.assign(
    Object.assign(
      Object.assign({ event_id: event.event_id, sent_at: new Date().toISOString() }, sdkInfo && { sdk: sdkInfo }),
      !!tunnel && { dsn: (0, utils_1.dsnToString)(dsn) }
    ),
    event.type === 'transaction' &&
      dynamicSamplingContext && {
        trace: (0, utils_1.dropUndefinedKeys)(Object.assign({}, dynamicSamplingContext))
      }
  );
}
function createProfilingEventEnvelope(event, dsn, metadata, tunnel) {
  var _a, _b, _c, _d, _e, _f, _g;
  const sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
  const rawProfile = event.sdkProcessingMetadata['profile'];
  if (rawProfile === undefined || rawProfile === null) {
    throw new TypeError(
      `Cannot construct profiling event envelope without a valid profile. Got ${rawProfile} instead.`
    );
  }
  enhanceEventWithSdkInfo(event, metadata && metadata.sdk);
  const envelopeHeaders = createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn);
  const profile = {
    platform: 'typescript',
    profile_id: (0, utils_1.uuid4)(),
    profile: [rawProfile, {}],
    device_locale:
      (_a = process.env['LC_ALL'] || process.env['LC_MESSAGES'] || process.env['LANG'] || process.env['LANGUAGE']) !==
        null && _a !== void 0
        ? _a
        : 'unknown locale',
    device_manufacturer: os_1.default.type(),
    device_model: os_1.default.arch(),
    device_os_name: os_1.default.platform(),
    device_os_version: os_1.default.release(),
    device_is_emulator: false,
    environment: (_b = process.env['NODE_ENV']) !== null && _b !== void 0 ? _b : 'unknown environment',
    transaction_name: (_c = event.transaction) !== null && _c !== void 0 ? _c : 'unknown transaction',
    duration_ns: `${rawProfile.duration_ns}`,
    version_code:
      (_d = sdkInfo === null || sdkInfo === void 0 ? void 0 : sdkInfo.version) !== null && _d !== void 0
        ? _d
        : 'unknown version',
    version_name:
      (_e = sdkInfo === null || sdkInfo === void 0 ? void 0 : sdkInfo.name) !== null && _e !== void 0
        ? _e
        : 'unknown name',
    trace_id:
      (_g = (_f = envelopeHeaders.trace) === null || _f === void 0 ? void 0 : _f.trace_id) !== null && _g !== void 0
        ? _g
        : 'unknown trace id',
    transaction_id: envelopeHeaders.event_id
  };
  const envelopeItem = [
    {
      // @ts-expect-error profile is not yet a type in @sentry/types
      type: 'profile'
    },
    profile
  ];
  return (0, utils_1.createEnvelope)(envelopeHeaders, [envelopeItem]);
}
exports.createProfilingEventEnvelope = createProfilingEventEnvelope;
function isProfiledTransactionEvent(event) {
  return !!(
    event.sdkProcessingMetadata &&
    'profile' in event.sdkProcessingMetadata &&
    event.sdkProcessingMetadata['profile'] !== undefined
  );
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
