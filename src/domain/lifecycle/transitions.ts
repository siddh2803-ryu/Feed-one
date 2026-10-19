/**
 * Feed One Domain: Lifecycle Transitions & State Machine
 * Traceability: Ref §12.3, PRD §7.1, §7.2, BR-LC-02, BR-OF, D7, D9, D15, D19
 *
 * Strict state machine enforcement: any transition not in the table is rejected.
 */

import { ActorRole, DonationStatus, OfferStatus } from "../matching/types";

export interface TransitionValidationResult {
  allowed: boolean;
  errorCode?: string;
  errorMessage?: string;
}

export interface TransitionContext {
  hasEligibleCandidates?: boolean;
  safetyEligible?: boolean;
  activeOfferStatus?: OfferStatus;
  nowIso: string;
  respondByIso?: string;
  pickupDeadlineIso?: string;
  expiryGraceMinutes?: number;
  reason?: string;
  expiredAtIso?: string;
}

/**
 * Validates a donation lifecycle transition against BR-LC-02.
 * Traceability: BR-LC-02, T1-T13
 */
export function validateDonationTransition(
  from: DonationStatus,
  to: DonationStatus,
  actorRole: ActorRole,
  context: TransitionContext
): TransitionValidationResult {
  // Same status transitions only allowed for re-matching in non-terminal states (T3)
  if (from === to) {
    if (
      (from === "match_recommended" || from === "no_match") &&
      (to === "match_recommended" || to === "no_match")
    ) {
      return { allowed: true };
    }
    return {
      allowed: false,
      errorCode: "INVALID_TRANSITION",
      errorMessage: `Cannot transition from ${from} to same status ${to}.`,
    };
  }

  // T1: listed -> match_recommended
  if (from === "listed" && to === "match_recommended") {
    if (context.safetyEligible === false) {
      return {
        allowed: false,
        errorCode: "SAFETY_NOT_ELIGIBLE",
        errorMessage: "Cannot recommend match when food safety is not eligible.",
      };
    }
    return { allowed: true };
  }

  // T2: listed -> no_match
  if (from === "listed" && to === "no_match") {
    return { allowed: true };
  }

  // T3: match_recommended -> no_match OR no_match -> match_recommended (Re-matching)
  if (
    (from === "match_recommended" && to === "no_match") ||
    (from === "no_match" && to === "match_recommended")
  ) {
    return { allowed: true };
  }

  // T4: match_recommended -> awaiting_confirmation (Offer sent)
  if (from === "match_recommended" && to === "awaiting_confirmation") {
    if (actorRole !== "donor" && actorRole !== "system") {
      return {
        allowed: false,
        errorCode: "FORBIDDEN_ACTOR",
        errorMessage: "Only donor can send an offer to await confirmation.",
      };
    }
    return { allowed: true };
  }

  // T5: awaiting_confirmation -> confirmed (Offer accepted)
  if (from === "awaiting_confirmation" && to === "confirmed") {
    if (actorRole !== "recipient") {
      return {
        allowed: false,
        errorCode: "FORBIDDEN_ACTOR",
        errorMessage: "Only recipient can accept an offer.",
      };
    }
    if (
      context.respondByIso &&
      new Date(context.nowIso).getTime() >=
        new Date(context.respondByIso).getTime()
    ) {
      return {
        allowed: false,
        errorCode: "OFFER_EXPIRED",
        errorMessage: "Offer response window has passed.",
      };
    }
    return { allowed: true };
  }

  // T6: awaiting_confirmation -> match_recommended OR no_match (Offer declined, expired, or withdrawn)
  if (
    from === "awaiting_confirmation" &&
    (to === "match_recommended" || to === "no_match")
  ) {
    return { allowed: true };
  }

  // T7: confirmed -> collected (Collection recorded)
  if (from === "confirmed" && to === "collected") {
    if (actorRole !== "donor" && actorRole !== "recipient" && actorRole !== "system") {
      return {
        allowed: false,
        errorCode: "FORBIDDEN_ACTOR",
        errorMessage: "Only donor or recipient can record collection.",
      };
    }
    return { allowed: true };
  }

  // T8: collected -> delivered (Delivery recorded)
  if (from === "collected" && to === "delivered") {
    if (actorRole !== "recipient") {
      return {
        allowed: false,
        errorCode: "FORBIDDEN_ACTOR",
        errorMessage: "Only recipient can record delivery.",
      };
    }
    return { allowed: true };
  }

  // T9: any pre-collection non-terminal -> pickup_expired
  const preCollectionStates: DonationStatus[] = [
    "listed",
    "match_recommended",
    "no_match",
    "awaiting_confirmation",
    "confirmed",
  ];
  if (preCollectionStates.includes(from) && to === "pickup_expired") {
    return { allowed: true };
  }

  // T10: any pre-collection non-terminal -> cancelled
  if (preCollectionStates.includes(from) && to === "cancelled") {
    if (actorRole !== "donor" && actorRole !== "coordinator") {
      return {
        allowed: false,
        errorCode: "FORBIDDEN_ACTOR",
        errorMessage: "Only donor or coordinator can cancel a donation.",
      };
    }
    if (!context.reason || context.reason.trim().length === 0) {
      return {
        allowed: false,
        errorCode: "REASON_REQUIRED",
        errorMessage: "Cancellation reason is required.",
      };
    }
    return { allowed: true };
  }

  // T11: confirmed -> match_recommended OR no_match (Accepted offer withdrawn by coordinator)
  if (
    from === "confirmed" &&
    (to === "match_recommended" || to === "no_match")
  ) {
    if (actorRole !== "coordinator") {
      return {
        allowed: false,
        errorCode: "FORBIDDEN_ACTOR",
        errorMessage: "Only coordinator can withdraw an accepted offer.",
      };
    }
    if (!context.reason) {
      return {
        allowed: false,
        errorCode: "REASON_REQUIRED",
        errorMessage: "Reason is required to withdraw an accepted offer.",
      };
    }
    return { allowed: true };
  }

  // T12: pickup_expired -> collected (Coordinator operational correction D19 within 24h)
  if (from === "pickup_expired" && to === "collected") {
    if (actorRole !== "coordinator") {
      return {
        allowed: false,
        errorCode: "FORBIDDEN_ACTOR",
        errorMessage: "Only coordinator can make an operational correction.",
      };
    }
    if (!context.reason) {
      return {
        allowed: false,
        errorCode: "REASON_REQUIRED",
        errorMessage: "Reason is mandatory for operational corrections.",
      };
    }
    if (context.expiredAtIso) {
      const expiredAt = new Date(context.expiredAtIso).getTime();
      const now = new Date(context.nowIso).getTime();
      const maxCorrectionMs = 24 * 60 * 60 * 1000; // 24 hours
      if (now - expiredAt > maxCorrectionMs) {
        return {
          allowed: false,
          errorCode: "CORRECTION_WINDOW_EXCEEDED",
          errorMessage: "Correction window (24h) has expired.",
        };
      }
    }
    return { allowed: true };
  }

  // T13: confirmed -> cancelled (Refused at handoff)
  if (from === "confirmed" && to === "cancelled") {
    if (!context.reason) {
      return {
        allowed: false,
        errorCode: "REASON_REQUIRED",
        errorMessage: "Reason is required when refusing at handoff.",
      };
    }
    return { allowed: true };
  }

  // Terminal states cannot transition anywhere (except T12 correction)
  return {
    allowed: false,
    errorCode: "INVALID_TRANSITION",
    errorMessage: `Transition from ${from} to ${to} is not permitted.`,
  };
}

/**
 * Validates an offer transition against BR-OF.
 * Traceability: BR-OF, D7, D8, D15, D31
 */
export function validateOfferTransition(
  from: OfferStatus,
  to: OfferStatus,
  actorRole: ActorRole,
  context: { nowIso: string; respondByIso: string; reason?: string }
): TransitionValidationResult {
  if (from === to) {
    return { allowed: false, errorCode: "INVALID_TRANSITION" };
  }

  if (from === "sent" && to === "accepted") {
    if (actorRole !== "recipient") {
      return {
        allowed: false,
        errorCode: "FORBIDDEN_ACTOR",
        errorMessage: "Only recipient can accept an offer.",
      };
    }
    if (
      new Date(context.nowIso).getTime() >=
      new Date(context.respondByIso).getTime()
    ) {
      return {
        allowed: false,
        errorCode: "OFFER_EXPIRED",
        errorMessage: "Offer response window has lapsed.",
      };
    }
    return { allowed: true };
  }

  if (from === "sent" && to === "declined") {
    if (actorRole !== "recipient") {
      return {
        allowed: false,
        errorCode: "FORBIDDEN_ACTOR",
        errorMessage: "Only recipient can decline an offer.",
      };
    }
    if (!context.reason) {
      return {
        allowed: false,
        errorCode: "REASON_REQUIRED",
        errorMessage: "Decline reason is required.",
      };
    }
    return { allowed: true };
  }

  if (from === "sent" && to === "expired") {
    return { allowed: true };
  }

  if (from === "sent" && to === "withdrawn") {
    if (
      actorRole !== "donor" &&
      actorRole !== "coordinator" &&
      actorRole !== "system"
    ) {
      return {
        allowed: false,
        errorCode: "FORBIDDEN_ACTOR",
        errorMessage: "Forbidden actor for offer withdrawal.",
      };
    }
    return { allowed: true };
  }

  return {
    allowed: false,
    errorCode: "INVALID_TRANSITION",
    errorMessage: `Offer transition from ${from} to ${to} is invalid.`,
  };
}
