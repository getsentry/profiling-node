"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hubextensions_1 = require("./hubextensions");
// @ts-expect-error file extension errors
const cpu_profiler_1 = __importDefault(require("./../build/Release/cpu_profiler"));
function makeTransactionMock() {
    return {
        finish() {
            return;
        },
        setMetadata(metadata) {
            this.metadata = Object.assign({}, metadata);
        }
    };
}
function makeHubMock({ profileSampleRate }) {
    return {
        getClient: jest.fn().mockImplementation(() => {
            return {
                getOptions: jest.fn().mockImplementation(() => {
                    return {
                        profileSampleRate
                    };
                })
            };
        })
    };
}
describe('hubextensions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    it('skips profiling if profileSampleRate is not set (undefined)', () => {
        var _a;
        const hub = makeHubMock({ profileSampleRate: undefined });
        const startTransaction = jest.fn().mockImplementation(() => makeTransactionMock());
        const startProfilingSpy = jest.spyOn(cpu_profiler_1.default, 'startProfiling');
        const maybeStartTransactionWithProfiling = (0, hubextensions_1.__PRIVATE__wrapStartTransactionWithProfiling)(startTransaction);
        const transaction = maybeStartTransactionWithProfiling.call(hub, { name: '' }, {});
        transaction.finish();
        expect(startTransaction).toHaveBeenCalledTimes(1);
        expect(startProfilingSpy).not.toHaveBeenCalled();
        // @ts-expect-error profile is not a part of sdk metadata so we expect error until it becomes part of the official SDK.
        expect((_a = transaction.metadata) === null || _a === void 0 ? void 0 : _a.profile).toBeUndefined();
    });
    it('skips profiling if profileSampleRate is set to 0', () => {
        var _a;
        const hub = makeHubMock({ profileSampleRate: 0 });
        const startTransaction = jest.fn().mockImplementation(() => makeTransactionMock());
        const startProfilingSpy = jest.spyOn(cpu_profiler_1.default, 'startProfiling');
        const maybeStartTransactionWithProfiling = (0, hubextensions_1.__PRIVATE__wrapStartTransactionWithProfiling)(startTransaction);
        const transaction = maybeStartTransactionWithProfiling.call(hub, { name: '' }, {});
        transaction.finish();
        expect(startTransaction).toHaveBeenCalledTimes(1);
        expect(startProfilingSpy).not.toHaveBeenCalled();
        // @ts-expect-error profile is not a part of sdk metadata so we expect error until it becomes part of the official SDK.
        expect((_a = transaction.metadata) === null || _a === void 0 ? void 0 : _a.profile).toBeUndefined();
    });
    it('skips profiling when random > sampleRate', () => {
        var _a;
        const hub = makeHubMock({ profileSampleRate: 0.5 });
        jest.spyOn(global.Math, 'random').mockReturnValue(1);
        const startTransaction = jest.fn().mockImplementation(() => makeTransactionMock());
        const startProfilingSpy = jest.spyOn(cpu_profiler_1.default, 'startProfiling');
        const maybeStartTransactionWithProfiling = (0, hubextensions_1.__PRIVATE__wrapStartTransactionWithProfiling)(startTransaction);
        const transaction = maybeStartTransactionWithProfiling.call(hub, { name: '' }, {});
        transaction.finish();
        expect(startTransaction).toHaveBeenCalledTimes(1);
        expect(startProfilingSpy).not.toHaveBeenCalled();
        // @ts-expect-error profile is not a part of sdk metadata so we expect error until it becomes part of the official SDK.
        expect((_a = transaction.metadata) === null || _a === void 0 ? void 0 : _a.profile).toBeUndefined();
    });
    it('starts the profiler', () => {
        var _a;
        jest.unmock('./../build/Release/cpu_profiler');
        const startProfilingSpy = jest.spyOn(cpu_profiler_1.default, 'startProfiling');
        const stopProfilingSpy = jest.spyOn(cpu_profiler_1.default, 'stopProfiling');
        const hub = makeHubMock({ profileSampleRate: 1 });
        const startTransaction = jest.fn().mockImplementation(() => makeTransactionMock());
        const maybeStartTransactionWithProfiling = (0, hubextensions_1.__PRIVATE__wrapStartTransactionWithProfiling)(startTransaction);
        const transaction = maybeStartTransactionWithProfiling.call(hub, { name: '' }, {});
        transaction.finish();
        expect(startTransaction).toHaveBeenCalledTimes(1);
        expect(startProfilingSpy).toHaveBeenCalledTimes(1);
        expect(stopProfilingSpy).toHaveBeenCalledTimes(1);
        // @ts-expect-error profile is not a part of sdk metadata so we expect error until it becomes part of the official SDK.
        expect((_a = transaction.metadata) === null || _a === void 0 ? void 0 : _a.profile).toBeDefined();
    });
});
