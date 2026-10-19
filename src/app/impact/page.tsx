"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, AlertCircle } from "lucide-react";
import { MetricSummary } from "@/domain/metrics/calculator";
import { MetricTile } from "@/components/feedone/MetricTile";

export default function ImpactDashboardPage() {
  const [scope, setScope] = useState<"demo" | "real" | "all">("demo");
  const [metrics, setMetrics] = useState<MetricSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/metrics?scope=${scope}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setMetrics(data.data);
      })
      .finally(() => setIsLoading(false));
  }, [scope]);

  return (
    <div className="space-y-8">
      {/* Header & Scope Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-brand" />
            <span>Honest Impact & Reliability Dashboard</span>
          </h1>
          <p className="text-xs text-foreground-muted mt-1">
            Aggregated purely from recorded handoff events. Factual quantities are never converted or combined with hypothetical environmental estimates.
          </p>
        </div>

        {/* Scope Filter (FR-IMP-02) */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-surface border border-border">
          {(["demo", "real", "all"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                scope === s
                  ? "bg-brand text-brand-on shadow-xs"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              {s === "demo" ? "Demo Data" : s === "real" ? "Real Data" : "All Data"}
            </button>
          ))}
        </div>
      </div>

      {isLoading || !metrics ? (
        <div className="text-center py-12 text-xs text-foreground-muted">
          Aggregating verified metrics...
        </div>
      ) : (
        <>
          {/* Primary Metric Tiles */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricTile
              label="Donations Listed"
              value={metrics.donationsListed}
              scopeLabel={scope}
              definition="Total listings created. Does not imply food was rescued."
            />

            <MetricTile
              label="Delivered Rescues"
              value={metrics.donationsDelivered}
              scopeLabel={scope}
              definition="Primary success metric: confirmed delivered to recipient."
            />

            <MetricTile
              label="Redistributed Items"
              value={metrics.foodRedistributedItems}
              unit="items"
              scopeLabel={scope}
              definition="Verified packets, trays, or discrete items delivered."
            />

            <MetricTile
              label="Redistributed Weight"
              value={metrics.foodRedistributedKg}
              unit="kg"
              scopeLabel={scope}
              definition="Verified bulk weight delivered (never mixed with item counts)."
            />
          </div>

          {/* Secondary Operational Reliability Metrics */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Coordination Speed */}
            <div className="bg-surface p-5 rounded-xl border border-border space-y-3">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Coordination Latency (Time to Confirmed Match)
              </h2>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-xs text-foreground-muted block mb-1">Mean Confirmation Time</span>
                  <span className="text-2xl font-bold text-brand tabular-nums font-display">
                    {metrics.meanTimeToConfirmedMatchMinutes !== null
                      ? `${metrics.meanTimeToConfirmedMatchMinutes} min`
                      : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-foreground-muted block mb-1">Median Confirmation Time</span>
                  <span className="text-2xl font-bold text-brand tabular-nums font-display">
                    {metrics.medianTimeToConfirmedMatchMinutes !== null
                      ? `${metrics.medianTimeToConfirmedMatchMinutes} min`
                      : "N/A"}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-foreground-muted pt-2 border-t border-border">
                Measured from listing submission until mutual confirmation by donor and recipient.
              </p>
            </div>

            {/* Unsuccessful Outcomes Transparency */}
            <div className="bg-surface p-5 rounded-xl border border-border space-y-3">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-danger" />
                <span>Unsuccessful Outcomes Breakdown</span>
              </h2>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-border">
                  <span className="text-foreground-muted">Expired (Never confirmed by any recipient):</span>
                  <strong className="text-foreground tabular-nums">
                    {metrics.unsuccessfulOutcomes.pickupExpiredNeverConfirmed}
                  </strong>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-border">
                  <span className="text-foreground-muted">Expired (Confirmed but missed collection):</span>
                  <strong className="text-foreground tabular-nums">
                    {metrics.unsuccessfulOutcomes.pickupExpiredConfirmedNotCollected}
                  </strong>
                </div>

                <div className="py-1">
                  <span className="text-foreground-muted block mb-1">Cancellations by Reason:</span>
                  {Object.keys(metrics.unsuccessfulOutcomes.cancelledByReason).length === 0 ? (
                    <span className="text-foreground-muted italic text-[11px]">No cancellations recorded.</span>
                  ) : (
                    <div className="space-y-1">
                      {Object.entries(metrics.unsuccessfulOutcomes.cancelledByReason).map(([reason, count]) => (
                        <div key={reason} className="flex justify-between text-[11px]">
                          <span className="capitalize">{reason}</span>
                          <strong className="tabular-nums">{count}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
