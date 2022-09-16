"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Sentry = __importStar(require("@sentry/node"));
require("@sentry/tracing"); // this has a addExtensionMethods side effect
const index_1 = require("./index"); // this has a addExtensionMethods side effect
Sentry.init({
    dsn: 'https://3e28828639ff4360baed0f350b8010bd@o1137848.ingest.sentry.io/6326615',
    debug: false,
    tracesSampleRate: 1,
    // @ts-expect-error profilingSampleRate is not part of the options type yet
    profileSampleRate: 1,
    integrations: [new index_1.ProfilingIntegration()]
});
// @ts-expect-error file extension errors
const cpu_profiler_1 = __importDefault(require("./../build/Release/cpu_profiler"));
describe('hubextensions', () => {
    it('calls profiler when startTransaction is invoked on hub', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        const startProfilingSpy = jest.spyOn(cpu_profiler_1.default, 'startProfiling');
        const stopProfilingSpy = jest.spyOn(cpu_profiler_1.default, 'stopProfiling');
        const transport = (_a = Sentry.getCurrentHub().getClient()) === null || _a === void 0 ? void 0 : _a.getTransport();
        if (!transport) {
            throw new Error('Sentry getCurrentHub()->getClient()->getTransport() did not return a transport');
        }
        const transportSpy = jest.spyOn(transport, 'send').mockImplementation(() => {
            // Do nothing so we don't send events to Sentry
            return Promise.resolve();
        });
        const transaction = Sentry.getCurrentHub().startTransaction({ name: 'profile_hub' });
        transaction.finish();
        yield Sentry.flush(1000);
        expect(startProfilingSpy).toHaveBeenCalledTimes(1);
        expect(stopProfilingSpy).toHaveBeenCalledWith('profile_hub');
        // One for profile, the other for transaction
        expect(transportSpy).toHaveBeenCalledTimes(2);
        expect((_f = (_e = (_d = (_c = (_b = transportSpy.mock.calls) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d[1]) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f[0]).toMatchObject({ type: 'profile' });
    }));
});
