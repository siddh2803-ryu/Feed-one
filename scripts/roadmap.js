#!/usr/bin/env node

/**
 * Feed One: 50-Commit Roadmap Helper CLI
 * Repo: https://github.com/siddh2803-ryu/Feed-one
 *
 * Usage:
 *   node scripts/roadmap.js list
 *   node scripts/roadmap.js show <commit-number (1-50)>
 *   node scripts/roadmap.js template <commit-number (1-50)>
 */

const ROADMAP = [
  {
    num: 1,
    phase: "Phase 1: Domain Core & Constraint Engine Expansion",
    msg: "feat(matching): add multi-attribute tolerance threshold to C2 capacity checks",
    files: ["src/domain/matching/constraints.ts", "tests/unit/domain/constraints.test.ts"],
    desc: "Introduce optional capacityTolerancePercent (e.g. 5%) in MatchConfig allowing near-capacity matches to enter needs_confirmation rather than strict exclusion."
  },
  {
    num: 2,
    phase: "Phase 1: Domain Core & Constraint Engine Expansion",
    msg: "feat(matching): implement secondary tie-breaker criteria for recipient candidate ranking",
    files: ["src/domain/matching/rank.ts", "tests/unit/domain/rank.test.ts"],
    desc: "Extend rankCandidates() with a secondary tie-breaker: when pickup window start and distance are equal, prioritize recipients with lower recent delivery volume within the past 7 days to balance community distribution."
  },
  {
    num: 3,
    phase: "Phase 1: Domain Core & Constraint Engine Expansion",
    msg: "feat(time): add transit time calculation buffer to pickup window C3 evaluation",
    files: ["src/domain/time/windows.ts", "tests/unit/domain/time.test.ts"],
    desc: "Incorporate estimated vehicle transit time into effective pickup arrival calculations before validating slot duration >= 30m."
  },
  {
    num: 4,
    phase: "Phase 1: Domain Core & Constraint Engine Expansion",
    msg: "feat(matching): support custom donor travel distance cap in constraint C4",
    files: ["src/domain/matching/constraints.ts", "src/domain/matching/types.ts"],
    desc: "Support optional maxDistanceKm on DonationSnapshot. C4 passes only if distance is within both recipient serviceRadiusKm and donor maxDistanceKm."
  },
  {
    num: 5,
    phase: "Phase 1: Domain Core & Constraint Engine Expansion",
    msg: "feat(matching): enrich constraint explanation builders with dynamic reason context",
    files: ["src/domain/matching/explanations.ts"],
    desc: "Provide formatted markdown explanations in buildCandidateExplanation() specifying exact hour intervals and kilometer deltas for all failed constraints."
  },
  {
    num: 6,
    phase: "Phase 1: Domain Core & Constraint Engine Expansion",
    msg: "test(matching): add extensive parameterized test matrix for C1-C6 constraints",
    files: ["tests/unit/domain/constraints_matrix.test.ts"],
    desc: "Create parameterized Vitest test suite executing 25 distinct combinations of category, capacity, time window, and provenance inputs."
  },
  {
    num: 7,
    phase: "Phase 1: Domain Core & Constraint Engine Expansion",
    msg: "refactor(matching): optimize candidate evaluation loop using early-exit constraint evaluation",
    files: ["src/domain/matching/engine.ts"],
    desc: "Short-circuit evaluation for candidates when non-recoverable hard failures are detected, reducing unnecessary time window computation."
  },
  {
    num: 8,
    phase: "Phase 2: Safety Rules & Cold-Chain Governance",
    msg: "feat(safety): add rule S9 for frozen food cold-chain transportation requirements",
    files: ["src/domain/safety/evaluator.ts", "tests/unit/domain/safety.test.ts"],
    desc: "Add rule S9: when storageCategory === 'frozen', verify recipient possesses frozen storage capability or flag as needs_review."
  },
  {
    num: 9,
    phase: "Phase 2: Safety Rules & Cold-Chain Governance",
    msg: "feat(safety): introduce major allergen tagging and recipient allergy exclusion guard",
    files: ["src/domain/matching/types.ts", "src/domain/safety/evaluator.ts"],
    desc: "Add allergens: string[] to DonationSnapshot. When critical allergens are present and recipient allergen policy rejects them, exclude candidate safely."
  },
  {
    num: 10,
    phase: "Phase 2: Safety Rules & Cold-Chain Governance",
    msg: "feat(safety): implement coordinator safety review override audit log tracking",
    files: ["src/domain/safety/evaluator.ts", "src/server/db/store.ts"],
    desc: "Require mandatory reviewerNotes and reviewedBy user ID when transitioning a donation from needs_review to eligible_by_review."
  },
  {
    num: 11,
    phase: "Phase 2: Safety Rules & Cold-Chain Governance",
    msg: "feat(safety): add maximum hot-holding duration threshold rule S10",
    files: ["src/domain/safety/evaluator.ts", "tests/unit/domain/safety.test.ts"],
    desc: "Add rule S10: items with storageCategory === 'hot_held' must have pickupDeadline - preparedAt <= 4 hours, else transition directly to blocked."
  },
  {
    num: 12,
    phase: "Phase 2: Safety Rules & Cold-Chain Governance",
    msg: "test(safety): add negative test suite for spoiled and near-expiry food edge cases",
    files: ["tests/unit/domain/safety_edge.test.ts"],
    desc: "Test boundary conditions where useBy equals now down to the exact millisecond, verifying strict rejection under rules S1 and S2."
  },
  {
    num: 13,
    phase: "Phase 2: Safety Rules & Cold-Chain Governance",
    msg: "docs(safety): document regulatory alignment with Food Safety & Standards Regulations",
    files: ["docs/SAFETY_REGULATIONS.md"],
    desc: "Detail compliance mapping of S1–S10 starter rules against standard national food donation and good samaritan guidelines."
  },
  {
    num: 14,
    phase: "Phase 3: Lifecycle State Machine, Expiries & Concurrency",
    msg: "feat(lifecycle): implement idempotent transition guard with version check",
    files: ["src/domain/lifecycle/transitions.ts", "src/server/db/store.ts"],
    desc: "Implement optimistic locking validation: reject status mutations if provided version does not match entity version."
  },
  {
    num: 15,
    phase: "Phase 3: Lifecycle State Machine, Expiries & Concurrency",
    msg: "feat(lifecycle): add cancellation reason taxonomy and donor cancellation restrictions",
    files: ["src/domain/lifecycle/transitions.ts", "src/domain/matching/types.ts"],
    desc: "Support standard cancellation reason codes. Prohibit cancellation once status is confirmed without coordinator override."
  },
  {
    num: 16,
    phase: "Phase 3: Lifecycle State Machine, Expiries & Concurrency",
    msg: "feat(lifecycle): implement automatic offer fallback cascade on recipient decline",
    files: ["src/server/db/store.ts", "src/app/api/offers/[id]/decline/route.ts"],
    desc: "When an offer is declined, query remaining eligible candidates from match snapshot and automatically dispatch to next ranked recipient."
  },
  {
    num: 17,
    phase: "Phase 3: Lifecycle State Machine, Expiries & Concurrency",
    msg: "feat(lifecycle): add grace-period operational correction endpoint for late pickups",
    files: ["src/server/db/store.ts", "src/app/api/donations/[id]/route.ts"],
    desc: "Allow coordinators to retroactively transition pickup_expired to collected within 24 hours provided physical handoff attestation is supplied."
  },
  {
    num: 18,
    phase: "Phase 3: Lifecycle State Machine, Expiries & Concurrency",
    msg: "feat(lifecycle): record immutable actor audit trail for all donation events",
    files: ["src/server/db/store.ts"],
    desc: "Ensure all lifecycle events store actorRole, actorId, ipHash, and UTC timestamp in an append-only event ledger."
  },
  {
    num: 19,
    phase: "Phase 3: Lifecycle State Machine, Expiries & Concurrency",
    msg: "test(lifecycle): simulate concurrent offer responses under race conditions",
    files: ["tests/unit/domain/concurrency.test.ts"],
    desc: "Test concurrent acceptance and decline requests arriving within the same event loop cycle, verifying strictly one succeeds."
  },
  {
    num: 20,
    phase: "Phase 3: Lifecycle State Machine, Expiries & Concurrency",
    msg: "refactor(lifecycle): consolidate transition validation into typed lookup table",
    files: ["src/domain/lifecycle/transitions.ts"],
    desc: "Refactor transition checks into a declarative Record<DonationStatus, DonationStatus[]> matrix to simplify state machine auditability."
  },
  {
    num: 21,
    phase: "Phase 4: Persistence Layer, Drizzle ORM & Supabase Integration",
    msg: "feat(db): establish typed Drizzle ORM connection pool with PostgreSQL fallback",
    files: ["src/server/db/drizzle.ts", "package.json"],
    desc: "Configure Postgres connection pool using postgres and drizzle-orm/postgres-js, with graceful fallback to in-memory store."
  },
  {
    num: 22,
    phase: "Phase 4: Persistence Layer, Drizzle ORM & Supabase Integration",
    msg: "feat(db): define comprehensive Drizzle schema matching PostgreSQL migrations",
    files: ["src/server/db/schema.ts"],
    desc: "Export typed Drizzle tables for donations, recipients, offers, lifecycle_events, match_runs, and discovery_leads."
  },
  {
    num: 23,
    phase: "Phase 4: Persistence Layer, Drizzle ORM & Supabase Integration",
    msg: "feat(db): implement persistent repository interface bridging Drizzle and MemoryStore",
    files: ["src/server/db/repository.ts", "src/server/db/store.ts"],
    desc: "Abstract data access behind an asynchronous DataRepository interface implemented by both InMemoryStore and DrizzleStore."
  },
  {
    num: 24,
    phase: "Phase 4: Persistence Layer, Drizzle ORM & Supabase Integration",
    msg: "feat(db): add partial unique index on active pending offers in Supabase migrations",
    files: ["supabase/migrations/0001_init.sql"],
    desc: "Add SQL partial unique index CREATE UNIQUE INDEX uq_active_offer ON offers(donation_id) WHERE status = 'sent'; preventing double-offers."
  },
  {
    num: 25,
    phase: "Phase 4: Persistence Layer, Drizzle ORM & Supabase Integration",
    msg: "feat(db): implement automated 90-day retention cleanup for in-app notifications",
    files: ["src/server/db/store.ts", "src/app/api/jobs/apply-expiries/route.ts"],
    desc: "Add maintenance routine in expiry cron to purge notifications older than 90 days."
  },
  {
    num: 26,
    phase: "Phase 4: Persistence Layer, Drizzle ORM & Supabase Integration",
    msg: "test(db): add repository integration tests against live PostgreSQL test database",
    files: ["tests/integration/db_repository.test.ts"],
    desc: "Validate entity insertion, optimistic lock bumping, and transaction rollbacks on PostgreSQL."
  },
  {
    num: 27,
    phase: "Phase 5: API Resiliency, Validation & Webhook Subsystems",
    msg: "feat(api): add strict Zod schema validation middleware for donation listings",
    files: ["src/app/api/donations/route.ts", "src/lib/validation/donations.ts"],
    desc: "Validate payload fields with localized error messages and strict boundary checking."
  },
  {
    num: 28,
    phase: "Phase 5: API Resiliency, Validation & Webhook Subsystems",
    msg: "feat(api): implement idempotent request key handling for offer accept and decline",
    files: ["src/app/api/offers/[id]/accept/route.ts", "src/app/api/offers/[id]/decline/route.ts"],
    desc: "Check Idempotency-Key header; cache and replay identical response when repeated requests are received within 5 minutes."
  },
  {
    num: 29,
    phase: "Phase 5: API Resiliency, Validation & Webhook Subsystems",
    msg: "feat(api): format standardized RFC 7807 Problem Details for all API error responses",
    files: ["src/lib/api/errors.ts", "src/app/api/donations/route.ts"],
    desc: "Return uniform JSON error payloads containing type, title, status, detail, and domain code."
  },
  {
    num: 30,
    phase: "Phase 5: API Resiliency, Validation & Webhook Subsystems",
    msg: "feat(api): add token-bucket rate limiting middleware for discovery fetch requests",
    files: ["src/server/rate_limit.ts", "src/app/api/discovery/runs/route.ts"],
    desc: "Enforce daily caps on discovery endpoints per PRD Q3 specifications."
  },
  {
    num: 31,
    phase: "Phase 5: API Resiliency, Validation & Webhook Subsystems",
    msg: "feat(api): implement outbound webhook dispatcher for instant recipient offer alerts",
    files: ["src/server/webhooks.ts", "src/app/api/donations/[id]/offers/route.ts"],
    desc: "Dispatch secure HTTP POST webhooks to registered recipient endpoints upon new offer generation."
  },
  {
    num: 32,
    phase: "Phase 5: API Resiliency, Validation & Webhook Subsystems",
    msg: "feat(api): implement batch recipient opening hours update route with validation",
    files: ["src/app/api/recipients/[id]/windows/route.ts"],
    desc: "Add batch upsert endpoint for recurring slots with validation ensuring end time > start time."
  },
  {
    num: 33,
    phase: "Phase 5: API Resiliency, Validation & Webhook Subsystems",
    msg: "test(api): write comprehensive HTTP route test suite for all REST endpoints",
    files: ["tests/integration/api_routes.test.ts"],
    desc: "Use Vitest with mocked Next.js request/response contexts to test status codes across all 18 API routes."
  },
  {
    num: 34,
    phase: "Phase 6: Privacy Enforcement, Security Headers & Auditing",
    msg: "feat(security): enforce field-level PII redaction on unconfirmed candidate endpoints",
    files: ["src/server/authz.ts", "src/app/api/donations/[id]/candidates/route.ts"],
    desc: "Strip physical addresses, telephone numbers, and notes from candidate payload until offer is accepted."
  },
  {
    num: 35,
    phase: "Phase 6: Privacy Enforcement, Security Headers & Auditing",
    msg: "feat(security): add strict Content Security Policy and HTTP security headers in next.config",
    files: ["next.config.mjs"],
    desc: "Configure CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, and Referrer-Policy."
  },
  {
    num: 36,
    phase: "Phase 6: Privacy Enforcement, Security Headers & Auditing",
    msg: "feat(security): implement HMAC SHA-256 signature verification for webhook callbacks",
    files: ["src/server/security/crypto.ts"],
    desc: "Sign outgoing webhook payloads using X-FeedOne-Signature and verify incoming payload integrity."
  },
  {
    num: 37,
    phase: "Phase 6: Privacy Enforcement, Security Headers & Auditing",
    msg: "feat(security): add automated role permission matrix regression testing",
    files: ["tests/unit/security_matrix.test.ts"],
    desc: "Test every combination of user roles against every mutation endpoint to prevent privilege escalation."
  },
  {
    num: 38,
    phase: "Phase 6: Privacy Enforcement, Security Headers & Auditing",
    msg: "feat(security): sanitize and redact sensitive PII from server execution logs",
    files: ["src/lib/logger.ts", "src/server/db/store.ts"],
    desc: "Implement structured JSON logger that automatically hashes phone numbers, names, and IP addresses."
  },
  {
    num: 39,
    phase: "Phase 7: Frontend Portals, Design System & Accessibility",
    msg: "feat(ui): add visual route distance and map placeholder to Donor CandidateCard",
    files: ["src/components/feedone/CandidateCard.tsx"],
    desc: "Display approximate Haversine distance with clean badge indicators and transit feasibility notes."
  },
  {
    num: 40,
    phase: "Phase 7: Frontend Portals, Design System & Accessibility",
    msg: "feat(ui): add urgent countdown timer with audio-visual warning states to OfferCard",
    files: ["src/components/feedone/DeadlineCountdown.tsx", "src/components/feedone/OfferCard.tsx"],
    desc: "Highlight urgency when time remaining < 10 minutes (yellow) and < 5 minutes (pulsing red alert)."
  },
  {
    num: 41,
    phase: "Phase 7: Frontend Portals, Design System & Accessibility",
    msg: "feat(ui): build Coordinator safety review modal with granular reason checkboxes",
    files: ["src/app/(coordinator)/coordinator/safety/page.tsx"],
    desc: "Provide interactive modal allowing coordinators to inspect safety flags and submit approval with reason notes."
  },
  {
    num: 42,
    phase: "Phase 7: Frontend Portals, Design System & Accessibility",
    msg: "feat(ui): implement responsive bottom navigation bar for mobile recipient volunteers",
    files: ["src/app/layout.tsx", "src/components/feedone/MobileNav.tsx"],
    desc: "Add fixed mobile navigation bar with touch-friendly targets for recipient portal and impact."
  },
  {
    num: 43,
    phase: "Phase 7: Frontend Portals, Design System & Accessibility",
    msg: "feat(ui): enhance Impact dashboard with date-range filters and CSV export modal",
    files: ["src/app/impact/page.tsx"],
    desc: "Add date range picker dynamically recalculating kilograms diverted and active partner counts."
  },
  {
    num: 44,
    phase: "Phase 7: Frontend Portals, Design System & Accessibility",
    msg: "feat(a11y): implement full WCAG 2.1 AA keyboard navigation and ARIA landmarks",
    files: ["src/app/layout.tsx", "src/components/feedone/ExplanationSheet.tsx"],
    desc: "Add aria-expanded, role='region', skip-to-content links, and full keyboard tab-indexing."
  },
  {
    num: 45,
    phase: "Phase 7: Frontend Portals, Design System & Accessibility",
    msg: "feat(ui): introduce optimistic UI state transitions and toast notifications",
    files: ["src/components/feedone/Toast.tsx", "src/app/(recipient)/recipient/page.tsx"],
    desc: "Optimistically update offer status to Accepted immediately upon button press; show toast on error."
  },
  {
    num: 46,
    phase: "Phase 8: Telemetry, CI/CD, Documentation & Deployment",
    msg: "feat(telemetry): add system health check diagnostics and memory metrics endpoint",
    files: ["src/app/api/health/route.ts"],
    desc: "Return Node.js memory usage, uptime, active donation count, and database connectivity status in GET /api/health."
  },
  {
    num: 47,
    phase: "Phase 8: Telemetry, CI/CD, Documentation & Deployment",
    msg: "ci: configure GitHub Actions workflow for automated test, lint, and build verification",
    files: ["ci/workflow.yml"],
    desc: "Set up GitHub Actions CI workflow running npm run lint, npm test, and npm run build."
  },
  {
    num: 48,
    phase: "Phase 8: Telemetry, CI/CD, Documentation & Deployment",
    msg: "docs: add comprehensive OpenAPI 3.0 specification for all Feed One endpoints",
    files: ["docs/openapi.yaml"],
    desc: "Detail all request/response schemas, authentication headers, error codes, and sample payloads in OpenAPI 3.0 YAML."
  },
  {
    num: 49,
    phase: "Phase 8: Telemetry, CI/CD, Documentation & Deployment",
    msg: "deploy: configure multi-stage production Dockerfile and container health probe",
    files: ["Dockerfile", ".dockerignore"],
    desc: "Author optimized multi-stage standalone Next.js Dockerfile with non-root user execution and healthcheck probe."
  },
  {
    num: 50,
    phase: "Phase 8: Telemetry, CI/CD, Documentation & Deployment",
    msg: "chore(release): bump version to 1.0.0 and finalize production readiness checklist",
    files: ["package.json", "docs/RELEASE_NOTES.md"],
    desc: "Bump version to 1.0.0, summarize completed feature milestones, and document operational verification steps."
  }
];

const cmd = process.argv[2] || "list";
const targetNum = parseInt(process.argv[3], 10);

if (cmd === "list") {
  console.log("\n=======================================================");
  console.log("  FEED ONE: 50-COMMIT DEVELOPMENT ROADMAP");
  console.log("  GitHub: https://github.com/siddh2803-ryu/Feed-one");
  console.log("=======================================================\n");

  let currentPhase = "";
  ROADMAP.forEach((item) => {
    if (item.phase !== currentPhase) {
      currentPhase = item.phase;
      console.log(`\n📌 ${currentPhase}`);
      console.log("─".repeat(currentPhase.length + 3));
    }
    const numPad = String(item.num).padStart(2, "0");
    console.log(`[#${numPad}] ${item.msg}`);
  });

  console.log("\nTip: Run `node scripts/roadmap.js show <1-50>` to inspect a single commit.");
  console.log("Tip: Run `node scripts/roadmap.js template <1-50>` for ready-to-run git commands.\n");
} else if (cmd === "show" && targetNum) {
  const item = ROADMAP.find((r) => r.num === targetNum);
  if (!item) {
    console.error(`Error: Commit #${targetNum} not found in roadmap (1-50).`);
    process.exit(1);
  }
  console.log(`\n=======================================================`);
  console.log(` COMMIT #${item.num}: ${item.msg}`);
  console.log(`=======================================================`);
  console.log(`Phase:        ${item.phase}`);
  console.log(`Description:  ${item.desc}`);
  console.log(`Target Files:`);
  item.files.forEach((f) => console.log(`  - ${f}`));
  console.log(`\nGit Command:`);
  console.log(`  git add ${item.files.join(" ")}`);
  console.log(`  git commit -m "${item.msg}"\n`);
} else if (cmd === "template" && targetNum) {
  const item = ROADMAP.find((r) => r.num === targetNum);
  if (!item) {
    console.error(`Error: Commit #${targetNum} not found in roadmap (1-50).`);
    process.exit(1);
  }
  console.log(`git add ${item.files.join(" ")} && git commit -m "${item.msg}"`);
} else {
  console.log("Usage: node scripts/roadmap.js [list|show <n>|template <n>]");
}
