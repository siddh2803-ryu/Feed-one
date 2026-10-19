"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Shield, User, Globe, Database } from "lucide-react";
import { RecipientSnapshot } from "@/domain/matching/types";

export default function DirectoryPage() {
  const [recipients, setRecipients] = useState<RecipientSnapshot[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    fetch("/api/recipients")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setRecipients(data.data);
      });
  }, []);

  const filtered = recipients.filter((r) => {
    if (filterType !== "all" && r.recordType !== filterType) return false;
    if (searchQuery.trim()) {
      return r.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

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

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">
            Recipient Directory & Provenance
          </h1>
          <p className="text-xs text-foreground-muted mt-1">
            Audit organisational data quality and trace whether facts originate from verified sources or public web extraction.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search by organisation name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border-strong bg-surface text-foreground"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs text-foreground-muted font-medium">Record Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-surface text-foreground"
          >
            <option value="all">All Types</option>
            <option value="seeded_demo">Demo Verified</option>
            <option value="lead">Discovered Leads</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted border-b border-border text-foreground-muted font-semibold">
              <tr>
                <th className="px-4 py-3">Organisation</th>
                <th className="px-4 py-3">Record Type</th>
                <th className="px-4 py-3">Accepted Categories (C1)</th>
                <th className="px-4 py-3">Capacity (C2)</th>
                <th className="px-4 py-3">Availability (C3)</th>
                <th className="px-4 py-3">Collection (C4)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground">
                    <div>{r.name}</div>
                    <div className="text-[11px] text-foreground-muted capitalize">
                      {(r.orgType || "other").replace(/_/g, " ")}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {r.recordType === "seeded_demo" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-demo bg-demo-subtle px-2 py-0.5 rounded-full">
                        <Database className="w-3 h-3" />
                        Demo Seeded
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent bg-accent-subtle px-2 py-0.5 rounded-full">
                        <Globe className="w-3 h-3" />
                        Public Lead
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-foreground-muted">
                    {r.acceptedCategories ? (
                      <div className="flex flex-wrap gap-1">
                        {r.acceptedCategories.map((c) => (
                          <span
                            key={c}
                            className="px-1.5 py-0.5 rounded bg-surface-muted text-[10px] font-medium text-foreground capitalize"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-warning italic">Unknown</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-foreground-muted">
                    {r.capacityItems !== null
                      ? `${r.capacityItems} items`
                      : r.capacityKg !== null
                      ? `${r.capacityKg} kg`
                      : <span className="text-warning italic">Unknown</span>}
                  </td>

                  <td className="px-4 py-3 text-foreground-muted">
                    {r.collectionWindows.length > 0 ? (
                      <span className="text-success font-medium">
                        {r.collectionWindows.length} confirmed window(s)
                      </span>
                    ) : r.publicOpeningHours ? (
                      <span className="text-accent text-[11px]" title={r.publicOpeningHours}>
                        Website hours only (unverified)
                      </span>
                    ) : (
                      <span className="text-warning italic">No windows</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-foreground-muted">
                    {r.canCollect === true ? (
                      <span className="text-success font-medium">Can collect</span>
                    ) : r.canCollect === false ? (
                      <span className="text-danger font-medium">Cannot collect</span>
                    ) : (
                      <span className="text-warning italic">Unknown</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
