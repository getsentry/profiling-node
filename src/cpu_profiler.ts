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

export interface CpuProfiler {
  startProfiling(name: string): void;
  stopProfiling(name: string): CpuProfile;
  setUsePreciseSampling(usePreciseSampling: boolean): void;
  setSamplingInterval(samplingIntervalInMicroseconds: number): void;
}

const CpuProfiler = profiler as CpuProfiler;
export { CpuProfiler };
