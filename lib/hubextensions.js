"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addExtensionMethods = void 0;
const os_1 = __importDefault(require("os"));
const hub_1 = require("@sentry/hub");
// @ts-ignore
const cpu_profiler_1 = __importDefault(require("./../build/Release/cpu_profiler"));
const utils_1 = require("@sentry/utils");
const core_1 = require("@sentry/core");
function isEventEnvelope(envelope) {
    return !!envelope[0].event_id;
}
// @ts-ignore
const orgSendEnvelope = core_1.BaseClient.prototype._sendEnvelope;
let profiles = [];
// @ts-ignore
core_1.BaseClient.prototype._sendEnvelope = function (envelope) {
    var _a;
    if (isEventEnvelope(envelope)) {
        const platform = os_1.default.platform();
        const release = os_1.default.release();
        const locale = process.env['LC_ALL'] || process.env['LC_MESSAGES'] || process.env['LANG'] || process.env['LANGUAGE'];
        while (profiles.length > 0) {
            const cpuProfile = profiles.pop();
            const profile = {
                type: 'profile',
                platform: 'node',
                profile_id: (0, utils_1.uuid4)(),
                profile: [cpuProfile],
                device_locale: locale,
                device_manufacturer: 'GitHub',
                device_model: 'GitHub Actions',
                device_os_name: platform,
                device_os_version: release,
                device_is_emulator: false,
                transaction_name: 'typescript.compile',
                version_code: '1',
                version_name: '0.1',
                duration_ns: cpuProfile.endValue - cpuProfile.startValue,
                trace_id: (_a = envelope[0].trace) === null || _a === void 0 ? void 0 : _a.trace_id,
                transaction_id: envelope[0].event_id,
            };
            // @ts-ignore
            envelope = (0, utils_1.addItemToEnvelope)(envelope, [{ type: 'profile' }, profile]);
        }
    }
    orgSendEnvelope.call(this, envelope);
};
function _wrapStartTransaction(originalTransaction) {
    return function wrappedStartTransaction(transactionContext, customSamplingContext) {
        const boundOriginalTransaction = originalTransaction.bind(this);
        const transaction = boundOriginalTransaction(transactionContext, customSamplingContext);
        cpu_profiler_1.default.startProfiling(transactionContext.name);
        const originalFinish = transaction.finish.bind(transaction);
        function profilingWrappedTransactionFinish() {
            const profile = cpu_profiler_1.default.stopProfiling(transactionContext.name);
            profiles.push(profile);
            originalFinish();
        }
        transaction.finish = profilingWrappedTransactionFinish;
        return transaction;
    };
}
/**
 * @private
 */
function _addProfilingExtensionMethods() {
    const carrier = (0, hub_1.getMainCarrier)();
    if (!carrier.__SENTRY__) {
        return;
    }
    carrier.__SENTRY__.extensions = carrier.__SENTRY__.extensions || {};
    if (carrier.__SENTRY__.extensions['startTransaction']) {
        carrier.__SENTRY__.extensions['startTransaction'] = _wrapStartTransaction(
        // @ts-ignore
        carrier.__SENTRY__.extensions['startTransaction']);
    }
}
/**
 * This patches the global object and injects the Profiling extensions methods
 */
function addExtensionMethods() {
    _addProfilingExtensionMethods();
}
exports.addExtensionMethods = addExtensionMethods;
