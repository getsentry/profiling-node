import type types from '@sentry/types';

declare module '@sentry/types' {
  export interface TransactionContextWithProfiling extends types.TransactionContext {
    profiling: {
      mode?: 'eager' | 'lazy';
      samplingFrequest?: number;
    };
  }
}
