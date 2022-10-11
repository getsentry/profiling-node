// @ts-expect-error this screams because it cannot resolve the module?
import profiler from './../build/Release/cpu_profiler.node';
import { threadId } from 'worker_threads';

interface Sample {
  stack_id: number;
  thread_id: string;
  elapsed_since_start_ns: string;
}

type Stack = number[];

type Frame = {
  function: string;
  file: string;
  line: number;
  column: number;
};

export interface RawThreadCpuProfile {
  stacks: Stack[];
  samples: Sample[];
  frames: Frame[];
  profile_start_us: number;
  profile_end_us: number;
}
export interface ThreadCpuProfile {
  samples: Sample[];
  stacks: Stack[];
  frames: Frame[];
  thread_metadata: Record<string, { name?: string; priority?: number }>;
  queue_metadata?: Record<string, { label: string }>;
}

interface PrivateV8CpuProfilerBindings {
  startProfiling(name: string): void;
  stopProfiling(name: string, threadId: number): ThreadCpuProfile;
}

interface V8CpuProfilerBindings {
  startProfiling(name: string): void;
  stopProfiling(name: string): ThreadCpuProfile;
}

const privateBindings: PrivateV8CpuProfilerBindings = profiler;
const CpuProfilerBindings: V8CpuProfilerBindings = {
  startProfiling(name: string) {
    return privateBindings.startProfiling(name);
  },
  stopProfiling(name: string) {
    return privateBindings.stopProfiling(name, threadId);
  }
};
export { CpuProfilerBindings };
