/**
 * Feed One Domain: Matching Engine
 * Traceability: Ref §8.2, PRD §10.2, §10.4, BR-MAT, BR-RANK, D3, D5, D25
 *
 * Pure deterministic matching function.
 * Hard constraints C1 to C6 strictly precede any ranking.
 */

import {
  CandidateEvaluation,
  CandidateGroup,
  ConstraintOutcome,
  DonationSnapshot,
  MatchConfig,
  MatchResult,
  RecipientSnapshot,
  UnknownDisclosed,
} from "./types";
import {
  evaluateC1,
  evaluateC2,
  evaluateC3,
  evaluateC4,
  evaluateC5,
  evaluateC6,
} from "./constraints";
import { rankCandidates } from "./rank";
import { buildCandidateExplanation } from "./explanations";

export function match(
  donation: DonationSnapshot,
  recipients: RecipientSnapshot[],
  excludedRecipientIds: string[] = [],
  config: MatchConfig,
  nowIso: string
): MatchResult {
  // 1. Donation-level safety check (C5)
  const c5 = evaluateC5(donation);
  if (c5.result !== "pass") {
    return {
      donationId: donation.id,
      evaluatedAt: nowIso,
      configSnapshot: config,
      donationBlockers: [c5.reasonCode],
      candidates: [],
      outcome: "no_match",
      counts: {
        eligible: 0,
        needsConfirmation: 0,
        excluded: 0,
      },
    };
  }

  const eligibleCandidates: CandidateEvaluation[] = [];
  const needsConfirmationCandidates: CandidateEvaluation[] = [];
  const excludedCandidates: CandidateEvaluation[] = [];

  for (const recipient of recipients) {
    // Only evaluate active or lead recipients
    if (
      recipient.recordType === "rejected" ||
      recipient.recordType === "duplicate"
    ) {
      continue;
    }

    const isLead = recipient.recordType === "lead";

    // Check if recipient was previously excluded for this donation (BR-OF)
    if (excludedRecipientIds.includes(recipient.id)) {
      excludedCandidates.push({
        recipientId: recipient.id,
        recipientName: recipient.name,
        isLead,
        group: "excluded",
        rank: null,
        constraints: [
          {
            id: "C5",
            result: "pass",
            reasonCode: "PREVIOUSLY_DECLINED_OR_EXPIRED",
            inputs: {},
          },
        ],
        unknowns: [],
        distanceKm: null,
        earliestFeasiblePickup: null,
        feasibleSlots: [],
        leftoverCapacity: null,
        rankingReasons: [],
        explanation: "Previously declined or let an offer expire for this donation.",
      });
      continue;
    }

    // Evaluate constraints C1 through C6
    const c1 = evaluateC1(donation, recipient);
    const c2 = evaluateC2(donation, recipient);
    const { outcome: c3, feasibleSlots, earliestPickup } = evaluateC3(
      donation,
      recipient,
      config,
      nowIso
    );
    const c4 = evaluateC4(donation, recipient);
    const { outcome: c6, distanceKm } = evaluateC6(donation, recipient);

    const outcomes: ConstraintOutcome[] = [c1, c2, c3, c4, c5, c6];

    // Determine Grouping per D3
    const hasFail = outcomes.some((o) => o.result === "fail");
    const hasUnknown = outcomes.some((o) => o.result === "unknown");

    let group: CandidateGroup;
    if (hasFail) {
      group = "excluded";
    } else if (hasUnknown) {
      group = "needs_confirmation";
    } else {
      group = "eligible";
    }

    // D5: Leads can NEVER be Eligible (forced to needs_confirmation)
    if (isLead && group === "eligible") {
      group = "needs_confirmation";
    }

    // Collect unknowns
    const unknowns: UnknownDisclosed[] = [];
    if (c1.result === "unknown") {
      unknowns.push({
        constraint: "C1",
        field: "accepted_categories",
        resolution: `Ask whether they accept ${donation.category}.`,
      });
    }
    if (c2.result === "unknown") {
      unknowns.push({
        constraint: "C2",
        field: "capacity",
        resolution: `Ask how much they can take in one donation.`,
      });
    }
    if (c3.result === "unknown") {
      unknowns.push({
        constraint: "C3",
        field: "collection_windows",
        resolution: `Ask when they can collect from donors.`,
      });
    }
    if (c4.result === "unknown") {
      unknowns.push({
        constraint: "C4",
        field: "can_collect",
        resolution: `Ask whether they can collect from your location.`,
      });
    }
    if (c6.result === "unknown") {
      unknowns.push({
        constraint: "C6",
        field: "location",
        resolution: `Ask coordinator to record their location and service radius.`,
      });
    }

    // Calculate leftover capacity
    const isKg = donation.unit === "kg";
    const capacityVal = isKg ? recipient.capacityKg : recipient.capacityItems;
    const leftoverCapacity =
      capacityVal !== null ? capacityVal - donation.quantity : null;

    const evaluation: CandidateEvaluation = {
      recipientId: recipient.id,
      recipientName: recipient.name,
      isLead,
      group,
      rank: null, // assigned in ranking
      constraints: outcomes,
      unknowns,
      distanceKm,
      earliestFeasiblePickup: earliestPickup,
      feasibleSlots,
      leftoverCapacity,
      rankingReasons: [],
      explanation: "", // built below
      publicContactRoute: recipient.contactPhone ?? recipient.websiteUrl ?? undefined,
      sourceUrl: recipient.websiteUrl ?? undefined,
    };

    if (group === "eligible") {
      eligibleCandidates.push(evaluation);
    } else if (group === "needs_confirmation") {
      needsConfirmationCandidates.push(evaluation);
    } else {
      excludedCandidates.push(evaluation);
    }
  }

  // 3. Rank within groups
  const rankedEligible = rankCandidates(eligibleCandidates);
  const rankedNeedsConfirmation = rankCandidates(needsConfirmationCandidates);

  // 4. Attach explanations
  const finalEligible = rankedEligible.map((c) => {
    const recipient = recipients.find((r) => r.id === c.recipientId)!;
    return {
      ...c,
      explanation: buildCandidateExplanation(
        c.group,
        c.rank,
        c.isLead,
        c.constraints,
        c.unknowns,
        donation,
        recipient
      ),
    };
  });

  const finalNeedsConfirmation = rankedNeedsConfirmation.map((c) => {
    const recipient = recipients.find((r) => r.id === c.recipientId)!;
    return {
      ...c,
      explanation: buildCandidateExplanation(
        c.group,
        c.rank,
        c.isLead,
        c.constraints,
        c.unknowns,
        donation,
        recipient
      ),
    };
  });

  const finalExcluded = excludedCandidates.map((c) => {
    const recipient = recipients.find((r) => r.id === c.recipientId)!;
    return {
      ...c,
      explanation: buildCandidateExplanation(
        c.group,
        c.rank,
        c.isLead,
        c.constraints,
        c.unknowns,
        donation,
        recipient
      ),
    };
  });

  const allCandidates = [
    ...finalEligible,
    ...finalNeedsConfirmation,
    ...finalExcluded,
  ];

  return {
    donationId: donation.id,
    evaluatedAt: nowIso,
    configSnapshot: config,
    donationBlockers: [],
    candidates: allCandidates,
    outcome: finalEligible.length > 0 ? "match_recommended" : "no_match",
    counts: {
      eligible: finalEligible.length,
      needsConfirmation: finalNeedsConfirmation.length,
      excluded: finalExcluded.length,
    },
  };
}
