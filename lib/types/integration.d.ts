import type { Integration, EventProcessor, Hub, Event } from '@sentry/types';
/**
 * We need this integration in order to send data to Sentry. We hook into the event processor
 * and inspect each event to see if it is a transaction event and if that transaction event
 * contains a profile on it's metadata. If that is the case, we create a profiling event envelope
 * and delete the profile from the transaction metadata.
 */
export declare class ProfilingIntegration implements Integration {
    /**
    * @inheritDoc
    */
    readonly name: string;
    getCurrentHub?: () => Hub;
    constructor();
    /**
     * @inheritDoc
     */
    setupOnce(addGlobalEventProcessor: (callback: EventProcessor) => void, getCurrentHub: () => Hub): void;
    /**
     * @inheritDoc
     */
    handleGlobalEvent(event: Event): Promise<Event>;
}
//# sourceMappingURL=integration.d.ts.map