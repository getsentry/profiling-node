import type { Hub, TransactionContext, CustomSamplingContext, Transaction } from '@sentry/types';
import type { NodeClient } from '@sentry/node';
import { CpuProfilerBindings } from './cpu_profiler';
export declare const MAX_PROFILE_DURATION_MS: number;
type StartTransaction = (this: Hub, transactionContext: TransactionContext, customSamplingContext?: CustomSamplingContext) => Transaction;
export declare function maybeProfileTransaction(client: NodeClient | undefined, transaction: Transaction, customSamplingContext?: CustomSamplingContext): string | undefined;
/**
 * Stops the profiler for profile_id and returns the profile
 * @param transaction
 * @param profile_id
 * @returns
 */
export declare function stopTransactionProfile(transaction: Transaction, profile_id: string | undefined): ReturnType<typeof CpuProfilerBindings['stopProfiling']> | null;
export declare function __PRIVATE__wrapStartTransactionWithProfiling(startTransaction: StartTransaction): StartTransaction;
/**
 * This patches the global object and injects the Profiling extensions methods
 */
export declare function addProfilingExtensionMethods(): void;
export {};
//# sourceMappingURL=hubextensions.d.ts.map