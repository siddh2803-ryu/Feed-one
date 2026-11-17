import { describe, it, expect } from "vitest";
import { evaluateC1 } from "@/domain/matching/constraints";
import { DonationSnapshot, RecipientSnapshot } from "@/domain/matching/types";

describe("Constraint Evaluation Parameterized Matrix", () => {
  const baseDonation: DonationSnapshot = {
    id: "matrix-don",
    category: "bakery",
    title: "Surplus Breads",
    quantity: 20,
    unit: "items",
    availableFrom: "2026-10-19T12:00:00Z",
    pickupDeadline: "2026-10-19T16:00:00Z",
    lat: 12.97,
    lng: 77.59,
    storageCategory: "ambient",
    packagedSealed: true,
    safetyStatus: "eligible_by_rules",
  };

  const baseRecipient: RecipientSnapshot = {
    id: "matrix-rec",
    name: "Partner NGO",
    recordType: "onboarded",
    verificationStatus: "coordinator_verified",
    lat: 12.98,
    lng: 77.60,
    serviceRadiusKm: 10,
    acceptedCategories: ["bakery", "packaged_dry"],
    capacityItems: 100,
    capacityKg: null,
    canCollect: true,
    weeklyWindows: [],
    provenance: {},
  };

  it("matrix test: matching category returns pass", () => {
    const outcome = evaluateC1(baseDonation, baseRecipient);
    expect(outcome.result).toBe("pass");
  });

  it("matrix test: non-matching category returns fail", () => {
    const mismatched = { ...baseRecipient, acceptedCategories: ["cooked_meals" as const] };
    const outcome = evaluateC1(baseDonation, mismatched);
    expect(outcome.result).toBe("fail");
  });
});
