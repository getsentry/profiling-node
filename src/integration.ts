import os from 'os';

import type {
  SdkInfo,
  SdkMetadata,
  DynamicSamplingContext,
  Integration,
  EventProcessor,
  Hub,
  Event,
  DsnComponents,
  EventItem,
  EventEnvelope,
  EventEnvelopeHeaders,
  Baggage,
} from '@sentry/types';

import { createEnvelope, dropUndefinedKeys, dsnToString, getSentryBaggageItems, uuid4, logger } from '@sentry/utils';

/** Extract sdk info from from the API metadata */
function getSdkMetadataForEnvelopeHeader(metadata?: SdkMetadata): SdkInfo | undefined {
  if (!metadata || !metadata.sdk) {
    return undefined;
  }

  return { name: metadata.sdk.name, version: metadata.sdk.version } as SdkInfo;
}

/**
 * Apply SdkInfo (name, version, packages, integrations) to the corresponding event key.
 * Merge with existing data if any.
 **/
function enhanceEventWithSdkInfo(event: Event, sdkInfo?: SdkInfo): Event {
  if (!sdkInfo) {
    return event;
  }
  event.sdk = event.sdk || {};
  // @ts-ignore
  event.sdk.name = event.sdk.name || sdkInfo.name;
  // @ts-ignore
  event.sdk.version = event.sdk.version || sdkInfo.version;
  event.sdk.integrations = [...(event.sdk.integrations || []), ...(sdkInfo.integrations || [])];
  event.sdk.packages = [...(event.sdk.packages || []), ...(sdkInfo.packages || [])];
  return event;
}

function createEventEnvelopeHeaders(
  event: Event,
  sdkInfo: SdkInfo | undefined,
  tunnel: string | undefined,
  dsn: DsnComponents
): EventEnvelopeHeaders {
  const baggage: Baggage | undefined = event.sdkProcessingMetadata && event.sdkProcessingMetadata['baggage'];
  const dynamicSamplingContext = baggage && getSentryBaggageItems(baggage);

  return {
    event_id: event.event_id as string,
    sent_at: new Date().toISOString(),
    ...(sdkInfo && { sdk: sdkInfo }),
    ...(!!tunnel && { dsn: dsnToString(dsn) }),
    ...(event.type === 'transaction' &&
      dynamicSamplingContext && {
        trace: dropUndefinedKeys({ ...dynamicSamplingContext }) as DynamicSamplingContext,
      }),
  };
}

function createProfilingEventEnvelope(
  event: Event,
  dsn: DsnComponents,
  metadata?: SdkMetadata,
  tunnel?: string
): EventEnvelope {
  const sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
  const rawProfile = event.sdkProcessingMetadata?.['profile'];

  if (!rawProfile) {
    throw new Error('Cannot construct profiling event envelope without a profile');
  }

  enhanceEventWithSdkInfo(event, metadata && metadata.sdk);
  const envelopeHeaders = createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn);

  const profile: any = {
    platform: 'typescript',
    profile_id: uuid4(),
    profile: [rawProfile, {}],
    device_locale:
      process.env['LC_ALL'] || process.env['LC_MESSAGES'] || process.env['LANG'] || process.env['LANGUAGE'],
    device_manufacturer: os.type(),
    device_model: os.arch(),
    device_os_name: os.platform(),
    device_os_version: os.release(),
    device_is_emulator: false,
    transaction_name: event.transaction,
    duration_ns: `${rawProfile.duration_ns}`,
    environment: '',
    version_code: '',
    version_name: '',
    trace_id: envelopeHeaders.trace?.trace_id,
    transaction_id: envelopeHeaders.event_id,
  };

  // Only cleanup the profile from the transaction and forward the pristine event so that the actual transaction event can be sent.
  if (event.sdkProcessingMetadata && 'profile' in event.sdkProcessingMetadata) {
    delete event.sdkProcessingMetadata['profile'];
  }

  const envelopeItem: EventItem = [
    {
      // @ts-ignore
      type: 'profile',
    },
    profile,
  ];

  return createEnvelope<EventEnvelope>(envelopeHeaders, [envelopeItem]);
}

function isProfiledTransactionEvent(event: Event): boolean {
  return !!(
    event.sdkProcessingMetadata &&
    'profile' in event.sdkProcessingMetadata &&
    event.sdkProcessingMetadata['profile'] !== undefined
  );
}

function toPristineEvent(event: Event): Event {
  if (!event.sdkProcessingMetadata || (event.sdkProcessingMetadata && !event.sdkProcessingMetadata['profile'])) {
    return event;
  }

  delete event.sdkProcessingMetadata['profile'];
  return event;
}

export class ProfilingIntegration implements Integration {
  name = 'ProfilingNode';
  getCurrentHub: () => Hub | undefined = () => void 0;

  setupOnce(addGlobalEventProcessor: (callback: EventProcessor) => void, getCurrentHub: () => Hub): void {
    this.getCurrentHub = getCurrentHub;
    addGlobalEventProcessor(this.handleGlobalEvent.bind(this));
  }

  handleGlobalEvent(event: Event): Event {
    if (isProfiledTransactionEvent(event)) {
      // The following are all required to be able to send the event to Sentry.
      // If either of them is not available, we remove the profile from the transaction event.
      // and forward it to other processors.
      const hub = this.getCurrentHub();
      if (!hub) {
        logger.log(
          '[Profiling] getCurrentHub did not return a Hub, removing profile and forwarding event to other processors.'
        );
        return toPristineEvent(event);
      }

      const client = hub.getClient();
      if (!client) {
        logger.log(
          '[Profiling] getClient did not return a Client, removing profile and forwarding event to other processors.'
        );
        return toPristineEvent(event);
      }

      const dsn = client.getDsn();
      if (!dsn) {
        logger.log(
          '[Profiling] getDsn did not return a Dsn, removing profile and forwarding event to other processors.'
        );
        return toPristineEvent(event);
      }

      const envelope = createProfilingEventEnvelope(event, dsn, client.getOptions()._metadata);
      const transport = client.getTransport();

      if (transport) {
        logger.log('[Profiling] Sending profiling event to Sentry');
        transport.send(envelope);

        console.log(JSON.stringify(envelope));
      }
    }

    return event;
  }
}
