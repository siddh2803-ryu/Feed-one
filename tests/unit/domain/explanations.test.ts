import { describe, it, expect } from "vitest";
import { buildCandidateExplanation } from "@/domain/matching/explanations";
import { DonationSnapshot, RecipientSnapshot } from "@/domain/matching/types";

describe("Matching Explanations Builder", () => {
  const donation: DonationSnapshot = {
    id: "don-exp",
    category: "bakery",
    title: "Bread",
    quantity: 10,
    unit: "items",
    availableFrom: "2026-10-19T18:00:00Z",
    pickupDeadline: "2026-10-19T21:00:00Z",
    lat: 12.97,
    lng: 77.59,
    storageCategory: "ambient",
    packagedSealed: true,
    safetyStatus: "eligible_by_rules",
  };

  const recipient: RecipientSnapshot = {
    id: "rec-exp",
    name: "Hope Shelter",
    recordType: "onboarded",
    verificationStatus: "coordinator_verified",
    lat: 12.98,
    lng: 77.60,
    serviceRadiusKm: 10,
    acceptedCategories: ["bakery"],
    capacityItems: 50,
    capacityKg: null,
    canCollect: true,
    weeklyWindows: [],
    provenance: {},
  };

  it("formats clear explanation for eligible recommended candidate", () => {
    const explanation = buildCandidateExplanation(
      "eligible",
      1,
      false,
      [
        { id: "C1", result: "pass", reasonCode: "C1_CATEGORY_ACCEPTED", inputs: {} },
        { id: "C2", result: "pass", reasonCode: "C2_CAPACITY_FIT", inputs: {} },
      ],
      [],
      donation,
      recipient
    );

    expect(explanation).toContain("Recommended: meets all 6 requirements.");
  });
});
