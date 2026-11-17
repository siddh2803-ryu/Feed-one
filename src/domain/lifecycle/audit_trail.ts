/**
 * Feed One: Immutable Event Audit Trail Structures
 */
export interface FormattedAuditEvent {
  sequence: number;
  eventId: number;
  donationId: string;
  eventType: string;
  fromStatus?: string;
  toStatus?: string;
  actorRole: string;
  occurredAt: string;
  checksum: string;
}

export function formatAuditEvent(event: any, sequence: number): FormattedAuditEvent {
  return {
    sequence,
    eventId: event.id,
    donationId: event.donationId,
    eventType: event.eventType,
    fromStatus: event.fromStatus,
    toStatus: event.toStatus,
    actorRole: event.actorRole,
    occurredAt: event.occurredAt,
    checksum: Buffer.from(`${event.id}-${event.donationId}-${event.occurredAt}`).toString("base64")
  };
}
