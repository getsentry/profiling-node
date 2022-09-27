"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CpuProfilerBindings = void 0;
// @ts-expect-error this screams because it cannot resolve the module?
const cpu_profiler_node_1 = __importDefault(require("./../build/Release/cpu_profiler.node"));
const CpuProfilerBindings = cpu_profiler_node_1.default;
exports.CpuProfilerBindings = CpuProfilerBindings;
