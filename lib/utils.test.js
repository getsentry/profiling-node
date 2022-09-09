"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const os_1 = __importDefault(require("os"));
function makeSdkMetadata(props) {
    return {
        sdk: Object.assign({}, props)
    };
}
function makeDsn(props) {
    return Object.assign({ protocol: 'http', projectId: '1', host: 'localhost' }, props);
}
function makeEvent(props, profile) {
    return Object.assign(Object.assign({}, props), { sdkProcessingMetadata: { profile: profile } });
}
function makeProfile(props) {
    return Object.assign({ duration_ns: '100', platform: 'typescript', profile_id: '00000000-0000-0000-0000-000000000000', profile: [{}, {}], device_locale: 'unknown locale', device_manufacturer: 'unknown manufacturer', device_model: 'unknown model', device_os_name: 'unknown os name', device_os_version: 'unknown os version', device_is_emulator: false, transaction_name: 'unknown transaction', environment: 'unknown environment', version_code: 'unknown version code', version_name: 'unknown version name', trace_id: '00000000000000000000000000000000', transaction_id: '00000000000000000000000000000000' }, props);
}
describe('isProfiledTransactionEvent', () => {
    it('profiled event', () => {
        expect((0, utils_1.isProfiledTransactionEvent)({ sdkProcessingMetadata: { profile: {} } })).toBe(true);
    });
    it('not profiled event', () => {
        expect((0, utils_1.isProfiledTransactionEvent)({ sdkProcessingMetadata: { something: {} } })).toBe(false);
    });
});
describe('maybeRemoveProfileFromSdkMetadata', () => {
    it('removes profile', () => {
        expect((0, utils_1.maybeRemoveProfileFromSdkMetadata)({ sdkProcessingMetadata: { profile: {} } })).toEqual({
            sdkProcessingMetadata: {}
        });
    });
    it('does nothing', () => {
        expect((0, utils_1.maybeRemoveProfileFromSdkMetadata)({ sdkProcessingMetadata: { something: {} } })).toEqual({
            sdkProcessingMetadata: { something: {} }
        });
    });
});
describe('createProfilingEventEnvelope', () => {
    it('throws if profile is undefined', () => {
        // @ts-expect-error undefined is not a valid profile, we are forcing it here for some defensive programming
        expect(() => (0, utils_1.createProfilingEventEnvelope)(makeEvent({}, undefined), makeDsn({}), makeSdkMetadata({}))).toThrowError('Cannot construct profiling event envelope without a valid profile. Got undefined instead.');
        // @ts-expect-error null is not a valid profile, we are forcing it here for some defensive programming
        expect(() => (0, utils_1.createProfilingEventEnvelope)(makeEvent({}, null), makeDsn({}), makeSdkMetadata({}))).toThrowError('Cannot construct profiling event envelope without a valid profile. Got null instead.');
    });
    it('envelope header is of type: profile', () => {
        var _a;
        const envelope = (0, utils_1.createProfilingEventEnvelope)(makeEvent({}, makeProfile({})), makeDsn({}), makeSdkMetadata({
            name: 'sentry.javascript.node',
            version: '1.2.3',
            integrations: ['integration1', 'integration2'],
            packages: [
                { name: 'package1', version: '1.2.3' },
                { name: 'package2', version: '4.5.6' }
            ]
        }));
        expect((_a = envelope[1][0]) === null || _a === void 0 ? void 0 : _a[0].type).toBe('profile');
    });
    it('enriches envelope with sdk metadata', () => {
        const envelope = (0, utils_1.createProfilingEventEnvelope)(makeEvent({}, makeProfile({})), makeDsn({}), makeSdkMetadata({
            name: 'sentry.javascript.node',
            version: '1.2.3'
        }));
        // @ts-expect-error header type inference is broken
        expect(envelope[0].sdk.name).toBe('sentry.javascript.node');
        // @ts-expect-error header type inference is broken
        expect(envelope[0].sdk.version).toBe('1.2.3');
    });
    it('handles undefined sdk metadata', () => {
        const envelope = (0, utils_1.createProfilingEventEnvelope)(makeEvent({}, makeProfile({})), makeDsn({}), undefined);
        // @ts-expect-error header type inference is broken
        expect(envelope[0].sdk).toBe(undefined);
    });
    it('enriches envelope with dsn metadata', () => {
        const envelope = (0, utils_1.createProfilingEventEnvelope)(makeEvent({}, makeProfile({})), makeDsn({
            host: 'sentry.io',
            projectId: '123',
            protocol: 'https',
            path: 'path',
            port: '9000',
            publicKey: 'publicKey'
        }), makeSdkMetadata({}), 'tunnel');
        // @ts-expect-error header type inference is broken
        expect(envelope[0].dsn).toBe('https://publicKey@sentry.io:9000/path/123');
    });
    it('enriches profile with device info', () => {
        var _a;
        const spies = [];
        spies.push(jest.spyOn(os_1.default, 'platform').mockReturnValue('linux'));
        spies.push(jest.spyOn(os_1.default, 'release').mockReturnValue('5.4.0-42-generic'));
        spies.push(jest.spyOn(os_1.default, 'arch').mockReturnValue('x64'));
        spies.push(jest.spyOn(os_1.default, 'type').mockReturnValue('linux'));
        const envelope = (0, utils_1.createProfilingEventEnvelope)(makeEvent({}, makeProfile({})), makeDsn({}), makeSdkMetadata({}));
        const profile = (_a = envelope[1][0]) === null || _a === void 0 ? void 0 : _a[1];
        expect(profile.device_manufacturer).toBe('linux');
        expect(profile.device_model).toBe('x64');
        expect(profile.device_os_name).toBe('linux');
        expect(profile.device_os_version).toBe('5.4.0-42-generic');
        for (const spy of spies) {
            expect(spy).toHaveBeenCalledTimes(1);
        }
    });
    it('copied duration_ns from profile', () => {
        var _a;
        const envelope = (0, utils_1.createProfilingEventEnvelope)(
        // @ts-expect-error duration_ns is not a valid property on the raw profile, but we are required
        // to encode it to string so that backend will accept it.
        makeEvent({ sdkProcessingMetadata: { profile: { duration_ns: 100 } } }, makeProfile({})), makeDsn({}), makeSdkMetadata({}));
        const profile = (_a = envelope[1][0]) === null || _a === void 0 ? void 0 : _a[1];
        expect(profile.duration_ns).toBe('100');
    });
});
