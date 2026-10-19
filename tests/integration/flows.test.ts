/**
 * Integration Test: End-to-End Operational Flows
 * Traceability: Ref §13.1, Ref §17.1, PRD §8.6, §17.4 (E2E-01, E2E-02, E2E-05)
 */

import { describe, it, expect, beforeEach } from "vitest";
import { store } from "@/server/db/store";
import { calculateMetrics } from "@/domain/metrics/calculator";

describe("Feed One End-to-End Operational Workflows", () => {
  beforeEach(() => {
    store.resetDemo();
  });

  it("E2E-01: Main Bread Demo Flow (Bread listing -> Recipient B recommended -> Offer sent -> Accepted -> Collected -> Delivered -> Metrics updated)", () => {
    const anchor = store.getDemoAnchor();
    const deadline = new Date(new Date(anchor).getTime() + 3 * 3600000).toISOString();
    const prepared = new Date(new Date(anchor).getTime() - 6 * 3600000).toISOString();
    const useBy = new Date(new Date(anchor).getTime() + 24 * 3600000).toISOString();

    // 1. Donor lists 40 packets of bread
    const donation = store.createDonation({
      donorId: "d0000000-0000-4000-8000-000000000001",
      pickupLocationId: "l0000000-0000-4000-8000-000000000001",
      category: "bakery",
      title: "Bread packets",
      description: "Sliced bread, freshly baked.",
      quantity: 40,
      unit: "items",
      unitLabel: "packets",
      availableFrom: anchor,
      pickupDeadline: deadline,
      lat: 12.9716,
      lng: 77.5946,
      storageCategory: "ambient",
      packagedSealed: true,
      preparedAt: prepared,
      useBy: useBy,
      attestedAt: anchor,
      status: "listed",
      isDemo: true,
    });

    expect(donation.safetyStatus).toBe("eligible_by_rules");
    expect(donation.status).toBe("match_recommended");

    // 2. Verify Candidate Groupings
    const matchRun = store.getLatestMatchRun(donation.id);
    expect(matchRun).toBeDefined();
    expect(matchRun!.outcome).toBe("match_recommended");

    const candidateB = matchRun!.candidates.find((c) => c.recipientId === "r0000000-0000-4000-8000-000000000002");
    expect(candidateB?.group).toBe("eligible");
    expect(candidateB?.rank).toBe(1);
    expect(candidateB?.rankingReasons).toContain("RECOMMENDED_PRIMARY");

    const candidateLead = matchRun!.candidates.find((c) => c.recipientId === "r0000000-0000-4000-8000-000000000004");
    expect(candidateLead?.group).toBe("needs_confirmation");
    expect(candidateLead?.isLead).toBe(true);

    const candidateA = matchRun!.candidates.find((c) => c.recipientId === "r0000000-0000-4000-8000-000000000001");
    expect(candidateA?.group).toBe("excluded"); // capacity 15 < 40

    const candidateC = matchRun!.candidates.find((c) => c.recipientId === "r0000000-0000-4000-8000-000000000003");
    expect(candidateC?.group).toBe("excluded"); // window mismatch

    // 3. Donor sends offer to Recipient B
    const offer = store.createOffer(donation.id, candidateB!.recipientId, candidateB!.recipientId);
    expect(offer.status).toBe("sent");

    const awaitingDonation = store.getDonation(donation.id);
    expect(awaitingDonation?.status).toBe("awaiting_confirmation");

    // 4. Recipient B accepts offer with planned slot
    const plannedSlot = new Date(new Date(anchor).getTime() + 3600000).toISOString();
    const acceptedOffer = store.acceptOffer(offer.id, plannedSlot);
    expect(acceptedOffer.status).toBe("accepted");

    const confirmedDonation = store.getDonation(donation.id);
    expect(confirmedDonation?.status).toBe("confirmed");
    expect(confirmedDonation?.confirmedAt).toBeDefined();

    // 5. Physical Collection recorded
    const collectedDonation = store.recordCollected(donation.id, new Date().toISOString(), "recipient");
    expect(collectedDonation.status).toBe("collected");
    expect(collectedDonation.collectedAt).toBeDefined();

    // 6. Delivery recorded
    const deliveredDonation = store.recordDelivered(donation.id, new Date().toISOString(), "Delivered to shelter pantry.");
    expect(deliveredDonation.status).toBe("delivered");
    expect(deliveredDonation.deliveredAt).toBeDefined();

    // 7. Verify Honest Impact Metrics
    const allDonations = store.getDonations();
    const metricRecords = allDonations.map((d) => ({
      id: d.id,
      unit: d.unit,
      quantity: d.quantity,
      status: d.status,
      isDemo: d.isDemo,
      createdAt: d.createdAt,
      confirmedAt: d.confirmedAt,
      deliveredAt: d.deliveredAt,
    }));

    const metrics = calculateMetrics(metricRecords, "demo");
    expect(metrics.donationsDelivered).toBe(1);
    expect(metrics.foodRedistributedItems).toBe(40);
    expect(metrics.foodRedistributedKg).toBe(0);
  });

  it("E2E-02: Alternate Bread Demo Flow (Recipient B declines -> Re-matching runs -> Returns to no_match with Lead disclosed)", () => {
    const anchor = store.getDemoAnchor();
    const deadline = new Date(new Date(anchor).getTime() + 3 * 3600000).toISOString();

    const donation = store.createDonation({
      donorId: "d0000000-0000-4000-8000-000000000001",
      pickupLocationId: "l0000000-0000-4000-8000-000000000001",
      category: "bakery",
      title: "Bread packets",
      description: "Surplus bread",
      quantity: 40,
      unit: "items",
      unitLabel: "packets",
      availableFrom: anchor,
      pickupDeadline: deadline,
      lat: 12.9716,
      lng: 77.5946,
      storageCategory: "ambient",
      packagedSealed: true,
      preparedAt: anchor,
      useBy: new Date(new Date(anchor).getTime() + 24 * 3600000).toISOString(),
      attestedAt: anchor,
      status: "listed",
      isDemo: true,
    });

    const offer = store.createOffer(donation.id, "r0000000-0000-4000-8000-000000000002", "r0000000-0000-4000-8000-000000000002");
    expect(offer.status).toBe("sent");

    // Recipient B declines
    const declinedOffer = store.declineOffer(offer.id, "no_capacity", "Fridge undergoing maintenance");
    expect(declinedOffer.status).toBe("declined");

    // Donation returns to no_match (since no other eligible candidates exist)
    const updatedDonation = store.getDonation(donation.id);
    expect(updatedDonation?.status).toBe("no_match");

    // Check re-matched run: B is now excluded (PREVIOUSLY_DECLINED), Lead is still Needs Confirmation
    const latestRun = store.getLatestMatchRun(donation.id);
    const candidateB = latestRun?.candidates.find((c) => c.recipientId === "r0000000-0000-4000-8000-000000000002");
    expect(candidateB?.group).toBe("excluded");

    const candidateLead = latestRun?.candidates.find((c) => c.recipientId === "r0000000-0000-4000-8000-000000000004");
    expect(candidateLead?.group).toBe("needs_confirmation");
  });

  it("E2E-05: Safety Triage Workflow (Chilled item needs review -> Coordinator approves -> Re-matches to match_recommended)", () => {
    // The seeded yogurt cups donation has safetyStatus = 'needs_review'
    const queue = store.getSafetyQueue();
    expect(queue.length).toBeGreaterThanOrEqual(1);

    const yogurtDonation = queue.find((d) => d.id === "donation-yogurt-demo")!;
    expect(yogurtDonation.status).toBe("no_match");
    expect(yogurtDonation.safetyStatus).toBe("needs_review");

    // Coordinator approves
    const reviewed = store.reviewSafety(
      yogurtDonation.id,
      "eligible_by_review",
      "Verified cold-chain log with store supervisor.",
      "c0000000-0000-4000-8000-000000000001"
    );

    expect(reviewed.safetyStatus).toBe("eligible_by_review");

    // Re-matching triggers automatically: Recipient B accepts dairy_eggs and has capacity
    const refreshed = store.getDonation(yogurtDonation.id);
    expect(refreshed?.status).toBe("match_recommended");

    const latestRun = store.getLatestMatchRun(yogurtDonation.id);
    const candidateB = latestRun?.candidates.find((c) => c.recipientId === "r0000000-0000-4000-8000-000000000002");
    expect(candidateB?.group).toBe("eligible");
  });
});
