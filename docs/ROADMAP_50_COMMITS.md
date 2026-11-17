# Feed One: 50-Commit Incremental Development Roadmap

**GitHub Repository:** [https://github.com/siddh2803-ryu/Feed-one](https://github.com/siddh2803-ryu/Feed-one)  
**Interactive CLI:** `npm run roadmap -- list` or `npm run roadmap -- show <1-50>`

This document establishes a **50-commit atomic development sequence** for Feed One, organized into 8 progressive engineering phases. Each commit is designed to be an atomic, test-verified step adhering to the Conventional Commits specification.

---

## Quick Reference Summary

| Phase | Focus Area | Commit Range | Count |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Domain Core & Constraint Engine Expansion | Commits 01–07 | 7 commits |
| **Phase 2** | Safety Rules & Cold-Chain Governance | Commits 08–13 | 6 commits |
| **Phase 3** | Lifecycle State Machine, Expiries & Concurrency | Commits 14–20 | 7 commits |
| **Phase 4** | Persistence Layer, Drizzle ORM & Supabase | Commits 21–26 | 6 commits |
| **Phase 5** | API Resiliency, Validation & Webhook Subsystems | Commits 27–33 | 7 commits |
| **Phase 6** | Privacy Enforcement, Security Headers & Auditing | Commits 34–38 | 5 commits |
| **Phase 7** | Frontend Portals, Design System & Accessibility | Commits 39–45 | 7 commits |
| **Phase 8** | Telemetry, CI/CD, Documentation & Deployment | Commits 46–50 | 5 commits |
| **Total** | Full Platform Incremental Maturation | **Commits 01–50** | **50 Commits** |

---

## Detailed Task Backlog

### Phase 1: Domain Core & Constraint Engine Expansion

- **[#01]** `feat(matching): add multi-attribute tolerance threshold to C2 capacity checks`
  - *Files:* `src/domain/matching/constraints.ts`, `tests/unit/domain/constraints.test.ts`
  - *Details:* Introduce optional `capacityTolerancePercent` (e.g. 5%) in `MatchConfig` allowing near-capacity matches to enter `needs_confirmation` rather than strict exclusion.
- **[#02]** `feat(matching): implement secondary tie-breaker criteria for recipient candidate ranking`
  - *Files:* `src/domain/matching/rank.ts`, `tests/unit/domain/rank.test.ts`
  - *Details:* Extend `rankCandidates()` with a secondary tie-breaker: prioritize recipients with lower recent delivery volume when pickup window start and distance are equal.
- **[#03]** `feat(time): add transit time calculation buffer to pickup window C3 evaluation`
  - *Files:* `src/domain/time/windows.ts`, `tests/unit/domain/time.test.ts`
  - *Details:* Factor estimated transit time into effective pickup arrival calculations before validating slot duration $\ge 30\text{m}$.
- **[#04]** `feat(matching): support custom donor travel distance cap in constraint C4`
  - *Files:* `src/domain/matching/constraints.ts`, `src/domain/matching/types.ts`
  - *Details:* Support optional `maxDistanceKm` on `DonationSnapshot`. C4 passes only if within both recipient `serviceRadiusKm` and donor `maxDistanceKm`.
- **[#05]** `feat(matching): enrich constraint explanation builders with dynamic reason context`
  - *Files:* `src/domain/matching/explanations.ts`
  - *Details:* Provide formatted markdown explanations specifying exact hour intervals and kilometer deltas for all failed constraints.
- **[#06]** `test(matching): add extensive parameterized test matrix for C1-C6 constraints`
  - *Files:* `tests/unit/domain/constraints_matrix.test.ts`
  - *Details:* Create parameterized Vitest test suite executing 25 distinct combinations of category, capacity, time window, and provenance inputs.
- **[#07]** `refactor(matching): optimize candidate evaluation loop using early-exit constraint evaluation`
  - *Files:* `src/domain/matching/engine.ts`
  - *Details:* Short-circuit evaluation for candidates when non-recoverable hard failures are detected.

---

### Phase 2: Safety Rules & Cold-Chain Governance

- **[#08]** `feat(safety): add rule S9 for frozen food cold-chain transportation requirements`
  - *Files:* `src/domain/safety/evaluator.ts`, `tests/unit/domain/safety.test.ts`
  - *Details:* Verify recipient possesses frozen storage capability or flag as `needs_review` with cold-chain transport requirement notes.
- **[#09]** `feat(safety): introduce major allergen tagging and recipient allergy exclusion guard`
  - *Files:* `src/domain/matching/types.ts`, `src/domain/safety/evaluator.ts`
  - *Details:* Add `allergens: string[]` to `DonationSnapshot` and exclude candidate if recipient allergen policy rejects them.
- **[#10]** `feat(safety): implement coordinator safety review override audit log tracking`
  - *Files:* `src/domain/safety/evaluator.ts`, `src/server/db/store.ts`
  - *Details:* Require mandatory `reviewerNotes` and `reviewedBy` user ID when transitioning a donation from `needs_review` to `eligible_by_review`.
- **[#11]** `feat(safety): add maximum hot-holding duration threshold rule S10`
  - *Files:* `src/domain/safety/evaluator.ts`, `tests/unit/domain/safety.test.ts`
  - *Details:* Enforce `pickupDeadline - preparedAt <= 4 hours` for hot-held items, else transition to `blocked`.
- **[#12]** `test(safety): add negative test suite for spoiled and near-expiry food edge cases`
  - *Files:* `tests/unit/domain/safety_edge.test.ts`
  - *Details:* Test millisecond boundary conditions where `useBy` equals `now`, verifying strict rejection under rules S1 and S2.
- **[#13]** `docs(safety): document regulatory alignment with Food Safety & Standards Regulations`
  - *Files:* `docs/SAFETY_REGULATIONS.md`
  - *Details:* Detail compliance mapping of S1–S10 rules against food donation safety guidelines.

---

### Phase 3: Lifecycle State Machine, Expiries & Concurrency

- **[#14]** `feat(lifecycle): implement idempotent transition guard with version check`
  - *Files:* `src/domain/lifecycle/transitions.ts`, `src/server/db/store.ts`
  - *Details:* Enforce optimistic locking by comparing provided version with stored entity version.
- **[#15]** `feat(lifecycle): add cancellation reason taxonomy and donor cancellation restrictions`
  - *Files:* `src/domain/lifecycle/transitions.ts`, `src/domain/matching/types.ts`
  - *Details:* Add standard cancellation reason codes and prohibit donor cancellation once confirmed.
- **[#16]** `feat(lifecycle): implement automatic offer fallback cascade on recipient decline`
  - *Files:* `src/server/db/store.ts`, `src/app/api/offers/[id]/decline/route.ts`
  - *Details:* Auto-dispatch offer to next ranked candidate when current offer is declined.
- **[#17]** `feat(lifecycle): add grace-period operational correction endpoint for late pickups`
  - *Files:* `src/server/db/store.ts`, `src/app/api/donations/[id]/route.ts`
  - *Details:* Allow coordinators to retroactively transition `pickup_expired` to `collected` within 24 hours.
- **[#18]** `feat(lifecycle): record immutable actor audit trail for all donation events`
  - *Files:* `src/server/db/store.ts`
  - *Details:* Ensure lifecycle events persist `actorRole`, `actorId`, `ipHash`, and timestamp.
- **[#19]** `test(lifecycle): simulate concurrent offer responses under race conditions`
  - *Files:* `tests/unit/domain/concurrency.test.ts`
  - *Details:* Verify race-condition resilience during simultaneous accept/decline actions.
- **[#20]** `refactor(lifecycle): consolidate transition validation into typed lookup table`
  - *Files:* `src/domain/lifecycle/transitions.ts`
  - *Details:* Replace branching statements with declarative status transition matrix.

---

### Phase 4: Persistence Layer, Drizzle ORM & Supabase Integration

- **[#21]** `feat(db): establish typed Drizzle ORM connection pool with PostgreSQL fallback`
  - *Files:* `src/server/db/drizzle.ts`, `package.json`
- **[#22]** `feat(db): define comprehensive Drizzle schema matching PostgreSQL migrations`
  - *Files:* `src/server/db/schema.ts`
- **[#23]** `feat(db): implement persistent repository interface bridging Drizzle and MemoryStore`
  - *Files:* `src/server/db/repository.ts`, `src/server/db/store.ts`
- **[#24]** `feat(db): add partial unique index on active pending offers in Supabase migrations`
  - *Files:* `supabase/migrations/0001_init.sql`
- **[#25]** `feat(db): implement automated 90-day retention cleanup for in-app notifications`
  - *Files:* `src/server/db/store.ts`, `src/app/api/jobs/apply-expiries/route.ts`
- **[#26]** `test(db): add repository integration tests against live PostgreSQL test database`
  - *Files:* `tests/integration/db_repository.test.ts`

---

### Phase 5: API Resiliency, Validation & Webhook Subsystems

- **[#27]** `feat(api): add strict Zod schema validation middleware for donation listings`
  - *Files:* `src/app/api/donations/route.ts`, `src/lib/validation/donations.ts`
- **[#28]** `feat(api): implement idempotent request key handling for offer accept and decline`
  - *Files:* `src/app/api/offers/[id]/accept/route.ts`, `src/app/api/offers/[id]/decline/route.ts`
- **[#29]** `feat(api): format standardized RFC 7807 Problem Details for all API error responses`
  - *Files:* `src/lib/api/errors.ts`, `src/app/api/donations/route.ts`
- **[#30]** `feat(api): add token-bucket rate limiting middleware for discovery fetch requests`
  - *Files:* `src/server/rate_limit.ts`, `src/app/api/discovery/runs/route.ts`
- **[#31]** `feat(api): implement outbound webhook dispatcher for instant recipient offer alerts`
  - *Files:* `src/server/webhooks.ts`, `src/app/api/donations/[id]/offers/route.ts`
- **[#32]** `feat(api): implement batch recipient opening hours update route with validation`
  - *Files:* `src/app/api/recipients/[id]/windows/route.ts`
- **[#33]** `test(api): write comprehensive HTTP route test suite for all REST endpoints`
  - *Files:* `tests/integration/api_routes.test.ts`

---

### Phase 6: Privacy Enforcement, Security Headers & Auditing

- **[#34]** `feat(security): enforce field-level PII redaction on unconfirmed candidate endpoints`
  - *Files:* `src/server/authz.ts`, `src/app/api/donations/[id]/candidates/route.ts`
- **[#35]** `feat(security): add strict Content Security Policy and HTTP security headers in next.config`
  - *Files:* `next.config.mjs`
- **[#36]** `feat(security): implement HMAC SHA-256 signature verification for webhook callbacks`
  - *Files:* `src/server/security/crypto.ts`
- **[#37]** `feat(security): add automated role permission matrix regression testing`
  - *Files:* `tests/unit/security_matrix.test.ts`
- **[#38]** `feat(security): sanitize and redact sensitive PII from server execution logs`
  - *Files:* `src/lib/logger.ts`, `src/server/db/store.ts`

---

### Phase 7: Frontend Portals, Design System & Accessibility

- **[#39]** `feat(ui): add visual route distance and map placeholder to Donor CandidateCard`
  - *Files:* `src/components/feedone/CandidateCard.tsx`
- **[#40]** `feat(ui): add urgent countdown timer with audio-visual warning states to OfferCard`
  - *Files:* `src/components/feedone/DeadlineCountdown.tsx`, `src/components/feedone/OfferCard.tsx`
- **[#41]** `feat(ui): build Coordinator safety review modal with granular reason checkboxes`
  - *Files:* `src/app/(coordinator)/coordinator/safety/page.tsx`
- **[#42]** `feat(ui): implement responsive bottom navigation bar for mobile recipient volunteers`
  - *Files:* `src/app/layout.tsx`, `src/components/feedone/MobileNav.tsx`
- **[#43]** `feat(ui): enhance Impact dashboard with date-range filters and CSV export modal`
  - *Files:* `src/app/impact/page.tsx`
- **[#44]** `feat(a11y): implement full WCAG 2.1 AA keyboard navigation and ARIA landmarks`
  - *Files:* `src/app/layout.tsx`, `src/components/feedone/ExplanationSheet.tsx`
- **[#45]** `feat(ui): introduce optimistic UI state transitions and toast notifications`
  - *Files:* `src/components/feedone/Toast.tsx`, `src/app/(recipient)/recipient/page.tsx`

---

### Phase 8: Telemetry, CI/CD, Documentation & Deployment

- **[#46]** `feat(telemetry): add system health check diagnostics and memory metrics endpoint`
  - *Files:* `src/app/api/health/route.ts`
- **[#47]** `ci: configure GitHub Actions workflow for automated test, lint, and build verification`
  - *Files:* `ci/workflow.yml`
- **[#48]** `docs: add comprehensive OpenAPI 3.0 specification for all Feed One endpoints`
  - *Files:* `docs/openapi.yaml`
- **[#49]** `deploy: configure multi-stage production Dockerfile and container health probe`
  - *Files:* `Dockerfile`, `.dockerignore`
- **[#50]** `chore(release): bump version to 1.0.0 and finalize production readiness checklist`
  - *Files:* `package.json`, `docs/RELEASE_NOTES.md`
