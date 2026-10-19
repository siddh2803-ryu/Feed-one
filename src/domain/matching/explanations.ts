/**
 * Feed One Domain: Template Explanations Engine
 * Traceability: Ref §8.2.1, PRD §10.5, Appendix B
 *
 * Deterministic template assembly quoting input values, disclosed unknowns,
 * and provenance tags. Never outputs "safe" or claims route optimization.
 */

import {
  CandidateEvaluation,
  CandidateGroup,
  ConstraintOutcome,
  DonationSnapshot,
  ProvenanceLevel,
  RecipientSnapshot,
  UnknownDisclosed,
} from "./types";

export function formatProvenance(level?: ProvenanceLevel): string {
  switch (level) {
    case "recipient_confirmed":
      return "confirmed by organisation";
    case "coordinator_verified":
      return "verified by coordinator";
    case "seeded_demo":
      return "demo data";
    case "public_source":
      return "from website";
    case "system_derived":
      return "calculated";
    default:
      return "unknown source";
  }
}

export function generateConstraintSummary(
  outcome: ConstraintOutcome,
  donation: DonationSnapshot
): string {
  const provText = outcome.provenance?.[0]
    ? formatProvenance(outcome.provenance[0])
    : "unverified";

  switch (outcome.reasonCode) {
    case "C1_CATEGORY_ACCEPTED":
      return `Accepts ${donation.category} (${provText}).`;
    case "C1_CATEGORY_NOT_ACCEPTED":
      return `Does not accept ${donation.category}.`;
    case "C1_UNKNOWN":
      return `Not known whether it accepts ${donation.category}.`;
    case "C1_PUBLIC_SOURCE_ONLY":
      return `Its website mentions food services, but accepted categories are not confirmed.`;

    case "C2_CAPACITY_SUFFICIENT":
      return `Can take up to ${outcome.inputs.capacity} ${donation.unitLabel ?? donation.unit} in one donation; this donation is ${donation.quantity} ${donation.unitLabel ?? donation.unit}.`;
    case "C2_CAPACITY_INSUFFICIENT":
      return `Can take up to ${outcome.inputs.capacity} ${donation.unitLabel ?? donation.unit}; this donation is ${donation.quantity} ${donation.unitLabel ?? donation.unit}. Splitting a donation is not supported yet.`;
    case "C2_UNKNOWN":
      return `Capacity is not recorded.`;
    case "C2_UNIT_MISMATCH":
      return `Capacity is recorded in ${outcome.inputs.otherUnit}, not ${donation.unit}.`;

    case "C3_FEASIBLE":
      return `Can collect within operational window before deadline. Earliest: ${outcome.inputs.earliestFeasiblePickup}.`;
    case "C3_NO_OVERLAP":
      return `Its collection times do not overlap with this pickup window.`;
    case "C3_TOO_LATE":
      return `Less than ${outcome.inputs.minSlotMinutes ?? 30} minutes remain before the deadline.`;
    case "C3_UNKNOWN":
      return `Collection times are not recorded.`;
    case "C3_PUBLIC_SOURCE_ONLY":
      return `Only published opening hours are known. These are not confirmed collection times.`;

    case "C4_CAN_COLLECT":
      return `Can collect from donors (${provText}).`;
    case "C4_CANNOT_COLLECT":
      return `Cannot collect from donors.`;
    case "C4_UNKNOWN":
      return `Not known whether it can collect.`;

    case "C5_ELIGIBLE_BY_RULES":
      return `Listing is eligible under configured handling rules.`;
    case "C5_ELIGIBLE_BY_REVIEW":
      return `Listing was approved by coordinator review.`;
    case "SAFETY_NEEDS_REVIEW":
      return `Needs coordinator review before matching.`;
    case "SAFETY_BLOCKED":
      return `Blocked by handling rules.`;

    case "C6_WITHIN_AREA":
      return `About ${outcome.inputs.distanceKm} km away (straight line), within its ${outcome.inputs.radiusKm} km service area.`;
    case "C6_OUTSIDE_AREA":
      return `About ${outcome.inputs.distanceKm} km away (straight line), outside its ${outcome.inputs.radiusKm} km service area.`;
    case "C6_UNKNOWN":
      return `Location or service area is not recorded.`;

    default:
      return `${outcome.id}: ${outcome.reasonCode}`;
  }
}

export function buildCandidateExplanation(
  group: CandidateGroup,
  rank: number | null,
  isLead: boolean,
  constraints: ConstraintOutcome[],
  unknowns: UnknownDisclosed[],
  donation: DonationSnapshot,
  recipient: RecipientSnapshot
): string {
  const parts: string[] = [];

  // Headline
  if (group === "eligible") {
    if (rank === 1) {
      parts.push("Recommended: meets all 6 requirements.");
    } else {
      parts.push(`Also suitable (rank ${rank}).`);
    }
  } else if (group === "needs_confirmation") {
    parts.push(
      `Might be suitable, but ${unknowns.length} detail${
        unknowns.length === 1 ? "" : "s"
      } need confirming.`
    );
  } else {
    // Excluded: identify first failing constraint
    const failedC = constraints.find((c) => c.result === "fail");
    if (failedC) {
      if (failedC.id === "C3" && failedC.reasonCode === "C3_NO_OVERLAP") {
        parts.push(
          "Not suitable: its collection window does not overlap with this pickup window. It is evaluated, but operational timing takes precedence over distance."
        );
      } else {
        parts.push(`Not suitable: ${generateConstraintSummary(failedC, donation)}`);
      }
    } else {
      parts.push("Not suitable for this donation.");
    }
  }

  // Supporting facts
  const passedC = constraints.filter((c) => c.result === "pass");
  for (const c of passedC) {
    parts.push(generateConstraintSummary(c, donation));
  }

  // Unknown resolutions
  if (unknowns.length > 0) {
    for (const u of unknowns) {
      parts.push(u.resolution);
    }
  }

  // Lead disclaimer if applicable
  if (isLead) {
    parts.push(
      "Discovered organisation: not yet verified by Feed One. Information from their website may be out of date."
    );
  }

  return parts.join(" ");
}
