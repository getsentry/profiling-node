import os from 'os';

import { getMainCarrier, Hub } from '@sentry/hub';
import type { TransactionContext, CustomSamplingContext, Transaction } from '@sentry/types';

// @ts-ignore
import profiler from './../build/Release/cpu_profiler';

import type { Envelope, EventEnvelope } from '@sentry/types';
import { addItemToEnvelope, uuid4 } from '@sentry/utils';
import { BaseClient } from '@sentry/core';

function isEventEnvelope(envelope: Envelope): envelope is EventEnvelope {
  return !!(envelope[0] as any).event_id;
}

// @ts-ignore
const orgSendEnvelope = BaseClient.prototype._sendEnvelope;

let profiles: any[] = [];

// @ts-ignore
BaseClient.prototype._sendEnvelope = function (envelope: Envelope) {
  if (isEventEnvelope(envelope)) {
    const platform = os.platform();
    const release = os.release();
    const locale =
      process.env['LC_ALL'] || process.env['LC_MESSAGES'] || process.env['LANG'] || process.env['LANGUAGE'];

    while (profiles.length > 0) {
      const cpuProfile = profiles.pop();

      const profile: any = {
        type: 'profile',
        platform: 'node',
        profile_id: uuid4(),
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
        trace_id: envelope[0].trace?.trace_id,
        transaction_id: envelope[0].event_id,
      };

      // @ts-ignore
      envelope = addItemToEnvelope(envelope, [{ type: 'profile' }, profile]);
    }
  }

  orgSendEnvelope.call(this, envelope);
};

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

function _wrapStartTransaction(originalTransaction: StartTransaction): StartTransaction {
  return function wrappedStartTransaction(
    this: Hub,
    transactionContext: TransactionContext,
    customSamplingContext?: CustomSamplingContext
  ): Transaction {
    const boundOriginalTransaction = originalTransaction.bind(this);
    const transaction = boundOriginalTransaction(transactionContext, customSamplingContext);

    profiler.startProfiling(transactionContext.name);

    const originalFinish = transaction.finish.bind(transaction);
    function profilingWrappedTransactionFinish() {
      const profile = profiler.stopProfiling(transactionContext.name);
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
function _addProfilingExtensionMethods(): void {
  const carrier = getMainCarrier();
  if (!carrier.__SENTRY__) {
    return;
  }
  carrier.__SENTRY__.extensions = carrier.__SENTRY__.extensions || {};

  if (carrier.__SENTRY__.extensions['startTransaction']) {
    carrier.__SENTRY__.extensions['startTransaction'] = _wrapStartTransaction(
      // @ts-ignore
      carrier.__SENTRY__.extensions['startTransaction']
    );
  }
}

/**
 * This patches the global object and injects the Profiling extensions methods
 */
export function addExtensionMethods(): void {
  _addProfilingExtensionMethods();
}
