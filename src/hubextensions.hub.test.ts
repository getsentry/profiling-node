import * as Sentry from '@sentry/node';

import { addExtensionMethods } from '@sentry/tracing';
import { ProfilingIntegration } from './index';
import { importCppBindingsModule } from './cpu_profiler';
import { logger } from '@sentry/utils';
import { NodeClient } from '@sentry/node';
import { getMainCarrier } from '@sentry/hub';
import type { Transport } from '@sentry/types';

function makeClientWithoutHooks(): [NodeClient, Transport] {
  const integration = new ProfilingIntegration();
  const transport = Sentry.makeNodeTransport({
    url: 'https://7fa19397baaf433f919fbe02228d5470@o1137848.ingest.sentry.io/6625302',
    recordDroppedEvent: () => {
      return undefined;
    }
  });
  const client = new NodeClient({
    stackParser: Sentry.defaultStackParser,
    tracesSampleRate: 1,
    profilesSampleRate: 1,
    debug: true,
    environment: 'test-environment',
    dsn: 'https://7fa19397baaf433f919fbe02228d5470@o1137848.ingest.sentry.io/6625302',
    integrations: [integration],
    transport: (_opts) => transport
  });
  client.setupIntegrations = () => {
    integration.setupOnce(
      (cb) => {
        // @ts-expect-error just push our processor
        getMainCarrier().__SENTRY__.globalEventProcessors = [cb];
      },
      () => Sentry.getCurrentHub()
    );
  };
  // @ts-expect-error override on purpose
  client.on = undefined;
  return [client, transport];
}

function makeClient(): [NodeClient, Transport] {
  const integration = new ProfilingIntegration();
  const transport = Sentry.makeNodeTransport({
    url: 'https://7fa19397baaf433f919fbe02228d5470@o1137848.ingest.sentry.io/6625302',
    recordDroppedEvent: () => {
      return undefined;
    }
  });
  const client = new NodeClient({
    stackParser: Sentry.defaultStackParser,
    tracesSampleRate: 1,
    profilesSampleRate: 1,
    debug: true,
    environment: 'test-environment',
    dsn: 'https://7fa19397baaf433f919fbe02228d5470@o1137848.ingest.sentry.io/6625302',
    integrations: [integration],
    transport: (_opts) => transport
  });
  client.setupIntegrations = () => {
    integration.setupOnce(
      (cb) => {
        // @ts-expect-error just push our processor
        getMainCarrier().__SENTRY__.globalEventProcessors = [cb];
      },
      () => Sentry.getCurrentHub()
    );
  };

  return [client, transport];
}

const profiler = importCppBindingsModule();
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('hubextensions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    // We will mock the carrier as if it has been initialized by the SDK, else everything is short circuited
    getMainCarrier().__SENTRY__ = {};
    addExtensionMethods();
  });
  afterEach(() => {
    delete getMainCarrier().__SENTRY__;
  });

  it('pulls environment from sdk init', async () => {
    const [client, transport] = makeClientWithoutHooks();
    const hub = Sentry.getCurrentHub();
    hub.bindClient(client);

    const transportSpy = jest.spyOn(transport, 'send').mockImplementation(() => {
      // Do nothing so we don't send events to Sentry
      return Promise.resolve();
    });

    const transaction = Sentry.getCurrentHub().startTransaction({ name: 'profile_hub' });
    await wait(500);
    transaction.finish();

    await Sentry.flush(1000);
    expect(transportSpy.mock.calls?.[0]?.[0]?.[1]?.[0]?.[1]).toMatchObject({ environment: 'test-environment' });
  });

  it('logger warns user if there are insufficient samples and discards the profile', async () => {
    const logSpy = jest.spyOn(logger, 'log');

    const [client, transport] = makeClientWithoutHooks();
    const hub = Sentry.getCurrentHub();
    hub.bindClient(client);

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
        profiler_logging_mode: 'lazy'
      };
    });

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

    const [client, transport] = makeClientWithoutHooks();
    const hub = Sentry.getCurrentHub();
    hub.bindClient(client);

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
    expect(logSpy.mock?.calls?.[6]?.[0]).toBe('[Profiling] Invalid traceId: ' + 'boop' + ' on profiled event');
  });

  describe.skip('with hooks', () => {
    it('calls profiler when transaction is started/stopped', async () => {
      const [client, transport] = makeClient();
      const hub = Sentry.getCurrentHub();
      hub.bindClient(client);

      const startProfilingSpy = jest.spyOn(profiler, 'startProfiling');
      const stopProfilingSpy = jest.spyOn(profiler, 'stopProfiling');

      const transportSpy = jest.spyOn(transport, 'send').mockImplementation(() => {
        // Do nothing so we don't send events to Sentry
        return Promise.resolve();
      });

      const transaction = hub.startTransaction({ name: 'profile_hub' });
      await wait(500);
      transaction.finish();

      await Sentry.flush(1000);

      expect(startProfilingSpy).toHaveBeenCalledTimes(1);
      expect((stopProfilingSpy.mock.lastCall?.[0] as string).length).toBe(32);
      // One for profile, the other for transaction
      expect(transportSpy).toHaveBeenCalledTimes(2);
      expect(transportSpy.mock.calls?.[0]?.[0]?.[1]?.[0]?.[0]).toMatchObject({ type: 'profile' });
    });

    it('sends profile in separate envelope', async () => {
      const [client, transport] = makeClient();
      const hub = Sentry.getCurrentHub();
      hub.bindClient(client);

      const transportSpy = jest.spyOn(transport, 'send').mockImplementation(() => {
        // Do nothing so we don't send events to Sentry
        return Promise.resolve();
      });

      const transaction = hub.startTransaction({ name: 'profile_hub' });
      await wait(500);
      transaction.finish();

      await Sentry.flush(1000);

      // One for profile, the other for transaction
      expect(transportSpy).toHaveBeenCalledTimes(1);
      // @TODO fix this
      expect(transportSpy.mock.calls?.[0]?.[0]?.[1]?.[0]?.[0]).toMatchObject({ type: 'profile' });
    });
  });

  describe('without hooks', () => {
    it('calls profiler when transaction is started/stopped', async () => {
      const [client] = makeClientWithoutHooks();
      const hub = Sentry.getCurrentHub();
      hub.bindClient(client);

      const startProfilingSpy = jest.spyOn(profiler, 'startProfiling');
      const stopProfilingSpy = jest.spyOn(profiler, 'stopProfiling');

      const transaction = hub.startTransaction({ name: 'profile_hub' });
      await wait(500);
      transaction.finish();

      await Sentry.flush(1000);

      expect(startProfilingSpy).toHaveBeenCalledTimes(1);
      expect((stopProfilingSpy.mock.lastCall?.[0] as string).length).toBe(32);
    });

    it('sends profile in separate envelope', async () => {
      const [client, transport] = makeClientWithoutHooks();
      const hub = Sentry.getCurrentHub();
      hub.bindClient(client);

      const transportSpy = jest.spyOn(transport, 'send').mockImplementation(() => {
        // Do nothing so we don't send events to Sentry
        return Promise.resolve();
      });

      const transaction = hub.startTransaction({ name: 'profile_hub' });
      await wait(500);
      transaction.finish();

      await Sentry.flush(1000);

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

      const [client] = makeClientWithoutHooks();
      const hub = Sentry.getCurrentHub();
      hub.bindClient(client);

      const transaction = Sentry.getCurrentHub().startTransaction({ name: 'timeout_transaction' });
      expect(startProfilingSpy).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(30001);

      expect(stopProfilingSpy).toHaveBeenCalledTimes(1);
      expect((stopProfilingSpy.mock.lastCall?.[0] as string).length).toBe(32);

      transaction.finish();
      expect(stopProfilingSpy).toHaveBeenCalledTimes(1);
    });
  });
});
