"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, Search, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { StoredDiscoveryRun } from "@/server/db/store";

export default function DiscoveryConsolePage() {
  const [runs, setRuns] = useState<StoredDiscoveryRun[]>([]);
  const [query, setQuery] = useState("food shelter community kitchen surplus donation");
  const [location, setLocation] = useState("Central Market");
  const [activeRun, setActiveRun] = useState<StoredDiscoveryRun | null>(null);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadRuns = () => {
    fetch("/api/discovery/runs")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setRuns(data.data);
          if (data.data.length > 0 && !activeRun) {
            setActiveRun(data.data[0]);
          }
        }
      });
  };

  useEffect(() => {
    loadRuns();
  }, []);

  const handleStartSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/discovery/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, location }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Search failed.");
      }

      setActiveRun(data.data);
      setSelectedUrls(data.data.searchResults.map((r: any) => r.url));
      loadRuns();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initiate discovery.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleFetchSelected = async () => {
    if (!activeRun || selectedUrls.length === 0) return;
    setIsFetching(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/discovery/runs/${activeRun.id}/fetch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: selectedUrls }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Fetch failed.");
      }

      setActiveRun(data.data);
      loadRuns();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to fetch URLs.");
    } finally {
      setIsFetching(false);
    }
  };

  const toggleUrl = (url: string) => {
    if (selectedUrls.includes(url)) {
      setSelectedUrls(selectedUrls.filter((u) => u !== url));
    } else {
      setSelectedUrls([...selectedUrls, url]);
    }
  };

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
          <h1 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Globe className="w-6 h-6 text-brand" />
            <span>TinyFish Public Web Discovery (PRD §11)</span>
          </h1>
          <p className="text-xs text-foreground-muted mt-1">
            Asynchronous background lead enrichment. Search public websites, batch fetch pages, and extract unverified lead organisations.
          </p>
        </div>

        <div className="text-xs text-demo font-semibold bg-demo-subtle px-3 py-1 rounded-md border border-demo">
          Provider: {process.env.DISCOVERY_PROVIDER || "mock"} (Simulated Offline Fixtures)
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-danger-subtle text-danger text-xs flex items-center gap-2 border border-danger/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Query Search Bar */}
      <form onSubmit={handleStartSearch} className="bg-surface p-5 rounded-2xl border border-border shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
          New Discovery Query
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs text-foreground-muted block mb-1">Search Keywords</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-md border border-border-strong bg-surface text-foreground"
              placeholder="e.g. food shelter NGO community kitchen"
            />
          </div>
          <div>
            <label className="text-xs text-foreground-muted block mb-1">Geographic Hint</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-md border border-border-strong bg-surface text-foreground"
              placeholder="e.g. Central Market"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSearching}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-brand text-brand-on hover:bg-brand-hover shadow-xs disabled:opacity-50 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isSearching ? "Searching..." : "Execute Discovery Search"}</span>
          </button>
        </div>
      </form>

      {/* Active Run Results */}
      {activeRun && (
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <span className="text-xs font-bold text-foreground">
                Query Results: &ldquo;{activeRun.query}&rdquo;
              </span>
              <div className="text-[11px] text-foreground-muted mt-0.5">
                Status: <strong className="capitalize text-foreground">{activeRun.status.replace(/_/g, " ")}</strong> • Found {activeRun.searchResults.length} candidate URLs
              </div>
            </div>

            {activeRun.status === "awaiting_selection" && (
              <button
                type="button"
                onClick={handleFetchSelected}
                disabled={isFetching || selectedUrls.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-brand text-brand-on hover:bg-brand-hover shadow-xs disabled:opacity-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>
                  {isFetching
                    ? "Fetching..."
                    : `Batch Fetch Selected (${selectedUrls.length})`}
                </span>
              </button>
            )}

            {activeRun.status === "completed" && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-success bg-success-subtle px-2.5 py-1 rounded-md border border-success/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Fetched {activeRun.counts.fetched} Leads Added to Directory</span>
              </span>
            )}
          </div>

          {/* Search Hits List */}
          <div className="space-y-3">
            {activeRun.searchResults.map((hit) => {
              const isSelected = selectedUrls.includes(hit.url);
              return (
                <div
                  key={hit.url}
                  className={`p-4 rounded-xl border transition-all text-xs space-y-1.5 ${
                    isSelected
                      ? "border-brand bg-brand-subtle/10"
                      : "border-border bg-surface"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-foreground">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleUrl(hit.url)}
                        className="rounded text-brand focus:ring-brand"
                      />
                      <span>{hit.title}</span>
                    </label>
                    <span className="text-[10px] text-foreground-muted bg-surface-muted px-2 py-0.5 rounded">
                      Position #{hit.position}
                    </span>
                  </div>

                  <p className="text-foreground-muted text-[11px] leading-relaxed">
                    {hit.snippet}
                  </p>

                  <div className="text-[11px] text-brand truncate font-mono">
                    {hit.url}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
