import type { Hub, TransactionContext, CustomSamplingContext, Transaction } from '@sentry/types';
import { getMainCarrier } from '@sentry/hub';
import { logger, uuid4 } from '@sentry/utils';

import { isDebugBuild } from './env';
import { CpuProfilerBindings } from './cpu_profiler';
import { isValidSampleRate } from './utils';

const MAX_PROFILE_DURATION_MS = 30 * 1000;

type StartTransaction = (
  this: Hub,
  transactionContext: TransactionContext,
  customSamplingContext?: CustomSamplingContext
) => Transaction;

// Wraps startTransaction and stopTransaction with profiling related logic.
// startProfiling is called after the call to startTransaction in order to avoid our own code from
// being profiled. Because of that same reason, stopProfiling is called before the call to stopTransaction.
export function __PRIVATE__wrapStartTransactionWithProfiling(startTransaction: StartTransaction): StartTransaction {
  return function wrappedStartTransaction(
    this: Hub,
    transactionContext: TransactionContext,
    customSamplingContext?: CustomSamplingContext
  ): Transaction {
    const transaction = startTransaction.call(this, transactionContext, customSamplingContext);

    // We create "unique" transaction names to avoid concurrent transactions with same names
    // from being ignored by the profiler. From here on, only this transaction name should be used when
    // calling the profiler methods. Note: we log the original name to the user to avoid confusion.
    const profile_id = uuid4();
    const uniqueTransactionName = `${transactionContext.name} ${profile_id}`;

    // profilesSampleRate is multiplied with tracesSampleRate to get the final sampling rate. We dont perform
    // the actual multiplication to get the final rate, but we discard the profile if the transaction was sampled,
    // so anything after this block from here is based on the transaction sampling.
    if (!transaction.sampled) {
      return transaction;
    }

    const client = this.getClient();
    if (!client) {
      if (isDebugBuild()) {
        logger.log('[Profiling] Profiling disabled, no client found.');
      }
      return transaction;
    }
    const options = client.getOptions();
    if (!options) {
      if (isDebugBuild()) {
        logger.log('[Profiling] Profiling disabled, no options found.');
      }
      return transaction;
    }

    // @ts-expect-error sampler is not yer part of the sdk options
    const profilesSampler = options.profilesSampler;
    // @ts-expect-error sampler is not yer part of the sdk options
    let profilesSampleRate: number | undefined = options.profilesSampleRate;

    // Prefer sampler to sample rate if both are provided.
    if (typeof profilesSampler === 'function') {
      profilesSampleRate = profilesSampler(customSamplingContext);
    }
    // @TODO: enable this block if we want distributed tracing support
    // see https://github.com/getsentry/profiling-node/pull/109#discussion_r1132434757
    // else if (customSamplingContext && customSamplingContext['parentSampled'] !== undefined) {
    //   profilesSampleRate = customSamplingContext['parentSampled'];
    // }

    // Since this is coming from the user (or from a function provided by the user), who knows what we might get. (The
    // only valid values are booleans or numbers between 0 and 1.)
    if (!isValidSampleRate(profilesSampleRate)) {
      if (isDebugBuild()) {
        logger.warn('[Profiling] Discarding profile because of invalid sample rate.');
      }
      return transaction;
    }

    // if the function returned 0 (or false), or if `profileSampleRate` is 0, it's a sign the profile should be dropped
    if (!profilesSampleRate) {
      if (isDebugBuild()) {
        logger.log(
          `[Profiling] Discarding profile because ${
            typeof profilesSampler === 'function'
              ? 'profileSampler returned 0 or false'
              : 'a negative sampling decision was inherited or profileSampleRate is set to 0'
          }`
        );
      }
      return transaction;
    }

    // Now we roll the dice. Math.random is inclusive of 0, but not of 1, so strict < is safe here. In case sampleRate is
    // a boolean, the < comparison will cause it to be automatically cast to 1 if it's true and 0 if it's false.
    const sampled = Math.random() < (profilesSampleRate as number | boolean);
    // Check if we should sample this profile
    if (!sampled) {
      if (isDebugBuild()) {
        logger.log(
          `[Profiling] Discarding profile because it's not included in the random sample (sampling rate = ${Number(
            profilesSampleRate
          )})`
        );
      }
      return transaction;
    }

    // Start the profiler
    CpuProfilerBindings.startProfiling(uniqueTransactionName);
    if (isDebugBuild()) {
      logger.log('[Profiling] started profiling transaction: ' + transactionContext.name);
    }

    // A couple of important things to note here:
    // `CpuProfilerBindings.stopProfiling` will be scheduled to run in 30seconds in order to exceed max profile duration.
    // Whichever of the two (transaction.finish/timeout) is first to run, the profiling will be stopped and the gathered profile
    // will be processed when the original transaction is finished. Since onProfileHandler can be invoked multiple times in the
    // event of an error or user mistake (calling transaction.finish multiple times), it is important that the behavior of onProfileHandler
    // is idempotent as we do not want any timings or profiles to be overriden by the last call to onProfileHandler.
    // After the original finish method is called, the event will be reported through the integration and delegated to transport.
    let profile: ReturnType<typeof CpuProfilerBindings['stopProfiling']> | null = null;

    function onProfileHandler(): ReturnType<typeof CpuProfilerBindings['stopProfiling']> | null {
      // Check if the profile exists and return it the behavior has to be idempotent as users may call transaction.finish multiple times.
      if (profile) {
        if (isDebugBuild()) {
          logger.log('[Profiling] profile for:', transactionContext.name, 'already exists, returning early');
        }
        return profile;
      }

      profile = CpuProfilerBindings.stopProfiling(uniqueTransactionName);

      if (maxDurationTimeoutID) {
        global.clearTimeout(maxDurationTimeoutID);
        maxDurationTimeoutID = undefined;
      }

      if (isDebugBuild()) {
        logger.log('[Profiling] stopped profiling of transaction: ' + transactionContext.name);
      }

      // In case of an overlapping transaction, stopProfiling may return null and silently ignore the overlapping profile.
      if (!profile) {
        if (isDebugBuild()) {
          logger.log(
            '[Profiling] profiler returned null profile for: ' + transactionContext.name,
            'this may indicate an overlapping transaction or a call to stopProfiling with a profile title that was never started'
          );
        }
        return null;
      }

      // Assign profile_id to the profile
      profile.profile_id = profile_id;
      return profile;
    }

    // Enqueue a timeout to prevent profiles from running over max duration.
    let maxDurationTimeoutID: NodeJS.Timeout | void = global.setTimeout(() => {
      if (isDebugBuild()) {
        logger.log('[Profiling] max profile duration elapsed, stopping profiling for:', transactionContext.name);
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

/**
 * Patches startTransaction and stopTransaction with profiling logic.
 * @private
 */
function _addProfilingExtensionMethods(): void {
  const carrier = getMainCarrier();
  if (!carrier.__SENTRY__) {
    if (isDebugBuild()) {
      logger.log("[Profiling] Can't find main carrier, profiling won't work.");
    }
    return;
  }
  carrier.__SENTRY__.extensions = carrier.__SENTRY__.extensions || {};

  if (!carrier.__SENTRY__.extensions['startTransaction']) {
    if (isDebugBuild()) {
      logger.log(
        '[Profiling] startTransaction does not exists, profiling will not work. Make sure you import @sentry/tracing package before @sentry/profiling-node as import order matters.'
      );
    }
    return;
  }

  if (isDebugBuild()) {
    logger.log('[Profiling] startTransaction exists, patching it with profiling functionality...');
  }
  carrier.__SENTRY__.extensions['startTransaction'] = __PRIVATE__wrapStartTransactionWithProfiling(
    // This is already patched by sentry/tracing, we are going to re-patch it...
    carrier.__SENTRY__.extensions['startTransaction'] as StartTransaction
  );
}

/**
 * This patches the global object and injects the Profiling extensions methods
 */
export function addExtensionMethods(): void {
  _addProfilingExtensionMethods();
}
