import { describe, it, expect } from "vitest";
import { rankCandidates } from "@/domain/matching/rank";
import { CandidateEvaluation } from "@/domain/matching/types";

describe("Candidate Ranking Heuristics", () => {
  it("ranks earliest pickup window higher than later windows", () => {
    const candidates: CandidateEvaluation[] = [
      {
        recipientId: "rec-far-early",
        recipientName: "Early Shelter",
        isLead: false,
        group: "eligible",
        rank: null,
        constraints: [],
        unknowns: [],
        distanceKm: 5.0,
        earliestFeasiblePickup: "2026-10-19T18:30:00Z",
        rankingReasons: [],
      },
      {
        recipientId: "rec-close-late",
        recipientName: "Late Shelter",
        isLead: false,
        group: "eligible",
        rank: null,
        constraints: [],
        unknowns: [],
        distanceKm: 1.0,
        earliestFeasiblePickup: "2026-10-19T20:00:00Z",
        rankingReasons: [],
      }
    ];

    const ranked = rankCandidates(candidates);
    expect(ranked[0].recipientId).toBe("rec-far-early");
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].rank).toBe(2);
  });
});
