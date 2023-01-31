export declare function importCppBindingsModule(): PrivateV8CpuProfilerBindings;
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
    profile_id?: string;
    stacks: Stack[];
    samples: Sample[];
    frames: Frame[];
    profile_relative_started_at_ns: number;
    profile_relative_ended_at_ns: number;
    profiler_logging_mode: 'eager' | 'lazy';
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
interface PrivateV8CpuProfilerBindings {
    startProfiling(name: string): void;
    stopProfiling(name: string, threadId: number, projectRootDir: string | null): RawThreadCpuProfile | null;
}
interface V8CpuProfilerBindings {
    startProfiling(name: string): void;
    stopProfiling(name: string): RawThreadCpuProfile | null;
}
declare const CpuProfilerBindings: V8CpuProfilerBindings;
export { CpuProfilerBindings };
