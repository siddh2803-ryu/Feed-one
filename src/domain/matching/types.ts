/**
 * Feed One Domain Types
 * Traceability: Ref §7, §8, PRD §10.3, D1-D31
 */

export type ConstraintId = "C1" | "C2" | "C3" | "C4" | "C5" | "C6";
export type ConstraintResult = "pass" | "fail" | "unknown";
export type CandidateGroup = "eligible" | "needs_confirmation" | "excluded";
export type ProvenanceLevel =
  | "recipient_confirmed"
  | "coordinator_verified"
  | "seeded_demo"
  | "public_source"
  | "system_derived";

export type DonationUnit = "items" | "kg"; // D4
export type StorageCategory = "ambient" | "chilled" | "frozen" | "hot_held"; // D10
export type SafetyStatus =
  | "pending"
  | "eligible_by_rules"
  | "eligible_by_review"
  | "needs_review"
  | "blocked";

export type DonationStatus =
  | "listed"
  | "match_recommended"
  | "no_match"
  | "awaiting_confirmation"
  | "confirmed"
  | "collected"
  | "delivered"
  | "pickup_expired"
  | "cancelled";

export type OfferStatus = "sent" | "accepted" | "declined" | "expired" | "withdrawn";

export type RecordType = "seeded_demo" | "lead" | "onboarded" | "rejected" | "duplicate";
export type VerificationStatus = "unverified" | "coordinator_verified";
export type OrgType = "ngo" | "community_kitchen" | "shelter" | "other";
export type ActorRole = "donor" | "recipient" | "coordinator" | "system"; // D9

export interface Slot {
  start: string; // ISO 8601 UTC
  end: string;   // ISO 8601 UTC
}

export interface ConstraintOutcome {
  id: ConstraintId;
  result: ConstraintResult;
  reasonCode: string;
  inputs: Record<string, unknown>;
  provenance?: ProvenanceLevel[];
}

export interface UnknownDisclosed {
  constraint: ConstraintId;
  field: string;
  resolution: string;
}

export interface CandidateEvaluation {
  recipientId: string;
  recipientName: string;
  isLead: boolean; // D5: Leads cannot be Eligible
  group: CandidateGroup;
  rank: number | null; // 1-based within group, null if excluded
  constraints: ConstraintOutcome[];
  unknowns: UnknownDisclosed[];
  distanceKm: number | null;
  earliestFeasiblePickup: string | null; // ISO 8601 UTC
  feasibleSlots: Slot[];
  leftoverCapacity: number | null;
  rankingReasons: string[];
  explanation: string;
  publicContactRoute?: string;
  sourceUrl?: string;
}

export interface MatchConfig {
  minPickupSlotMinutes: number; // default 30 (D29)
  regionTimezone: string;       // e.g. "Asia/Kolkata" (D21)
}

export interface MatchResult {
  donationId: string;
  evaluatedAt: string; // Injected ISO 8601 UTC
  configSnapshot: MatchConfig;
  donationBlockers: string[];
  candidates: CandidateEvaluation[];
  outcome: "match_recommended" | "no_match";
  counts: {
    eligible: number;
    needsConfirmation: number;
    excluded: number;
  };
}

export interface DonationSnapshot {
  id: string;
  category: string;
  title: string;
  description?: string;
  quantity: number;
  unit: DonationUnit;
  unitLabel?: string | null;
  availableFrom: string;  // ISO 8601 UTC
  pickupDeadline: string; // ISO 8601 UTC
  lat: number;
  lng: number;
  storageCategory: StorageCategory;
  packagedSealed: boolean;
  preparedAt: string;     // ISO 8601 UTC
  useBy?: string | null;  // ISO 8601 UTC
  safetyStatus: SafetyStatus;
  safetyRuleId?: string | null;
  safetyReason?: string | null;
}

export interface CollectionWindow {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // "HH:MM" e.g. "08:00"
  endTime: string;   // "HH:MM" e.g. "12:00"
  provenance: ProvenanceLevel;
}

export interface RecipientSnapshot {
  id: string;
  name: string;
  orgType?: OrgType | string;
  recordType: RecordType;
  verificationStatus: VerificationStatus;
  lat: number | null;
  lng: number | null;
  serviceRadiusKm: number | null;
  acceptedCategories: string[] | null; // D30: null means unknown
  capacityItems: number | null;        // D30
  capacityKg: number | null;           // D30
  canCollect: boolean | null;
  collectionWindows: CollectionWindow[];
  publicOpeningHours?: string | null;
  provenance: Record<string, { level: ProvenanceLevel; at?: string; sourceRecordId?: string }>;
  websiteUrl?: string | null;
  contactPhone?: string | null;
}
