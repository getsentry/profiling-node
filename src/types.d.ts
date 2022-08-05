import type { TransactionContext } from '@sentry/types';
interface ProfilingTransactionContext extends TransactionContext {
  profiling?: {
    mode?: 'eager' | 'lazy';
    samplingFrequest?: number;
  };
}
declare module '@sentry/types' {
  interface TransactionContext {
    profiling?: {
      mode?: 'eager' | 'lazy';
      samplingInterval?: number;
    };
  }
}
