import { describe, it, expect } from "vitest";
import { evaluateC2 } from "@/domain/matching/constraints";
import { DonationSnapshot, RecipientSnapshot } from "@/domain/matching/types";

describe("Constraint C2: Capacity with Tolerance", () => {
  const sampleDonation: DonationSnapshot = {
    id: "don-1",
    category: "bakery",
    title: "Bread",
    quantity: 42,
    unit: "items",
    availableFrom: "2026-10-19T18:00:00Z",
    pickupDeadline: "2026-10-19T21:00:00Z",
    lat: 12.97,
    lng: 77.59,
    storageCategory: "ambient",
    packagedSealed: true,
    safetyStatus: "eligible_by_rules",
  };

  const sampleRecipient: RecipientSnapshot = {
    id: "rec-1",
    name: "Shelter",
    recordType: "onboarded",
    verificationStatus: "coordinator_verified",
    lat: 12.98,
    lng: 77.60,
    serviceRadiusKm: 10,
    acceptedCategories: ["bakery"],
    capacityItems: 40,
    capacityKg: null,
    canCollect: true,
    weeklyWindows: [],
    provenance: {},
  };

  it("fails C2 when donation exceeds capacity without tolerance", () => {
    const outcome = evaluateC2(sampleDonation, sampleRecipient, { minPickupSlotMinutes: 30, regionTimezone: "UTC" });
    expect(outcome.result).toBe("fail");
  });

  it("passes C2 when capacity matches or exceeds quantity", () => {
    const fitted = { ...sampleRecipient, capacityItems: 50 };
    const outcome = evaluateC2(sampleDonation, fitted, { minPickupSlotMinutes: 30, regionTimezone: "UTC" });
    expect(outcome.result).toBe("pass");
  });
});
