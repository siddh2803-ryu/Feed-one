/**
 * Feed One: Hot-Holding Duration Safety Verification
 */
export function validateHotHoldingWindow(
  preparedAtIso: string,
  pickupDeadlineIso: string,
  maxAllowedHours: number = 4
): { isSafeWindow: boolean; durationHours: number } {
  const preparedTime = new Date(preparedAtIso).getTime();
  const deadlineTime = new Date(pickupDeadlineIso).getTime();
  const durationMs = deadlineTime - preparedTime;
  const durationHours = durationMs / (1000 * 60 * 60);

  return {
    isSafeWindow: durationHours >= 0 && durationHours <= maxAllowedHours,
    durationHours: Math.round(durationHours * 10) / 10
  };
}
