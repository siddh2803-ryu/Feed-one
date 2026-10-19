import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  Package,
  Layers,
  MapPin,
  AlertTriangle,
  Scale,
  Database,
  Building,
  ArrowUpRight,
  Check,
  X,
  HelpCircle,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="max-w-5xl mx-auto py-8 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 pt-4">
        {/* System Architecture Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface border border-border text-xs font-mono text-foreground-muted">
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
          <span className="font-semibold text-foreground">Feed One Infrastructure</span>
          <span className="text-border-strong">•</span>
          <span>Deterministic Dispatch Engine</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight font-display max-w-4xl mx-auto leading-[1.1]">
          Constraint-Based Food Rescue Coordination{" "}
          <span className="text-brand">Without Guesswork.</span>
        </h1>

        {/* Technical Subtitle */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-foreground-muted leading-relaxed">
          Feed One routes commercial surplus food to verified charities through deterministic operational constraints, sequential response windows, and cold-chain safety protocols. Feasibility strictly precedes ranking.
        </p>

        {/* Primary CTAs */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/donor/donations/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-brand text-brand-on hover:bg-brand-hover shadow-sm transition-colors"
          >
            <span>Run Surplus Dispatch Demo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/coordinator"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-surface border border-border-strong text-foreground hover:bg-surface-muted transition-colors"
          >
            <span>Coordinator Operations Console</span>
          </Link>

          <Link
            href="/impact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-surface border border-border text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
          >
            <span>View Verified Impact</span>
          </Link>
        </div>

        {/* Engineering Highlights */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-foreground-muted font-mono">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand" />
            C1 to C6 Hard Constraints
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand" />
            Zero Black-Box Scoring
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand" />
            Sequential Single-Offer Windows
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand" />
            Two-Phase Contact Disclosure
          </span>
        </div>
      </div>

      {/* Architectural Principles: 3 Pillar Cards */}
      <div className="grid md:grid-cols-3 gap-5">
        <div className="bg-surface p-6 rounded-xl border border-border space-y-3">
          <div className="w-9 h-9 rounded-lg bg-brand-subtle flex items-center justify-center text-brand">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-foreground">
            Hard Feasibility Precedes Ranking
          </h2>
          <p className="text-xs text-foreground-muted leading-relaxed">
            Every candidate recipient is screened against 6 strict physical constraints (category, capacity, time overlap, vehicle capability, food safety rules, and geographic radius). No weighted score can override a logistical failure.
          </p>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border space-y-3">
          <div className="w-9 h-9 rounded-lg bg-info-subtle flex items-center justify-center text-info">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-foreground">
            Sequential Time-Bounded Offers
          </h2>
          <p className="text-xs text-foreground-muted leading-relaxed">
            Offers are dispatched sequentially to one recipient at a time with a strict respond-by window (15 to 30 minutes). This eliminates race conditions, multi-recipient double-booking, and panic-acceptances.
          </p>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border space-y-3">
          <div className="w-9 h-9 rounded-lg bg-accent-subtle flex items-center justify-center text-accent">
            <Database className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-foreground">
            Verified Provenance Hierarchy
          </h2>
          <p className="text-xs text-foreground-muted leading-relaxed">
            Feed One enforces strict provenance tiers. Confirmed recipient profiles pass constraints; unverified public directory entries remain flagged as unconfirmed leads and can never receive automated dispatch passes.
          </p>
        </div>
      </div>

      {/* The 6 Hard Constraints Matrix */}
      <div className="space-y-4">
        <div className="border-b border-border pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold text-brand uppercase tracking-wider font-mono">
              Deterministic Evaluation Pipeline
            </span>
            <h2 className="text-xl font-bold text-foreground font-display">
              The 6 Operational Constraints (C1 to C6)
            </h2>
          </div>
          <span className="text-xs text-foreground-muted">
            All 6 must pass for candidate eligibility
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* C1 */}
          <div className="bg-surface p-4 rounded-xl border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-muted text-foreground">
                C1
              </span>
              <span className="text-[11px] text-foreground-muted font-medium">Category Compatibility</span>
            </div>
            <h3 className="text-xs font-bold text-foreground">Accepted Food Taxonomy</h3>
            <p className="text-[11px] text-foreground-muted leading-relaxed">
              Verifies that the recipient facility accepts the specific category (produce, bakery, dairy, prepared meals). Mismatches fail immediately.
            </p>
          </div>

          {/* C2 */}
          <div className="bg-surface p-4 rounded-xl border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-muted text-foreground">
                C2
              </span>
              <span className="text-[11px] text-foreground-muted font-medium">Volumetric Capacity</span>
            </div>
            <h3 className="text-xs font-bold text-foreground">Exact Unit Matching</h3>
            <p className="text-[11px] text-foreground-muted leading-relaxed">
              Compares requested quantity against available storage in matching units (items or kg). Never relies on arbitrary unit conversion guesses.
            </p>
          </div>

          {/* C3 */}
          <div className="bg-surface p-4 rounded-xl border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-muted text-foreground">
                C3
              </span>
              <span className="text-[11px] text-foreground-muted font-medium">Schedule Overlap</span>
            </div>
            <h3 className="text-xs font-bold text-foreground">Operating Window Intersection</h3>
            <p className="text-[11px] text-foreground-muted leading-relaxed">
              Calculates overlap between donor pickup window and recipient collection shifts. Requires at least 30 continuous feasible minutes.
            </p>
          </div>

          {/* C4 */}
          <div className="bg-surface p-4 rounded-xl border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-muted text-foreground">
                C4
              </span>
              <span className="text-[11px] text-foreground-muted font-medium">Logistical Readiness</span>
            </div>
            <h3 className="text-xs font-bold text-foreground">Collection Capability</h3>
            <p className="text-[11px] text-foreground-muted leading-relaxed">
              Confirms the recipient operates transport vehicles or active volunteer drivers able to collect directly from the donor location.
            </p>
          </div>

          {/* C5 */}
          <div className="bg-surface p-4 rounded-xl border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-muted text-foreground">
                C5
              </span>
              <span className="text-[11px] text-foreground-muted font-medium">Food Hygiene</span>
            </div>
            <h3 className="text-xs font-bold text-foreground">Starter Safety Rules S1 to S8</h3>
            <p className="text-[11px] text-foreground-muted leading-relaxed">
              Deterministic rule evaluation of storage temperature, packaging integrity, and time thresholds. Flagged items require coordinator clearance.
            </p>
          </div>

          {/* C6 */}
          <div className="bg-surface p-4 rounded-xl border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-muted text-foreground">
                C6
              </span>
              <span className="text-[11px] text-foreground-muted font-medium">Spatial Proximity</span>
            </div>
            <h3 className="text-xs font-bold text-foreground">Haversine Service Area</h3>
            <p className="text-[11px] text-foreground-muted leading-relaxed">
              Computes straight-line distance against recipient service radius. Clearly labeled approximate distance without simulated traffic claims.
            </p>
          </div>
        </div>
      </div>

      {/* Contrast Table: Feed One vs Traditional Approaches */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border bg-surface-muted/40">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Architecture Comparison: Production Utility vs Vibe-Coded Prototypes
          </h2>
          <p className="text-xs text-foreground-muted mt-1">
            Why deterministic constraint satisfaction outperforms subjective matching heuristics in emergency food relief.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-muted/80 text-foreground font-semibold border-b border-border">
              <tr>
                <th className="px-5 py-3 font-mono">Dimension</th>
                <th className="px-5 py-3 text-brand">Feed One Coordination Engine</th>
                <th className="px-5 py-3 text-foreground-muted">Conventional Matching Portals</th>
              </tr>
            </thead>
            <tbody className="divide-y border-border">
              <tr>
                <td className="px-5 py-3 font-semibold text-foreground">Matching Logic</td>
                <td className="px-5 py-3 text-foreground">
                  <div className="flex items-center gap-1.5 text-brand font-medium">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Hard constraints must satisfy before any ranking (C1 to C6).</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-foreground-muted">
                  Weighted scoring where high distance scores mask closed operating hours.
                </td>
              </tr>

              <tr>
                <td className="px-5 py-3 font-semibold text-foreground">Offer Dispatching</td>
                <td className="px-5 py-3 text-foreground">
                  <div className="flex items-center gap-1.5 text-brand font-medium">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Sequential offers with strict expiration timers (15m to 30m).</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-foreground-muted">
                  Simultaneous mass broadcasts triggering race conditions and wasted trips.
                </td>
              </tr>

              <tr>
                <td className="px-5 py-3 font-semibold text-foreground">Contact Disclosure</td>
                <td className="px-5 py-3 text-foreground">
                  <div className="flex items-center gap-1.5 text-brand font-medium">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Two-phase reveal: exact address and phone sealed until mutual acceptance.</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-foreground-muted">
                  Publicly exposed commercial addresses and uncontrolled contact phone numbers.
                </td>
              </tr>

              <tr>
                <td className="px-5 py-3 font-semibold text-foreground">Directory Provenance</td>
                <td className="px-5 py-3 text-foreground">
                  <div className="flex items-center gap-1.5 text-brand font-medium">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Strict tiering: only verified profiles are eligible; web leads require human onboarding.</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-foreground-muted">
                  Scraped web records treated as active recipients without availability checks.
                </td>
              </tr>

              <tr>
                <td className="px-5 py-3 font-semibold text-foreground">Impact Reporting</td>
                <td className="px-5 py-3 text-foreground">
                  <div className="flex items-center gap-1.5 text-brand font-medium">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Factual counts from confirmed handoff events only; zero estimated formulas.</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-foreground-muted">
                  Fabricated CO2 counters, synthetic meal multipliers, and unverified estimates.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Canonical Walkthrough: The 40-Packet Bread Scenario */}
      <div className="bg-surface rounded-xl border border-brand/40 shadow-xs overflow-hidden">
        <div className="p-6 bg-brand-subtle/25 border-b border-brand/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-brand text-brand-on">
                Reference Scenario
              </span>
              <span className="text-xs font-bold text-foreground">PRD Section 8.6 Walkthrough</span>
            </div>
            <h2 className="text-lg font-bold text-foreground font-display">
              The 40-Packet Bread Demonstration
            </h2>
            <p className="text-xs text-foreground-muted max-w-2xl">
              Inspect how the dispatch engine evaluates a commercial surplus donation of 40 packaged bread units listed with a 4-hour collection deadline.
            </p>
          </div>

          <Link
            href="/donor/donations/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-brand text-brand-on hover:bg-brand-hover shrink-0 transition-colors"
          >
            <span>Simulate in Donor Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Candidate 1 */}
          <div className="p-3.5 rounded-lg bg-surface border border-brand/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">Shelter B</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-subtle text-brand border border-brand/20">
                Rank 1: Eligible
              </span>
            </div>
            <p className="text-[11px] text-foreground-muted">
              Capacity: 50 items. Open 10:00 to 12:00. Distance: 2.5 km. Passes all 6 hard constraints.
            </p>
            <div className="text-[11px] font-semibold text-brand flex items-center gap-1 pt-1 border-t border-border">
              <CheckCircle2 className="w-3 h-3" />
              <span>Recommended Match</span>
            </div>
          </div>

          {/* Candidate 2 */}
          <div className="p-3.5 rounded-lg bg-surface border border-warning/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">Community Pantry</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-warning-subtle text-warning border border-warning/20">
                Needs Review
              </span>
            </div>
            <p className="text-[11px] text-foreground-muted">
              Discovered public lead. Operating hours unverified. Requires donor acknowledgement of unknowns.
            </p>
            <div className="text-[11px] font-semibold text-warning flex items-center gap-1 pt-1 border-t border-border">
              <HelpCircle className="w-3 h-3" />
              <span>Unconfirmed Hours</span>
            </div>
          </div>

          {/* Candidate 3 */}
          <div className="p-3.5 rounded-lg bg-surface-muted/40 border border-border space-y-1.5 opacity-85">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">Kitchen A</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-danger-subtle text-danger border border-danger/20">
                Excluded
              </span>
            </div>
            <p className="text-[11px] text-foreground-muted">
              C2 Capacity constraint failed: accepts maximum 25 items. Insufficient storage for 40 units.
            </p>
            <div className="text-[11px] font-semibold text-danger flex items-center gap-1 pt-1 border-t border-border">
              <X className="w-3 h-3" />
              <span>Insufficient Capacity</span>
            </div>
          </div>

          {/* Candidate 4 */}
          <div className="p-3.5 rounded-lg bg-surface-muted/40 border border-border space-y-1.5 opacity-85">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">NGO C</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-danger-subtle text-danger border border-danger/20">
                Excluded
              </span>
            </div>
            <p className="text-[11px] text-foreground-muted">
              C3 Schedule constraint failed: collection team begins at 16:00, after 14:00 deadline.
            </p>
            <div className="text-[11px] font-semibold text-danger flex items-center gap-1 pt-1 border-t border-border">
              <X className="w-3 h-3" />
              <span>Zero Window Overlap</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Navigation Tiles */}
      <div className="space-y-4">
        <div className="border-b border-border pb-2">
          <span className="text-[11px] font-bold text-foreground-muted uppercase tracking-wider font-mono">
            Platform Workspaces
          </span>
          <h2 className="text-xl font-bold text-foreground font-display">
            Role-Based Operational Consoles
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          <Link
            href="/donor"
            className="group bg-surface p-5 rounded-xl border border-border hover:border-brand transition-all block space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-brand-subtle flex items-center justify-center text-brand font-bold text-xs">
                DN
              </div>
              <ArrowUpRight className="w-4 h-4 text-foreground-muted group-hover:text-brand transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-foreground group-hover:text-brand transition-colors">
              Donor Dispatch Portal
            </h3>
            <p className="text-xs text-foreground-muted leading-relaxed">
              List surplus inventory, specify cold-chain requirements, view ranked eligible charities, and issue sequential offers.
            </p>
          </Link>

          <Link
            href="/recipient"
            className="group bg-surface p-5 rounded-xl border border-border hover:border-brand transition-all block space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-info-subtle flex items-center justify-center text-info font-bold text-xs">
                RC
              </div>
              <ArrowUpRight className="w-4 h-4 text-foreground-muted group-hover:text-info transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-foreground group-hover:text-info transition-colors">
              Recipient Operations Inbox
            </h3>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Review time-bounded offers with respond-by countdowns, confirm collection capability, and record handoffs.
            </p>
          </Link>

          <Link
            href="/coordinator"
            className="group bg-surface p-5 rounded-xl border border-border hover:border-brand transition-all block space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-accent-subtle flex items-center justify-center text-accent font-bold text-xs">
                CD
              </div>
              <ArrowUpRight className="w-4 h-4 text-foreground-muted group-hover:text-accent transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
              Coordinator Command Center
            </h3>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Triage at-risk donations expiring within 60 minutes, evaluate safety review queues, and supervise web discovery leads.
            </p>
          </Link>
        </div>
      </div>

      {/* Honest Impact Commitment Banner */}
      <div className="p-6 rounded-xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-brand text-xs font-bold font-mono">
            <Scale className="w-4 h-4" />
            <span>Honest Reporting Standard</span>
          </div>
          <h3 className="text-sm font-bold text-foreground">
            Zero Fictional Metrics or Estimated Meal Multipliers
          </h3>
          <p className="text-xs text-foreground-muted max-w-xl">
            Feed One computes metrics exclusively from confirmed physical handoff events. We never publish estimated carbon offsets or synthetic impact ratios.
          </p>
        </div>

        <Link
          href="/impact"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-surface border border-border-strong text-foreground hover:bg-surface-muted shrink-0 transition-colors"
        >
          <span>Open Verified Impact Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
