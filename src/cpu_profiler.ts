// eslint-disable-next-line
const profiler = require('./../build/Release/cpu_profiler.node');

interface Frame {
  name: string;
  script_name: string;
  script_id: number;
  line_number: number;
  column_number: number;
  deopt_reasons?: string[];
}

export interface ThreadCpuProfile {
  title: string;
  start_value: number;
  end_value: number;
  type: string;
  unit: string;
  duration_ns: string | number;
  samples: number[];
  weights: number[];
  thread_id: number | undefined;
  frames: Frame[];
}

export interface V8CpuProfilerBindings {
  startProfiling(name: string): void;
  stopProfiling(name: string): ThreadCpuProfile;
  setUsePreciseSampling(usePreciseSampling: boolean): void;
  setSamplingInterval(samplingIntervalInMicroseconds: number): void;
}

const CpuProfilerBindings: V8CpuProfilerBindings = profiler;
export { CpuProfilerBindings };
