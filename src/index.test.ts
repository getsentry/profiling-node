import * as Sentry from '@sentry/node';
import '@sentry/tracing';
import type { Transport } from '@sentry/types';

import { ProfilingIntegration } from './index';
import type { Profile } from './utils';

const STATIC_TRANSPORT = {
  events: [] as any[],
  send: function (...args: any[]) {
    this.events.push(args);
    return Promise.resolve();
  },
  flush: function () {
    return Promise.resolve(true);
  }
};

function findAllProfiles(): any[] | null {
  return STATIC_TRANSPORT.events.filter((call) => {
    return call[0][1][0][0].type === 'profile';
  });
}

function findProfile(): Profile | null {
  return (
    STATIC_TRANSPORT.events.find((call) => {
      return call[0][1][0][0].type === 'profile';
    })?.[0][1][0][1] ?? null
  );
}

Sentry.init({
  dsn: 'https://7fa19397baaf433f919fbe02228d5470@o1137848.ingest.sentry.io/6625302',
  tracesSampleRate: 1,
  profilesSampleRate: 1, // Set sampling rate
  integrations: [new ProfilingIntegration()],
  transport: () => STATIC_TRANSPORT as Transport
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Sentry - Profiling', () => {
  beforeEach(() => {
    STATIC_TRANSPORT.events = [];
  });
  it('profiles a transaction', async () => {
    const transaction = Sentry.startTransaction({ name: 'title' });
    await wait(500);
    transaction.finish();

    await Sentry.flush(500);
    expect(findProfile()).not.toBe(null);
  });

  it('can profile overlapping transactions', async () => {
    const t1 = Sentry.startTransaction({ name: 'outer' });
    const t2 = Sentry.startTransaction({ name: 'inner' });
    await wait(500);

    t2.finish();
    t1.finish();

    await Sentry.flush(500);

    expect(findAllProfiles()?.[0]?.[0]?.[1]?.[0]?.[1].transactions[0].name).toBe('inner');
    expect(findAllProfiles()?.[1]?.[0]?.[1]?.[0]?.[1].transactions[0].name).toBe('outer');
    expect(findAllProfiles()).toHaveLength(2);
    expect(findProfile()).not.toBe(null);
  });

  it('does not discard overlapping transaction with same title', async () => {
    const t1 = Sentry.startTransaction({ name: 'same-title' });
    const t2 = Sentry.startTransaction({ name: 'same-title' });
    await wait(500);
    t2.finish();
    t1.finish();

    await Sentry.flush(500);
    expect(findAllProfiles()).toHaveLength(2);
    expect(findProfile()).not.toBe(null);
  });

  it('does not crash if finish is called multiple times', async () => {
    const transaction = Sentry.startTransaction({ name: 'title' });
    await wait(500);
    transaction.finish();
    transaction.finish();

    await Sentry.flush(500);
    expect(findAllProfiles()).toHaveLength(1);
    expect(findProfile()).not.toBe(null);
  });
});
