import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, Sliders } from "lucide-react";

export default function CoordinatorSettingsPage() {
  const safetyRules = [
    {
      id: "S1",
      condition: "use_by <= now",
      outcome: "blocked",
      reason: "Use-by time has passed.",
    },
    {
      id: "S2",
      condition: "use_by < pickup_deadline",
      outcome: "blocked",
      reason: "Use-by time is before pickup deadline.",
    },
    {
      id: "S3",
      condition: "category == 'other'",
      outcome: "needs_review",
      reason: "Category 'Other' needs coordinator review.",
    },
    {
      id: "S4",
      condition: "storage_category in ('chilled', 'frozen', 'hot_held')",
      outcome: "needs_review",
      reason: "Temperature-controlled items require handling review.",
    },
    {
      id: "S5",
      condition: "packaged_sealed == false",
      outcome: "needs_review",
      reason: "Unpackaged items need coordinator review.",
    },
    {
      id: "S6",
      condition: "use_by is null",
      outcome: "needs_review",
      reason: "No use-by time provided.",
    },
    {
      id: "S7",
      condition: "category in ('bakery', 'packaged_dry', 'produce', 'beverages') AND ambient AND packaged",
      outcome: "eligible_by_rules",
      reason: "Matches configured rule for ambient packaged items.",
    },
    {
      id: "S8",
      condition: "Fallback (cooked meals, dairy, eggs)",
      outcome: "needs_review",
      reason: "Needs coordinator review.",
    },
  ];

  const operationalThresholds = [
    { key: "MIN_PICKUP_SLOT_MINUTES", value: "30 min", description: "Minimum duration for feasible collection window (D29)" },
    { key: "OFFER_RESPONSE_MINUTES", value: "15 min", description: "Default offer response window (D8)" },
    { key: "OFFER_DEADLINE_BUFFER_MINUTES", value: "30 min", description: "Buffer before deadline when dispatching offers (D8)" },
    { key: "MIN_RESPONSE_MINUTES", value: "5 min", description: "Minimum response window to allow offer creation (D31)" },
    { key: "EXPIRY_GRACE_MINUTES", value: "15 min", description: "Grace period before pickup deadline triggers expiry (D19)" },
    { key: "CORRECTION_WINDOW_HOURS", value: "24 hours", description: "Coordinator grace window for late pickup logging (D19)" },
    { key: "DISCOVERY_MAX_SEARCHES_PER_DAY", value: "50", description: "Internal safety daily cap for TinyFish Search API" },
    { key: "DISCOVERY_MAX_FETCH_URLS_PER_DAY", value: "100", description: "Internal safety daily cap for TinyFish Fetch API" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/coordinator"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Command Center</span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">
          Active Configuration & Safety Rules (PRD §7.4, D17)
        </h1>
        <p className="text-xs text-foreground-muted mt-1">
          Review the deterministic rules governing food safety screening, operational thresholds, and rate caps.
        </p>
      </div>

      {/* Safety Rules Disclaimer Notice */}
      <div className="p-4 rounded-xl bg-warning-subtle text-warning border border-warning/30 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <strong className="font-bold block">Important Food Safety Notice:</strong>
          <p className="text-foreground leading-relaxed">
            Food safety screening operates strictly under conservative routing rules pending review by a qualified food-safety professional. The system never asserts or guarantees that food is safe to eat. Physical quality verification occurs directly at handoff.
          </p>
        </div>
      </div>

      {/* Table S1 to S8 */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-border bg-surface-muted/50 flex items-center justify-between">
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Deterministic Routing Table (S1 to S8)
          </h2>
          <span className="text-[11px] text-foreground-muted">Top-to-bottom evaluation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted border-b border-border text-foreground-muted font-semibold">
              <tr>
                <th className="px-4 py-3">Rule ID</th>
                <th className="px-4 py-3">Condition Evaluated</th>
                <th className="px-4 py-3">Outcome Status</th>
                <th className="px-4 py-3">System Reason Text</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {safetyRules.map((r) => (
                <tr key={r.id} className="hover:bg-surface-muted/30">
                  <td className="px-4 py-3 font-bold text-foreground font-mono">{r.id}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-foreground">{r.condition}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        r.outcome === "eligible_by_rules"
                          ? "bg-success-subtle text-success"
                          : r.outcome === "blocked"
                          ? "bg-danger-subtle text-danger"
                          : "bg-warning-subtle text-warning"
                      }`}
                    >
                      {r.outcome.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground-muted italic">&ldquo;{r.reason}&rdquo;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operational Thresholds Table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-border bg-surface-muted/50 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand" />
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Configured Operational Thresholds (Appendix C)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted border-b border-border text-foreground-muted font-semibold">
              <tr>
                <th className="px-4 py-3">Key Parameter</th>
                <th className="px-4 py-3">Configured Value</th>
                <th className="px-4 py-3">Operational Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {operationalThresholds.map((t) => (
                <tr key={t.key} className="hover:bg-surface-muted/30">
                  <td className="px-4 py-3 font-mono text-foreground font-semibold">{t.key}</td>
                  <td className="px-4 py-3 font-bold text-brand">{t.value}</td>
                  <td className="px-4 py-3 text-foreground-muted">{t.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
