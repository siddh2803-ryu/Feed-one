/**
 * Milestone 1 Unit Test: 40-Packet Bread Scenario
 * Traceability: Ref §13.1, PRD §8.6, Appendix A, D1-D31
 *
 * Expected outcome:
 * - Recipient B: Eligible & Recommended (earliest pickup 19:00, dist 4.2km)
 * - Recipient D (Community Pantry Lead): Needs confirmation (unknown C1-C4, C6)
 * - Recipient A: Excluded on C2 (capacity 15 < 40)
 * - Recipient C: Excluded on C3 (window 08:00-12:00 ends before food available), despite being closest (1.1km)
 */

import { describe, it, expect } from "vitest";
import { match } from "@/domain/matching/engine";
import { evaluateSafetyRules } from "@/domain/safety/evaluator";
import {
  DonationSnapshot,
  MatchConfig,
  RecipientSnapshot,
} from "@/domain/matching/types";

describe("Milestone 1: 40-Packet Bread Demo Scenario (Ref §13.1)", () => {
  const DEMO_ANCHOR = "2026-10-19T18:00:00.000Z"; // Monday 18:00 UTC

  const matchConfig: MatchConfig = {
    minPickupSlotMinutes: 30,
    regionTimezone: "UTC",
  };

  // Donor Listing: Demo Bakery 40 packets of bread
  const breadDonation: DonationSnapshot = {
    id: "donation-bread-40",
    category: "bakery",
    title: "Bread packets",
    quantity: 40,
    unit: "items",
    unitLabel: "packets",
    availableFrom: "2026-10-19T18:00:00.000Z", // anchor
    pickupDeadline: "2026-10-19T21:00:00.000Z", // anchor + 3h
    lat: 12.9716, // center (0, 0)
    lng: 77.5946,
    storageCategory: "ambient",
    packagedSealed: true,
    preparedAt: "2026-10-19T06:00:00.000Z", // 06:00
    useBy: "2026-10-20T18:00:00.000Z", // tomorrow 18:00
    safetyStatus: "pending",
  };

  // Recipient A (Community kitchen): capacity 15 < 40 (fails C2)
  const recipientA: RecipientSnapshot = {
    id: "recipient-a",
    name: "Recipient A (demo)",
    recordType: "seeded_demo",
    verificationStatus: "coordinator_verified",
    lat: 12.9716 + 2.5 / 111.32, // (2.5 km north)
    lng: 77.5946,
    serviceRadiusKm: 10,
    acceptedCategories: ["bakery", "produce", "packaged_dry"],
    capacityItems: 15, // capacity 15 < 40!
    capacityKg: null,
    canCollect: null, // unknown C4
    collectionWindows: [
      {
        dayOfWeek: 1, // Monday
        startTime: "18:30",
        endTime: "20:30",
        provenance: "seeded_demo",
      },
    ],
    provenance: {
      accepted_categories: { level: "seeded_demo" },
      capacity_items: { level: "seeded_demo" },
      location: { level: "seeded_demo" },
    },
  };

  // Recipient B (Shelter): capacity 50 >= 40, can collect, window 19:00-20:30 (Eligible & Recommended)
  const recipientB: RecipientSnapshot = {
    id: "recipient-b",
    name: "Recipient B (demo)",
    recordType: "seeded_demo",
    verificationStatus: "coordinator_verified",
    lat: 12.9716,
    lng: 77.5946 + 4.2 / (111.32 * Math.cos((12.9716 * Math.PI) / 180)), // (4.2 km east)
    serviceRadiusKm: 10,
    acceptedCategories: [
      "bakery",
      "packaged_dry",
      "produce",
      "cooked_meals",
      "dairy_eggs",
    ],
    capacityItems: 50,
    capacityKg: 30,
    canCollect: true,
    collectionWindows: [
      {
        dayOfWeek: 1, // Monday
        startTime: "19:00",
        endTime: "20:30",
        provenance: "seeded_demo",
      },
    ],
    provenance: {
      accepted_categories: { level: "seeded_demo" },
      capacity_items: { level: "seeded_demo" },
      can_collect: { level: "seeded_demo" },
      collection_windows: { level: "seeded_demo" },
      location: { level: "seeded_demo" },
    },
  };

  // Recipient C (NGO): closest (1.1 km), but window 08:00-12:00 ends before 18:00 (fails C3)
  const recipientC: RecipientSnapshot = {
    id: "recipient-c",
    name: "Recipient C (demo)",
    recordType: "seeded_demo",
    verificationStatus: "coordinator_verified",
    lat: 12.9716 - 1.1 / 111.32, // (1.1 km south)
    lng: 77.5946,
    serviceRadiusKm: 10,
    acceptedCategories: ["bakery", "produce"],
    capacityItems: 60,
    capacityKg: null,
    canCollect: true,
    collectionWindows: [
      {
        dayOfWeek: 1, // Monday
        startTime: "08:00",
        endTime: "12:00",
        provenance: "seeded_demo",
      },
    ],
    provenance: {
      accepted_categories: { level: "seeded_demo" },
      capacity_items: { level: "seeded_demo" },
      can_collect: { level: "seeded_demo" },
      collection_windows: { level: "seeded_demo" },
      location: { level: "seeded_demo" },
    },
  };

  // Recipient D: Community Pantry (demo lead): public source only, unknown C1-C4, C6
  const recipientD: RecipientSnapshot = {
    id: "recipient-d-lead",
    name: "Community Pantry (demo lead)",
    recordType: "lead",
    verificationStatus: "unverified",
    lat: 12.9716,
    lng: 77.5946 - 3.0 / (111.32 * Math.cos((12.9716 * Math.PI) / 180)),
    serviceRadiusKm: null,
    acceptedCategories: null,
    capacityItems: null,
    capacityKg: null,
    canCollect: null,
    collectionWindows: [],
    publicOpeningHours: "Mon to Sat 10:00 to 19:00",
    provenance: {
      location: { level: "public_source" },
      public_opening_hours: { level: "public_source" },
    },
    websiteUrl: "https://example.org/community-pantry",
  };

  it("evaluates safety rules to eligible_by_rules (rule S7)", () => {
    const safetyResult = evaluateSafetyRules(breadDonation, DEMO_ANCHOR);
    expect(safetyResult.status).toBe("eligible_by_rules");
    expect(safetyResult.ruleId).toBe("S7");
    expect(safetyResult.reason).toContain("ambient");
  });

  it("runs matching with B recommended, D under Needs confirmation, A excluded on C2, and C excluded on C3", () => {
    // Apply screened safety status
    const donationWithSafety: DonationSnapshot = {
      ...breadDonation,
      safetyStatus: "eligible_by_rules",
      safetyRuleId: "S7",
      safetyReason: "Matches configured rule for packaged, ambient items.",
    };

    const matchResult = match(
      donationWithSafety,
      [recipientA, recipientB, recipientC, recipientD],
      [],
      matchConfig,
      DEMO_ANCHOR
    );

    expect(matchResult.outcome).toBe("match_recommended");
    expect(matchResult.counts.eligible).toBe(1);
    expect(matchResult.counts.needsConfirmation).toBe(1);
    expect(matchResult.counts.excluded).toBe(2);

    // 1. Recipient B MUST be Eligible & Recommended (Rank 1)
    const candidateB = matchResult.candidates.find(
      (c) => c.recipientId === "recipient-b"
    );
    expect(candidateB).toBeDefined();
    expect(candidateB!.group).toBe("eligible");
    expect(candidateB!.rank).toBe(1);
    expect(candidateB!.rankingReasons).toContain("RECOMMENDED_PRIMARY");
    expect(candidateB!.earliestFeasiblePickup).toBe("2026-10-19T19:00:00.000Z");
    expect(candidateB!.distanceKm).toBeCloseTo(4.2, 0);
    expect(candidateB!.explanation).toContain("Recommended");
    expect(candidateB!.explanation).toContain("50 packets");

    // 2. Recipient D (Community Pantry Lead) MUST be in Needs Confirmation (D3, D5)
    const candidateD = matchResult.candidates.find(
      (c) => c.recipientId === "recipient-d-lead"
    );
    expect(candidateD).toBeDefined();
    expect(candidateD!.group).toBe("needs_confirmation");
    expect(candidateD!.isLead).toBe(true);
    expect(candidateD!.unknowns.length).toBeGreaterThanOrEqual(4);
    expect(candidateD!.explanation).toContain("Might be suitable");
    expect(candidateD!.explanation).toContain("Discovered organisation");

    // 3. Recipient A MUST be Excluded on C2 (Capacity 15 < 40)
    const candidateA = matchResult.candidates.find(
      (c) => c.recipientId === "recipient-a"
    );
    expect(candidateA).toBeDefined();
    expect(candidateA!.group).toBe("excluded");
    expect(candidateA!.rank).toBeNull();
    const c2A = candidateA!.constraints.find((c) => c.id === "C2");
    expect(c2A?.result).toBe("fail");
    expect(c2A?.reasonCode).toBe("C2_CAPACITY_INSUFFICIENT");
    expect(candidateA!.explanation).toContain("Can take up to 15 packets");

    // 4. Recipient C MUST be Excluded on C3 (No overlap with 18:00-21:00)
    const candidateC = matchResult.candidates.find(
      (c) => c.recipientId === "recipient-c"
    );
    expect(candidateC).toBeDefined();
    expect(candidateC!.group).toBe("excluded");
    expect(candidateC!.rank).toBeNull();
    const c3C = candidateC!.constraints.find((c) => c.id === "C3");
    expect(c3C?.result).toBe("fail");
    expect(c3C?.reasonCode).toBe("C3_NO_OVERLAP");
    // Even though C is closest (1.1 km), it is excluded before ranking!
    expect(candidateC!.distanceKm).toBeCloseTo(1.1, 0);
    expect(candidateC!.explanation).toContain("does not overlap");
  });
});
