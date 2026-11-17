/**
 * Feed One: Late Pickup Operational Corrections (D19)
 */
export interface OperationalCorrectionRequest {
  donationId: string;
  coordinatorId: string;
  attestedPickupTime: string;
  operationalReason: string;
}

export function validateOperationalCorrection(
  request: OperationalCorrectionRequest,
  expiredAtIso: string,
  nowIso: string
): { isValid: boolean; error?: string } {
  const expiredTime = new Date(expiredAtIso).getTime();
  const now = new Date(nowIso).getTime();
  const hoursSinceExpiry = (now - expiredTime) / (1000 * 60 * 60);

  if (hoursSinceExpiry > 24) {
    return { isValid: false, error: "Correction must be logged within 24 hours of expiry." };
  }
  if (!request.operationalReason || request.operationalReason.length < 5) {
    return { isValid: false, error: "Detailed operational reason required." };
  }
  return { isValid: true };
}
