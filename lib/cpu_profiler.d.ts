interface Sample {
    stack_id: number;
    thread_id: string;
    relative_timestamp_ns: string;
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
    start_value_us: number;
    end_value_us: number;
}
export interface ThreadCpuProfile {
    samples: Sample[];
    stacks: Stack[];
    frames: Frame[];
    thread_metadata: Record<string, {
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
