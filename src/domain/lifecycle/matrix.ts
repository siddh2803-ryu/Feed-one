/**
 * Feed One: Declarative State Machine Transition Matrix
 */
export const DONATION_STATE_MATRIX: Record<string, string[]> = {
  listed: ["match_recommended", "no_match", "cancelled"],
  match_recommended: ["awaiting_confirmation", "no_match", "cancelled"],
  no_match: ["match_recommended", "cancelled"],
  awaiting_confirmation: ["confirmed", "match_recommended", "no_match", "cancelled"],
  confirmed: ["collected", "pickup_expired"],
  collected: ["delivered"],
  delivered: [],
  pickup_expired: ["collected"], // via coordinator correction
  cancelled: [],
};

export function canTransitionDonation(from: string, to: string): boolean {
  const allowed = DONATION_STATE_MATRIX[from] || [];
  return allowed.includes(to);
}
