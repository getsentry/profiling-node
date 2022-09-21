import type { BaseTransportOptions, ClientOptions, Hub, Transaction, TransactionMetadata } from '@sentry/types';

import { __PRIVATE__wrapStartTransactionWithProfiling } from './hubextensions';

// @ts-expect-error file extension errors
import profiler from './../build/Release/cpu_profiler';

function makeTransactionMock(): Transaction {
  return {
    finish() {
      return;
    },
    setMetadata(metadata: Partial<TransactionMetadata>) {
      this.metadata = { ...metadata } as TransactionMetadata;
    }
  } as Transaction;
}

function makeHubMock({ profileSampleRate }: { profileSampleRate: number | undefined }): Hub {
  return {
    getClient: jest.fn().mockImplementation(() => {
      return {
        getOptions: jest.fn().mockImplementation(() => {
          return {
            profileSampleRate
          } as unknown as ClientOptions<BaseTransportOptions>;
        })
      };
    })
  } as unknown as Hub;
}

describe('hubextensions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  it('skips profiling if profileSampleRate is not set (undefined)', () => {
    const hub = makeHubMock({ profileSampleRate: undefined });
    const startTransaction = jest.fn().mockImplementation(() => makeTransactionMock());
    const startProfilingSpy = jest.spyOn(profiler, 'startProfiling');

    const maybeStartTransactionWithProfiling = __PRIVATE__wrapStartTransactionWithProfiling(startTransaction);
    const transaction = maybeStartTransactionWithProfiling.call(hub, { name: '' }, {});
    transaction.finish();

    expect(startTransaction).toHaveBeenCalledTimes(1);
    expect(startProfilingSpy).not.toHaveBeenCalled();
    // @ts-expect-error profile is not part of SDK metadata
    expect(transaction.metadata?.profile).toBeUndefined();
  });
  it('skips profiling if profileSampleRate is set to 0', () => {
    const hub = makeHubMock({ profileSampleRate: 0 });
    const startTransaction = jest.fn().mockImplementation(() => makeTransactionMock());
    const startProfilingSpy = jest.spyOn(profiler, 'startProfiling');

    const maybeStartTransactionWithProfiling = __PRIVATE__wrapStartTransactionWithProfiling(startTransaction);
    const transaction = maybeStartTransactionWithProfiling.call(hub, { name: '' }, {});
    transaction.finish();

    expect(startTransaction).toHaveBeenCalledTimes(1);
    expect(startProfilingSpy).not.toHaveBeenCalled();
    // @ts-expect-error profile is not part of SDK metadata
    expect(transaction.metadata?.profile).toBeUndefined();
  });
  it('skips profiling when random > sampleRate', () => {
    const hub = makeHubMock({ profileSampleRate: 0.5 });
    jest.spyOn(global.Math, 'random').mockReturnValue(1);
    const startTransaction = jest.fn().mockImplementation(() => makeTransactionMock());
    const startProfilingSpy = jest.spyOn(profiler, 'startProfiling');

    const maybeStartTransactionWithProfiling = __PRIVATE__wrapStartTransactionWithProfiling(startTransaction);
    const transaction = maybeStartTransactionWithProfiling.call(hub, { name: '' }, {});
    transaction.finish();

    expect(startTransaction).toHaveBeenCalledTimes(1);
    expect(startProfilingSpy).not.toHaveBeenCalled();
    // @ts-expect-error profile is not part of SDK metadata
    expect(transaction.metadata?.profile).toBeUndefined();
  });
  it('starts the profiler', () => {
    jest.unmock('./../build/Release/cpu_profiler');
    const startProfilingSpy = jest.spyOn(profiler, 'startProfiling');
    const stopProfilingSpy = jest.spyOn(profiler, 'stopProfiling');

    const hub = makeHubMock({ profileSampleRate: 1 });
    const startTransaction = jest.fn().mockImplementation(() => makeTransactionMock());

    const maybeStartTransactionWithProfiling = __PRIVATE__wrapStartTransactionWithProfiling(startTransaction);
    const transaction = maybeStartTransactionWithProfiling.call(hub, { name: '' }, {});
    transaction.finish();

    expect(startTransaction).toHaveBeenCalledTimes(1);
    expect(startProfilingSpy).toHaveBeenCalledTimes(1);
    expect(stopProfilingSpy).toHaveBeenCalledTimes(1);
    // @ts-expect-error profile is not part of SDK metadata
    expect(transaction.metadata?.profile).toBeDefined();
  });
});
