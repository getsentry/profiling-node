// eslint-disable-next-line
const profiler = require('./../build/Release/cpu_profiler.node');

interface Frame {
  columnNumber: number;
  deoptReasons?: string[];
  lineNumber: number;
  name: string;
  scriptId: number;
  scriptName: string;
}

export interface CpuProfile {
  weights: number[];
  duration_ns: number[];
  startValue: number;
  endValue: number;
  frames: Frame[];
  title: string;
  threadId: number;
  type: 'sampled';
  unit: string;
  samples: number[][];
}

export interface V8CpuProfilerBindings {
  startProfiling(name: string): void;
  stopProfiling(name: string): CpuProfile;
  setUsePreciseSampling(usePreciseSampling: boolean): void;
  setSamplingInterval(samplingIntervalInMicroseconds: number): void;
}

console.log(profiler);

const CpuProfilerBindings: V8CpuProfilerBindings = profiler;
export { CpuProfilerBindings };
