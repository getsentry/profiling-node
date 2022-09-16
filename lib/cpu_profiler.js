"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CpuProfilerBindings = void 0;
// eslint-disable-next-line
const profiler = require('./../build/Release/cpu_profiler.node');
console.log(profiler);
const CpuProfilerBindings = profiler;
exports.CpuProfilerBindings = CpuProfilerBindings;
