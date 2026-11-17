/**
 * Feed One: Donation Cancellation Taxonomy & Invariants
 */
export const CANCELLATION_REASONS = [
  "spoiled_before_pickup",
  "accidental_listing",
  "internal_redistribution",
  "emergency_facility_closure",
  "other"
] as const;

export type CancellationReason = typeof CANCELLATION_REASONS[number];

export function isCancellationAllowed(status: string): boolean {
  // Prohibit cancellation once handoff is completed
  return !["collected", "delivered", "pickup_expired", "cancelled"].includes(status);
}
