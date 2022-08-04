import types from '@sentry/types';

declare module '@sentry/types' {
  export interface TransactionContextWithProfiling extends TransactionContext {
    profiling: {
      mode?: 'eager' | 'lazy';
      samplingFrequest?: number;
    };
  }

  export default types;
}
