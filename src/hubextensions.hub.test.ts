import * as Sentry from '@sentry/node';
import '@sentry/tracing'; // this has a addExtensionMethods side effect
import { ProfilingIntegration } from './index'; // this has a addExtensionMethods side effect

Sentry.init({
  dsn: 'https://3e28828639ff4360baed0f350b8010bd@o1137848.ingest.sentry.io/6326615',
  debug: false,
  tracesSampleRate: 1,
  // @ts-expect-error profilingSampleRate is not part of the options type yet
  profileSampleRate: 1,
  integrations: [new ProfilingIntegration()]
});

// @ts-expect-error file extension errors
import profiler from './../build/Release/cpu_profiler';

describe('hubextensions', () => {
  it('calls profiler when startTransaction is invoked on hub', () => {
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
    transaction.finish();

    expect(startProfilingSpy).toHaveBeenCalledTimes(1);
    expect(stopProfilingSpy).toHaveBeenCalledWith('profile_hub');
    expect(transportSpy).toHaveBeenCalledTimes(1);
  });
});
