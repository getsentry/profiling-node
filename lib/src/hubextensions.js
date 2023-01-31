"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addExtensionMethods = exports.__PRIVATE__wrapStartTransactionWithProfiling = void 0;
const hub_1 = require("@sentry/hub");
const utils_1 = require("@sentry/utils");
const env_1 = require("./env");
const cpu_profiler_1 = require("./cpu_profiler");
const MAX_PROFILE_DURATION_MS = 30 * 1000;
// Wraps startTransaction and stopTransaction with profiling related logic.
// startProfiling is called after the call to startTransaction in order to avoid our own code from
// being profiled. Because of that same reason, stopProfiling is called before the call to stopTransaction.
function __PRIVATE__wrapStartTransactionWithProfiling(startTransaction) {
    return function wrappedStartTransaction(transactionContext, customSamplingContext) {
        var _a, _b, _c;
        const transaction = startTransaction.call(this, transactionContext, customSamplingContext);
        // We create "unique" transaction names to avoid concurrent transactions with same names
        // from being ignored by the profiler. From here on, only this transaction name should be used when
        // calling the profiler methods. Note: we log the original name to the user to avoid confusion.
        const profile_id = (0, utils_1.uuid4)();
        const uniqueTransactionName = `${transactionContext.name} ${profile_id}`;
        // profilesSampleRate is multiplied with tracesSampleRate to get the final sampling rate.
        if (!transaction.sampled) {
            return transaction;
        }
        // @ts-expect-error profilesSampleRate is not part of the options type yet
        const profilesSampleRate = (_c = (_b = (_a = this.getClient()) === null || _a === void 0 ? void 0 : _a.getOptions) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c.profilesSampleRate;
        if (profilesSampleRate === undefined) {
            if ((0, env_1.isDebugBuild)()) {
                utils_1.logger.log('[Profiling] Profiling disabled, enable it by setting `profilesSampleRate` option to SDK init call.');
            }
            return transaction;
        }
        // Check if we should sample this profile
        if (Math.random() > profilesSampleRate) {
            if ((0, env_1.isDebugBuild)()) {
                utils_1.logger.log('[Profiling] Skip profiling transaction due to sampling.');
            }
            return transaction;
        }
        // Start the profiler
        cpu_profiler_1.CpuProfilerBindings.startProfiling(uniqueTransactionName);
        if ((0, env_1.isDebugBuild)()) {
            utils_1.logger.log('[Profiling] started profiling transaction: ' + transactionContext.name);
        }
        // A couple of important things to note here:
        // `CpuProfilerBindings.stopProfiling` will be scheduled to run in 30seconds in order to exceed max profile duration.
        // Whichever of the two (transaction.finish/timeout) is first to run, the profiling will be stopped and the gathered profile
        // will be processed when the original transaction is finished. Since onProfileHandler can be invoked multiple times in the
        // event of an error or user mistake (calling transaction.finish multiple times), it is important that the behavior of onProfileHandler
        // is idempotent as we do not want any timings or profiles to be overriden by the last call to onProfileHandler.
        // After the original finish method is called, the event will be reported through the integration and delegated to transport.
        let profile = null;
        function onProfileHandler() {
            // Check if the profile exists and return it the behavior has to be idempotent as users may call transaction.finish multiple times.
            if (profile) {
                if ((0, env_1.isDebugBuild)()) {
                    utils_1.logger.log('[Profiling] profile for:', transactionContext.name, 'already exists, returning early');
                }
                return profile;
            }
            profile = cpu_profiler_1.CpuProfilerBindings.stopProfiling(uniqueTransactionName);
            if (maxDurationTimeoutID) {
                global.clearTimeout(maxDurationTimeoutID);
                maxDurationTimeoutID = undefined;
            }
            if ((0, env_1.isDebugBuild)()) {
                utils_1.logger.log('[Profiling] stopped profiling of transaction: ' + transactionContext.name);
            }
            // In case of an overlapping transaction, stopProfiling may return null and silently ignore the overlapping profile.
            if (!profile) {
                if ((0, env_1.isDebugBuild)()) {
                    utils_1.logger.log('[Profiling] profiler returned null profile for: ' + transactionContext.name, 'this may indicate an overlapping transaction or a call to stopProfiling with a profile title that was never started');
                }
                return null;
            }
            // Assign profile_id to the profile
            profile.profile_id = profile_id;
            return profile;
        }
        // Enqueue a timeout to prevent profiles from running over max duration.
        let maxDurationTimeoutID = global.setTimeout(() => {
            if ((0, env_1.isDebugBuild)()) {
                utils_1.logger.log('[Profiling] max profile duration elapsed, stopping profiling for:', transactionContext.name);
            }
            onProfileHandler();
        }, MAX_PROFILE_DURATION_MS);
        // We need to reference the original finish call to avoid creating an infinite loop
        const originalFinish = transaction.finish.bind(transaction);
        function profilingWrappedTransactionFinish() {
            // onProfileHandler should always return the same profile even if this is called multiple times.
            // Always call onProfileHandler to ensure stopProfiling is called and the timeout is cleared.
            const profile = onProfileHandler();
            // @ts-expect-error profile is not a part of sdk metadata so we expect error until it becomes part of the official SDK.
            transaction.setMetadata({ profile });
            // Set profile context
            transaction.setContext('profile', { profile_id });
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
        if ((0, env_1.isDebugBuild)()) {
            utils_1.logger.log("[Profiling] Can't find main carrier, profiling won't work.");
        }
        return;
    }
    carrier.__SENTRY__.extensions = carrier.__SENTRY__.extensions || {};
    if (!carrier.__SENTRY__.extensions['startTransaction']) {
        if ((0, env_1.isDebugBuild)()) {
            utils_1.logger.log('[Profiling] startTransaction does not exists, profiling will not work. Make sure you import @sentry/tracing package before @sentry/profiling-node as import order matters.');
        }
        return;
    }
    if ((0, env_1.isDebugBuild)()) {
        utils_1.logger.log('[Profiling] startTransaction exists, patching it with profiling functionality...');
    }
    carrier.__SENTRY__.extensions['startTransaction'] = __PRIVATE__wrapStartTransactionWithProfiling(
    // This is already patched by sentry/tracing, we are going to re-patch it...
    carrier.__SENTRY__.extensions['startTransaction']);
}
/**
 * This patches the global object and injects the Profiling extensions methods
 */
function addExtensionMethods() {
    _addProfilingExtensionMethods();
}
exports.addExtensionMethods = addExtensionMethods;
