# Feed One — Feasibility-First Food Rescue Coordination Platform

[![GitHub Repository](https://img.shields.io/badge/GitHub-Feed--one-181717?style=flat&logo=github)](https://github.com/siddh2803-ryu/Feed-one)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.35-C5F74F?style=flat&logo=drizzle)](https://orm.drizzle.team/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Tested_with-Vitest_33%2F33_Passing-yellow?style=flat&logo=vitest)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> **Repository:** [https://github.com/siddh2803-ryu/Feed-one](https://github.com/siddh2803-ryu/Feed-one)  
> **Mission:** Turning commercial surplus food into timely, coordinated community relief through **deterministic constraint matching**, **cold-chain safety routing**, **two-phase contact privacy**, and **honest impact auditing**.

---

## 📑 Table of Contents

1. [Executive Overview](#-executive-overview)
2. [Why Feed One? (The Core Problem)](#-why-feed-one-the-core-problem)
3. [System Architecture & Core Mechanics](#-system-architecture--core-mechanics)
   - [Deterministic Matching & Hard Constraints (C1–C6)](#1-deterministic-matching--hard-constraints-c1c6)
   - [Candidate Grouping & Ranking Heuristics](#2-candidate-grouping--ranking-heuristics)
   - [Food Safety Screening Rules (S1–S8)](#3-food-safety-screening-rules-s1s8)
   - [Two-Phase Contact Disclosure (Privacy by Design)](#4-two-phase-contact-disclosure-privacy-by-design)
   - [Donation & Offer Lifecycle State Machines](#5-donation--offer-lifecycle-state-machines)
   - [Data Provenance & Trust Hierarchy](#6-data-provenance--trust-hierarchy)
4. [Role Portals & Demo Personas](#-role-portals--demo-personas)
5. [Tech Stack & Engineering Foundations](#-tech-stack--engineering-foundations)
6. [Codebase & Directory Structure](#-codebase--directory-structure)
7. [Getting Started & Local Setup](#-getting-started--local-setup)
   - [Prerequisites](#prerequisites)
   - [Installation & Clone](#installation--clone)
   - [Environment Configuration](#environment-configuration)
   - [Running the Development Server](#running-the-development-server)
   - [Database Modes (In-Memory vs PostgreSQL)](#database-modes-in-memory-vs-postgresql)
8. [Testing & Verification](#-testing--verification)
9. [API Endpoint Reference](#-api-endpoint-reference)
10. [🛠️ The 50-Commit Phased Development Roadmap](#️-the-50-commit-phased-development-roadmap)
    - [Phase 1: Domain Core & Constraint Engine Expansion (Commits 01–07)](#phase-1-domain-core--constraint-engine-expansion-commits-0107)
    - [Phase 2: Safety Rules & Cold-Chain Governance (Commits 08–13)](#phase-2-safety-rules--cold-chain-governance-commits-0813)
    - [Phase 3: Lifecycle State Machine, Expiries & Concurrency (Commits 14–20)](#phase-3-lifecycle-state-machine-expiries--concurrency-commits-1420)
    - [Phase 4: Persistence Layer, Drizzle ORM & Supabase Integration (Commits 21–26)](#phase-4-persistence-layer-drizzle-orm--supabase-integration-commits-2126)
    - [Phase 5: API Resiliency, Validation & Webhook Subsystems (Commits 27–33)](#phase-5-api-resiliency-validation--webhook-subsystems-commits-2733)
    - [Phase 6: Privacy Enforcement, Security Headers & Auditing (Commits 34–38)](#phase-6-privacy-enforcement-security-headers--auditing-commits-3438)
    - [Phase 7: Frontend Portals, Design System & Accessibility (Commits 39–45)](#phase-7-frontend-portals-design-system--accessibility-commits-3945)
    - [Phase 8: Telemetry, CI/CD, Documentation & Deployment (Commits 46–50)](#phase-8-telemetry-cicd-documentation--deployment-commits-4650)
11. [Commit Execution & Git Workflow Guide](#-commit-execution--git-workflow-guide)
12. [Contributing & Code Standards](#-contributing--code-standards)
13. [License & Ethical Disclaimer](#-license--ethical-disclaimer)

---

## 🌟 Executive Overview

**Feed One** is a next-generation food rescue coordination utility designed to eliminate the logistical friction between commercial food donors (bakeries, supermarkets, caterers, hotels, corporate cafeterias) and verified frontline charities (homeless shelters, soup kitchens, community pantries, refugee relief centres).

Unlike conventional food donation platforms that function as static "classified boards" or reactive chat groups, Feed One operates as a **constraint-governed dispatch system**. It evaluates real-world operational feasibility *before* ranking or dispatching:

```
[Commercial Donor Lists Surplus] 
             │
             ▼
   [S1–S8 Safety Screening] ──(Blocked / Needs Review)──► [Coordinator Review Queue]
             │ (Eligible)
             ▼
   [C1–C6 Feasibility Engine] ──► Evaluates: Category, Capacity, Time Slots, Distance, Concurrency
             │
             ▼
   [Sequential Dispatch] ──► Ranked Candidate 1 (With strict Respond-By Deadline)
             │
       ┌─────┴────────────────┐
       ▼                      ▼
  [Accepted]              [Declined / Expired]
       │                      │
  [Handoff Contact Unsealed]  └──► Auto-Dispatches to Candidate 2
       │
  [Physical Collection & Delivery Verified]
       │
  [Honest Impact Metrics Incremented (kg / items)]
```

---

## ⚡ Why Feed One? (The Core Problem)

Traditional surplus food redistribution suffers from critical operational failure modes:

| Failure Mode | Traditional Donation Boards | Feed One Solution |
| :--- | :--- | :--- |
| **Operational Timing** | Listings sit unread for hours; food spoils past its use-by window. | Strict pickup window intersection ($\ge 30\text{m}$) and sequential offer deadlines with automated fallback. |
| **Capacity Mismatches** | A small shelter receives 200kg of produce they cannot refrigerate or consume. | Hard capacity constraint (**C2**) prevents overloading; strictly evaluates items or kg. |
| **Safety Compromises** | No cold-chain or temperature-handling oversight. Food poisoning liabilities emerge. | Pure deterministic rule table (**S1–S8**); temperature-controlled items require coordinator verification. |
| **Donor Privacy Leaks** | Public listings expose donor loading bays to unvetted foot traffic. | **Two-Phase Contact Disclosure:** Exact address and phone are sealed until mutual offer confirmation. |
| **Greenwashing Metrics** | Inflated, unverified formulas for "CO2 saved" or "trees planted". | **Honest Auditing:** Factual tallies of delivered kilograms and items only. Zero fabricated carbon metrics. |

---

## 🏗️ System Architecture & Core Mechanics

### 1. Deterministic Matching & Hard Constraints (C1–C6)

Feasibility strictly precedes candidate ranking. A candidate recipient is evaluated through six deterministic filters:

```
                   ┌───────────────────────────────────┐
                   │    Surplus Donation Listing       │
                   └─────────────────┬─────────────────┘
                                     │
      ┌──────────────────────────────┼──────────────────────────────┐
      ▼                              ▼                              ▼
┌──────────────┐               ┌──────────────┐               ┌──────────────┐
│ C1: Category │               │ C2: Capacity │               │  C3: Windows │
│ Accepted?    │               │ Available?   │               │ Overlapping? │
└──────┬───────┘               └──────┬───────┘               └──────┬───────┘
       │                              │                              │
      ┌┴──────────────────────────────┴──────────────────────────────┴┐
      ▼                                                               ▼
┌──────────────┐                                               ┌──────────────┐
│ C4: Distance │                                               │  C5: Safety  │
│ Within Range?│                                               │   Eligible?  │
└──────┬───────┘                                               └──────┬───────┘
       │                              │                               │
       └──────────────────────────────┼───────────────────────────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │   C6: Concurrency Lock    │
                        │ (No active offer clash)   │
                        └─────────────┬─────────────┘
                                      ▼
                        Candidate Grouping & Ranking
```

- **C1 (Category Compatibility):** Verifies the recipient accepts the food category (`bakery`, `produce`, `packaged_dry`, `cooked_meals`, `dairy_eggs`, `beverages`, `other`).
- **C2 (Capacity Alignment):** Evaluates whether the donation quantity fits recipient storage. Evaluated strictly in the same unit (`items` or `kg`). Unit mismatches yield `unknown` (`C2_UNIT_MISMATCH`).
- **C3 (Pickup Window Intersection):** Intersects the donation's available window $[\max(\text{available\_from}, \text{now}), \text{pickup\_deadline}]$ with the recipient’s recurring collection schedule. Requires at least one overlap slot $\ge 30$ minutes.
- **C4 (Distance & Service Area):** Computes Haversine distance from donor coordinates to recipient. Validates that distance $\le \text{service\_radius\_km}$.
- **C5 (Donation Safety Status):** Evaluates whether food safety screening resolved to `eligible_by_rules` or `eligible_by_review`. If `blocked` or `needs_review`, matching is suspended.
- **C6 (Concurrency Guard):** Prevents simultaneous double-allocation by enforcing that recipients with an active pending offer cannot be double-booked.

---

### 2. Candidate Grouping & Ranking Heuristics

Recipients are evaluated into three distinct cohorts:

1. **Eligible (`eligible`):** Every constraint evaluated to `pass`. Candidates are ranked deterministically:
   $$\text{Rank Priority} = \text{Earliest Pickup Slot Start} \;\longrightarrow\; \text{Shortest Haversine Distance} \;\longrightarrow\; \text{Largest Capacity Surplus}$$
2. **Needs Confirmation (`needs_confirmation`):** Zero constraints failed, but at least one evaluated to `unknown` (e.g., unconfirmed weekly intake schedule or public-source provenance). Ranked strictly after all Eligible candidates.
3. **Excluded (`excluded`):** Failed one or more hard constraints (e.g., capacity overloaded, outside operating hours, out of service radius). Disqualified with transparent reason codes.

---

### 3. Food Safety Screening Rules (S1–S8)

Every donation passes through pure deterministic safety evaluation (`src/domain/safety/evaluator.ts`). **The system never labels food as "safe"**; it strictly determines dispatch eligibility:

| Rule | Condition | Outcome | Operational Reason |
| :--- | :--- | :--- | :--- |
| **S1** | `use_by <= now` | `blocked` | Food has passed its use-by deadline. Cannot be redistributed. |
| **S2** | `use_by < pickup_deadline` | `blocked` | Food expires before the pickup window closes. |
| **S3** | `category == 'other'` | `needs_review` | Uncategorized items require food-safety coordinator triage. |
| **S4** | `storageCategory in ['chilled', 'frozen', 'hot_held']` | `needs_review` | Temperature-controlled cold chain requires verified transport protocol. |
| **S5** | `packaged_sealed == false` | `needs_review` | Unpackaged/open items require hygiene review. |
| **S6** | `use_by == null` | `needs_review` | Missing shelf-life attestation requires verification. |
| **S7** | Ambient, sealed, shelf-stable staple (`bakery`, `packaged_dry`, `produce`, `beverages`) | `eligible_by_rules` | Fast-track auto-approval for low-risk ambient packaged surplus. |
| **S8** | Catch-all (e.g., prepared cooked meals, dairy & eggs) | `needs_review` | High-risk categories route to coordinator queue. |

---

### 4. Two-Phase Contact Disclosure (Privacy by Design)

To protect commercial donors from unscheduled drop-ins and safeguard vulnerable shelter locations:

```
[Phase 1: Listing & Candidate Selection]
  Donor sees:     "Hope Haven Shelter • 4.2 km away • Evening Intake • Verified Partner"
  Recipient sees: "40 Packets Sliced Bread • 4.2 km away • Available 18:00 - 21:00"
  (Exact street addresses, contact names, and direct phone numbers remain CRYPTOGRAPHICALLY SEALED)

                                │
                        [Offer Accepted]
                                ▼
[Phase 2: Confirmed Dispatch Handoff]
  Donor unseals:     Driver Name, Volunteer Direct Line, Vehicle Reg / Pickup ETA
  Recipient unseals: Exact Loading Bay Address, Gate Access Code, Contact Person Phone
```

---

### 5. Donation & Offer Lifecycle State Machines

Every status mutation is enforced by pure state transition validators with immutable event recording:

#### Donation Lifecycle
```mermaid
stateDiagram-v2
    [*] --> listed
    listed --> match_recommended : Safety pass & candidates found
    listed --> no_match : No feasible candidates
    match_recommended --> awaiting_confirmation : Offer dispatched
    awaiting_confirmation --> confirmed : Recipient accepts offer
    awaiting_confirmation --> match_recommended : Offer declined/expired
    awaiting_confirmation --> no_match : No remaining candidates
    confirmed --> collected : Physical handoff recorded
    collected --> delivered : Delivery confirmed at charity
    confirmed --> pickup_expired : Pickup deadline + 15m grace exceeded
    listed --> cancelled : Donor cancels
    match_recommended --> cancelled : Donor cancels
    awaiting_confirmation --> cancelled : Donor cancels
```

#### Offer Lifecycle
```mermaid
stateDiagram-v2
    [*] --> sent : Dispatched to Top Candidate
    sent --> accepted : Accepted within Respond-By Window
    sent --> declined : Explicitly declined by recipient
    sent --> expired : Respond-By window elapsed
    sent --> withdrawn : Donor withdrew offer
```

---

### 6. Data Provenance & Trust Hierarchy

Data points carry explicit provenance badges to prevent untrusted public web scrapes from triggering automatic dispatches:

1. `recipient_confirmed` *(Highest trust: verified directly by organization admin)*
2. `coordinator_verified` *(Verified via phone/site check by platform coordinator)*
3. `seeded_demo` *(Pre-verified deterministic demo scenario entities)*
4. `system_derived` *(Computed by platform algorithms, e.g., Haversine distance)*
5. `public_source` *(Untrusted directory scrapes; automatically forces constraint to `unknown`)*

---

## 👥 Role Portals & Demo Personas

Feed One provides zero-friction sandbox testing with pre-seeded personas accessible via the top-bar role switcher or `/demo`:

| Persona | Role | Key Profile Attributes | Primary Route |
| :--- | :--- | :--- | :--- |
| **Demo Bakery** | `donor` | The Flour Box Bakery • Ambient bakery donor listing 40 packets of bread. | [`/donor`](file:///Users/adnan/Desktop/Feed-One/src/app/(donor)/donor/page.tsx) |
| **Recipient B** | `recipient` | Hope Haven Shelter • Capacity: 50 items • Evening window (18:00–22:00) • **Recommended Match**. | [`/recipient`](file:///Users/adnan/Desktop/Feed-One/src/app/(recipient)/recipient/page.tsx) |
| **Recipient A** | `recipient` | St. Jude Community Kitchen • Capacity: 15 items • Fails C2 on 40-item listings. | [`/recipient`](file:///Users/adnan/Desktop/Feed-One/src/app/(recipient)/recipient/page.tsx) |
| **Recipient C** | `recipient` | Westside Day Center • Closest (1.1 km) but morning-only window (08:00–12:00) • Fails C3. | [`/recipient`](file:///Users/adnan/Desktop/Feed-One/src/app/(recipient)/recipient/page.tsx) |
| **Platform Coordinator** | `coordinator` | City Coordinator • Safety review triage, public lead verification, system overrides. | [`/coordinator`](file:///Users/adnan/Desktop/Feed-One/src/app/(coordinator)/coordinator/page.tsx) |
| **Public Transparency** | `public` | Verified impact metrics: Kilograms diverted, items rescued, active verified charities. | [`/impact`](file:///Users/adnan/Desktop/Feed-One/src/app/impact/page.tsx) |

---

## 💻 Tech Stack & Engineering Foundations

- **Framework:** [Next.js 14.2](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **Language:** [TypeScript 5.6](https://www.typescriptlang.org/) (Strict type-checking, zero `any` policy)
- **Styling:** [Tailwind CSS 3.4](https://tailwindcss.com/) with semantic color tokens and accessible dark/light high-contrast palettes
- **Component Primitives:** [Radix UI](https://www.radix-ui.com/) accessible dialogs, dropdowns, tabs, and tooltips
- **Icons:** [Lucide React](https://lucide.dev/)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) + [Zod 3.23](https://zod.dev/)
- **Charts & Data Viz:** [Recharts 2.13](https://recharts.org/) for real-time impact visualizations
- **Database & Schema:** [Drizzle ORM 0.35](https://orm.drizzle.team/) + [Supabase](https://supabase.com/) PostgreSQL
- **Dual-Mode Persistence:** Fully reactive in-memory state store with instant reset (`POST /api/demo/reset`) + PostgreSQL Drizzle schema
- **Test Runner:** [Vitest 2.1](https://vitest.dev/) for sub-second deterministic unit and integration test execution

---

## 📂 Codebase & Directory Structure

```
Feed-One/
├── .env.example                     # Environment template with offline demo defaults
├── README.md                        # Master architectural documentation & roadmap
├── package.json                     # Project manifest and npm scripts
├── tsconfig.json                    # Strict TypeScript configuration
├── tailwind.config.ts               # Custom semantic design tokens
├── vitest.config.ts                 # Vitest runner configuration
├── docs/                            # Traceable engineering registers
│   ├── DECISIONS.md                 # 31 architectural decisions (D1–D31)
│   ├── DEVIATIONS.md                # Controlled deviations from baseline spec
│   ├── INTEGRATIONS.md              # Supabase, Drizzle, and TinyFish integration specs
│   ├── OPEN_QUESTIONS.md            # Unresolved questions & pragmatic fallbacks (Q1–Q15)
│   └── REFERENCE.md                 # Mathematical formulas & domain constants
├── supabase/                        # Database migrations & seeds
│   ├── migrations/
│   │   └── 0001_init.sql            # Comprehensive PostgreSQL schema with constraints & indexes
│   └── seed/
│       └── seed.ts                  # Deterministic demo entities generator
├── src/
│   ├── app/                         # Next.js App Router (Pages & API Handlers)
│   │   ├── (coordinator)/           # Coordinator Command Center (/coordinator)
│   │   ├── (donor)/                 # Donor Dispatch Portal (/donor)
│   │   ├── (recipient)/             # Recipient Response Inbox (/recipient)
│   │   ├── api/                     # REST API Route Handlers
│   │   │   ├── demo/                # Demo reset and role switcher endpoints
│   │   │   ├── discovery/           # Lead discovery runs and lead promotion
│   │   │   ├── donations/           # Donation listing, candidate matching, handoff
│   │   │   ├── health/              # System health check
│   │   │   ├── jobs/                # Expiry background worker trigger
│   │   │   ├── metrics/             # Honest impact tally calculation
│   │   │   ├── notifications/       # In-app notification stream
│   │   │   ├── offers/              # Sequential offer dispatch, accept, decline
│   │   │   ├── recipients/          # Recipient profiles & recurring intake windows
│   │   │   └── safety/              # Safety triage queue endpoints
│   │   ├── demo/                    # Interactive Persona Switcher page
│   │   ├── impact/                  # Public Impact & Transparency dashboard
│   │   ├── privacy/                 # Privacy Policy & two-phase disclosure notice
│   │   ├── terms/                   # Terms of Service & Food Safety attestation
│   │   ├── layout.tsx               # Root layout with RoleSwitcher & DemoBanner
│   │   ├── page.tsx                 # High-impact technical landing page
│   │   └── globals.css              # Custom utility classes and CSS variables
│   ├── components/
│   │   └── feedone/                 # Domain-specific UI component library
│   │       ├── CandidateCard.tsx    # Feasible candidate card with constraint badges
│   │       ├── ConstraintRow.tsx    # Visual C1–C6 pass/fail/unknown breakdowns
│   │       ├── DeadlineCountdown.tsx# Responsive urgency countdown timer
│   │       ├── DemoBanner.tsx       # Sandboxed demo indicator & reset trigger
│   │       ├── ExplanationSheet.tsx # Drawer explaining matching reasons & unknowns
│   │       ├── MetricTile.tsx       # Factual impact counters without greenwashing
│   │       ├── OfferCard.tsx        # Actionable offer card with accept/decline actions
│   │       ├── PickupCard.tsx       # Confirmed pickup details & unsealed contact info
│   │       ├── RoleSwitcher.tsx     # Instant persona switching component
│   │       ├── StatusBadge.tsx      # Domain status badges with semantic colors
│   │       └── StatusTimeline.tsx   # Visual lifecycle event progression
│   ├── domain/                      # PURE DETERMINISTIC DOMAIN LOGIC (Zero external I/O)
│   │   ├── lifecycle/
│   │   │   └── transitions.ts       # State transition rules & invariants (BR-LC-02)
│   │   ├── matching/
│   │   │   ├── constraints.ts       # C1 to C6 constraint evaluation functions
│   │   │   ├── engine.ts            # Core matching coordinator
│   │   │   ├── explanations.ts      # Deterministic explanation string builders
│   │   │   ├── rank.ts              # Eligible candidate ranking algorithms
│   │   │   └── types.ts             # Domain types, interfaces, enums
│   │   ├── metrics/
│   │   │   └── calculator.ts        # Honest impact accumulator (items & kg)
│   │   ├── safety/
│   │   │   └── evaluator.ts         # Rules S1 to S8 food safety routing engine
│   │   └── time/
│   │       └── windows.ts           # Slot intersection & Haversine distance calculations
│   ├── lib/
│   │   └── personas.ts              # Client-safe persona definitions
│   └── server/                      # Server-only modules
│       ├── auth.ts                  # Session & persona resolver
│       ├── authz.ts                 # Role-based authorization matrix
│       └── db/
│           └── store.ts             # Reactive data store with deterministic reset
└── tests/                           # Vitest testing suite
    ├── unit/
    │   ├── authz.test.ts            # Role permission enforcement tests
    │   └── domain/                  # Pure domain logic unit tests (C1-C6, S1-S8, time, lifecycle)
    └── integration/
        └── flows.test.ts            # Full end-to-end operational dispatch flows
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites

- **Node.js:** `>= 18.17.0` (Recommended: LTS 20+)
- **npm:** `>= 9.0.0`
- **Git:** `>= 2.30.0`

### Installation & Clone

```bash
# Clone the repository
git clone https://github.com/siddh2803-ryu/Feed-one.git

# Navigate into the project directory
cd Feed-one

# Install dependencies
npm install
```

### Environment Configuration

Feed One includes a ready-to-use `.env.example` that permits immediate local development in offline demo mode without requiring third-party credentials:

```bash
cp .env.example .env.local
```

Key environment configurations available in `.env.local`:
```ini
# Application Region Settings
REGION_TIMEZONE="Asia/Kolkata"
REGION_CENTER_LAT=12.9716
REGION_CENTER_LNG=77.5946

# Matching Engine Configuration
MIN_PICKUP_SLOT_MINUTES=30
OFFER_RESPONSE_MINUTES=15
OFFER_DEADLINE_BUFFER_MINUTES=30
EXPIRY_GRACE_MINUTES=15

# Storage & Persistence Mode
# Use "memory" for immediate zero-dependency offline sandbox testing.
# Use "postgres" when connected to a local or Supabase PostgreSQL instance.
STORAGE_MODE="memory"
DATABASE_URL="postgres://postgres:postgres@localhost:54322/postgres"

# Optional External Discovery
DISCOVERY_PROVIDER="mock"
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You can immediately click into `/demo` to switch personas, create donations, and witness deterministic matching in action!

### Database Modes (In-Memory vs PostgreSQL)

1. **In-Memory Mode (`STORAGE_MODE="memory"`):** Default mode. Perfect for rapid development, testing, and live demos. State changes are held in-memory and can be deterministically reset anytime via the UI "Reset Demo" button or `POST /api/demo/reset`.
2. **PostgreSQL Mode (`STORAGE_MODE="postgres"`):** Production mode. Connects to Supabase or PostgreSQL via Drizzle ORM.
   ```bash
   # Generate Drizzle migration files
   npm run db:generate

   # Apply migrations to database
   npm run db:migrate

   # Seed database with demo entities
   npm run db:seed
   ```

---

## 🧪 Testing & Verification

Feed One features a comprehensive test suite with Vitest ensuring every domain constraint, safety rule, and lifecycle transition adheres strictly to specification:

```bash
# Run all unit and integration tests (33 tests across 7 test suites)
npm test

# Run tests in continuous watch mode during development
npm run test:watch

# Run tests with code coverage analysis
npm run test:coverage
```

### Test Coverage Highlights:
- **`tests/unit/domain/bread_demo.test.ts`**: The canonical 40-packet bread scenario verifying Recipient B recommendation, Recipient A capacity exclusion, and Recipient C time exclusion.
- **`tests/unit/domain/safety.test.ts`**: S1–S8 safety routing edge cases.
- **`tests/unit/domain/lifecycle.test.ts`**: Immutable state transitions, illegal transition rejection, and concurrency guards.
- **`tests/unit/domain/time.test.ts`**: Haversine distance, slot boundary conditions, and timezone math.
- **`tests/unit/authz.test.ts`**: Role-based access control matrix across donor, recipient, and coordinator routes.
- **`tests/integration/flows.test.ts`**: Complete lifecycle from listing creation $\rightarrow$ candidate selection $\rightarrow$ offer acceptance $\rightarrow$ handoff $\rightarrow$ metrics delivery.

---

## 📡 API Endpoint Reference

All endpoints return standard JSON responses and enforce role authorization via cookies or `x-demo-user-id` headers.

| Method | Endpoint | Authorized Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/donations` | `donor`, `coordinator` | Create a new surplus food listing. Evaluates safety S1–S8 and triggers initial matching. |
| `GET` | `/api/donations/[id]` | `donor`, `coordinator`, `recipient`* | Retrieve donation details. (*Fields redacted before mutual confirmation). |
| `POST` | `/api/donations/[id]/candidates` | `donor`, `coordinator` | Retrieve ranked candidates evaluated under C1–C6 with transparent explanations. |
| `POST` | `/api/donations/[id]/offers` | `donor`, `coordinator` | Dispatch sequential offer to selected candidate with respond-by deadline. |
| `POST` | `/api/donations/[id]/collected` | `donor`, `recipient`, `coordinator` | Record physical handoff from donor to recipient driver/volunteer. |
| `POST` | `/api/donations/[id]/delivered` | `recipient`, `coordinator` | Record arrival and delivery at recipient charity facility. |
| `POST` | `/api/donations/[id]/cancel` | `donor`, `coordinator` | Cancel listing prior to pickup handoff. |
| `POST` | `/api/donations/[id]/rematch` | `donor`, `coordinator` | Re-evaluate matching constraints against current recipient pool. |
| `POST` | `/api/donations/[id]/safety-review`| `coordinator` | Approve or reject items queued in safety review (`eligible_by_review` / `blocked`). |
| `GET` | `/api/offers` | `recipient`, `coordinator` | List pending, accepted, and historical offers for current organization. |
| `POST` | `/api/offers/[id]/accept` | `recipient`, `coordinator` | Accept offer. Unseals two-phase contact information and transitions donation to `confirmed`. |
| `POST` | `/api/offers/[id]/decline` | `recipient`, `coordinator` | Decline offer with reason code. Immediately cascades to next ranked candidate. |
| `GET` | `/api/recipients` | `coordinator` | List registered recipients and discovered lead organizations. |
| `POST` | `/api/recipients/[id]/windows` | `recipient`, `coordinator` | Update recurring weekly collection availability windows. |
| `POST` | `/api/jobs/apply-expiries` | `system`, `coordinator` | Background worker evaluating expired offer response windows and pickup deadlines. |
| `GET` | `/api/metrics` | `public` | Retrieve factual aggregate impact tallies (kg diverted, items rescued). |
| `GET` | `/api/health` | `public` | System status, database health, and active version telemetry. |
| `POST` | `/api/demo/reset` | `public` | Reset in-memory database to deterministic initial seed data. |

---

## 🛠️ The 50-Commit Phased Development Roadmap

To facilitate structured, modular, and collaborative development on GitHub ([https://github.com/siddh2803-ryu/Feed-one](https://github.com/siddh2803-ryu/Feed-one)), the project is architected to be expanded through **50 granular, atomic commits**.

Each commit item provides an exact conventional commit message, scope, file targets, and implementation instructions.

---

### Phase 1: Domain Core & Constraint Engine Expansion (Commits 01–07)

#### Commit 01
- **Message:** `feat(matching): add multi-attribute tolerance threshold to C2 capacity checks`
- **Scope:** Constraint C2 refinement
- **Target Files:** `src/domain/matching/constraints.ts`, `tests/unit/domain/constraints.test.ts`
- **Implementation:** Introduce an optional `capacityTolerancePercent` (e.g. 5%) in `MatchConfig` allowing near-capacity matches to enter `needs_confirmation` rather than strict exclusion. Add unit tests for boundary thresholds.
- **Verification:** `npm test tests/unit/domain/constraints.test.ts`

#### Commit 02
- **Message:** `feat(matching): implement secondary tie-breaker criteria for recipient candidate ranking`
- **Scope:** Ranking algorithm
- **Target Files:** `src/domain/matching/rank.ts`, `tests/unit/domain/rank.test.ts`
- **Implementation:** Extend `rankCandidates()` with a secondary tie-breaker: when pickup window start and distance are equal, prioritize recipients with lower recent delivery volume within the past 7 days to balance community distribution.
- **Verification:** `npm test tests/unit/domain/rank.test.ts`

#### Commit 03
- **Message:** `feat(time): add transit time calculation buffer to pickup window C3 evaluation`
- **Scope:** Pickup window time math
- **Target Files:** `src/domain/time/windows.ts`, `tests/unit/domain/time.test.ts`
- **Implementation:** Incorporate estimated vehicle transit time ($(\text{distanceKm} / 30\text{km/h}) \times 60$) into effective pickup arrival calculations before validating slot duration $\ge 30\text{m}$.
- **Verification:** `npm test tests/unit/domain/time.test.ts`

#### Commit 04
- **Message:** `feat(matching): support custom donor travel distance cap in constraint C4`
- **Scope:** Distance filter
- **Target Files:** `src/domain/matching/constraints.ts`, `src/domain/matching/types.ts`
- **Implementation:** Support optional `maxDistanceKm` on `DonationSnapshot`. C4 passes only if distance is within both recipient `serviceRadiusKm` and donor `maxDistanceKm`.
- **Verification:** `npm test tests/unit/domain/bread_demo.test.ts`

#### Commit 05
- **Message:** `feat(matching): enrich constraint explanation builders with dynamic reason context`
- **Scope:** Human-readable explanations
- **Target Files:** `src/domain/matching/explanations.ts`
- **Implementation:** Provide formatted markdown explanations in `buildCandidateExplanation()` specifying exact hour intervals and kilometer deltas for all failed constraints.
- **Verification:** `npm test`

#### Commit 06
- **Message:** `test(matching): add extensive parameterized test matrix for C1-C6 constraints`
- **Scope:** Test coverage
- **Target Files:** `tests/unit/domain/constraints_matrix.test.ts`
- **Implementation:** Create parameterized Vitest test suite executing 25 distinct combinations of category, capacity, time window, and provenance inputs.
- **Verification:** `npm test tests/unit/domain/constraints_matrix.test.ts`

#### Commit 07
- **Message:** `refactor(matching): optimize candidate evaluation loop using early-exit constraint evaluation`
- **Scope:** Performance optimization
- **Target Files:** `src/domain/matching/engine.ts`
- **Implementation:** Short-circuit evaluation for candidates when non-recoverable hard failures (such as zero category overlap) are detected, reducing unnecessary time window computation.
- **Verification:** `npm test`

---

### Phase 2: Safety Rules & Cold-Chain Governance (Commits 08–13)

#### Commit 08
- **Message:** `feat(safety): add rule S9 for frozen food cold-chain transportation requirements`
- **Scope:** Safety rules expansion
- **Target Files:** `src/domain/safety/evaluator.ts`, `tests/unit/domain/safety.test.ts`
- **Implementation:** Add rule S9: when `storageCategory === 'frozen'`, verify recipient possesses frozen storage capability or flag as `needs_review` with cold-chain transport requirement notes.
- **Verification:** `npm test tests/unit/domain/safety.test.ts`

#### Commit 09
- **Message:** `feat(safety): introduce major allergen tagging and recipient allergy exclusion guard`
- **Scope:** Allergen safety
- **Target Files:** `src/domain/matching/types.ts`, `src/domain/safety/evaluator.ts`
- **Implementation:** Add `allergens: string[]` to `DonationSnapshot`. When critical allergens (peanuts, shellfish) are present and recipient allergen policy rejects them, exclude candidate safely.
- **Verification:** `npm test tests/unit/domain/safety.test.ts`

#### Commit 10
- **Message:** `feat(safety): implement coordinator safety review override audit log tracking`
- **Scope:** Auditability
- **Target Files:** `src/domain/safety/evaluator.ts`, `src/server/db/store.ts`
- **Implementation:** Require mandatory `reviewerNotes` and `reviewedBy` user ID when transitioning a donation from `needs_review` to `eligible_by_review`.
- **Verification:** `npm test tests/unit/domain/safety.test.ts`

#### Commit 11
- **Message:** `feat(safety): add maximum hot-holding duration threshold rule S10`
- **Scope:** Prepared meal safety
- **Target Files:** `src/domain/safety/evaluator.ts`, `tests/unit/domain/safety.test.ts`
- **Implementation:** Add rule S10: items with `storageCategory === 'hot_held'` must have `pickupDeadline - preparedAt <= 4 hours`, else transition directly to `blocked`.
- **Verification:** `npm test tests/unit/domain/safety.test.ts`

#### Commit 12
- **Message:** `test(safety): add negative test suite for spoiled and near-expiry food edge cases`
- **Scope:** Safety boundary testing
- **Target Files:** `tests/unit/domain/safety_edge.test.ts`
- **Implementation:** Test boundary conditions where `useBy` equals `now` down to the exact millisecond, verifying strict rejection under rules S1 and S2.
- **Verification:** `npm test tests/unit/domain/safety_edge.test.ts`

#### Commit 13
- **Message:** `docs(safety): document regulatory alignment with Food Safety & Standards Regulations`
- **Scope:** Safety compliance documentation
- **Target Files:** `docs/SAFETY_REGULATIONS.md`
- **Implementation:** Detail compliance mapping of S1–S10 starter rules against standard national food donation and good samaritan guidelines.
- **Verification:** `git status`

---

### Phase 3: Lifecycle State Machine, Expiries & Concurrency (Commits 14–20)

#### Commit 14
- **Message:** `feat(lifecycle): implement idempotent transition guard with version check`
- **Scope:** Concurrency & data integrity
- **Target Files:** `src/domain/lifecycle/transitions.ts`, `src/server/db/store.ts`
- **Implementation:** Implement optimistic locking validation: reject status mutations if provided `version` does not match the stored entity version, returning `CONCURRENT_MODIFICATION_ERROR`.
- **Verification:** `npm test tests/unit/domain/lifecycle.test.ts`

#### Commit 15
- **Message:** `feat(lifecycle): add cancellation reason taxonomy and donor cancellation restrictions`
- **Scope:** Cancellation workflow
- **Target Files:** `src/domain/lifecycle/transitions.ts`, `src/domain/matching/types.ts`
- **Implementation:** Support standard cancellation reason codes (`spoiled_before_pickup`, `accidental_listing`, `internal_redistribution`). Prohibit cancellation once status is `confirmed` without coordinator override.
- **Verification:** `npm test tests/unit/domain/lifecycle.test.ts`

#### Commit 16
- **Message:** `feat(lifecycle): implement automatic offer fallback cascade on recipient decline`
- **Scope:** Automated dispatch cascade
- **Target Files:** `src/server/db/store.ts`, `src/app/api/offers/[id]/decline/route.ts`
- **Implementation:** When an offer is declined, query the remaining eligible candidates from the match snapshot and automatically dispatch an offer to the next ranked recipient.
- **Verification:** `npm test tests/integration/flows.test.ts`

#### Commit 17
- **Message:** `feat(lifecycle): add grace-period operational correction endpoint for late pickups`
- **Scope:** Operational flexibility (D19)
- **Target Files:** `src/server/db/store.ts`, `src/app/api/donations/[id]/route.ts`
- **Implementation:** Allow coordinators to retroactively transition `pickup_expired` to `collected` within 24 hours provided a verified physical handoff attestation is supplied.
- **Verification:** `npm test tests/unit/domain/lifecycle.test.ts`

#### Commit 18
- **Message:** `feat(lifecycle): record immutable actor audit trail for all donation events`
- **Scope:** Event sourcing audit
- **Target Files:** `src/server/db/store.ts`
- **Implementation:** Ensure all lifecycle events store `actorRole`, `actorId`, `ipHash`, and UTC timestamp in an append-only event ledger.
- **Verification:** `npm test tests/integration/flows.test.ts`

#### Commit 19
- **Message:** `test(lifecycle): simulate concurrent offer responses under race conditions`
- **Scope:** Concurrency tests
- **Target Files:** `tests/unit/domain/concurrency.test.ts`
- **Implementation:** Test concurrent acceptance and decline requests arriving within the same event-loop cycle, verifying strictly one succeeds and version numbers increment properly.
- **Verification:** `npm test tests/unit/domain/concurrency.test.ts`

#### Commit 20
- **Message:** `refactor(lifecycle): consolidate transition validation into typed lookup table`
- **Scope:** Code cleanup
- **Target Files:** `src/domain/lifecycle/transitions.ts`
- **Implementation:** Refactor transition checks into a declarative `Record<DonationStatus, DonationStatus[]>` matrix to simplify state machine auditability.
- **Verification:** `npm test tests/unit/domain/lifecycle.test.ts`

---

### Phase 4: Persistence Layer, Drizzle ORM & Supabase Integration (Commits 21–26)

#### Commit 21
- **Message:** `feat(db): establish typed Drizzle ORM connection pool with PostgreSQL fallback`
- **Scope:** Database connectivity
- **Target Files:** `src/server/db/drizzle.ts`, `package.json`
- **Implementation:** Configure Postgres connection pool using `postgres` and `drizzle-orm/postgres-js`, with graceful fallback to in-memory store when `DATABASE_URL` is omitted.
- **Verification:** `npm run build`

#### Commit 22
- **Message:** `feat(db): define comprehensive Drizzle schema matching PostgreSQL migrations`
- **Scope:** ORM schema definitions
- **Target Files:** `src/server/db/schema.ts`
- **Implementation:** Export typed Drizzle tables for `donations`, `recipients`, `offers`, `lifecycle_events`, `match_runs`, and `discovery_leads` with complete foreign key relations.
- **Verification:** `npm run db:generate`

#### Commit 23
- **Message:** `feat(db): implement persistent repository interface bridging Drizzle and MemoryStore`
- **Scope:** Repository pattern
- **Target Files:** `src/server/db/repository.ts`, `src/server/db/store.ts`
- **Implementation:** Abstract data access behind an asynchronous `DataRepository` interface implemented by both `InMemoryStore` and `DrizzleStore`.
- **Verification:** `npm test`

#### Commit 24
- **Message:** `feat(db): add partial unique index on active pending offers in Supabase migrations`
- **Scope:** Database constraint enforcement (D22)
- **Target Files:** `supabase/migrations/0001_init.sql`
- **Implementation:** Add SQL partial unique index `CREATE UNIQUE INDEX uq_active_offer ON offers(donation_id) WHERE status = 'sent';` preventing race condition double-offers.
- **Verification:** `git status`

#### Commit 25
- **Message:** `feat(db): implement automated 90-day retention cleanup for in-app notifications`
- **Scope:** Data hygiene (Q6)
- **Target Files:** `src/server/db/store.ts`, `src/app/api/jobs/apply-expiries/route.ts`
- **Implementation:** Add maintenance routine in expiry cron to purge notifications older than 90 days.
- **Verification:** `npm test`

#### Commit 26
- **Message:** `test(db): add repository integration tests against live PostgreSQL test database`
- **Scope:** Database integration testing
- **Target Files:** `tests/integration/db_repository.test.ts`
- **Implementation:** Create test suite validating entity insertion, optimistic lock bumping, and transaction rollbacks on Supabase/PostgreSQL.
- **Verification:** `npm test`

---

### Phase 5: API Resiliency, Validation & Webhook Subsystems (Commits 27–33)

#### Commit 27
- **Message:** `feat(api): add strict Zod schema validation middleware for donation listings`
- **Scope:** Request validation
- **Target Files:** `src/app/api/donations/route.ts`, `src/lib/validation/donations.ts`
- **Implementation:** Validate payload fields (quantity $> 0$, pickup deadline $>$ available from, valid category enum, coordinates within pilot boundaries) with localized error messages.
- **Verification:** `npm test tests/integration/flows.test.ts`

#### Commit 28
- **Message:** `feat(api): implement idempotent request key handling for offer accept and decline`
- **Scope:** API idempotency
- **Target Files:** `src/app/api/offers/[id]/accept/route.ts`, `src/app/api/offers/[id]/decline/route.ts`
- **Implementation:** Check incoming `Idempotency-Key` header; cache and replay identical response when repeated requests are received within 5 minutes.
- **Verification:** `npm test`

#### Commit 29
- **Message:** `feat(api): format standardized RFC 7807 Problem Details for all API error responses`
- **Scope:** Error handling standards
- **Target Files:** `src/lib/api/errors.ts`, `src/app/api/donations/route.ts`
- **Implementation:** Return uniform JSON error payloads containing `type`, `title`, `status`, `detail`, `instance`, and domain `code`.
- **Verification:** `npm test`

#### Commit 30
- **Message:** `feat(api): add token-bucket rate limiting middleware for discovery fetch requests`
- **Scope:** Rate limiting
- **Target Files:** `src/server/rate_limit.ts`, `src/app/api/discovery/runs/route.ts`
- **Implementation:** Enforce daily cap (50 searches, 100 fetches) on discovery endpoints per PRD Q3 specifications.
- **Verification:** `npm test`

#### Commit 31
- **Message:** `feat(api): implement outbound webhook dispatcher for instant recipient offer alerts`
- **Scope:** Webhook alerting
- **Target Files:** `src/server/webhooks.ts`, `src/app/api/donations/[id]/offers/route.ts`
- **Implementation:** Dispatch secure HTTP POST webhooks to registered recipient endpoints upon new offer generation with exponential backoff retries.
- **Verification:** `npm test`

#### Commit 32
- **Message:** `feat(api): implement batch recipient opening hours update route with validation`
- **Scope:** Recipient intake management
- **Target Files:** `src/app/api/recipients/[id]/windows/route.ts`
- **Implementation:** Add batch upsert endpoint for recurring slots with validation ensuring end time $>$ start time and day of week $\in [0..6]$.
- **Verification:** `npm test`

#### Commit 33
- **Message:** `test(api): write comprehensive HTTP route test suite for all REST endpoints`
- **Scope:** API test coverage
- **Target Files:** `tests/integration/api_routes.test.ts`
- **Implementation:** Use Vitest with mocked Next.js request/response contexts to test status codes and response headers across all 18 API routes.
- **Verification:** `npm test tests/integration/api_routes.test.ts`

---

### Phase 6: Privacy Enforcement, Security Headers & Auditing (Commits 34–38)

#### Commit 34
- **Message:** `feat(security): enforce field-level PII redaction on unconfirmed candidate endpoints`
- **Scope:** Two-phase disclosure security
- **Target Files:** `src/server/authz.ts`, `src/app/api/donations/[id]/candidates/route.ts`
- **Implementation:** Strip physical addresses, telephone numbers, and coordinator contact notes from candidate payload until mutual offer status is `accepted`.
- **Verification:** `npm test tests/unit/authz.test.ts`

#### Commit 35
- **Message:** `feat(security): add strict Content Security Policy and HTTP security headers in next.config`
- **Scope:** Web application security
- **Target Files:** `next.config.mjs`
- **Implementation:** Configure headers: `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.
- **Verification:** `npm run build`

#### Commit 36
- **Message:** `feat(security): implement HMAC SHA-256 signature verification for webhook callbacks`
- **Scope:** Cryptographic verification
- **Target Files:** `src/server/security/crypto.ts`
- **Implementation:** Sign outgoing webhook payloads using `X-FeedOne-Signature` and verify incoming payload integrity.
- **Verification:** `npm test`

#### Commit 37
- **Message:** `feat(security): add automated role permission matrix regression testing`
- **Scope:** Access control verification
- **Target Files:** `tests/unit/security_matrix.test.ts`
- **Implementation:** Test every combination of user roles (`donor`, `recipient`, `coordinator`, `anonymous`) against every mutation endpoint to prevent privilege escalation.
- **Verification:** `npm test tests/unit/security_matrix.test.ts`

#### Commit 38
- **Message:** `feat(security): sanitize and redact sensitive PII from server execution logs`
- **Scope:** Privacy & logging
- **Target Files:** `src/lib/logger.ts`, `src/server/db/store.ts`
- **Implementation:** Implement structured JSON logger that automatically hashes phone numbers, names, and IP addresses before console emission.
- **Verification:** `npm test`

---

### Phase 7: Frontend Portals, Design System & Accessibility (Commits 39–45)

#### Commit 39
- **Message:** `feat(ui): add visual route distance and map placeholder to Donor CandidateCard`
- **Scope:** Donor UI enhancement
- **Target Files:** `src/components/feedone/CandidateCard.tsx`
- **Implementation:** Display approximate Haversine distance with clean badge indicators, transit feasibility notes, and clear visual candidate ranking.
- **Verification:** `npm run build`

#### Commit 40
- **Message:** `feat(ui): add urgent countdown timer with audio-visual warning states to OfferCard`
- **Scope:** Recipient UI enhancement
- **Target Files:** `src/components/feedone/DeadlineCountdown.tsx`, `src/components/feedone/OfferCard.tsx`
- **Implementation:** Highlight urgency when time remaining $< 10$ minutes (yellow) and $< 5$ minutes (pulsing red alert).
- **Verification:** `npm run build`

#### Commit 41
- **Message:** `feat(ui): build Coordinator safety review modal with granular reason checkboxes`
- **Scope:** Coordinator UI enhancement
- **Target Files:** `src/app/(coordinator)/coordinator/safety/page.tsx`
- **Implementation:** Provide interactive modal allowing coordinators to inspect safety flags (S3–S8), check cold-chain certifications, and submit approval with reason notes.
- **Verification:** `npm run build`

#### Commit 42
- **Message:** `feat(ui): implement responsive bottom navigation bar for mobile recipient volunteers`
- **Scope:** Mobile UX
- **Target Files:** `src/app/layout.tsx`, `src/components/feedone/MobileNav.tsx`
- **Implementation:** Add fixed mobile navigation bar with touch-friendly targets for `/recipient`, `/recipient/profile`, and `/impact`.
- **Verification:** `npm run build`

#### Commit 43
- **Message:** `feat(ui): enhance Impact dashboard with date-range filters and CSV export modal`
- **Scope:** Analytics UI
- **Target Files:** `src/app/impact/page.tsx`
- **Implementation:** Add date range picker (Today, Last 7 Days, Month to Date, All Time) dynamically recalculating kilograms diverted and active partner counts.
- **Verification:** `npm run build`

#### Commit 44
- **Message:** `feat(a11y): implement full WCAG 2.1 AA keyboard navigation and ARIA landmarks`
- **Scope:** Accessibility
- **Target Files:** `src/app/layout.tsx`, `src/components/feedone/ExplanationSheet.tsx`
- **Implementation:** Add `aria-expanded`, `role="region"`, skip-to-content links, and full keyboard tab-indexing across all modal drawers and interactive tables.
- **Verification:** `npm run build`

#### Commit 45
- **Message:** `feat(ui): introduce optimistic UI state transitions and toast notifications`
- **Scope:** User feedback & responsiveness
- **Target Files:** `src/components/feedone/Toast.tsx`, `src/app/(recipient)/recipient/page.tsx`
- **Implementation:** Optimistically update offer status to "Accepted" immediately upon button press while network request is in-flight; show toast notification on error.
- **Verification:** `npm run build`

---

### Phase 8: Telemetry, CI/CD, Documentation & Deployment (Commits 46–50)

#### Commit 46
- **Message:** `feat(telemetry): add system health check diagnostics and memory metrics endpoint`
- **Scope:** Observability
- **Target Files:** `src/app/api/health/route.ts`
- **Implementation:** Return Node.js memory usage, uptime, active donation count, and database connectivity status in `GET /api/health`.
- **Verification:** `npm test`

#### Commit 47
- **Message:** `ci: configure GitHub Actions workflow for automated test, lint, and build verification`
- **Scope:** Continuous integration
- **Target Files:** `ci/workflow.yml`
- **Implementation:** Set up GitHub Actions CI workflow running `npm run lint`, `npm test`, and `npm run build` on all pull requests and pushes to `main`.
- **Verification:** `git status`

#### Commit 48
- **Message:** `docs: add comprehensive OpenAPI 3.0 specification for all Feed One endpoints`
- **Scope:** Developer documentation
- **Target Files:** `docs/openapi.yaml`
- **Implementation:** Detail all request/response schemas, authentication headers, error codes, and sample payloads in OpenAPI 3.0 YAML format.
- **Verification:** `git status`

#### Commit 49
- **Message:** `deploy: configure multi-stage production Dockerfile and container health probe`
- **Scope:** Containerization & deployment
- **Target Files:** `Dockerfile`, `.dockerignore`
- **Implementation:** Author optimized multi-stage standalone Next.js Dockerfile with non-root user execution, alpine base image, and built-in healthcheck probe.
- **Verification:** `git status`

#### Commit 50
- **Message:** `chore(release): bump version to 1.0.0 and finalize production readiness checklist`
- **Scope:** Release milestone
- **Target Files:** `package.json`, `docs/RELEASE_NOTES.md`
- **Implementation:** Bump version to `1.0.0`, summarize completed feature milestones, and document operational verification steps for staging deployment.
- **Verification:** `npm test && npm run build`

---

## 💻 Commit Execution & Git Workflow Guide

Whether you are contributing collaboratively or executing these roadmap milestones incrementally, follow this step-by-step Git procedure:

### 1. Ensure Local Remote Is Correct
Verify that your local Git repository is mapped to:
```bash
git remote -v
# Should display:
# origin  https://github.com/siddh2803-ryu/Feed-one.git (fetch)
# origin  https://github.com/siddh2803-ryu/Feed-one.git (push)
```

If it points to a different remote, update it immediately:
```bash
git remote set-url origin https://github.com/siddh2803-ryu/Feed-one.git
```

### 2. Creating a Feature Branch
```bash
# Switch to main and sync with upstream
git checkout main
git pull origin main

# Create a focused feature branch for your milestone
git checkout -b feat/commit-01-capacity-threshold
```

### 3. Implementing and Verifying Changes
Make the modular edits specified in the roadmap, then run the test suite to ensure zero regressions:
```bash
# Verify test integrity
npm test

# Verify type safety and build
npm run build
```

### 4. Committing with Conventional Commit Format
```bash
# Stage the modified files
git add src/domain/matching/constraints.ts tests/unit/domain/constraints.test.ts

# Commit using the exact conventional commit message from the roadmap
git commit -m "feat(matching): add multi-attribute tolerance threshold to C2 capacity checks"

# Push to your branch on GitHub
git push -u origin feat/commit-01-capacity-threshold
```

---

## 🤝 Contributing & Code Standards

We welcome community contributions to Feed One! Please review our core tenets:

1. **Deterministic Over Heuristic:** Feasibility calculations must remain deterministic and auditable. AI/LLM components are restricted to summarization; they never decide safety, eligibility, or ranking.
2. **Zero-Secret Commits:** Never commit `.env`, `.env.local`, API keys, service credentials, or production tokens to git.
3. **Strict Type Safety:** No `any` types. Ensure all domain snapshots and API route parameters are fully typed with TypeScript and validated with Zod.
4. **Test-Driven Changes:** Every new constraint or safety rule must be accompanied by a dedicated unit test in `tests/unit/`.

---

## 📜 License & Ethical Disclaimer

### License
Distributed under the **MIT License**. See `LICENSE` for details.

### Operational Food Safety Disclaimer
> **Important Notice:** Feed One provides operational routing, constraint validation, and administrative triage workflows. The software does not physically inspect food, certify microbiological safety, or substitute for local public health and food handling regulations. Final physical inspection occurs at the point of handoff between donor personnel and recipient representatives.
