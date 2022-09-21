import type { SdkMetadata, DsnComponents, Event, EventEnvelope } from '@sentry/types';
import type { ThreadCpuProfile } from './cpu_profiler';
export interface Profile<T extends ThreadCpuProfile | ProcessedThreadCpuProfile> {
    platform: string;
    profile_id: string;
    profile: [T, unknown];
    device_locale: string;
    device_manufacturer: string;
    device_model: string;
    device_os_name: string;
    device_os_version: string;
    device_is_emulator: false;
    transaction_name: string;
    duration_ns: string;
    environment: string;
    version_code: string;
    version_name: string;
    trace_id: string;
    transaction_id: string;
}
export interface ProcessedThreadCpuProfile extends ThreadCpuProfile {
    duration_ns: number;
    thread_id: number;
}
export declare function enrichWithThreadId(profile: ThreadCpuProfile): ProcessedThreadCpuProfile;
export interface ProfiledEvent extends Event {
    sdkProcessingMetadata: {
        profile?: ThreadCpuProfile;
    };
}
export declare function createProfilingEventEnvelope(event: ProfiledEvent, dsn: DsnComponents, metadata?: SdkMetadata, tunnel?: string): EventEnvelope;
export declare function isProfiledTransactionEvent(event: Event): event is ProfiledEvent;
export declare function maybeRemoveProfileFromSdkMetadata(event: Event | ProfiledEvent): Event;
