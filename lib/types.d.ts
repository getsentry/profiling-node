import type { TransactionContext } from '@sentry/types';

declare module '@sentry/types' {
  interface TransactionContextWithProfiling extends TransactionContext {
    profiling: {
      mode?: 'eager' | 'lazy';
      samplingFrequest?: number;
    };
  }
}
