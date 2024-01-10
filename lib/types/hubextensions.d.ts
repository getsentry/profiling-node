import type { Hub, TransactionContext, CustomSamplingContext, Transaction } from '@sentry/types';
import type { NodeClient } from '@sentry/node';
import { CpuProfilerBindings } from './cpu_profiler';
export declare const MAX_PROFILE_DURATION_MS: number;
type StartTransaction = (this: Hub, transactionContext: TransactionContext, customSamplingContext?: CustomSamplingContext) => Transaction;
/**
 * Takes a transaction and determines if it should be profiled or not. If it should be profiled, it returns the
 * profile_id, otherwise returns undefined. Takes care of setting profile context on transaction as well
 */
export declare function maybeProfileTransaction(client: NodeClient | undefined, transaction: Transaction, customSamplingContext?: CustomSamplingContext): string | undefined;
/**
 * Stops the profiler for profile_id and returns the profile
 * @param transaction
 * @param profile_id
 * @returns
 */
export declare function stopTransactionProfile(transaction: Transaction, profile_id: string | undefined): ReturnType<typeof CpuProfilerBindings['stopProfiling']> | null;
/**
 * Wraps startTransaction and stopTransaction with profiling related logic.
 * startProfiling is called after the call to startTransaction in order to avoid our own code from
 * being profiled. Because of that same reason, stopProfiling is called before the call to stopTransaction.
 */
export declare function __PRIVATE__wrapStartTransactionWithProfiling(startTransaction: StartTransaction): StartTransaction;
/**
 * This patches the global object and injects the Profiling extensions methods
 */
export declare function addProfilingExtensionMethods(): void;
export {};
//# sourceMappingURL=hubextensions.d.ts.map