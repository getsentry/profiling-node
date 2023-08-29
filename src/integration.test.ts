import { EventEmitter } from 'events';

import { logger } from '@sentry/utils';
import type { Event, Hub, Transport } from '@sentry/types';

import { ProfilingIntegration } from './integration';
import type { ProfiledEvent } from './types';

function assertCleanProfile(event: ProfiledEvent | Event): void {
  expect(event.sdkProcessingMetadata?.profile).toBeUndefined();
}

function makeProfiledEvent(): ProfiledEvent {
  return {
    type: 'transaction',
    sdkProcessingMetadata: {
      profile: {
        profile_id: 'id',
        profiler_logging_mode: 'lazy',
        samples: [
          {
            elapsed_since_start_ns: '0',
            thread_id: '0',
            stack_id: 0
          },
          {
            elapsed_since_start_ns: '1',
            thread_id: '0',
            stack_id: 0
          }
        ],
        measurements: {},
        frames: [],
        stacks: [],
        resources: []
      }
    }
  };
}

describe('ProfilingIntegration', () => {
  it('has a name', () => {
    expect(new ProfilingIntegration().name).toBe('ProfilingIntegration');
  });

  it('stores a reference to getCurrentHub', () => {
    const integration = new ProfilingIntegration();

    const getCurrentHub = jest.fn().mockImplementation(() => {
      return {
        getClient: jest.fn()
      };
    });
    const addGlobalEventProcessor = () => void 0;

    integration.setupOnce(addGlobalEventProcessor, getCurrentHub);
    expect(integration.getCurrentHub).toBe(getCurrentHub);
  });

  describe('without hooks', () => {
    it('does not call transporter if null profile is received', () => {
      const transport: Transport = {
        send: jest.fn().mockImplementation(() => Promise.resolve()),
        flush: jest.fn().mockImplementation(() => Promise.resolve())
      };
      const integration = new ProfilingIntegration();

      const getCurrentHub = jest.fn((): Hub => {
        return {
          getClient: () => {
            return {
              getOptions: () => {
                return {
                  _metadata: {}
                };
              },
              getDsn: () => {
                return {};
              },
              getTransport: () => transport
            };
          }
        } as Hub;
      });
      const addGlobalEventProcessor = () => void 0;
      integration.setupOnce(addGlobalEventProcessor, getCurrentHub);

      integration.handleGlobalEvent({
        type: 'transaction',
        sdkProcessingMetadata: {
          profile: null
        }
      });
      expect(transport.send).not.toHaveBeenCalled();
    });

    it('when Hub.getClient returns undefined', () => {
      const logSpy = jest.spyOn(logger, 'log');
      const integration = new ProfilingIntegration();

      const getCurrentHub = jest.fn((): Hub => {
        return { getClient: () => undefined } as Hub;
      });
      const addGlobalEventProcessor = () => void 0;
      integration.setupOnce(addGlobalEventProcessor, getCurrentHub);

      assertCleanProfile(integration.handleGlobalEvent(makeProfiledEvent()));
      expect(logSpy).toHaveBeenCalledWith(
        '[Profiling] getClient did not return a Client, removing profile from event and forwarding to next event processors.'
      );
    });
    it('when getDsn returns undefined', () => {
      const logSpy = jest.spyOn(logger, 'log');
      const integration = new ProfilingIntegration();

      const getCurrentHub = jest.fn((): Hub => {
        return {
          getClient: () => {
            return {
              getDsn: () => undefined
            };
          }
        } as Hub;
      });
      const addGlobalEventProcessor = () => void 0;
      integration.setupOnce(addGlobalEventProcessor, getCurrentHub);

      assertCleanProfile(integration.handleGlobalEvent(makeProfiledEvent()));
      expect(logSpy).toHaveBeenCalledWith(
        '[Profiling] getDsn did not return a Dsn, removing profile from event and forwarding to next event processors.'
      );
    });
    it('when getTransport returns undefined', () => {
      const logSpy = jest.spyOn(logger, 'log');
      const integration = new ProfilingIntegration();

      const getCurrentHub = jest.fn((): Hub => {
        return {
          getClient: () => {
            return {
              getDsn: () => {
                return {};
              },
              getTransport: () => undefined
            };
          }
        } as Hub;
      });
      const addGlobalEventProcessor = () => void 0;
      integration.setupOnce(addGlobalEventProcessor, getCurrentHub);

      assertCleanProfile(integration.handleGlobalEvent(makeProfiledEvent()));
      expect(logSpy).toHaveBeenCalledWith(
        '[Profiling] getTransport did not return a Transport, removing profile from event and forwarding to next event processors.'
      );
    });

    it('sends profile to sentry', () => {
      const logSpy = jest.spyOn(logger, 'log');
      const transport: Transport = {
        send: jest.fn().mockImplementation(() => Promise.resolve()),
        flush: jest.fn().mockImplementation(() => Promise.resolve())
      };
      const integration = new ProfilingIntegration();

      const getCurrentHub = jest.fn((): Hub => {
        return {
          getClient: () => {
            return {
              getOptions: () => {
                return {
                  _metadata: {}
                };
              },
              getDsn: () => {
                return {};
              },
              getTransport: () => transport
            };
          }
        } as Hub;
      });
      const addGlobalEventProcessor = () => void 0;
      integration.setupOnce(addGlobalEventProcessor, getCurrentHub);

      assertCleanProfile(integration.handleGlobalEvent(makeProfiledEvent()));
      expect(logSpy.mock.calls?.[1]?.[0]).toBe('[Profiling] Preparing envelope and sending a profiling event');
    });
  });

  describe('with SDK hooks', () => {
    it('does not call transporter if null profile is received', () => {
      const transport: Transport = {
        send: jest.fn().mockImplementation(() => Promise.resolve()),
        flush: jest.fn().mockImplementation(() => Promise.resolve())
      };
      const integration = new ProfilingIntegration();
      const emitter = new EventEmitter();

      const getCurrentHub = jest.fn((): Hub => {
        return {
          getClient: () => {
            return {
              on: emitter.on.bind(emitter),
              emit: emitter.emit.bind(emitter),
              getOptions: () => {
                return {
                  _metadata: {}
                };
              },
              getDsn: () => {
                return {};
              },
              getTransport: () => transport
            } as any;
          }
        } as Hub;
      });

      const addGlobalEventProcessor = () => void 0;
      integration.setupOnce(addGlobalEventProcessor, getCurrentHub);

      // @TODO mock profiler stop
      expect(transport.send).not.toHaveBeenCalled();
    });

    it('binds to startTransaction, finishTransaction and beforeEnvelope', () => {
      const transport: Transport = {
        send: jest.fn().mockImplementation(() => Promise.resolve()),
        flush: jest.fn().mockImplementation(() => Promise.resolve())
      };
      const integration = new ProfilingIntegration();
      const emitter = new EventEmitter();

      const getCurrentHub = jest.fn((): Hub => {
        return {
          getClient: () => {
            return {
              on: emitter.on.bind(emitter),
              emit: emitter.emit.bind(emitter),
              getOptions: () => {
                return {
                  _metadata: {}
                };
              },
              getDsn: () => {
                return {};
              },
              getTransport: () => transport
            } as any;
          }
        } as Hub;
      });

      const spy = jest.spyOn(emitter, 'on');

      const addGlobalEventProcessor = jest.fn();
      integration.setupOnce(addGlobalEventProcessor, getCurrentHub);

      expect(spy).toBeCalledTimes(3);
      expect(spy.mock?.calls?.[0]?.[0]).toBe('startTransaction');
      expect(spy.mock?.calls?.[1]?.[0]).toBe('finishTransaction');
      expect(spy.mock?.calls?.[2]?.[0]).toBe('beforeEnvelope');

      expect(addGlobalEventProcessor).not.toHaveBeenCalled();
    });
  });
});
