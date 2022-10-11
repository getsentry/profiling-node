interface Sample {
    stack_id: number;
    thread_id: string;
    elapsed_since_start_ns: string;
}
declare type Stack = number[];
declare type Frame = {
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
    thread_metadata: Record<string, {
        name?: string;
        priority?: number;
    }>;
    queue_metadata?: Record<string, {
        label: string;
    }>;
}
interface V8CpuProfilerBindings {
    startProfiling(name: string): void;
    stopProfiling(name: string): ThreadCpuProfile;
}
declare const CpuProfilerBindings: V8CpuProfilerBindings;
export { CpuProfilerBindings };
