"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ArrowRight, Package } from "lucide-react";
import { StoredDonation } from "@/server/db/store";
import { StatusBadge } from "@/components/feedone/StatusBadge";
import { DeadlineCountdown } from "@/components/feedone/DeadlineCountdown";

export default function DonorDashboardPage() {
  const [donations, setDonations] = useState<StoredDonation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/donations")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setDonations(data.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">
            Donor Dashboard
          </h1>
          <p className="text-xs text-foreground-muted mt-1">
            Manage your surplus food listings and monitor timely pickup commitments.
          </p>
        </div>

        <Link
          href="/donor/donations/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-brand text-brand-on hover:bg-brand-hover shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Surplus Listing</span>
        </Link>
      </div>

      {/* Listing Cards */}
      {isLoading ? (
        <div className="text-center py-12 text-xs text-foreground-muted">
          Loading donations...
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center text-foreground-muted mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground">No active donations</h3>
          <p className="text-xs text-foreground-muted max-w-sm mx-auto">
            List surplus food in about two minutes. The engine evaluates recipients against your constraints instantly.
          </p>
          <Link
            href="/donor/donations/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-brand text-brand-on hover:bg-brand-hover transition-colors"
          >
            <span>Create First Listing</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {donations.map((d) => (
            <Link
              key={d.id}
              href={`/donor/donations/${d.id}`}
              className="bg-surface p-5 rounded-xl border border-border hover:border-brand transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-foreground group-hover:text-brand transition-colors">
                    {d.quantity} {d.unitLabel ?? d.unit} of {d.title}
                  </span>
                  <StatusBadge status={d.status} size="sm" />
                </div>

                <div className="flex items-center gap-3 text-xs text-foreground-muted flex-wrap">
                  <span className="capitalize">{d.category}</span>
                  <span>•</span>
                  <span>
                    Listed: {new Date(d.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span>•</span>
                  <DeadlineCountdown deadlineIso={d.pickupDeadline} />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-brand self-end sm:self-center">
                <span>View Details & Matches</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
