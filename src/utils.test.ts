import type { SdkMetadata, DsnComponents } from '@sentry/types';
import type { ProfiledEvent } from './utils';

import {
  maybeRemoveProfileFromSdkMetadata,
  isProfiledTransactionEvent,
  createProfilingEventEnvelope,
  Profile,
  ProcessedThreadCpuProfile
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
    duration_ns: '1',
    title: 'profile',
    start_value: 0,
    end_value: 1,
    type: 'sampled',
    unit: 'microseconds',
    samples: [],
    weights: [],
    thread_id: undefined,
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
    // @ts-expect-error undefined is not a valid profile, we are forcing it here for some defensive programming
    expect(() => createProfilingEventEnvelope(makeEvent({}, undefined), makeDsn({}), makeSdkMetadata({}))).toThrowError(
      'Cannot construct profiling event envelope without a valid profile. Got undefined instead.'
    );
    // @ts-expect-error null is not a valid profile, we are forcing it here for some defensive programming
    expect(() => createProfilingEventEnvelope(makeEvent({}, null), makeDsn({}), makeSdkMetadata({}))).toThrowError(
      'Cannot construct profiling event envelope without a valid profile. Got null instead.'
    );
  });

  it('envelope header is of type: profile', () => {
    const envelope = createProfilingEventEnvelope(
      makeEvent({}, makeProfile({})),
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
      makeEvent({}, makeProfile({})),
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
    const envelope = createProfilingEventEnvelope(makeEvent({}, makeProfile({})), makeDsn({}), undefined);

    // @ts-expect-error header type inference is broken
    expect(envelope[0].sdk).toBe(undefined);
  });

  it('enriches envelope with dsn metadata', () => {
    const envelope = createProfilingEventEnvelope(
      makeEvent({}, makeProfile({})),
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
    spies.push(jest.spyOn(os, 'type').mockReturnValue('linux'));

    const envelope = createProfilingEventEnvelope(makeEvent({}, makeProfile({})), makeDsn({}), makeSdkMetadata({}));
    const profile = envelope[1][0]?.[1] as Profile<ProcessedThreadCpuProfile>;

    expect(profile.device_manufacturer).toBe('linux');
    expect(profile.device_model).toBe('x64');
    expect(profile.device_os_name).toBe('linux');
    expect(profile.device_os_version).toBe('5.4.0-42-generic');

    for (const spy of spies) {
      expect(spy).toHaveBeenCalledTimes(1);
    }
  });

  it('enriches profile with thread_id', () => {
    const envelope = createProfilingEventEnvelope(
      makeEvent({}, makeProfile({ thread_id: undefined })),
      makeDsn({}),
      makeSdkMetadata({})
    );

    const profile = envelope[1][0]?.[1] as Profile<ProcessedThreadCpuProfile>;
    expect(profile.profile[0].thread_id).not.toBe(undefined);
    expect(typeof profile.profile[0].thread_id).toBe('number');
  });

  it('copied duration_ns from profile', () => {
    const envelope = createProfilingEventEnvelope(
      makeEvent({ sdkProcessingMetadata: {} }, makeProfile({ duration_ns: 100 })),
      makeDsn({}),
      makeSdkMetadata({})
    );
    const profile = envelope[1][0]?.[1] as NonNullable<ProfiledEvent['sdkProcessingMetadata']['profile']>;
    expect(profile.duration_ns).toBe('100');
  });
});
