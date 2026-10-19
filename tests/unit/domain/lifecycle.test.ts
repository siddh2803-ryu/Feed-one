/**
 * Unit Tests: Lifecycle Transitions & State Machine
 * Traceability: Ref §12.3, PRD §7.1, §7.2, BR-LC-02, BR-OF
 */

import { describe, it, expect } from "vitest";
import {
  validateDonationTransition,
  validateOfferTransition,
} from "@/domain/lifecycle/transitions";

describe("Donation Lifecycle State Machine (BR-LC-02)", () => {
  const now = "2026-10-19T18:00:00.000Z";

  it("T1: allows listed -> match_recommended only when safety is eligible", () => {
    const valid = validateDonationTransition(
      "listed",
      "match_recommended",
      "system",
      { nowIso: now, safetyEligible: true }
    );
    expect(valid.allowed).toBe(true);

    const invalid = validateDonationTransition(
      "listed",
      "match_recommended",
      "system",
      { nowIso: now, safetyEligible: false }
    );
    expect(invalid.allowed).toBe(false);
    expect(invalid.errorCode).toBe("SAFETY_NOT_ELIGIBLE");
  });

  it("T4: allows match_recommended -> awaiting_confirmation by donor", () => {
    const donorValid = validateDonationTransition(
      "match_recommended",
      "awaiting_confirmation",
      "donor",
      { nowIso: now }
    );
    expect(donorValid.allowed).toBe(true);

    const recipientInvalid = validateDonationTransition(
      "match_recommended",
      "awaiting_confirmation",
      "recipient",
      { nowIso: now }
    );
    expect(recipientInvalid.allowed).toBe(false);
    expect(recipientInvalid.errorCode).toBe("FORBIDDEN_ACTOR");
  });

  it("T5: allows awaiting_confirmation -> confirmed by recipient when within window", () => {
    const valid = validateDonationTransition(
      "awaiting_confirmation",
      "confirmed",
      "recipient",
      {
        nowIso: "2026-10-19T18:10:00.000Z",
        respondByIso: "2026-10-19T18:15:00.000Z",
      }
    );
    expect(valid.allowed).toBe(true);

    // After response window
    const late = validateDonationTransition(
      "awaiting_confirmation",
      "confirmed",
      "recipient",
      {
        nowIso: "2026-10-19T18:16:00.000Z",
        respondByIso: "2026-10-19T18:15:00.000Z",
      }
    );
    expect(late.allowed).toBe(false);
    expect(late.errorCode).toBe("OFFER_EXPIRED");
  });

  it("T7 & T8: enforces collected before delivered and actor roles", () => {
    // T7: confirmed -> collected allowed for donor or recipient
    expect(
      validateDonationTransition("confirmed", "collected", "donor", {
        nowIso: now,
      }).allowed
    ).toBe(true);
    expect(
      validateDonationTransition("confirmed", "collected", "recipient", {
        nowIso: now,
      }).allowed
    ).toBe(true);

    // T8: collected -> delivered allowed only for recipient
    expect(
      validateDonationTransition("collected", "delivered", "recipient", {
        nowIso: now,
      }).allowed
    ).toBe(true);
    expect(
      validateDonationTransition("collected", "delivered", "donor", {
        nowIso: now,
      }).allowed
    ).toBe(false);

    // Direct transition from confirmed to delivered is forbidden
    expect(
      validateDonationTransition("confirmed", "delivered", "recipient", {
        nowIso: now,
      }).allowed
    ).toBe(false);
  });

  it("T10: requires reason when cancelling", () => {
    const noReason = validateDonationTransition(
      "match_recommended",
      "cancelled",
      "donor",
      { nowIso: now }
    );
    expect(noReason.allowed).toBe(false);
    expect(noReason.errorCode).toBe("REASON_REQUIRED");

    const withReason = validateDonationTransition(
      "match_recommended",
      "cancelled",
      "donor",
      { nowIso: now, reason: "Food no longer available" }
    );
    expect(withReason.allowed).toBe(true);
  });

  it("T12: allows operational correction within 24h by coordinator only", () => {
    const expiredAt = "2026-10-19T18:00:00.000Z";
    const within24h = "2026-10-20T10:00:00.000Z"; // +16h
    const after24h = "2026-10-20T20:00:00.000Z"; // +26h

    const validCorrection = validateDonationTransition(
      "pickup_expired",
      "collected",
      "coordinator",
      {
        nowIso: within24h,
        expiredAtIso: expiredAt,
        reason: "Pickup completed at 18:30 but log was missed.",
      }
    );
    expect(validCorrection.allowed).toBe(true);

    const expiredCorrection = validateDonationTransition(
      "pickup_expired",
      "collected",
      "coordinator",
      {
        nowIso: after24h,
        expiredAtIso: expiredAt,
        reason: "Late correction attempt.",
      }
    );
    expect(expiredCorrection.allowed).toBe(false);
    expect(expiredCorrection.errorCode).toBe("CORRECTION_WINDOW_EXCEEDED");
  });

  it("rejects illegal transitions outside transition table", () => {
    const sampleIllegal = [
      ["delivered", "collected"],
      ["delivered", "cancelled"],
      ["cancelled", "listed"],
      ["listed", "confirmed"],
      ["awaiting_confirmation", "delivered"],
    ] as const;

    for (const [from, to] of sampleIllegal) {
      const res = validateDonationTransition(from, to, "coordinator", {
        nowIso: now,
        reason: "Illegal attempt",
      });
      expect(res.allowed).toBe(false);
      expect(res.errorCode).toBe("INVALID_TRANSITION");
    }
  });
});

describe("Offer State Machine (BR-OF)", () => {
  const now = "2026-10-19T18:00:00.000Z";
  const respondBy = "2026-10-19T18:15:00.000Z";

  it("validates offer acceptance before respond_by", () => {
    const valid = validateOfferTransition("sent", "accepted", "recipient", {
      nowIso: now,
      respondByIso: respondBy,
    });
    expect(valid.allowed).toBe(true);

    const expired = validateOfferTransition("sent", "accepted", "recipient", {
      nowIso: "2026-10-19T18:16:00.000Z",
      respondByIso: respondBy,
    });
    expect(expired.allowed).toBe(false);
    expect(expired.errorCode).toBe("OFFER_EXPIRED");
  });

  it("requires reason when declining an offer", () => {
    const withReason = validateOfferTransition("sent", "declined", "recipient", {
      nowIso: now,
      respondByIso: respondBy,
      reason: "no_capacity",
    });
    expect(withReason.allowed).toBe(true);

    const noReason = validateOfferTransition("sent", "declined", "recipient", {
      nowIso: now,
      respondByIso: respondBy,
    });
    expect(noReason.allowed).toBe(false);
    expect(noReason.errorCode).toBe("REASON_REQUIRED");
  });
});
