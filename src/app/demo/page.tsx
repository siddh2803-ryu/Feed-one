"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, RotateCcw, ArrowRight } from "lucide-react";
import { DEMO_PERSONAS } from "@/lib/personas";

export default function DemoPickerPage() {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);

  const handleSelect = (key: string, targetPath: string) => {
    document.cookie = `feedone_persona=${key}; path=/; max-age=86400`;
    router.push(targetPath);
    router.refresh();
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await fetch("/api/demo/reset", { method: "POST" });
      router.refresh();
    } catch (err) {
      console.error("Reset failed", err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 text-demo font-semibold text-xs mb-2">
          <FlaskConical className="w-4 h-4" />
          <span>Interactive Demo Control Panel</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground font-display">
          Seeded Demo Personas (PRD §5, D11)
        </h1>
        <p className="text-xs text-foreground-muted mt-1">
          Select any persona to switch roles instantly. All records are clearly tagged demo data.
        </p>
      </div>

      <div className="grid gap-4">
        {/* Donor */}
        <div className="bg-surface p-5 rounded-xl border border-border flex items-center justify-between gap-4 hover:border-brand transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand uppercase tracking-wider">
                Donor
              </span>
              <span className="text-sm font-bold text-foreground">
                {DEMO_PERSONAS.donor.name}
              </span>
            </div>
            <p className="text-xs text-foreground-muted mt-1">
              {DEMO_PERSONAS.donor.description}
            </p>
          </div>
          <button
            onClick={() => handleSelect("donor", "/donor")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-brand text-brand-on hover:bg-brand-hover shrink-0 transition-colors"
          >
            <span>Open Donor Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recipient B */}
        <div className="bg-surface p-5 rounded-xl border border-border flex items-center justify-between gap-4 hover:border-brand transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-success uppercase tracking-wider">
                Recipient (Recommended)
              </span>
              <span className="text-sm font-bold text-foreground">
                {DEMO_PERSONAS.recipient_b.name}
              </span>
            </div>
            <p className="text-xs text-foreground-muted mt-1">
              {DEMO_PERSONAS.recipient_b.description}
            </p>
          </div>
          <button
            onClick={() => handleSelect("recipient_b", "/recipient")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-surface border border-border-strong text-foreground hover:bg-surface-muted shrink-0 transition-colors"
          >
            <span>Open Recipient Inbox</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recipient A */}
        <div className="bg-surface p-5 rounded-xl border border-border flex items-center justify-between gap-4 hover:border-brand transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-warning uppercase tracking-wider">
                Recipient (Capacity Limit)
              </span>
              <span className="text-sm font-bold text-foreground">
                {DEMO_PERSONAS.recipient_a.name}
              </span>
            </div>
            <p className="text-xs text-foreground-muted mt-1">
              {DEMO_PERSONAS.recipient_a.description}
            </p>
          </div>
          <button
            onClick={() => handleSelect("recipient_a", "/recipient")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-surface border border-border text-foreground hover:bg-surface-muted shrink-0 transition-colors"
          >
            <span>Open Inbox</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recipient C */}
        <div className="bg-surface p-5 rounded-xl border border-border flex items-center justify-between gap-4 hover:border-brand transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-danger uppercase tracking-wider">
                Recipient (Time Mismatch)
              </span>
              <span className="text-sm font-bold text-foreground">
                {DEMO_PERSONAS.recipient_c.name}
              </span>
            </div>
            <p className="text-xs text-foreground-muted mt-1">
              {DEMO_PERSONAS.recipient_c.description}
            </p>
          </div>
          <button
            onClick={() => handleSelect("recipient_c", "/recipient")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-surface border border-border text-foreground hover:bg-surface-muted shrink-0 transition-colors"
          >
            <span>Open Inbox</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Coordinator */}
        <div className="bg-surface p-5 rounded-xl border border-border flex items-center justify-between gap-4 hover:border-brand transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-info uppercase tracking-wider">
                Coordinator
              </span>
              <span className="text-sm font-bold text-foreground">
                {DEMO_PERSONAS.coordinator.name}
              </span>
            </div>
            <p className="text-xs text-foreground-muted mt-1">
              {DEMO_PERSONAS.coordinator.description}
            </p>
          </div>
          <button
            onClick={() => handleSelect("coordinator", "/coordinator")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-info text-white hover:bg-info/90 shrink-0 transition-colors"
          >
            <span>Open Operations Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Demo Reset Card */}
      <div className="bg-surface-muted p-5 rounded-xl border border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Reset All Demo Data</h3>
          <p className="text-xs text-foreground-muted mt-0.5">
            Restores the initial seed state and recalculates the DEMO_ANCHOR to the current time.
          </p>
        </div>
        <button
          onClick={handleReset}
          disabled={isResetting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border border-border-strong bg-surface text-foreground hover:bg-surface-muted disabled:opacity-50 transition-colors"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
          <span>Reset Seed State</span>
        </button>
      </div>
    </div>
  );
}
