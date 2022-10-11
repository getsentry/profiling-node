import type { Hub, TransactionContext, CustomSamplingContext, Transaction } from '@sentry/types';
import { getMainCarrier } from '@sentry/hub';
import { logger } from '@sentry/utils';

import { isDebugBuild } from './env';
import { CpuProfilerBindings } from './cpu_profiler';

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
    // @ts-expect-error profilesSampleRate is not part of the options type yet
    const profilesSampleRate = this.getClient()?.getOptions().profilesSampleRate ?? undefined;
    const transaction = startTransaction.call(this, transactionContext, customSamplingContext);

    if (profilesSampleRate === undefined) {
      if (isDebugBuild()) {
        logger.log(
          '[Profiling] Profiling disabled, enable it by setting `profilesSampleRate` option to SDK init call.'
        );
      }
      return transaction;
    }

    if (Math.random() > profilesSampleRate) {
      if (isDebugBuild()) {
        logger.log('[Profiling] Skip profiling transaction due to sampling.');
      }
      return transaction;
    }

    // We need to reference the original finish call to avoid creating an infinite loop
    const originalFinish = transaction.finish.bind(transaction);
    CpuProfilerBindings.startProfiling(transactionContext.name);
    if (isDebugBuild()) {
      logger.log('[Profiling] started profiling transaction: ' + transactionContext.name);
    }

    function profilingWrappedTransactionFinish() {
      const profile = CpuProfilerBindings.stopProfiling(transactionContext.name);
      if (isDebugBuild()) {
        logger.log('[Profiling] stopped profiling of transaction: ' + transactionContext.name);
      }
      // @ts-expect-error profile is not a part of sdk metadata so we expect error until it becomes part of the official SDK.
      transaction.setMetadata({ profile });
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
