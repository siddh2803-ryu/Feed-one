import { describe, it, expect } from "vitest";
import { evaluateC4 } from "@/domain/matching/constraints";
import { DonationSnapshot, RecipientSnapshot } from "@/domain/matching/types";

describe("Constraint C4: Distance and Service Radius", () => {
  const donor: DonationSnapshot = {
    id: "don-c4",
    category: "produce",
    title: "Apples",
    quantity: 10,
    unit: "kg",
    availableFrom: "2026-10-19T10:00:00Z",
    pickupDeadline: "2026-10-19T14:00:00Z",
    lat: 12.9716,
    lng: 77.5946,
    storageCategory: "ambient",
    packagedSealed: true,
    safetyStatus: "eligible_by_rules",
  };

  const nearbyRecipient: RecipientSnapshot = {
    id: "rec-close",
    name: "Nearby Shelter",
    recordType: "onboarded",
    verificationStatus: "coordinator_verified",
    lat: 12.9750,
    lng: 77.5950,
    serviceRadiusKm: 5,
    acceptedCategories: ["produce"],
    capacityItems: null,
    capacityKg: 50,
    canCollect: true,
    weeklyWindows: [],
    provenance: {},
  };

  it("passes C4 when distance is well within recipient service radius", () => {
    const outcome = evaluateC4(donor, nearbyRecipient);
    expect(outcome.result).toBe("pass");
  });
});
