import type { SdkMetadata, DsnComponents } from '@sentry/types';
import type { ProfiledEvent } from './utils';

import {
  maybeRemoveProfileFromSdkMetadata,
  isProfiledTransactionEvent,
  createProfilingEventEnvelope,
  Profile
} from './utils';
import os from 'os';

function makeSdkMetadata(props: Partial<SdkMetadata['sdk']>): SdkMetadata {
  return {
    sdk: {
      ...props
    }
  };
}

function makeDsn(props: Partial<DsnComponents>): DsnComponents {
  return {
    protocol: 'http',
    projectId: '1',
    host: 'localhost',
    ...props
  };
}

function makeEvent(
  props: Partial<ProfiledEvent>,
  profile: NonNullable<ProfiledEvent['sdkProcessingMetadata']['profile']>
): ProfiledEvent {
  return { ...props, sdkProcessingMetadata: { profile: profile } };
}

function makeProfile(
  props: Partial<ProfiledEvent['sdkProcessingMetadata']['profile']>
): NonNullable<ProfiledEvent['sdkProcessingMetadata']['profile']> {
  return {
    profile_end_us: 1,
    profile_start_us: 0,
    stacks: [],
    samples: [],
    frames: [],
    ...props
  };
}

describe('isProfiledTransactionEvent', () => {
  it('profiled event', () => {
    expect(isProfiledTransactionEvent({ sdkProcessingMetadata: { profile: {} } })).toBe(true);
  });
  it('not profiled event', () => {
    expect(isProfiledTransactionEvent({ sdkProcessingMetadata: { something: {} } })).toBe(false);
  });
});

describe('maybeRemoveProfileFromSdkMetadata', () => {
  it('removes profile', () => {
    expect(maybeRemoveProfileFromSdkMetadata({ sdkProcessingMetadata: { profile: {} } })).toEqual({
      sdkProcessingMetadata: {}
    });
  });

  it('does nothing', () => {
    expect(maybeRemoveProfileFromSdkMetadata({ sdkProcessingMetadata: { something: {} } })).toEqual({
      sdkProcessingMetadata: { something: {} }
    });
  });
});

describe('createProfilingEventEnvelope', () => {
  it('throws if profile is undefined', () => {
    expect(() =>
      // @ts-expect-error undefined is not a valid profile, we are forcing it here for some defensive programming
      createProfilingEventEnvelope(makeEvent({ type: 'transaction' }, undefined), makeDsn({}), makeSdkMetadata({}))
    ).toThrowError('Cannot construct profiling event envelope without a valid profile. Got undefined instead.');
    expect(() =>
      // @ts-expect-error null is not a valid profile, we are forcing it here for some defensive programming
      createProfilingEventEnvelope(makeEvent({ type: 'transaction' }, null), makeDsn({}), makeSdkMetadata({}))
    ).toThrowError('Cannot construct profiling event envelope without a valid profile. Got null instead.');
  });

  it('envelope header is of type: profile', () => {
    const envelope = createProfilingEventEnvelope(
      makeEvent({ type: 'transaction' }, makeProfile({})),
      makeDsn({}),
      makeSdkMetadata({
        name: 'sentry.javascript.node',
        version: '1.2.3',
        integrations: ['integration1', 'integration2'],
        packages: [
          { name: 'package1', version: '1.2.3' },
          { name: 'package2', version: '4.5.6' }
        ]
      })
    );
    expect(envelope[1][0]?.[0].type).toBe('profile');
  });
  it('enriches envelope with sdk metadata', () => {
    const envelope = createProfilingEventEnvelope(
      makeEvent({ type: 'transaction' }, makeProfile({})),
      makeDsn({}),
      makeSdkMetadata({
        name: 'sentry.javascript.node',
        version: '1.2.3'
      })
    );

    // @ts-expect-error header type inference is broken
    expect(envelope[0].sdk.name).toBe('sentry.javascript.node');
    // @ts-expect-error header type inference is broken
    expect(envelope[0].sdk.version).toBe('1.2.3');
  });

  it('handles undefined sdk metadata', () => {
    const envelope = createProfilingEventEnvelope(
      makeEvent({ type: 'transaction' }, makeProfile({})),
      makeDsn({}),
      undefined
    );

    // @ts-expect-error header type inference is broken
    expect(envelope[0].sdk).toBe(undefined);
  });

  it('enriches envelope with dsn metadata', () => {
    const envelope = createProfilingEventEnvelope(
      makeEvent({ type: 'transaction' }, makeProfile({})),
      makeDsn({
        host: 'sentry.io',
        projectId: '123',
        protocol: 'https',
        path: 'path',
        port: '9000',
        publicKey: 'publicKey'
      }),
      makeSdkMetadata({}),
      'tunnel'
    );

    // @ts-expect-error header type inference is broken
    expect(envelope[0].dsn).toBe('https://publicKey@sentry.io:9000/path/123');
  });

  it('enriches profile with device info', () => {
    const spies: jest.SpyInstance<string>[] = [];

    spies.push(jest.spyOn(os, 'platform').mockReturnValue('linux'));
    spies.push(jest.spyOn(os, 'release').mockReturnValue('5.4.0-42-generic'));
    spies.push(jest.spyOn(os, 'arch').mockReturnValue('x64'));
    // This will be called on node18, but not on lower versions of node
    if (typeof os.machine === 'function') {
      spies.push(jest.spyOn(os, 'machine').mockReturnValue('x64'));
    }
    spies.push(jest.spyOn(os, 'type').mockReturnValue('linux'));

    const envelope = createProfilingEventEnvelope(
      makeEvent({ type: 'transaction' }, makeProfile({})),
      makeDsn({}),
      makeSdkMetadata({})
    );
    const profile = envelope[1][0]?.[1] as unknown as Profile;

    expect(profile.device.manufacturer).toBe('linux');
    expect(profile.device.model).toBe('x64');
    expect(profile.os.name).toBe('linux');
    expect(profile.os.version).toBe('5.4.0-42-generic');

    for (const spy of spies) {
      expect(spy).toHaveBeenCalled();
    }
  });

  it('throws if event.type is not a transaction', () => {
    expect(() =>
      createProfilingEventEnvelope(
        makeEvent(
          // @ts-expect-error type is forced to something other than transaction
          { type: 'error' },
          // @ts-expect-error thread_id is forced to undefined and we assert that it is enriched
          makeProfile({ samples: [{ stack_id: 0, thread_id: undefined, elapsed_since_start_ns: '0' }] })
        ),
        makeDsn({}),
        makeSdkMetadata({})
      )
    ).toThrowError('Profiling events may only be attached to transactions, this should never occur.');
  });

  it('inherits transaction properties', () => {
    const start = new Date(2022, 8, 1, 12, 0, 0);
    const end = new Date(2022, 8, 1, 12, 0, 10);

    const envelope = createProfilingEventEnvelope(
      makeEvent(
        {
          type: 'transaction',
          transaction: 'transaction-name',
          start_timestamp: start.getTime() / 1000,
          timestamp: end.getTime() / 1000,
          contexts: {
            trace: {
              span_id: 'span_id',
              trace_id: 'trace_id'
            }
          }
        },
        // @ts-expect-error thread_id is forced to undefined and we assert that it is enriched
        makeProfile({ samples: [{ stack_id: 0, thread_id: undefined, elapsed_since_start_ns: '0' }] })
      ),
      makeDsn({}),
      makeSdkMetadata({})
    );

    const profile = envelope[1][0]?.[1] as unknown as Profile;

    expect(profile.transactions?.[0]?.name).toBe('transaction-name');
    expect(typeof profile.transactions?.[0]?.id).toBe('string');
    expect(profile.transactions?.[0]?.id?.length).toBe(32);
    expect(profile.transactions?.[0]?.trace_id).toBe('trace_id');
  });
});
