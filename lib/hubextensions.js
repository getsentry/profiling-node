"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addExtensionMethods = exports.__PRIVATE__wrapStartTransactionWithProfiling = void 0;
const hub_1 = require("@sentry/hub");
const utils_1 = require("@sentry/utils");
const env_1 = require("./env");
const cpu_profiler_1 = require("./cpu_profiler");
// Wraps startTransaction and stopTransaction with profiling related logic.
// startProfiling is called after the call to startTransaction in order to avoid our own code from
// being profiled. Because of that same reason, stopProfiling is called before the call to stopTransaction.
function __PRIVATE__wrapStartTransactionWithProfiling(startTransaction) {
    return function wrappedStartTransaction(transactionContext, customSamplingContext) {
        var _a, _b;
        // @ts-expect-error profileSampleRate is not part of the options type yet
        const profileSampleRate = (_b = (_a = this.getClient()) === null || _a === void 0 ? void 0 : _a.getOptions().profileSampleRate) !== null && _b !== void 0 ? _b : undefined;
        const transaction = startTransaction.call(this, transactionContext, customSamplingContext);
        if (profileSampleRate === undefined) {
            return transaction;
        }
        const shouldProfileTransaction = Math.random() < profileSampleRate;
        if (!shouldProfileTransaction) {
            return transaction;
        }
        const originalFinish = transaction.finish.bind(transaction);
        cpu_profiler_1.CpuProfilerBindings.startProfiling(transactionContext.name);
        if ((0, env_1.isDebugBuild)()) {
            utils_1.logger.log('[Profiling] started profiling transaction: ' + transactionContext.name);
        }
        function profilingWrappedTransactionFinish() {
            const profile = cpu_profiler_1.CpuProfilerBindings.stopProfiling(transactionContext.name);
            if ((0, env_1.isDebugBuild)()) {
                utils_1.logger.log('[Profiling] stopped profiling of transaction: ' + transactionContext.name);
            }
            // @ts-expect-error profile is not a part of sdk metadata so we expect error until it becomes part of the official SDK.
            transaction.setMetadata({ profile });
            return originalFinish();
        }
        transaction.finish = profilingWrappedTransactionFinish;
        return transaction;
    };
}
exports.__PRIVATE__wrapStartTransactionWithProfiling = __PRIVATE__wrapStartTransactionWithProfiling;
/**
 * Patches startTransaction and stopTransaction with profiling logic.
 * @private
 */
function _addProfilingExtensionMethods() {
    const carrier = (0, hub_1.getMainCarrier)();
    if (!carrier.__SENTRY__) {
        return;
    }
    carrier.__SENTRY__.extensions = carrier.__SENTRY__.extensions || {};
    if (carrier.__SENTRY__.extensions['startTransaction']) {
        carrier.__SENTRY__.extensions['startTransaction'] = __PRIVATE__wrapStartTransactionWithProfiling(
        // This is already patched by sentry/tracing, we are going to re-patch it...
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
