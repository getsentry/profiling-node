import * as Sentry from '@sentry/node';
import '@sentry/tracing'; // this has a addExtensionMethods side effect
import { ProfilingIntegration } from './index'; // this has a addExtensionMethods side effect
import { importCppBindingsModule } from './cpu_profiler';
import { logger } from '@sentry/utils';

Sentry.init({
  dsn: 'https://7fa19397baaf433f919fbe02228d5470@o1137848.ingest.sentry.io/6625302',
  debug: true,
  tracesSampleRate: 1,
  profilesSampleRate: 1,
  integrations: [new ProfilingIntegration()]
});

const profiler = importCppBindingsModule();

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('hubextensions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });
  it('calls profiler when startTransaction is invoked on hub', async () => {
    const startProfilingSpy = jest.spyOn(profiler, 'startProfiling');
    const stopProfilingSpy = jest.spyOn(profiler, 'stopProfiling');
    const transport = Sentry.getCurrentHub().getClient()?.getTransport();

    if (!transport) {
      throw new Error('Sentry getCurrentHub()->getClient()->getTransport() did not return a transport');
    }

    const transportSpy = jest.spyOn(transport, 'send').mockImplementation(() => {
      // Do nothing so we don't send events to Sentry
      return Promise.resolve();
    });

    const transaction = Sentry.getCurrentHub().startTransaction({ name: 'profile_hub' });
    await wait(500);
    transaction.finish();

    await Sentry.flush(1000);

    expect(startProfilingSpy).toHaveBeenCalledTimes(1);
    expect((stopProfilingSpy.mock.lastCall?.[0] as string).startsWith('profile_hub')).toBe(true);
    // One for profile, the other for transaction
    expect(transportSpy).toHaveBeenCalledTimes(2);
    expect(transportSpy.mock.calls?.[0]?.[0]?.[1]?.[0]?.[0]).toMatchObject({ type: 'profile' });
  });

  it('respect max profile duration timeout', async () => {
    // it seems that in node 19 globals (or least part of them) are a readonly object
    // so when useFakeTimers is called it throws an error because it cannot override
    // a readonly property of performance on global object. Use legacyFakeTimers for now
    jest.useFakeTimers({ legacyFakeTimers: true });
    const startProfilingSpy = jest.spyOn(profiler, 'startProfiling');
    const stopProfilingSpy = jest.spyOn(profiler, 'stopProfiling');
    const transport = Sentry.getCurrentHub().getClient()?.getTransport();

    if (!transport) {
      throw new Error('Sentry getCurrentHub()->getClient()->getTransport() did not return a transport');
    }

    const transaction = Sentry.getCurrentHub().startTransaction({ name: 'timeout_transaction' });
    expect(startProfilingSpy).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(30001);

    expect(stopProfilingSpy).toHaveBeenCalledTimes(1);
    expect((stopProfilingSpy.mock.lastCall?.[0] as string).startsWith('timeout_transaction')).toBe(true);

    transaction.finish();
    expect(stopProfilingSpy).toHaveBeenCalledTimes(1);
  });

  it('logger warns user if there are insufficient samples and discards the profile', async () => {
    const logSpy = jest.spyOn(logger, 'log');
    const transport = Sentry.getCurrentHub().getClient()?.getTransport();

    jest.spyOn(profiler, 'stopProfiling').mockImplementation(() => {
      return {
        samples: [
          {
            stack_id: 0,
            thread_id: '0',
            elapsed_since_start_ns: '10'
          }
        ],
        stacks: [[0]],
        frames: [],
        profile_relative_ended_at_ns: 0,
        profile_relative_started_at_ns: 0,
        profiler_logging_mode: 'lazy'
      };
    });

    if (!transport) {
      throw new Error('Sentry getCurrentHub()->getClient()->getTransport() did not return a transport');
    }

    jest.spyOn(transport, 'send').mockImplementation(() => {
      // Do nothing so we don't send events to Sentry
      return Promise.resolve();
    });

    const transaction = Sentry.getCurrentHub().startTransaction({ name: 'profile_hub' });
    transaction.finish();

    await Sentry.flush(1000);
    expect(logSpy.mock?.lastCall?.[0]).toBe('[Profiling] Discarding profile because it contains less than 2 samples');

    expect((transport.send as any).mock.calls[0][0][1][0][0].type).toBe('transaction');
    expect(transport.send).toHaveBeenCalledTimes(1);
  });

  it('logger warns user if traceId is invalid', async () => {
    const logSpy = jest.spyOn(logger, 'log');
    const transport = Sentry.getCurrentHub().getClient()?.getTransport();

    if (!transport) {
      throw new Error('Sentry getCurrentHub()->getClient()->getTransport() did not return a transport');
    }

    jest.spyOn(profiler, 'stopProfiling').mockImplementation(() => {
      return {
        samples: [
          {
            stack_id: 0,
            thread_id: '0',
            elapsed_since_start_ns: '10'
          },
          {
            stack_id: 0,
            thread_id: '0',
            elapsed_since_start_ns: '10'
          }
        ],
        stacks: [[0]],
        frames: [],
        profile_relative_ended_at_ns: 0,
        profile_relative_started_at_ns: 0,
        profiler_logging_mode: 'lazy'
      };
    });

    jest.spyOn(transport, 'send').mockImplementation(() => {
      // Do nothing so we don't send events to Sentry
      return Promise.resolve();
    });

    const transaction = Sentry.getCurrentHub().startTransaction({ name: 'profile_hub', traceId: 'boop' });
    await wait(500);
    transaction.finish();

    await Sentry.flush(1000);
    expect(logSpy.mock?.calls?.[5]?.[0]).toBe('[Profiling] Invalid traceId: ' + 'boop' + ' on profiled event');
  });
});
