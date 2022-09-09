import type { SdkMetadata, DsnComponents, Event, EventEnvelope } from '@sentry/types';
interface Profile {
    platform: string;
    profile_id: string;
    profile: [unknown, unknown];
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
export interface ProfiledEvent extends Event {
    sdkProcessingMetadata: {
        profile?: Profile;
    };
}
export declare function createProfilingEventEnvelope(event: ProfiledEvent, dsn: DsnComponents, metadata?: SdkMetadata, tunnel?: string): EventEnvelope;
export declare function isProfiledTransactionEvent(event: Event): event is ProfiledEvent;
export declare function maybeRemoveProfileFromSdkMetadata(event: Event | ProfiledEvent): Event;
export {};
