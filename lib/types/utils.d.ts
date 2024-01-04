import type { SdkMetadata, DsnComponents, Event, Envelope, EventEnvelope } from '@sentry/types';
import type { ProfiledEvent, RawThreadCpuProfile, Profile, ThreadCpuProfile } from './types';
import type { DebugImage } from './types';
/**
 * Enriches the profile with threadId of the current thread.
 * This is done in node as we seem to not be able to get the info from C native code.
 *
 * @param {ThreadCpuProfile | RawThreadCpuProfile} profile
 * @returns {ThreadCpuProfile}
 */
export declare function enrichWithThreadInformation(profile: ThreadCpuProfile | RawThreadCpuProfile): ThreadCpuProfile;
/**
 * Creates a profiling event envelope from a Sentry event. If profile does not pass
 * validation, returns null.
 * @param {Event}
 * @returns {Profile | null}
 */
export declare function createProfilingEventFromTransaction(event: ProfiledEvent): Profile | null;
/**
 * Creates a profiling envelope item, if the profile does not pass validation, returns null.
 * @param {RawThreadCpuProfile}
 * @param {Event}
 * @returns {Profile | null}
 */
export declare function createProfilingEvent(profile: RawThreadCpuProfile, event: Event): Profile | null;
/**
 * Creates an envelope from a profiling event.
 * @param {Event} Profile
 * @param {DsnComponents} dsn
 * @param {SdkMetadata} metadata
 * @param {string|undefined} tunnel
 * @returns {Envelope|null}
 */
export declare function createProfilingEventEnvelope(event: ProfiledEvent, dsn: DsnComponents, metadata?: SdkMetadata, tunnel?: string): EventEnvelope | null;
/**
 * Check if event metadata contains profile information
 * @param {Event}
 * @returns {boolean}
 */
export declare function isProfiledTransactionEvent(event: Event): event is ProfiledEvent;
/**
 * Due to how profiles are attached to event metadata, we may sometimes want to remove them to ensure
 * they are not processed by other Sentry integrations. This can be the case when we cannot construct a valid
 * profile from the data we have or some of the mechanisms to send the event (Hub, Transport etc) are not available to us.
 *
 * @param {Event | ProfiledEvent} event
 * @returns {Event}
 */
export declare function maybeRemoveProfileFromSdkMetadata(event: Event | ProfiledEvent): Event;
/**
 * Checks the given sample rate to make sure it is valid type and value (a boolean, or a number between 0 and 1).
 * @param {unknown} rate
 * @returns {boolean}
 */
export declare function isValidSampleRate(rate: unknown): boolean;
/**
 * Checks if the profile is valid and can be sent to Sentry.
 * @param {RawThreadCpuProfile} profile
 * @returns {boolean}
 */
export declare function isValidProfile(profile: RawThreadCpuProfile): profile is RawThreadCpuProfile & {
    profile_id: string;
};
/**
 * Adds items to envelope if they are not already present - mutates the envelope.
 * @param {Envelope} envelope
 * @param {Profile[]} profiles
 * @returns {Envelope}
 */
export declare function addProfilesToEnvelope(envelope: Envelope, profiles: Profile[]): Envelope;
/**
 * Finds transactions with profile_id context in the envelope
 * @param {Envelope} envelope
 * @returns {Event[]}
 */
export declare function findProfiledTransactionsFromEnvelope(envelope: Envelope): Event[];
/**
 * Cross reference profile collected resources with debug_ids and return a list of debug images.
 * @param {string[]} resource_paths
 * @returns {DebugImage[]}
 */
export declare function applyDebugMetadata(resource_paths: ReadonlyArray<string>): DebugImage[];
//# sourceMappingURL=utils.d.ts.map