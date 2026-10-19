/**
 * Feed One Domain: Constraints C1 to C6
 * Traceability: Ref §8.2.1, PRD §7.3, BR-MAT, D1-D6, D10, D14, D17, D24, D29, D30
 */

import {
  ConstraintOutcome,
  DonationSnapshot,
  MatchConfig,
  ProvenanceLevel,
  RecipientSnapshot,
  Slot,
} from "./types";
import {
  calculateHaversineDistance,
  evaluatePickupWindow,
} from "../time/windows";

/**
 * Checks whether an attribute's provenance is purely public_source.
 * Per D24: public_source cannot satisfy C1 to C4.
 */
function isPublicSourceOnly(
  provenanceMap: RecipientSnapshot["provenance"],
  fieldKey: string
): boolean {
  const fieldProv = provenanceMap[fieldKey];
  return fieldProv?.level === "public_source";
}

function getProvenanceLevels(
  provenanceMap: RecipientSnapshot["provenance"],
  fieldKey: string
): ProvenanceLevel[] | undefined {
  const fieldProv = provenanceMap[fieldKey];
  return fieldProv ? [fieldProv.level] : undefined;
}

/**
 * C1: Food category accepted
 * Traceability: D24, D30
 */
export function evaluateC1(
  donation: DonationSnapshot,
  recipient: RecipientSnapshot
): ConstraintOutcome {
  if (isPublicSourceOnly(recipient.provenance, "accepted_categories")) {
    return {
      id: "C1",
      result: "unknown",
      reasonCode: "C1_PUBLIC_SOURCE_ONLY",
      inputs: {
        category: donation.category,
        acceptedCategories: recipient.acceptedCategories,
      },
      provenance: ["public_source"],
    };
  }

  if (recipient.acceptedCategories === null) {
    return {
      id: "C1",
      result: "unknown",
      reasonCode: "C1_UNKNOWN",
      inputs: { category: donation.category, acceptedCategories: null },
      provenance: getProvenanceLevels(recipient.provenance, "accepted_categories"),
    };
  }

  const accepted = recipient.acceptedCategories.includes(donation.category);
  return {
    id: "C1",
    result: accepted ? "pass" : "fail",
    reasonCode: accepted ? "C1_CATEGORY_ACCEPTED" : "C1_CATEGORY_NOT_ACCEPTED",
    inputs: {
      category: donation.category,
      acceptedCategories: recipient.acceptedCategories,
    },
    provenance: getProvenanceLevels(recipient.provenance, "accepted_categories"),
  };
}

/**
 * C2: Capacity (full quantity in single donation)
 * Traceability: D1, D4, D24, D30
 */
export function evaluateC2(
  donation: DonationSnapshot,
  recipient: RecipientSnapshot
): ConstraintOutcome {
  const isKg = donation.unit === "kg";
  const capacity = isKg ? recipient.capacityKg : recipient.capacityItems;
  const provKey = isKg ? "capacity_kg" : "capacity_items";

  if (isPublicSourceOnly(recipient.provenance, provKey)) {
    return {
      id: "C2",
      result: "unknown",
      reasonCode: "C2_PUBLIC_SOURCE_ONLY",
      inputs: {
        quantity: donation.quantity,
        unit: donation.unit,
        capacity,
      },
      provenance: ["public_source"],
    };
  }

  // Unit mismatch: if donation is in items but recipient only has kg, or vice versa
  if (capacity === null) {
    const alternateCapacity = isKg
      ? recipient.capacityItems
      : recipient.capacityKg;
    if (alternateCapacity !== null) {
      return {
        id: "C2",
        result: "unknown",
        reasonCode: "C2_UNIT_MISMATCH",
        inputs: {
          quantity: donation.quantity,
          unit: donation.unit,
          otherUnit: isKg ? "items" : "kg",
          otherCapacity: alternateCapacity,
        },
        provenance: getProvenanceLevels(
          recipient.provenance,
          isKg ? "capacity_items" : "capacity_kg"
        ),
      };
    }

    return {
      id: "C2",
      result: "unknown",
      reasonCode: "C2_UNKNOWN",
      inputs: {
        quantity: donation.quantity,
        unit: donation.unit,
        capacity: null,
      },
      provenance: getProvenanceLevels(recipient.provenance, provKey),
    };
  }

  const sufficient = capacity >= donation.quantity;
  return {
    id: "C2",
    result: sufficient ? "pass" : "fail",
    reasonCode: sufficient ? "C2_CAPACITY_SUFFICIENT" : "C2_CAPACITY_INSUFFICIENT",
    inputs: {
      quantity: donation.quantity,
      unit: donation.unit,
      unitLabel: donation.unitLabel ?? donation.unit,
      capacity,
    },
    provenance: getProvenanceLevels(recipient.provenance, provKey),
  };
}

/**
 * C3: Pickup window feasibility
 * Traceability: D14, D24, D29
 */
export function evaluateC3(
  donation: DonationSnapshot,
  recipient: RecipientSnapshot,
  config: MatchConfig,
  nowIso: string
): { outcome: ConstraintOutcome; feasibleSlots: Slot[]; earliestPickup: string | null } {
  // If only public opening hours are known
  if (
    recipient.collectionWindows.length === 0 &&
    recipient.publicOpeningHours
  ) {
    return {
      outcome: {
        id: "C3",
        result: "unknown",
        reasonCode: "C3_PUBLIC_SOURCE_ONLY",
        inputs: {
          publicOpeningHours: recipient.publicOpeningHours,
          availableFrom: donation.availableFrom,
          pickupDeadline: donation.pickupDeadline,
        },
        provenance: ["public_source"],
      },
      feasibleSlots: [],
      earliestPickup: null,
    };
  }

  // If no windows at all
  if (recipient.collectionWindows.length === 0) {
    return {
      outcome: {
        id: "C3",
        result: "unknown",
        reasonCode: "C3_UNKNOWN",
        inputs: {
          availableFrom: donation.availableFrom,
          pickupDeadline: donation.pickupDeadline,
        },
        provenance: getProvenanceLevels(recipient.provenance, "collection_windows"),
      },
      feasibleSlots: [],
      earliestPickup: null,
    };
  }

  const windowResult = evaluatePickupWindow(
    donation.availableFrom,
    donation.pickupDeadline,
    nowIso,
    recipient.collectionWindows,
    config.regionTimezone,
    config.minPickupSlotMinutes
  );

  return {
    outcome: {
      id: "C3",
      result: windowResult.hasFeasibleSlot ? "pass" : "fail",
      reasonCode: windowResult.reasonCode,
      inputs: {
        availableFrom: donation.availableFrom,
        pickupDeadline: donation.pickupDeadline,
        feasibleSlots: windowResult.feasibleSlots,
        earliestFeasiblePickup: windowResult.earliestFeasiblePickup,
        minSlotMinutes: config.minPickupSlotMinutes,
      },
      provenance: getProvenanceLevels(recipient.provenance, "collection_windows"),
    },
    feasibleSlots: windowResult.feasibleSlots,
    earliestPickup: windowResult.earliestFeasiblePickup,
  };
}

/**
 * C4: Collection capability (can recipient collect from donor)
 * Traceability: D2, D24
 */
export function evaluateC4(
  _donation: DonationSnapshot,
  recipient: RecipientSnapshot
): ConstraintOutcome {
  if (isPublicSourceOnly(recipient.provenance, "can_collect")) {
    return {
      id: "C4",
      result: "unknown",
      reasonCode: "C4_PUBLIC_SOURCE_ONLY",
      inputs: { canCollect: recipient.canCollect },
      provenance: ["public_source"],
    };
  }

  if (recipient.canCollect === null) {
    return {
      id: "C4",
      result: "unknown",
      reasonCode: "C4_UNKNOWN",
      inputs: { canCollect: null },
      provenance: getProvenanceLevels(recipient.provenance, "can_collect"),
    };
  }

  return {
    id: "C4",
    result: recipient.canCollect ? "pass" : "fail",
    reasonCode: recipient.canCollect ? "C4_CAN_COLLECT" : "C4_CANNOT_COLLECT",
    inputs: { canCollect: recipient.canCollect },
    provenance: getProvenanceLevels(recipient.provenance, "can_collect"),
  };
}

/**
 * C5: Food safety eligibility (Donation level)
 * Traceability: D10, D17
 */
export function evaluateC5(donation: DonationSnapshot): ConstraintOutcome {
  const isPass =
    donation.safetyStatus === "eligible_by_rules" ||
    donation.safetyStatus === "eligible_by_review";

  const reasonCode =
    donation.safetyStatus === "eligible_by_rules"
      ? "C5_ELIGIBLE_BY_RULES"
      : donation.safetyStatus === "eligible_by_review"
      ? "C5_ELIGIBLE_BY_REVIEW"
      : donation.safetyStatus === "blocked"
      ? "SAFETY_BLOCKED"
      : "SAFETY_NEEDS_REVIEW";

  return {
    id: "C5",
    result: isPass ? "pass" : "fail", // D3: safety unknown/needs_review treated as fail/blocker
    reasonCode,
    inputs: {
      safetyStatus: donation.safetyStatus,
      safetyRuleId: donation.safetyRuleId,
      safetyReason: donation.safetyReason,
    },
    provenance: ["system_derived"],
  };
}

/**
 * C6: Service area (distance within recipient radius)
 * Traceability: D6, D24, D30
 */
export function evaluateC6(
  donation: DonationSnapshot,
  recipient: RecipientSnapshot
): { outcome: ConstraintOutcome; distanceKm: number | null } {
  if (
    recipient.lat === null ||
    recipient.lng === null ||
    recipient.serviceRadiusKm === null
  ) {
    return {
      outcome: {
        id: "C6",
        result: "unknown",
        reasonCode: "C6_UNKNOWN",
        inputs: {
          donorLat: donation.lat,
          donorLng: donation.lng,
          recipientLat: recipient.lat,
          recipientLng: recipient.lng,
          radiusKm: recipient.serviceRadiusKm,
        },
        provenance: getProvenanceLevels(recipient.provenance, "location"),
      },
      distanceKm: null,
    };
  }

  const distanceKm = calculateHaversineDistance(
    donation.lat,
    donation.lng,
    recipient.lat,
    recipient.lng
  );

  const withinArea = distanceKm <= recipient.serviceRadiusKm;
  return {
    outcome: {
      id: "C6",
      result: withinArea ? "pass" : "fail",
      reasonCode: withinArea ? "C6_WITHIN_AREA" : "C6_OUTSIDE_AREA",
      inputs: {
        distanceKm,
        radiusKm: recipient.serviceRadiusKm,
      },
      provenance: getProvenanceLevels(recipient.provenance, "location"),
    },
    distanceKm,
  };
}
