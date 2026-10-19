# Feed One — Feasibility-First Food Rescue Coordination Utility

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tested_with-Vitest-yellow?style=flat&logo=vitest)](https://vitest.dev/)

> Turning surplus food into timely, coordinated relief through deterministic matching, cold-chain safety validation, and privacy-preserving handoffs.

---

## 🌟 Overview

**Feed One** is an AI-assisted, constraint-based food rescue coordination platform connecting commercial food donors (bakeries, grocers, caterers, hotels) with verified community charities and emergency relief shelters.

Unlike traditional donation boards, Feed One evaluates operational constraints in real time:
- **Strict Time Feasibility:** Intake hours, preparation decay windows, and transport transit times.
- **Safety Enforcement (S1–S8):** Cold-chain verification, allergen handling, hot-holding limits, and coordinator oversight queues.
- **Two-Phase Contact Disclosure:** Exact donor and recipient contact details remain sealed until both parties mutually confirm an operational dispatch offer.
- **Auditable Impact:** Honest metrics tracking kilograms rescued and meal equivalents without fabricated carbon claims.

---

## 🏗️ Architecture & Portals

The application provides specialized workflows tailored to each participant role:

| Portal | Route | Primary Capabilities |
| :--- | :--- | :--- |
| **Donor Dispatch Portal** | `/donor` | List surplus items, specify storage conditions, review matching candidate recipients, and confirm handoff. |
| **Recipient Response Inbox** | `/recipient` | Review ranked offers with full constraint explanations, accept or decline within acceptance deadlines, manage dietary capabilities and intake schedules. |
| **Coordinator Command Center** | `/coordinator` | Full situational awareness, manual matching overrides, public web discovery queue triage, and safety rule thresholds. |
| **Impact & Verification** | `/impact` | Transparent, honest tally of kilograms diverted, meals served, and verified partner statistics. |
| **Demo Persona Sandbox** | `/demo` | Switch between pre-seeded personas (The Flour Box Bakery, Hope Haven Shelter, Community Kitchen, City Coordinator) to experience end-to-end workflows. |

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions, API Route Handlers)
- **Language:** [TypeScript 5](https://www.typescriptlang.org/) (Strict type-checking)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with custom color tokens and accessible UI components
- **Icons:** [Lucide React](https://lucide.dev/)
- **Database & ORM:** [Drizzle ORM](https://orm.drizzle.team/) with PostgreSQL / [Supabase](https://supabase.com/)
- **Testing:** [Vitest](https://vitest.dev/) for unit and end-to-end integration flows

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.17.0
- **npm** >= 9.0.0

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/siddh2803-ryu/Feed-one.git
   cd Feed-one
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the sample environment file:
   ```bash
   cp .env.example .env.local
   ```
   *Note: Default placeholder credentials in `.env.example` allow running in offline demo mode without external dependencies.*

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Quality Assurance

Run the Vitest test suite covering domain lifecycle state machines, safety rules S1–S8, time window feasibility, and integration flows:

```bash
# Run unit & integration tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with code coverage
npm run test:coverage
```

### Production Build

Verify type integrity and compile an optimized production build:

```bash
npm run build
```

---

## 🔒 Security & Privacy Practices

- **Zero-Secret Commits:** No credentials, service keys, private tokens, or sensitive environment variables are committed to version control.
- **Privacy by Design:** Facilities and vulnerable recipient organisations are protected by two-phase contact disclosure. Candidate matching exposes only distance, category fit, and capacity feasibility.
- **Constraint Determinism:** Safety and eligibility calculations are executed on the server with deterministic fallbacks to guarantee reliability during connectivity disruptions.

---

## 📄 License & Compliance

Licensed under the MIT License. See [Terms and Conditions](/terms) and [Privacy Policy](/privacy) for operational guidelines.