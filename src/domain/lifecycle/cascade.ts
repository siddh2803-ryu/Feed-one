/**
 * Feed One: Sequential Offer Fallback Cascade
 */
import { CandidateEvaluation } from "../matching/types";

export function selectNextCandidate(
  candidates: CandidateEvaluation[],
  attemptedRecipientIds: string[]
): CandidateEvaluation | null {
  const attemptedSet = new Set(attemptedRecipientIds);
  const eligibleRemaining = candidates.filter(
    c => c.group === "eligible" && !attemptedSet.has(c.recipientId)
  );

  return eligibleRemaining.length > 0 ? eligibleRemaining[0] : null;
}
