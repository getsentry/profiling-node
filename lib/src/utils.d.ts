import type { SdkMetadata, DsnComponents, Event, EventEnvelope } from '@sentry/types';
import type { ThreadCpuProfile, RawThreadCpuProfile } from './cpu_profiler';
export interface Profile {
    event_id: string;
    version: string;
    os: {
        name: string;
        version: string;
        build_number: string;
    };
    runtime: {
        name: string;
        version: string;
    };
    device: {
        architecture: string;
        is_emulator: boolean;
        locale: string;
        manufacturer: string;
        model: string;
    };
    timestamp: string;
    release: string;
    platform: string;
    profile: ThreadCpuProfile;
    debug_meta?: {
        images: {
            debug_id: string;
            image_addr: string;
            code_file: string;
            type: string;
            image_size: number;
            image_vmaddr: string;
        }[];
    };
    transactions: {
        name: string;
        trace_id: string;
        id: string;
        active_thread_id: string;
        relative_start_ns: string;
        relative_end_ns: string;
    }[];
}
export declare function enrichWithThreadInformation(profile: ThreadCpuProfile | RawThreadCpuProfile): ThreadCpuProfile;
export interface ProfiledEvent extends Event {
    sdkProcessingMetadata: {
        profile?: RawThreadCpuProfile;
    };
}
/**
 * Creates a profiling event envelope from a Sentry event. If profile does not pass
 * validation, returns null.
 * @param event
 * @param dsn
 * @param metadata
 * @param tunnel
 * @returns {EventEnvelope | null}
 */
export declare function createProfilingEventEnvelope(event: ProfiledEvent, dsn: DsnComponents, metadata?: SdkMetadata, tunnel?: string): EventEnvelope | null;
export declare function isProfiledTransactionEvent(event: Event): event is ProfiledEvent;
export declare function maybeRemoveProfileFromSdkMetadata(event: Event | ProfiledEvent): Event;
export declare function getProjectRootDirectory(): string | null;
