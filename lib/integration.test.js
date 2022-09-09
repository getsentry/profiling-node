"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const integration_1 = require("./integration");
const utils_1 = require("@sentry/utils");
function assertCleanProfile(event) {
    var _a;
    expect((_a = event.sdkProcessingMetadata) === null || _a === void 0 ? void 0 : _a.profile).toBeUndefined();
}
function makeProfiledEvent() {
    return {
        sdkProcessingMetadata: {
            profile: {
                duration_ns: '100',
                platform: 'typescript',
                profile_id: '00000000-0000-0000-0000-000000000000',
                profile: [{}, {}],
                device_locale: 'unknown locale',
                device_manufacturer: 'unknown manufacturer',
                device_model: 'unknown model',
                device_os_name: 'unknown os name',
                device_os_version: 'unknown os version',
                device_is_emulator: false,
                transaction_name: 'unknown transaction',
                environment: 'unknown environment',
                version_code: 'unknown version code',
                version_name: 'unknown version name',
                trace_id: '00000000000000000000000000000000',
                transaction_id: '00000000000000000000000000000000'
            }
        }
    };
}
describe('ProfilingIntegration', () => {
    it('has a name', () => {
        expect(new integration_1.ProfilingIntegration().name).toBe('ProfilingIntegration');
    });
    it('keeps a reference to getCurrentHub', () => {
        const integration = new integration_1.ProfilingIntegration();
        const getCurrentHub = jest.fn();
        const addGlobalEventProcessor = () => void 0;
        integration.setupOnce(addGlobalEventProcessor, getCurrentHub);
        expect(integration.getCurrentHub).toBe(getCurrentHub);
    });
    it('when Hub.getClient returns undefined', () => {
        const logSpy = jest.spyOn(utils_1.logger, 'log');
        const integration = new integration_1.ProfilingIntegration();
        const getCurrentHub = jest.fn(() => {
            return { getClient: () => undefined };
        });
        const addGlobalEventProcessor = () => void 0;
        integration.setupOnce(addGlobalEventProcessor, getCurrentHub);
        assertCleanProfile(integration.handleGlobalEvent(makeProfiledEvent()));
        expect(logSpy).toHaveBeenCalledWith('[Profiling] getClient did not return a Client, removing profile from event and forwarding to next event processors.');
    });
    it('when getDsn returns undefined', () => {
        const logSpy = jest.spyOn(utils_1.logger, 'log');
        const integration = new integration_1.ProfilingIntegration();
        const getCurrentHub = jest.fn(() => {
            return {
                getClient: () => {
                    return {
                        getDsn: () => undefined
                    };
                }
            };
        });
        const addGlobalEventProcessor = () => void 0;
        integration.setupOnce(addGlobalEventProcessor, getCurrentHub);
        assertCleanProfile(integration.handleGlobalEvent(makeProfiledEvent()));
        expect(logSpy).toHaveBeenCalledWith('[Profiling] getDsn did not return a Dsn, removing profile from event and forwarding to next event processors.');
    });
    it('when getTransport returns undefined', () => {
        const logSpy = jest.spyOn(utils_1.logger, 'log');
        const integration = new integration_1.ProfilingIntegration();
        const getCurrentHub = jest.fn(() => {
            return {
                getClient: () => {
                    return {
                        getDsn: () => {
                            return {};
                        },
                        getTransport: () => undefined
                    };
                }
            };
        });
        const addGlobalEventProcessor = () => void 0;
        integration.setupOnce(addGlobalEventProcessor, getCurrentHub);
        assertCleanProfile(integration.handleGlobalEvent(makeProfiledEvent()));
        expect(logSpy).toHaveBeenCalledWith('[Profiling] getTransport did not return a Transport, removing profile from event and forwarding to next event processors.');
    });
    it('sends profile to sentry', () => {
        const logSpy = jest.spyOn(utils_1.logger, 'log');
        const transport = {
            send: jest.fn().mockImplementation(() => Promise.resolve()),
            flush: jest.fn().mockImplementation(() => Promise.resolve())
        };
        const integration = new integration_1.ProfilingIntegration();
        const getCurrentHub = jest.fn(() => {
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
            };
        });
        const addGlobalEventProcessor = () => void 0;
        integration.setupOnce(addGlobalEventProcessor, getCurrentHub);
        assertCleanProfile(integration.handleGlobalEvent(makeProfiledEvent()));
        expect(logSpy).toHaveBeenCalledWith('[Profiling] Preparing envelope and sending a profiling event.');
    });
});
