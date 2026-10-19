"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  Globe,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { StoredDonation } from "@/server/db/store";
import { StatusBadge } from "@/components/feedone/StatusBadge";
import { DeadlineCountdown } from "@/components/feedone/DeadlineCountdown";

export default function CoordinatorOperationsPage() {
  const [donations, setDonations] = useState<StoredDonation[]>([]);
  const [safetyQueue, setSafetyQueue] = useState<StoredDonation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/donations").then((r) => r.json()),
      fetch("/api/safety/queue").then((r) => r.json()),
    ])
      .then(([donationsRes, safetyRes]) => {
        if (donationsRes.data) setDonations(donationsRes.data);
        if (safetyRes.data) setSafetyQueue(safetyRes.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Filter At-Risk Donations (FR-COO-01): pickup within 60 minutes and not yet collected
  const nowMs = Date.now();
  const atRiskDonations = donations.filter((d) => {
    if (d.status === "collected" || d.status === "delivered" || d.status === "cancelled") {
      return false;
    }
    const diffMinutes = (new Date(d.pickupDeadline).getTime() - nowMs) / 60000;
    return diffMinutes > 0 && diffMinutes <= 60;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">
            Coordinator Operations Command
          </h1>
          <p className="text-xs text-foreground-muted mt-1">
            Real-time platform triage, urgent at-risk listings, and safety queue management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/coordinator/safety"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-warning text-foreground-contrast hover:bg-warning/90 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Safety Queue ({safetyQueue.length})</span>
          </Link>

          <Link
            href="/coordinator/discovery"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border hover:bg-surface-muted text-foreground transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>TinyFish Discovery</span>
          </Link>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-xl border border-border">
          <span className="text-xs text-foreground-muted block mb-1">Total Active Listings</span>
          <span className="text-2xl font-bold text-foreground font-display">
            {donations.filter((d) => d.status !== "delivered" && d.status !== "cancelled").length}
          </span>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border">
          <span className="text-xs text-foreground-muted block mb-1">Awaiting Safety Triage</span>
          <span className="text-2xl font-bold text-warning font-display">
            {safetyQueue.length}
          </span>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-accent/40 bg-accent-subtle/10">
          <span className="text-xs text-accent font-semibold block mb-1">At-Risk (≤ 60m)</span>
          <span className="text-2xl font-bold text-accent font-display">
            {atRiskDonations.length}
          </span>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border">
          <span className="text-xs text-foreground-muted block mb-1">Delivered Rescues</span>
          <span className="text-2xl font-bold text-success font-display">
            {donations.filter((d) => d.status === "delivered").length}
          </span>
        </div>
      </div>

      {/* Urgent Lane: At-Risk Donations (≤60m to deadline) */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-accent uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-accent" />
          <span>At-Risk Lane: Expiring Soon (≤ 60 min to deadline)</span>
        </h2>

        {atRiskDonations.length === 0 ? (
          <div className="p-4 rounded-xl bg-surface border border-border text-xs text-foreground-muted">
            No listings currently at immediate risk of expiry.
          </div>
        ) : (
          <div className="grid gap-3">
            {atRiskDonations.map((d) => (
              <div
                key={d.id}
                className="bg-surface p-4 rounded-xl border border-accent/50 shadow-xs flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {d.quantity} {d.unitLabel ?? d.unit} of {d.title}
                    </span>
                    <StatusBadge status={d.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-foreground-muted mt-1">
                    <span>Category: {d.category}</span>
                    <span>•</span>
                    <DeadlineCountdown deadlineIso={d.pickupDeadline} />
                  </div>
                </div>

                <Link
                  href={`/donor/donations/${d.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline"
                >
                  <span>Triage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safety Review Needed Section */}
      {safetyQueue.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-warning uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-warning" />
            <span>Food Safety Reviews Pending Triage ({safetyQueue.length})</span>
          </h2>
          <div className="grid gap-3">
            {safetyQueue.map((d) => (
              <div
                key={d.id}
                className="bg-surface p-4 rounded-xl border border-warning/40 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {d.quantity} {d.unitLabel ?? d.unit} of {d.title}
                    </span>
                    <span className="text-xs text-warning font-semibold">
                      Triggered: Rule {d.safetyRuleId}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    {d.safetyReason}
                  </p>
                </div>

                <Link
                  href="/coordinator/safety"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-warning text-foreground-contrast hover:bg-warning/90 shrink-0"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Nav Tools */}
      <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-border">
        <Link
          href="/coordinator/directory"
          className="bg-surface p-4 rounded-xl border border-border hover:border-brand transition-colors block space-y-1"
        >
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-brand" />
            Directory & Provenance
          </span>
          <p className="text-[11px] text-foreground-muted">
            Inspect all recipient records, accepted food categories, and provenances.
          </p>
        </Link>

        <Link
          href="/coordinator/discovery"
          className="bg-surface p-4 rounded-xl border border-border hover:border-brand transition-colors block space-y-1"
        >
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-brand" />
            TinyFish Discovery
          </span>
          <p className="text-[11px] text-foreground-muted">
            Run web search and batch fetch to discover potential recipient organisations.
          </p>
        </Link>

        <Link
          href="/coordinator/settings"
          className="bg-surface p-4 rounded-xl border border-border hover:border-brand transition-colors block space-y-1"
        >
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-brand" />
            Rules & Configuration
          </span>
          <p className="text-[11px] text-foreground-muted">
            Inspect active starter safety rules S1 to S8 and operational thresholds.
          </p>
        </Link>
      </div>
    </div>
  );
}
