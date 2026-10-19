/**
 * Feed One Domain: Food Safety Routing Rules Evaluator
 * Traceability: Ref §14.1, PRD §7.4, D10, D17
 *
 * NOTE: These rules route listings; they DO NOT certify food as safe.
 * The system never outputs the word "safe".
 */

import { DonationSnapshot, SafetyStatus } from "../matching/types";

export interface SafetyEvaluationResult {
  status: SafetyStatus;
  ruleId: string;
  reason: string;
}

/**
 * Pure evaluator implementing starter table S1 to S8.
 * Evaluates top-to-bottom; first matching rule wins.
 * Traceability: D17, BR-SAF
 *
 * @param donation Donation snapshot
 * @param nowIso Injected current ISO 8601 UTC string
 */
export function evaluateSafetyRules(
  donation: Pick<
    DonationSnapshot,
    | "category"
    | "storageCategory"
    | "packagedSealed"
    | "useBy"
    | "pickupDeadline"
  >,
  nowIso: string
): SafetyEvaluationResult {
  const now = new Date(nowIso).getTime();
  const deadline = new Date(donation.pickupDeadline).getTime();
  const useBy = donation.useBy ? new Date(donation.useBy).getTime() : null;

  // S1: use_by is set and use_by <= now
  if (useBy !== null && useBy <= now) {
    return {
      status: "blocked",
      ruleId: "S1",
      reason: "Use-by time has passed.",
    };
  }

  // S2: use_by is set and use_by < pickup_deadline
  if (useBy !== null && useBy < deadline) {
    return {
      status: "blocked",
      ruleId: "S2",
      reason:
        "Use-by time is before the pickup deadline. Shorten the deadline or check the use-by time.",
    };
  }

  // S3: category = 'other'
  if (donation.category === "other") {
    return {
      status: "needs_review",
      ruleId: "S3",
      reason: "Category 'Other' needs coordinator review.",
    };
  }

  // S4: storage_category in ('chilled', 'frozen', 'hot_held')
  if (
    donation.storageCategory === "chilled" ||
    donation.storageCategory === "frozen" ||
    donation.storageCategory === "hot_held"
  ) {
    return {
      status: "needs_review",
      ruleId: "S4",
      reason:
        "Temperature-controlled food needs coordinator review in this version.",
    };
  }

  // S5: packaged_sealed = false
  if (!donation.packagedSealed) {
    return {
      status: "needs_review",
      ruleId: "S5",
      reason: "Unpackaged food needs coordinator review.",
    };
  }

  // S6: use_by is null
  if (useBy === null) {
    return {
      status: "needs_review",
      ruleId: "S6",
      reason: "No use-by time given.",
    };
  }

  // S7: category in ('bakery', 'packaged_dry', 'produce', 'beverages') and storage_category = 'ambient' and packaged_sealed = true
  const ambientApprovedCategories = [
    "bakery",
    "packaged_dry",
    "produce",
    "beverages",
  ];
  if (
    ambientApprovedCategories.includes(donation.category) &&
    donation.storageCategory === "ambient" &&
    donation.packagedSealed
  ) {
    return {
      status: "eligible_by_rules",
      ruleId: "S7",
      reason: "Matches configured rule for packaged, ambient items.",
    };
  }

  // S8: catch-all (including cooked_meals, dairy_eggs)
  return {
    status: "needs_review",
    ruleId: "S8",
    reason: "Needs coordinator review.",
  };
}
