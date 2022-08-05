import type { TransactionContext, CustomSamplingContext, Transaction } from '@sentry/types';
import { getMainCarrier, Hub } from '@sentry/hub';
import { logger } from '@sentry/utils';

// @ts-ignore
import profiler from './../build/Release/cpu_profiler';

/**
 * Creates a new transaction and adds a sampling decision if it doesn't yet have one.
 *
 * The Hub.startTransaction method delegates to this method to do its work, passing the Hub instance in as `this`, as if
 * it had been called on the hub directly. Exists as a separate function so that it can be injected into the class as an
 * "extension method."
 *
 * @param this: The Hub starting the transaction
 * @param transactionContext: Data used to configure the transaction
 * @param CustomSamplingContext: Optional data to be provided to the `tracesSampler` function (if any)
 *
 * @returns The new transaction
 *
 * @see {@link Hub.startTransaction}
 */

type StartTransaction = (
  this: Hub,
  transactionContext: TransactionContext,
  customSamplingContext?: CustomSamplingContext
) => Transaction;

function _wrapStartTransaction(startTransaction: StartTransaction): StartTransaction {
  return function wrappedStartTransaction(
    this: Hub,
    transactionContext: TransactionContext,
    customSamplingContext?: CustomSamplingContext
  ): Transaction {
    const transaction = startTransaction.call(this, transactionContext, customSamplingContext);
    const originalFinish = transaction.finish.bind(transaction);

    profiler.startProfiling(transactionContext.name);
    logger.log('[Profiling] started profiling transaction: ' + transactionContext.name);

    function profilingWrappedTransactionFinish() {
      const profile = profiler.stopProfiling(transactionContext.name);
      logger.log('[Profiling] stopped profiling of transaction: ' + transactionContext.name);
      // Metadata is strictly typed and profile is not a part of it.
      // Expect error for now and update the SDK later.
      // @ts-expect-error
      transaction.setMetadata({ profile });
      return originalFinish();
    }

    transaction.finish = profilingWrappedTransactionFinish;
    return transaction;
  };
}

/**
 * @private
 */
function _addProfilingExtensionMethods(): void {
  const carrier = getMainCarrier();
  if (!carrier.__SENTRY__) {
    return;
  }
  carrier.__SENTRY__.extensions = carrier.__SENTRY__.extensions || {};

  if (carrier.__SENTRY__.extensions['startTransaction']) {
    carrier.__SENTRY__.extensions['startTransaction'] = _wrapStartTransaction(
      // This is patched by sentry/tracing, we are going to re-patch it...
      carrier.__SENTRY__.extensions['startTransaction'] as StartTransaction
    );
  }
}

/**
 * This patches the global object and injects the Profiling extensions methods
 */
export function addExtensionMethods(): void {
  _addProfilingExtensionMethods();
}
