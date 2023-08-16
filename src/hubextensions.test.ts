import type {
  BaseTransportOptions,
  ClientOptions,
  Hub,
  Context,
  Transaction,
  TransactionMetadata
} from '@sentry/types';

import type { NodeClient } from '@sentry/node';

import { __PRIVATE__wrapStartTransactionWithProfiling } from './hubextensions';
import { CpuProfilerBindings } from './cpu_profiler';

import SegfaultHandler from 'segfault-handler';
SegfaultHandler.registerHandler('crash.log', function (signal, address, stack) {
  console.log(JSON.stringify(signal), JSON.stringify(address), JSON.stringify(stack));
});

function makeTransactionMock(options = {}): Transaction {
  return {
    metadata: {},
    tags: {},
    sampled: true,
    contexts: {},
    startChild: () => ({ finish: () => void 0 }),
    finish() {
      return;
    },
    toContext: () => {
      return {};
    },
    setContext(this: Transaction, key: string, context: Context) {
      // @ts-expect-error - contexts is private
      this.contexts[key] = context;
    },
    setTag(this: Transaction, key: string, value: any) {
      this.tags[key] = value;
    },
    setMetadata(this: Transaction, metadata: Partial<TransactionMetadata>) {
      this.metadata = { ...metadata } as TransactionMetadata;
    },
    ...options
  } as unknown as Transaction;
}

function makeHubMock({
  profilesSampleRate,
  client
}: {
  profilesSampleRate: number | undefined;
  client?: Partial<NodeClient>;
}): Hub {
  return {
    getClient: jest.fn().mockImplementation(() => {
      return {
        getOptions: jest.fn().mockImplementation(() => {
          return {
            profilesSampleRate
          } as unknown as ClientOptions<BaseTransportOptions>;
        }),
        ...(client ?? {})
      };
    })
  } as unknown as Hub;
}

describe('hubextensions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  it('skips profiling if profilesSampleRate is not set (undefined)', () => {
    const hub = makeHubMock({ profilesSampleRate: undefined });
    const startTransaction = jest.fn().mockImplementation(() => makeTransactionMock());
    const startProfilingSpy = jest.spyOn(CpuProfilerBindings, 'startProfiling');

    const maybeStartTransactionWithProfiling = __PRIVATE__wrapStartTransactionWithProfiling(startTransaction);
    const transaction = maybeStartTransactionWithProfiling.call(hub, { name: '' }, {});
    transaction.finish();

    expect(startTransaction).toHaveBeenCalledTimes(1);
    expect(startProfilingSpy).not.toHaveBeenCalled();
    expect((transaction.metadata as any)?.profile).toBeUndefined();
  });
  it('skips profiling if profilesSampleRate is set to 0', () => {
    const hub = makeHubMock({ profilesSampleRate: 0 });
    const startTransaction = jest.fn().mockImplementation(() => makeTransactionMock());
    const startProfilingSpy = jest.spyOn(CpuProfilerBindings, 'startProfiling');

    const maybeStartTransactionWithProfiling = __PRIVATE__wrapStartTransactionWithProfiling(startTransaction);
    const transaction = maybeStartTransactionWithProfiling.call(hub, { name: '' }, {});
    transaction.finish();

    expect(startTransaction).toHaveBeenCalledTimes(1);
    expect(startProfilingSpy).not.toHaveBeenCalled();

    expect((transaction.metadata as any)?.profile).toBeUndefined();
  });
  it('skips profiling when random > sampleRate', () => {
    const hub = makeHubMock({ profilesSampleRate: 0.5 });
    jest.spyOn(global.Math, 'random').mockReturnValue(1);
    const startTransaction = jest.fn().mockImplementation(() => makeTransactionMock());
    const startProfilingSpy = jest.spyOn(CpuProfilerBindings, 'startProfiling');

    const maybeStartTransactionWithProfiling = __PRIVATE__wrapStartTransactionWithProfiling(startTransaction);
    const transaction = maybeStartTransactionWithProfiling.call(hub, { name: '' }, {});
    transaction.finish();

    expect(startTransaction).toHaveBeenCalledTimes(1);
    expect(startProfilingSpy).not.toHaveBeenCalled();

    expect((transaction.metadata as any)?.profile).toBeUndefined();
  });
  it('starts the profiler', () => {
    const startProfilingSpy = jest.spyOn(CpuProfilerBindings, 'startProfiling');
    const stopProfilingSpy = jest.spyOn(CpuProfilerBindings, 'stopProfiling');

    const hub = makeHubMock({ profilesSampleRate: 1 });
    const startTransaction = jest.fn().mockImplementation(() => makeTransactionMock());

    const maybeStartTransactionWithProfiling = __PRIVATE__wrapStartTransactionWithProfiling(startTransaction);
    const transaction = maybeStartTransactionWithProfiling.call(hub, { name: '' }, {});
    transaction.finish();

    expect(startTransaction).toHaveBeenCalledTimes(1);
    expect(startProfilingSpy).toHaveBeenCalledTimes(1);
    expect(stopProfilingSpy).toHaveBeenCalledTimes(1);

    expect((transaction.metadata as any)?.profile).toBeDefined();
  });

  it('does not start the profiler if transaction is sampled', () => {
    const startProfilingSpy = jest.spyOn(CpuProfilerBindings, 'startProfiling');
    const stopProfilingSpy = jest.spyOn(CpuProfilerBindings, 'stopProfiling');

    const hub = makeHubMock({ profilesSampleRate: 1 });
    const startTransaction = jest.fn().mockImplementation(() => makeTransactionMock({ sampled: false }));

    const maybeStartTransactionWithProfiling = __PRIVATE__wrapStartTransactionWithProfiling(startTransaction);
    const transaction = maybeStartTransactionWithProfiling.call(hub, { name: '' }, {});
    transaction.finish();

    expect(startTransaction).toHaveBeenCalledTimes(1);
    expect(startProfilingSpy).not.toHaveBeenCalledTimes(1);
    expect(stopProfilingSpy).not.toHaveBeenCalledTimes(1);
  });

  it('disabled if neither profilesSampler and profilesSampleRate are not set', () => {
    const hub = makeHubMock({ profilesSampleRate: undefined });
    const startTransaction = jest.fn().mockImplementation(() => makeTransactionMock());

    const maybeStartTransactionWithProfiling = __PRIVATE__wrapStartTransactionWithProfiling(startTransaction);
    const samplingContext = { beep: 'boop' };
    const transaction = maybeStartTransactionWithProfiling.call(hub, { name: '' }, samplingContext);
    transaction.finish();

    const startProfilingSpy = jest.spyOn(CpuProfilerBindings, 'startProfiling');
    expect(startProfilingSpy).not.toHaveBeenCalled();
  });

  it('does not call startProfiling if profilesSampler returns invalid rate', () => {
    const startProfilingSpy = jest.spyOn(CpuProfilerBindings, 'startProfiling');
    const options = { profilesSampler: jest.fn().mockReturnValue(NaN) };
    const hub = makeHubMock({
      profilesSampleRate: undefined,
      client: {
        // @ts-expect-error partial client
        getOptions: () => options
      }
    });
    const startTransaction = jest.fn().mockImplementation(() => makeTransactionMock());

    const maybeStartTransactionWithProfiling = __PRIVATE__wrapStartTransactionWithProfiling(startTransaction);
    const samplingContext = { beep: 'boop' };
    const transaction = maybeStartTransactionWithProfiling.call(hub, { name: '' }, samplingContext);
    transaction.finish();

    expect(options.profilesSampler).toHaveBeenCalled();
    expect(startProfilingSpy).not.toHaveBeenCalled();
  });

  it('does not call startProfiling if profilesSampleRate is invalid', () => {
    const startProfilingSpy = jest.spyOn(CpuProfilerBindings, 'startProfiling');
    const options = { profilesSampler: jest.fn().mockReturnValue(NaN) };
    const hub = makeHubMock({
      profilesSampleRate: NaN,
      client: {
        // @ts-expect-error partial client
        getOptions: () => options
      }
    });
    const startTransaction = jest.fn().mockImplementation(() => makeTransactionMock());

    const maybeStartTransactionWithProfiling = __PRIVATE__wrapStartTransactionWithProfiling(startTransaction);
    const samplingContext = { beep: 'boop' };
    const transaction = maybeStartTransactionWithProfiling.call(hub, { name: '' }, samplingContext);
    transaction.finish();

    expect(options.profilesSampler).toHaveBeenCalled();
    expect(startProfilingSpy).not.toHaveBeenCalled();
  });

  it('calls profilesSampler with sampling context', () => {
    const options = { profilesSampler: jest.fn() };
    const hub = makeHubMock({
      profilesSampleRate: undefined,
      client: {
        // @ts-expect-error partial client
        getOptions: () => options
      }
    });
    const startTransaction = jest.fn().mockImplementation(() => makeTransactionMock());

    const maybeStartTransactionWithProfiling = __PRIVATE__wrapStartTransactionWithProfiling(startTransaction);
    const samplingContext = { beep: 'boop' };
    const transaction = maybeStartTransactionWithProfiling.call(hub, { name: '' }, samplingContext);
    transaction.finish();

    expect(options.profilesSampler).toHaveBeenCalledWith({
      ...samplingContext,
      transactionContext: transaction.toContext()
    });
  });

  it('prioritizes profilesSampler outcome over profilesSampleRate', () => {
    const startProfilingSpy = jest.spyOn(CpuProfilerBindings, 'startProfiling');
    const options = { profilesSampler: jest.fn().mockReturnValue(1) };
    const hub = makeHubMock({
      profilesSampleRate: 0,
      client: {
        // @ts-expect-error partial client
        getOptions: () => options
      }
    });
    const startTransaction = jest.fn().mockImplementation(() => makeTransactionMock());

    const maybeStartTransactionWithProfiling = __PRIVATE__wrapStartTransactionWithProfiling(startTransaction);
    const samplingContext = { beep: 'boop' };
    const transaction = maybeStartTransactionWithProfiling.call(hub, { name: '' }, samplingContext);
    transaction.finish();

    expect(startProfilingSpy).toHaveBeenCalled();
  });
});
