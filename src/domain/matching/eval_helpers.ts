/**
 * Feed One Matching Optimization Helpers
 */
import { ConstraintOutcome } from "./types";

export function hasHardFailure(outcomes: ConstraintOutcome[]): boolean {
  return outcomes.some(o => o.result === "fail");
}

export function countUnknowns(outcomes: ConstraintOutcome[]): number {
  return outcomes.filter(o => o.result === "unknown").length;
}
