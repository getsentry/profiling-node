"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cpu_profiler_1 = require("./../cpu_profiler");
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const profiled = (name, fn) => {
    cpu_profiler_1.CpuProfiler.startProfiling(name);
    fn();
    return cpu_profiler_1.CpuProfiler.stopProfiling(name);
};
const assertValidWeights = (weights) => {
    const isValidWeights = Array.isArray(weights) && weights.every((w) => w >= 0);
    expect(isValidWeights).toBe(true);
};
const assertValidSamples = (samples) => {
    const isValidSamples = Array.isArray(samples) &&
        samples.every((s) => {
            return Array.isArray(s) && s.every((v) => v >= 0);
        });
    expect(isValidSamples).toBe(true);
};
const assertWeightsToSamples = (weights, samples) => {
    expect(weights.length).toBe(samples.length);
};
describe('Profiler bindings', () => {
    it('exports profiler binding methods', () => {
        expect(typeof cpu_profiler_1.CpuProfiler['startProfiling']).toBe('function');
        expect(typeof cpu_profiler_1.CpuProfiler['stopProfiling']).toBe('function');
        expect(typeof cpu_profiler_1.CpuProfiler['setSamplingInterval']).toBe('function');
        expect(typeof cpu_profiler_1.CpuProfiler['setUsePreciseSampling']).toBe('function');
    });
    it('profiles a program', () => __awaiter(void 0, void 0, void 0, function* () {
        const profile = profiled('profiled-program', () => __awaiter(void 0, void 0, void 0, function* () {
            yield wait(500);
        }));
        expect(profile.title).toBe('profiled-program');
        assertValidSamples(profile.samples);
        assertValidWeights(profile.weights);
        assertWeightsToSamples(profile.weights, profile.samples);
    }));
    it('includes deopt reason', () => __awaiter(void 0, void 0, void 0, function* () {
        const types = [1, '', null, undefined, true, false, {}, [], () => { }];
        const randomFromArray = (arr) => arr[Math.floor(Math.random() * arr.length)];
        function holesInArray() {
            const array = [];
            let i = 0;
            while (i < 1e6) {
                array[i] = randomFromArray(types);
                i++;
            }
            return array;
        }
        const profile = profiled('profiled-program', () => __awaiter(void 0, void 0, void 0, function* () {
            let i = 0;
            while (i < 3) {
                holesInArray();
                i++;
            }
        }));
        expect(profile.title).toBe('profiled-program');
        console.log(profile);
        assertValidSamples(profile.samples);
        assertValidWeights(profile.weights);
        assertWeightsToSamples(profile.weights, profile.samples);
    }));
});
