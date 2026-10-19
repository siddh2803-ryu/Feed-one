/**
 * Unit Tests: Honest Impact Metrics Calculator
 * Traceability: Ref §15, PRD §7.7, BR-MET
 */

import { describe, it, expect } from "vitest";
import {
  calculateMetrics,
  DonationMetricRecord,
} from "@/domain/metrics/calculator";

describe("Honest Metrics Calculator (BR-MET)", () => {
  const sampleDonations: DonationMetricRecord[] = [
    {
      id: "d1",
      unit: "items",
      quantity: 40,
      status: "delivered",
      isDemo: true,
      createdAt: "2026-10-19T18:00:00.000Z",
      confirmedAt: "2026-10-19T18:10:00.000Z", // 10m
      deliveredAt: "2026-10-19T19:30:00.000Z",
    },
    {
      id: "d2",
      unit: "items",
      quantity: 20,
      status: "delivered",
      isDemo: true,
      createdAt: "2026-10-19T14:00:00.000Z",
      confirmedAt: "2026-10-19T14:20:00.000Z", // 20m
      deliveredAt: "2026-10-19T15:00:00.000Z",
    },
    {
      id: "d3",
      unit: "kg",
      quantity: 15.5,
      status: "delivered",
      isDemo: false, // Real data
      createdAt: "2026-10-19T10:00:00.000Z",
      confirmedAt: "2026-10-19T10:30:00.000Z", // 30m
      deliveredAt: "2026-10-19T12:00:00.000Z",
    },
    {
      id: "d4",
      unit: "items",
      quantity: 50,
      status: "pickup_expired",
      isDemo: true,
      createdAt: "2026-10-19T08:00:00.000Z",
      expiredAt: "2026-10-19T12:00:00.000Z",
      hadAcceptedOffer: false, // Never confirmed
    },
    {
      id: "d5",
      unit: "items",
      quantity: 30,
      status: "cancelled",
      isDemo: true,
      createdAt: "2026-10-19T09:00:00.000Z",
      cancelledAt: "2026-10-19T09:15:00.000Z",
      statusReason: "Food no longer available",
    },
  ];

  it("calculates metrics accurately for demo scope", () => {
    const metrics = calculateMetrics(sampleDonations, "demo");

    expect(metrics.scope).toBe("demo");
    expect(metrics.donationsListed).toBe(4);
    expect(metrics.donationsDelivered).toBe(2);
    expect(metrics.foodRedistributedItems).toBe(60); // 40 + 20
    expect(metrics.foodRedistributedKg).toBe(0); // Real record excluded in demo scope

    // Durations: 10m, 20m -> mean = 15m, median = 15m
    expect(metrics.meanTimeToConfirmedMatchMinutes).toBe(15);
    expect(metrics.medianTimeToConfirmedMatchMinutes).toBe(15);

    // Unsuccessful breakdown
    expect(metrics.unsuccessfulOutcomes.pickupExpiredNeverConfirmed).toBe(1);
    expect(metrics.unsuccessfulOutcomes.cancelledByReason["Food no longer available"]).toBe(1);
  });

  it("separates items and kg strictly without cross-unit conversion (D4)", () => {
    const metrics = calculateMetrics(sampleDonations, "all");

    expect(metrics.foodRedistributedItems).toBe(60);
    expect(metrics.foodRedistributedKg).toBe(15.5);
  });
});
