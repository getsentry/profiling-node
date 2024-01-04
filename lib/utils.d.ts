import type { SdkMetadata, DsnComponents, Event, Envelope, EventEnvelope } from '@sentry/types';
import type { ProfiledEvent, RawThreadCpuProfile, Profile, ThreadCpuProfile } from './types';
import type { DebugImage } from './types';
export declare function enrichWithThreadInformation(profile: ThreadCpuProfile | RawThreadCpuProfile): ThreadCpuProfile;
/**
 * Creates a profiling event envelope from a Sentry event. If profile does not pass
 * validation, returns null.
 * @param event
 * @returns {Profile | null}
 */
export declare function createProfilingEventFromTransaction(event: ProfiledEvent): Profile | null;
/**
 * Creates a profiling envelope item, if the profile does not pass validation, returns null.
 * @param event
 * @returns {Profile | null}
 */
export declare function createProfilingEvent(profile: RawThreadCpuProfile, event: Event): Profile | null;
/**
 * Creates an envelope from a profiling event.
 * @param event Profile
 * @param dsn
 * @param metadata
 * @param tunnel
 * @returns
 */
export declare function createProfilingEventEnvelope(event: ProfiledEvent, dsn: DsnComponents, metadata?: SdkMetadata, tunnel?: string): EventEnvelope | null;
export declare function isProfiledTransactionEvent(event: Event): event is ProfiledEvent;
export declare function maybeRemoveProfileFromSdkMetadata(event: Event | ProfiledEvent): Event;
/**
 * Checks the given sample rate to make sure it is valid type and value (a boolean, or a number between 0 and 1).
 */
export declare function isValidSampleRate(rate: unknown): boolean;
export declare function isValidProfile(profile: RawThreadCpuProfile): profile is RawThreadCpuProfile & {
    profile_id: string;
};
/**
 * Adds items to envelope if they are not already present - mutates the envelope.
 * @param envelope
 */
export declare function addProfilesToEnvelope(envelope: Envelope, profiles: Profile[]): Envelope;
/**
 * Finds transactions with profile_id context in the envelope
 * @param envelope
 * @returns
 */
export declare function findProfiledTransactionsFromEnvelope(envelope: Envelope): Event[];
export declare function applyDebugMetadata(resource_paths: ReadonlyArray<string>): DebugImage[];
//# sourceMappingURL=utils.d.ts.map