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
    profile_start_ms: number;
    profile_end_ms: number;
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
export interface V8CpuProfilerBindings {
    startProfiling(name: string): void;
    stopProfiling(name: string): ThreadCpuProfile;
    setUsePreciseSampling(usePreciseSampling: boolean): void;
    setSamplingInterval(samplingIntervalInMicroseconds: number): void;
}
declare const CpuProfilerBindings: V8CpuProfilerBindings;
export { CpuProfilerBindings };
