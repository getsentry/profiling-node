import type { PrivateV8CpuProfilerBindings, V8CpuProfilerBindings } from './types';
/**
 *  Imports cpp bindings based on the current platform and architecture.
 */
export declare function importCppBindingsModule(): PrivateV8CpuProfilerBindings;
declare const PrivateCpuProfilerBindings: PrivateV8CpuProfilerBindings;
declare const CpuProfilerBindings: V8CpuProfilerBindings;
export { PrivateCpuProfilerBindings };
export { CpuProfilerBindings };
//# sourceMappingURL=cpu_profiler.d.ts.map