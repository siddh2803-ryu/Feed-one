/**
 * Feed One Domain: Ranking Algorithm
 * Traceability: Ref §8.2.1, PRD §7.5, BR-RANK
 *
 * Sorts candidates lexicographically:
 * 1. earliest_feasible_pickup ascending (unknown last)
 * 2. distance_km ascending (unknown last)
 * 3. leftover_capacity ascending (unknown last)
 * 4. name ascending, then id for deterministic stability
 */

import { CandidateEvaluation } from "./types";

export function rankCandidates(
  candidates: CandidateEvaluation[]
): CandidateEvaluation[] {
  const sorted = [...candidates].sort((a, b) => {
    // 1. earliest_feasible_pickup ascending
    if (a.earliestFeasiblePickup !== b.earliestFeasiblePickup) {
      if (a.earliestFeasiblePickup === null) return 1;
      if (b.earliestFeasiblePickup === null) return -1;
      const timeDiff =
        new Date(a.earliestFeasiblePickup).getTime() -
        new Date(b.earliestFeasiblePickup).getTime();
      if (timeDiff !== 0) return timeDiff;
    }

    // 2. distance_km ascending
    if (a.distanceKm !== b.distanceKm) {
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      const distDiff = a.distanceKm - b.distanceKm;
      if (distDiff !== 0) return distDiff;
    }

    // 3. leftover_capacity ascending (closer fit preferred)
    if (a.leftoverCapacity !== b.leftoverCapacity) {
      if (a.leftoverCapacity === null) return 1;
      if (b.leftoverCapacity === null) return -1;
      const capDiff = a.leftoverCapacity - b.leftoverCapacity;
      if (capDiff !== 0) return capDiff;
    }

    // 4. Stable tie-break by name, then recipientId
    const nameDiff = a.recipientName.localeCompare(b.recipientName);
    if (nameDiff !== 0) return nameDiff;
    return a.recipientId.localeCompare(b.recipientId);
  });

  // Assign 1-based ranks and ranking reasons relative to predecessor
  return sorted.map((candidate, idx) => {
    const rank = idx + 1;
    const rankingReasons: string[] = [];

    if (idx > 0) {
      const predecessor = sorted[idx - 1];

      if (
        predecessor.earliestFeasiblePickup &&
        candidate.earliestFeasiblePickup &&
        new Date(predecessor.earliestFeasiblePickup).getTime() <
          new Date(candidate.earliestFeasiblePickup).getTime()
      ) {
        // Predecessor was earlier
      } else if (
        predecessor.distanceKm !== null &&
        candidate.distanceKm !== null &&
        predecessor.distanceKm < candidate.distanceKm
      ) {
        // Predecessor was closer
      }
    }

    if (idx === 0 && candidate.group === "eligible") {
      rankingReasons.push("RECOMMENDED_PRIMARY");
    }

    return {
      ...candidate,
      rank,
      rankingReasons,
    };
  });
}
