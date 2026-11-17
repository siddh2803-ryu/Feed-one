/**
 * Feed One: Safety Review Audit Record Schema
 */
export interface SafetyReviewAuditRecord {
  donationId: string;
  previousStatus: string;
  updatedStatus: string;
  reviewerId: string;
  reviewerNotes: string;
  timestamp: string;
}

export function createSafetyAuditLog(
  record: Omit<SafetyReviewAuditRecord, "timestamp">
): SafetyReviewAuditRecord {
  return {
    ...record,
    timestamp: new Date().toISOString()
  };
}
