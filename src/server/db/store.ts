/**
 * Feed One: Server Data Store & Repositories
 * Traceability: Ref §7, PRD §12.4, §13, D11, D15, D19, D22, D23
 *
 * Implements optimistic locking, append-only lifecycle event tracking,
 * and deterministic seed reset.
 */

import {
  CandidateEvaluation,
  DonationSnapshot,
  DonationStatus,
  MatchConfig,
  MatchResult,
  OfferStatus,
  RecipientSnapshot,
  SafetyStatus,
} from "@/domain/matching/types";
import { generateSeedData } from "../../../supabase/seed/seed";
import { match } from "@/domain/matching/engine";
import { evaluateSafetyRules } from "@/domain/safety/evaluator";
import { validateDonationTransition, validateOfferTransition } from "@/domain/lifecycle/transitions";

export interface StoredDonation extends DonationSnapshot {
  donorId: string;
  pickupLocationId: string;
  pickupInstructions?: string;
  allergenNotes?: string;
  attestedAt: string;
  status: DonationStatus;
  statusReason?: string;
  confirmedAt?: string;
  collectedAt?: string;
  deliveredAt?: string;
  expiredAt?: string;
  cancelledAt?: string;
  version: number;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoredOffer {
  id: string;
  donationId: string;
  recipientId: string;
  matchCandidateId: string;
  status: OfferStatus;
  sentAt: string;
  respondBy: string;
  respondedAt?: string;
  plannedPickupAt?: string;
  declineReason?: string;
  declineNote?: string;
  withdrawnReason?: string;
  acknowledgedUnknowns: boolean;
  version: number;
}

export interface StoredLifecycleEvent {
  id: number;
  donationId: string;
  offerId?: string;
  eventType: string;
  fromStatus?: DonationStatus;
  toStatus?: DonationStatus;
  actorRole: "donor" | "recipient" | "coordinator" | "system";
  actorId?: string;
  occurredAt: string;
  recordedAt: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  isDemo: boolean;
}

export interface StoredSafetyReview {
  id: string;
  donationId: string;
  reviewerId: string;
  decision: "eligible_by_review" | "blocked";
  note: string;
  createdAt: string;
}

export interface StoredDiscoveryRun {
  id: string;
  provider: "tinyfish" | "mock";
  query: string;
  location?: string;
  purpose?: string;
  status: "running" | "awaiting_selection" | "fetching" | "completed" | "failed";
  searchResults: Array<{ position: number; siteName: string; title: string; snippet: string; url: string }>;
  selectedUrls: string[];
  counts: { hits: number; fetched: number; failed: number; leadsCreated: number };
  errorCode?: string;
  errorDetail?: string;
  startedAt: string;
  finishedAt?: string;
}

export interface StoredNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  readAt?: string;
  createdAt: string;
}

class FeedOneStore {
  private donations = new Map<string, StoredDonation>();
  private recipients = new Map<string, RecipientSnapshot>();
  private matchRuns = new Map<string, MatchResult & { id: string; runNumber: number }>();
  private donationLatestRunId = new Map<string, string>();
  private offers = new Map<string, StoredOffer>();
  private lifecycleEvents: StoredLifecycleEvent[] = [];
  private safetyReviews: StoredSafetyReview[] = [];
  private discoveryRuns = new Map<string, StoredDiscoveryRun>();
  private notifications: StoredNotification[] = [];
  private eventCounter = 1;
  private demoAnchorIso: string = "";

  constructor() {
    this.resetDemo();
  }

  public getDemoAnchor(): string {
    return this.demoAnchorIso;
  }

  public resetDemo(): void {
    this.donations.clear();
    this.recipients.clear();
    this.matchRuns.clear();
    this.donationLatestRunId.clear();
    this.offers.clear();
    this.lifecycleEvents = [];
    this.safetyReviews = [];
    this.discoveryRuns.clear();
    this.notifications = [];
    this.eventCounter = 1;

    const seed = generateSeedData(12.9716, 77.5946, new Date());
    this.demoAnchorIso = seed.anchor;

    // Seed Recipients
    for (const r of seed.recipients) {
      this.recipients.set(r.id, {
        id: r.id,
        name: r.name,
        orgType: r.orgType as any,
        recordType: r.recordType as any,
        verificationStatus: r.verificationStatus as any,
        lat: r.lat,
        lng: r.lng,
        serviceRadiusKm: r.serviceRadiusKm,
        acceptedCategories: r.acceptedCategories,
        capacityItems: r.capacityItems,
        capacityKg: r.capacityKg,
        canCollect: r.canCollect,
        collectionWindows: r.windows as any,
        publicOpeningHours: r.publicOpeningHours,
        provenance: r.provenance as any,
        websiteUrl: r.websiteUrl,
      });
    }

    // Seed Safety Reviews Demo Donation: Chilled yogurt cups (E2E-05)
    const yogurtDeadline = new Date(new Date(seed.anchor).getTime() + 4 * 3600000).toISOString();
    const yogurtUseBy = new Date(new Date(seed.anchor).getTime() + 48 * 3600000).toISOString();
    const yogurtPrepared = new Date(new Date(seed.anchor).getTime() - 4 * 3600000).toISOString();

    const yogurtDonation: StoredDonation = {
      id: "donation-yogurt-demo",
      donorId: seed.donor.id,
      pickupLocationId: seed.donor.location.id,
      category: "dairy_eggs",
      title: "Yogurt cups (demo)",
      description: "24 sealed yogurt cups, refrigerated.",
      quantity: 24,
      unit: "items",
      unitLabel: "cups",
      availableFrom: seed.anchor,
      pickupDeadline: yogurtDeadline,
      lat: seed.donor.location.lat,
      lng: seed.donor.location.lng,
      storageCategory: "chilled",
      packagedSealed: true,
      preparedAt: yogurtPrepared,
      useBy: yogurtUseBy,
      attestedAt: seed.anchor,
      safetyStatus: "needs_review", // S4 rule triggered
      safetyRuleId: "S4",
      safetyReason: "Temperature-controlled food needs coordinator review in this version.",
      status: "no_match",
      statusReason: "Awaiting coordinator safety review.",
      version: 0,
      isDemo: true,
      createdAt: seed.anchor,
      updatedAt: seed.anchor,
    };
    this.donations.set(yogurtDonation.id, yogurtDonation);

    this.appendLifecycleEvent({
      donationId: yogurtDonation.id,
      eventType: "donation_created",
      toStatus: "listed",
      actorRole: "donor",
      occurredAt: seed.anchor,
      isDemo: true,
    });
    this.appendLifecycleEvent({
      donationId: yogurtDonation.id,
      eventType: "safety_screened",
      fromStatus: "listed",
      toStatus: "no_match",
      actorRole: "system",
      occurredAt: seed.anchor,
      reason: "Needs review by rule S4",
      isDemo: true,
    });
  }

  // --- Donations ---
  public getDonations(): StoredDonation[] {
    return Array.from(this.donations.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getDonation(id: string): StoredDonation | undefined {
    return this.donations.get(id);
  }

  public createDonation(
    donation: Omit<StoredDonation, "id" | "version" | "createdAt" | "updatedAt" | "safetyStatus">
  ): StoredDonation {
    const id = `don-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    // 1. Evaluate safety rules (D10, D17)
    const safetyResult = evaluateSafetyRules(
      {
        category: donation.category,
        storageCategory: donation.storageCategory,
        packagedSealed: donation.packagedSealed,
        useBy: donation.useBy,
        pickupDeadline: donation.pickupDeadline,
      },
      nowIso
    );

    const stored: StoredDonation = {
      ...donation,
      id,
      safetyStatus: safetyResult.status,
      safetyRuleId: safetyResult.ruleId,
      safetyReason: safetyResult.reason,
      status: "listed",
      version: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    this.donations.set(id, stored);

    this.appendLifecycleEvent({
      donationId: id,
      eventType: "donation_created",
      toStatus: "listed",
      actorRole: "donor",
      occurredAt: nowIso,
      isDemo: stored.isDemo,
    });

    this.appendLifecycleEvent({
      donationId: id,
      eventType: "safety_screened",
      actorRole: "system",
      occurredAt: nowIso,
      reason: `Rule ${safetyResult.ruleId}: ${safetyResult.reason}`,
      metadata: { safetyStatus: safetyResult.status },
      isDemo: stored.isDemo,
    });

    // 2. Synchronous matching (D15)
    this.runMatchingForDonation(id, "submit", nowIso);

    return this.donations.get(id)!;
  }

  public updateDonation(
    id: string,
    updates: Partial<StoredDonation>,
    actorRole: "donor" | "coordinator" = "donor"
  ): StoredDonation {
    const existing = this.donations.get(id);
    if (!existing) throw new Error("NOT_FOUND");

    const nowIso = new Date().toISOString();

    // Check if criteria changes require re-matching (D16)
    const criteriaChanged =
      updates.category !== undefined ||
      updates.quantity !== undefined ||
      updates.unit !== undefined ||
      updates.availableFrom !== undefined ||
      updates.pickupDeadline !== undefined ||
      updates.storageCategory !== undefined ||
      updates.packagedSealed !== undefined ||
      updates.useBy !== undefined;

    let newSafety = existing.safetyStatus;
    let newRuleId = existing.safetyRuleId;
    let newReason = existing.safetyReason;

    if (criteriaChanged) {
      const safetyResult = evaluateSafetyRules(
        {
          category: updates.category ?? existing.category,
          storageCategory: updates.storageCategory ?? existing.storageCategory,
          packagedSealed: updates.packagedSealed ?? existing.packagedSealed,
          useBy: updates.useBy !== undefined ? updates.useBy : existing.useBy,
          pickupDeadline: updates.pickupDeadline ?? existing.pickupDeadline,
        },
        nowIso
      );
      newSafety = safetyResult.status;
      newRuleId = safetyResult.ruleId;
      newReason = safetyResult.reason;
    }

    const updated: StoredDonation = {
      ...existing,
      ...updates,
      safetyStatus: newSafety,
      safetyRuleId: newRuleId,
      safetyReason: newReason,
      version: existing.version + 1,
      updatedAt: nowIso,
    };
    this.donations.set(id, updated);

    this.appendLifecycleEvent({
      donationId: id,
      eventType: "edited",
      actorRole,
      occurredAt: nowIso,
      isDemo: updated.isDemo,
    });

    if (criteriaChanged) {
      this.runMatchingForDonation(id, "edit", nowIso);
    }

    return this.donations.get(id)!;
  }

  public cancelDonation(
    id: string,
    reason: string,
    actorRole: "donor" | "coordinator"
  ): StoredDonation {
    const donation = this.donations.get(id);
    if (!donation) throw new Error("NOT_FOUND");

    const nowIso = new Date().toISOString();
    const validation = validateDonationTransition(
      donation.status,
      "cancelled",
      actorRole,
      { nowIso, reason }
    );
    if (!validation.allowed) {
      throw new Error(validation.errorCode || "INVALID_TRANSITION");
    }

    donation.status = "cancelled";
    donation.statusReason = reason;
    donation.cancelledAt = nowIso;
    donation.version += 1;
    donation.updatedAt = nowIso;

    // Withdraw any pending offer
    const pendingOffer = this.getPendingOfferForDonation(id);
    if (pendingOffer) {
      pendingOffer.status = "withdrawn";
      pendingOffer.withdrawnReason = "Donation cancelled";
      pendingOffer.version += 1;
      this.appendLifecycleEvent({
        donationId: id,
        offerId: pendingOffer.id,
        eventType: "offer_withdrawn",
        actorRole: "system",
        occurredAt: nowIso,
        reason: "Donation cancelled",
        isDemo: donation.isDemo,
      });
    }

    this.appendLifecycleEvent({
      donationId: id,
      eventType: "cancelled",
      fromStatus: donation.status,
      toStatus: "cancelled",
      actorRole,
      occurredAt: nowIso,
      reason,
      isDemo: donation.isDemo,
    });

    return donation;
  }

  // --- Matching ---
  public runMatchingForDonation(
    donationId: string,
    trigger: string,
    nowIso: string = new Date().toISOString()
  ): MatchResult {
    const donation = this.donations.get(donationId);
    if (!donation) throw new Error("NOT_FOUND");

    // Collect previously excluded recipients (declined or expired) for this donation (BR-OF)
    const pastOffers = Array.from(this.offers.values()).filter(
      (o) => o.donationId === donationId && (o.status === "declined" || o.status === "expired")
    );
    const excludedIds = pastOffers.map((o) => o.recipientId);

    const config: MatchConfig = {
      minPickupSlotMinutes: 30,
      regionTimezone: process.env.REGION_TIMEZONE || "Asia/Kolkata",
    };

    const matchResult = match(
      donation,
      Array.from(this.recipients.values()),
      excludedIds,
      config,
      nowIso
    );

    const runId = `run-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const storedRun = {
      ...matchResult,
      id: runId,
      runNumber: (this.matchRuns.size) + 1,
    };
    this.matchRuns.set(runId, storedRun);
    this.donationLatestRunId.set(donationId, runId);

    // Transition donation status based on match outcome
    const targetStatus: DonationStatus =
      matchResult.outcome === "match_recommended"
        ? "match_recommended"
        : "no_match";

    const transition = validateDonationTransition(
      donation.status,
      targetStatus,
      "system",
      {
        nowIso,
        safetyEligible:
          donation.safetyStatus === "eligible_by_rules" ||
          donation.safetyStatus === "eligible_by_review",
      }
    );

    if (transition.allowed) {
      donation.status = targetStatus;
      donation.version += 1;
      donation.updatedAt = nowIso;

      this.appendLifecycleEvent({
        donationId,
        eventType: "match_run",
        toStatus: targetStatus,
        actorRole: "system",
        occurredAt: nowIso,
        metadata: {
          trigger,
          eligibleCount: matchResult.counts.eligible,
          needsConfirmationCount: matchResult.counts.needsConfirmation,
          excludedCount: matchResult.counts.excluded,
        },
        isDemo: donation.isDemo,
      });
    }

    return matchResult;
  }

  public getLatestMatchRun(donationId: string): (MatchResult & { id: string }) | undefined {
    const runId = this.donationLatestRunId.get(donationId);
    return runId ? this.matchRuns.get(runId) : undefined;
  }

  // --- Offers ---
  public getOffers(): StoredOffer[] {
    return Array.from(this.offers.values());
  }

  public getOffer(id: string): StoredOffer | undefined {
    return this.offers.get(id);
  }

  public getPendingOfferForDonation(donationId: string): StoredOffer | undefined {
    return Array.from(this.offers.values()).find(
      (o) => o.donationId === donationId && o.status === "sent"
    );
  }

  public createOffer(
    donationId: string,
    recipientId: string,
    matchCandidateId: string,
    acknowledgeUnknowns: boolean = false
  ): StoredOffer {
    const donation = this.donations.get(donationId);
    if (!donation) throw new Error("DONATION_NOT_FOUND");

    // D22: Enforce strictly one pending offer per donation
    const existing = this.getPendingOfferForDonation(donationId);
    if (existing) {
      throw new Error("OFFER_ALREADY_PENDING");
    }

    const now = new Date();
    const nowIso = now.toISOString();

    // D8 & D31: Calculate respond_by
    const offerResponseMinutes = 15;
    const deadlineBufferMinutes = 30;
    const deadlineMs = new Date(donation.pickupDeadline).getTime();
    const potentialRespondBy = Math.min(
      now.getTime() + offerResponseMinutes * 60000,
      deadlineMs - deadlineBufferMinutes * 60000
    );

    const minResponseMinutes = 5;
    if (potentialRespondBy - now.getTime() < minResponseMinutes * 60000) {
      throw new Error("TOO_LATE_FOR_OFFER");
    }

    const respondByIso = new Date(potentialRespondBy).toISOString();

    const offerId = `ofr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const offer: StoredOffer = {
      id: offerId,
      donationId,
      recipientId,
      matchCandidateId,
      status: "sent",
      sentAt: nowIso,
      respondBy: respondByIso,
      acknowledgedUnknowns: acknowledgeUnknowns,
      version: 0,
    };
    this.offers.set(offerId, offer);

    // Update donation status
    donation.status = "awaiting_confirmation";
    donation.version += 1;
    donation.updatedAt = nowIso;

    this.appendLifecycleEvent({
      donationId,
      offerId,
      eventType: "offer_sent",
      fromStatus: "match_recommended",
      toStatus: "awaiting_confirmation",
      actorRole: "donor",
      occurredAt: nowIso,
      metadata: { recipientId, respondBy: respondByIso },
      isDemo: donation.isDemo,
    });

    // Create notification for recipient
    this.createNotification({
      userId: recipientId,
      type: "offer_received",
      title: "New Surplus Food Offer",
      body: `You received an offer for ${donation.quantity} ${donation.unitLabel ?? donation.unit} of ${donation.title}.`,
      link: `/recipient/offers/${offerId}`,
    });

    return offer;
  }

  public acceptOffer(
    offerId: string,
    plannedPickupAtIso: string
  ): StoredOffer {
    const offer = this.offers.get(offerId);
    if (!offer) throw new Error("OFFER_NOT_FOUND");
    const donation = this.donations.get(offer.donationId);
    if (!donation) throw new Error("DONATION_NOT_FOUND");

    const nowIso = new Date().toISOString();
    const validation = validateOfferTransition(offer.status, "accepted", "recipient", {
      nowIso,
      respondByIso: offer.respondBy,
    });
    if (!validation.allowed) {
      throw new Error(validation.errorCode || "INVALID_TRANSITION");
    }

    offer.status = "accepted";
    offer.respondedAt = nowIso;
    offer.plannedPickupAt = plannedPickupAtIso;
    offer.version += 1;

    donation.status = "confirmed";
    donation.confirmedAt = nowIso;
    donation.version += 1;
    donation.updatedAt = nowIso;

    this.appendLifecycleEvent({
      donationId: donation.id,
      offerId: offer.id,
      eventType: "offer_accepted",
      fromStatus: "awaiting_confirmation",
      toStatus: "confirmed",
      actorRole: "recipient",
      occurredAt: nowIso,
      metadata: { plannedPickupAt: plannedPickupAtIso },
      isDemo: donation.isDemo,
    });

    // Notify donor
    this.createNotification({
      userId: donation.donorId,
      type: "offer_accepted",
      title: "Offer Accepted!",
      body: `Your offer for ${donation.title} was accepted. Pickup planned for ${new Date(plannedPickupAtIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      link: `/donor/donations/${donation.id}`,
    });

    return offer;
  }

  public declineOffer(
    offerId: string,
    reason: string,
    note?: string
  ): StoredOffer {
    const offer = this.offers.get(offerId);
    if (!offer) throw new Error("OFFER_NOT_FOUND");
    const donation = this.donations.get(offer.donationId);
    if (!donation) throw new Error("DONATION_NOT_FOUND");

    const nowIso = new Date().toISOString();
    const validation = validateOfferTransition(offer.status, "declined", "recipient", {
      nowIso,
      respondByIso: offer.respondBy,
      reason,
    });
    if (!validation.allowed) {
      throw new Error(validation.errorCode || "INVALID_TRANSITION");
    }

    offer.status = "declined";
    offer.respondedAt = nowIso;
    offer.declineReason = reason;
    offer.declineNote = note;
    offer.version += 1;

    this.appendLifecycleEvent({
      donationId: donation.id,
      offerId: offer.id,
      eventType: "offer_declined",
      actorRole: "recipient",
      occurredAt: nowIso,
      reason,
      metadata: { note },
      isDemo: donation.isDemo,
    });

    // Notify donor
    this.createNotification({
      userId: donation.donorId,
      type: "offer_declined",
      title: "Offer Declined",
      body: `Recipient declined offer (${reason}). We've re-checked other candidates.`,
      link: `/donor/donations/${donation.id}`,
    });

    // Trigger re-matching excluding this recipient (T6)
    this.runMatchingForDonation(donation.id, "offer_declined", nowIso);

    return offer;
  }

  // --- Handover Lifecycle (Collected / Delivered) ---
  public recordCollected(
    donationId: string,
    occurredAtIso: string = new Date().toISOString(),
    actorRole: "donor" | "recipient"
  ): StoredDonation {
    const donation = this.donations.get(donationId);
    if (!donation) throw new Error("DONATION_NOT_FOUND");

    const nowIso = new Date().toISOString();
    const validation = validateDonationTransition(donation.status, "collected", actorRole, {
      nowIso,
    });
    if (!validation.allowed) {
      throw new Error(validation.errorCode || "INVALID_TRANSITION");
    }

    donation.status = "collected";
    donation.collectedAt = occurredAtIso;
    donation.version += 1;
    donation.updatedAt = nowIso;

    this.appendLifecycleEvent({
      donationId,
      eventType: "collected",
      fromStatus: "confirmed",
      toStatus: "collected",
      actorRole,
      occurredAt: occurredAtIso,
      isDemo: donation.isDemo,
    });

    return donation;
  }

  public recordDelivered(
    donationId: string,
    occurredAtIso: string = new Date().toISOString(),
    note?: string
  ): StoredDonation {
    const donation = this.donations.get(donationId);
    if (!donation) throw new Error("DONATION_NOT_FOUND");

    const nowIso = new Date().toISOString();
    const validation = validateDonationTransition(donation.status, "delivered", "recipient", {
      nowIso,
    });
    if (!validation.allowed) {
      throw new Error(validation.errorCode || "INVALID_TRANSITION");
    }

    donation.status = "delivered";
    donation.deliveredAt = occurredAtIso;
    donation.version += 1;
    donation.updatedAt = nowIso;

    this.appendLifecycleEvent({
      donationId,
      eventType: "delivered",
      fromStatus: "collected",
      toStatus: "delivered",
      actorRole: "recipient",
      occurredAt: occurredAtIso,
      metadata: { note },
      isDemo: donation.isDemo,
    });

    // Notify donor
    this.createNotification({
      userId: donation.donorId,
      type: "delivered",
      title: "Food Delivered!",
      body: `Your donation of ${donation.quantity} ${donation.unitLabel ?? donation.unit} was delivered.`,
      link: `/donor/donations/${donation.id}`,
    });

    return donation;
  }

  // --- Expiry Processing (D15, D19) ---
  public applyExpiries(nowIso: string = new Date().toISOString(), scope?: { donationId?: string }): {
    expiredOffersCount: number;
    expiredDonationsCount: number;
  } {
    let expiredOffersCount = 0;
    let expiredDonationsCount = 0;
    const nowMs = new Date(nowIso).getTime();

    // 1. Expire pending offers
    for (const offer of this.offers.values()) {
      if (scope?.donationId && offer.donationId !== scope.donationId) continue;

      if (offer.status === "sent" && nowMs >= new Date(offer.respondBy).getTime()) {
        offer.status = "expired";
        offer.version += 1;
        expiredOffersCount++;

        const donation = this.donations.get(offer.donationId);
        if (donation) {
          this.appendLifecycleEvent({
            donationId: donation.id,
            offerId: offer.id,
            eventType: "offer_expired",
            actorRole: "system",
            occurredAt: nowIso,
            reason: "Response deadline elapsed",
            isDemo: donation.isDemo,
          });

          this.runMatchingForDonation(donation.id, "offer_expired", nowIso);
        }
      }
    }

    // 2. Expire overdue pickups (deadline + grace)
    const graceMinutes = 15;
    for (const donation of this.donations.values()) {
      if (scope?.donationId && donation.id !== scope.donationId) continue;

      const preCollectionStates: DonationStatus[] = [
        "listed",
        "match_recommended",
        "no_match",
        "awaiting_confirmation",
        "confirmed",
      ];

      if (preCollectionStates.includes(donation.status)) {
        const deadlinePlusGraceMs =
          new Date(donation.pickupDeadline).getTime() + graceMinutes * 60000;

        if (nowMs >= deadlinePlusGraceMs) {
          donation.status = "pickup_expired";
          donation.expiredAt = nowIso;
          donation.version += 1;
          donation.updatedAt = nowIso;
          expiredDonationsCount++;

          this.appendLifecycleEvent({
            donationId: donation.id,
            eventType: "pickup_expired",
            fromStatus: donation.status,
            toStatus: "pickup_expired",
            actorRole: "system",
            occurredAt: nowIso,
            reason: `Pickup deadline plus ${graceMinutes}m grace elapsed`,
            isDemo: donation.isDemo,
          });
        }
      }
    }

    return { expiredOffersCount, expiredDonationsCount };
  }

  // --- Safety Review Queue (FR-SAF-03) ---
  public getSafetyQueue(): StoredDonation[] {
    return Array.from(this.donations.values()).filter(
      (d) => d.safetyStatus === "needs_review" && d.status !== "cancelled"
    );
  }

  public reviewSafety(
    donationId: string,
    decision: "eligible_by_review" | "blocked",
    note: string,
    reviewerId: string = "coord-1"
  ): StoredDonation {
    const donation = this.donations.get(donationId);
    if (!donation) throw new Error("DONATION_NOT_FOUND");

    const nowIso = new Date().toISOString();
    donation.safetyStatus = decision;
    donation.version += 1;
    donation.updatedAt = nowIso;

    const review: StoredSafetyReview = {
      id: `rev-${Date.now()}`,
      donationId,
      reviewerId,
      decision,
      note,
      createdAt: nowIso,
    };
    this.safetyReviews.push(review);

    this.appendLifecycleEvent({
      donationId,
      eventType: "safety_reviewed",
      actorRole: "coordinator",
      occurredAt: nowIso,
      reason: `Coordinator decision: ${decision} (${note})`,
      metadata: { decision, note },
      isDemo: donation.isDemo,
    });

    // Re-run matching after safety review decision (D25)
    this.runMatchingForDonation(donationId, "safety_review", nowIso);

    return donation;
  }

  // --- Recipients & Directory ---
  public getRecipients(): RecipientSnapshot[] {
    return Array.from(this.recipients.values());
  }

  public getRecipient(id: string): RecipientSnapshot | undefined {
    return this.recipients.get(id);
  }

  public updateRecipientProfile(
    id: string,
    updates: Partial<RecipientSnapshot>,
    actorRole: "recipient" | "coordinator" = "recipient"
  ): RecipientSnapshot {
    const existing = this.recipients.get(id);
    if (!existing) throw new Error("RECIPIENT_NOT_FOUND");

    const provLevel =
      actorRole === "recipient" ? "recipient_confirmed" : "coordinator_verified";
    const nowIso = new Date().toISOString();

    const newProv = { ...existing.provenance };
    if (updates.acceptedCategories !== undefined) {
      newProv.accepted_categories = { level: provLevel, at: nowIso };
    }
    if (updates.capacityItems !== undefined) {
      newProv.capacity_items = { level: provLevel, at: nowIso };
    }
    if (updates.capacityKg !== undefined) {
      newProv.capacity_kg = { level: provLevel, at: nowIso };
    }
    if (updates.canCollect !== undefined) {
      newProv.can_collect = { level: provLevel, at: nowIso };
    }

    const updated: RecipientSnapshot = {
      ...existing,
      ...updates,
      provenance: newProv,
    };
    this.recipients.set(id, updated);
    return updated;
  }

  // --- Discovery (TinyFish / Mock) ---
  public createDiscoveryRun(query: string, location?: string): StoredDiscoveryRun {
    const runId = `disc-${Date.now()}`;
    const nowIso = new Date().toISOString();

    // Simulated hits from mock provider
    const sampleHits = [
      {
        position: 1,
        siteName: "East Haven Shelter",
        title: "East Haven Shelter Services and Food Kitchen",
        snippet: "Providing emergency shelter and evening meals to individuals in East Haven.",
        url: "https://example.org/east-haven-shelter",
      },
      {
        position: 2,
        siteName: "Community Pantry West",
        title: "Community Pantry West - Fresh Food & Grocery Relief",
        snippet: "Open Mon-Sat 10:00 to 19:00 for surplus food collections and distribution.",
        url: "https://example.org/community-pantry-west",
      },
      {
        position: 3,
        siteName: "Hope Mission NGO",
        title: "Hope Mission Food Relief Project",
        snippet: "Collecting fresh bread and produce from local supermarkets.",
        url: "https://example.org/hope-mission",
      },
    ];

    const run: StoredDiscoveryRun = {
      id: runId,
      provider: (process.env.DISCOVERY_PROVIDER as any) || "mock",
      query,
      location,
      purpose: "Find public information about food-donation recipient organisations",
      status: "awaiting_selection",
      searchResults: sampleHits,
      selectedUrls: [],
      counts: { hits: sampleHits.length, fetched: 0, failed: 0, leadsCreated: 0 },
      startedAt: nowIso,
    };
    this.discoveryRuns.set(runId, run);
    return run;
  }

  public getDiscoveryRuns(): StoredDiscoveryRun[] {
    return Array.from(this.discoveryRuns.values()).sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  public fetchDiscoveryUrls(runId: string, urls: string[]): StoredDiscoveryRun {
    const run = this.discoveryRuns.get(runId);
    if (!run) throw new Error("RUN_NOT_FOUND");

    const nowIso = new Date().toISOString();
    run.selectedUrls = urls.slice(0, 10);
    run.status = "completed";
    run.finishedAt = nowIso;
    run.counts.fetched = urls.length;

    // Create a new Lead for each fetched URL if not already present
    for (const url of urls) {
      const leadId = `lead-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const hit = run.searchResults.find((h) => h.url === url);
      const name = hit ? hit.siteName : "Discovered Org";

      const lead: RecipientSnapshot = {
        id: leadId,
        name: `${name} (demo lead)`,
        recordType: "lead",
        verificationStatus: "unverified",
        lat: 12.9716,
        lng: 77.5946 - 2.0 / (111.32 * Math.cos((12.9716 * Math.PI) / 180)),
        serviceRadiusKm: null,
        acceptedCategories: null,
        capacityItems: null,
        capacityKg: null,
        canCollect: null,
        collectionWindows: [],
        publicOpeningHours: "Published hours on site",
        provenance: {
          location: { level: "public_source", at: nowIso },
          public_opening_hours: { level: "public_source", at: nowIso },
        },
        websiteUrl: url,
      };
      this.recipients.set(leadId, lead);
      run.counts.leadsCreated++;
    }

    return run;
  }

  // --- Lifecycle Events & Notifications ---
  public getLifecycleEvents(donationId: string): StoredLifecycleEvent[] {
    return this.lifecycleEvents
      .filter((e) => e.donationId === donationId)
      .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
  }

  public appendLifecycleEvent(event: Omit<StoredLifecycleEvent, "id" | "recordedAt">): void {
    const stored: StoredLifecycleEvent = {
      ...event,
      id: this.eventCounter++,
      recordedAt: new Date().toISOString(),
    };
    this.lifecycleEvents.push(stored);
  }

  public createNotification(notif: Omit<StoredNotification, "id" | "createdAt">): void {
    this.notifications.push({
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      createdAt: new Date().toISOString(),
    });
  }

  public getNotifications(userId?: string): StoredNotification[] {
    return this.notifications
      .filter((n) => !userId || n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public markNotificationRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) notif.readAt = new Date().toISOString();
  }
}

// Global singleton instance
export const store = new FeedOneStore();
