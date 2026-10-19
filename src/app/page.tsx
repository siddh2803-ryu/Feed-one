import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Clock, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-subtle text-brand text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Feasibility-First Food Rescue Coordination</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight font-display">
          Turning Surplus Food into <br />
          <span className="text-brand">Timely, Coordinated Relief.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-foreground-muted leading-relaxed">
          Feed One connects surplus food donors with eligible recipients through
          strict hard constraints, transparent explainability, and confirmed handoffs.
          Feasibility strictly precedes scoring.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/donor/donations/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-bold bg-brand text-brand-on hover:bg-brand-hover shadow-sm transition-all"
          >
            <span>List Surplus Food (Demo)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/demo"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold bg-surface border border-border-strong text-foreground hover:bg-surface-muted transition-all"
          >
            <span>Demo Persona Switcher</span>
          </Link>
        </div>
      </div>

      {/* Differentiators Grid */}
      <div className="grid sm:grid-cols-3 gap-6 pt-6">
        <div className="bg-surface p-5 rounded-xl border border-border space-y-2">
          <div className="w-8 h-8 rounded-lg bg-brand-subtle flex items-center justify-center text-brand mb-3">
            <Shield className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Hard Constraints First</h3>
          <p className="text-xs text-foreground-muted leading-relaxed">
            Evaluates categories, capacity, and operational windows before ranking. No score can override an operational failure.
          </p>
        </div>

        <div className="bg-surface p-5 rounded-xl border border-border space-y-2">
          <div className="w-8 h-8 rounded-lg bg-info-subtle flex items-center justify-center text-info mb-3">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Time-Bounded Offers</h3>
          <p className="text-xs text-foreground-muted leading-relaxed">
            Offers are dispatched sequentially with explicit response deadlines. Prevents multiple reservations or food spoilage.
          </p>
        </div>

        <div className="bg-surface p-5 rounded-xl border border-border space-y-2">
          <div className="w-8 h-8 rounded-lg bg-success-subtle flex items-center justify-center text-success mb-3">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Verified Provenance</h3>
          <p className="text-xs text-foreground-muted leading-relaxed">
            Distinguishes confirmed organisation availability from unverified web scrapes. Transparently exposes unknowns.
          </p>
        </div>
      </div>

      {/* 40-Packet Bread Scenario Card */}
      <div className="bg-brand-subtle/30 rounded-2xl border border-brand/30 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand">
            Interactive Walkthrough
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-foreground font-display">
            The 40-Packet Bread Demonstration
          </h2>
          <p className="text-xs text-foreground-muted max-w-xl">
            Experience how Feed One coordinates 40 packets of bread: recommending Shelter B, noting unverified Community Pantry Lead under Needs Confirmation, excluding Kitchen A on capacity, and excluding NGO C on operating window overlap.
          </p>
        </div>

        <Link
          href="/donor/donations/new"
          className="px-4 py-2.5 rounded-lg text-xs font-bold bg-brand text-brand-on hover:bg-brand-hover shrink-0 transition-colors"
        >
          Run Bread Demo
        </Link>
      </div>
    </div>
  );
}
