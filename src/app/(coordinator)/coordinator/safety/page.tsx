"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, Check, X, AlertCircle } from "lucide-react";
import { StoredDonation } from "@/server/db/store";
import { DeadlineCountdown } from "@/components/feedone/DeadlineCountdown";

export default function SafetyTriagePage() {
  const [queue, setQueue] = useState<StoredDonation[]>([]);
  const [selectedDonation, setSelectedDonation] = useState<StoredDonation | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadQueue = () => {
    fetch("/api/safety/queue")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setQueue(data.data);
          if (data.data.length > 0 && !selectedDonation) {
            setSelectedDonation(data.data[0]);
          }
        }
      });
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleDecision = async (decision: "eligible_by_review" | "blocked") => {
    if (!selectedDonation) return;
    if (!reviewNote.trim()) {
      setErrorMsg("A justification note is required for all safety triage decisions.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/donations/${selectedDonation.id}/safety-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, note: reviewNote }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to submit review.");
      }

      setReviewNote("");
      setSelectedDonation(null);
      loadQueue();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process decision.");
    } finally {
      setIsProcessing(false);
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">
            Food Safety Review Queue (FR-SAF-03)
          </h1>
          <p className="text-xs text-foreground-muted mt-1">
            Conservative rules route non-standard or temperature-controlled items here. Coordinators make recorded review decisions.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-danger-subtle text-danger text-xs flex items-center gap-2 border border-danger/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {queue.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center text-xs text-foreground-muted">
          All listings cleared! No pending safety reviews in queue.
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* List of items needing review (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Pending Reviews ({queue.length})
            </h2>
            <div className="space-y-2">
              {queue.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDonation(d)}
                  className={`w-full text-left p-4 rounded-xl border transition-all text-xs space-y-1.5 ${
                    selectedDonation?.id === d.id
                      ? "border-warning bg-warning-subtle/20 shadow-xs"
                      : "border-border bg-surface hover:bg-surface-muted"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      {d.quantity} {d.unitLabel ?? d.unit} of {d.title}
                    </span>
                    <span className="text-[11px] font-semibold text-warning bg-warning-subtle px-1.5 py-0.5 rounded">
                      {d.safetyRuleId}
                    </span>
                  </div>
                  <p className="text-foreground-muted truncate">{d.safetyReason}</p>
                  <DeadlineCountdown deadlineIso={d.pickupDeadline} />
                </button>
              ))}
            </div>
          </div>

          {/* Review Details Pane (7 cols) */}
          {selectedDonation && (
            <div className="lg:col-span-7 bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-5">
              <div className="border-b border-border pb-4">
                <span className="text-[11px] font-semibold text-warning uppercase tracking-wider block">
                  Triage Review Form
                </span>
                <h2 className="text-lg font-bold text-foreground mt-0.5">
                  {selectedDonation.quantity} {selectedDonation.unitLabel ?? selectedDonation.unit} of {selectedDonation.title}
                </h2>
                <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
                  {selectedDonation.description}
                </p>
              </div>

              {/* Attested Handling Specifications */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-surface-muted p-3.5 rounded-xl border border-border">
                <div>
                  <span className="text-foreground-muted block text-[11px]">Storage Category:</span>
                  <span className="font-semibold text-foreground capitalize">
                    {selectedDonation.storageCategory} ({selectedDonation.packagedSealed ? "Packaged" : "Unpackaged"})
                  </span>
                </div>
                <div>
                  <span className="text-foreground-muted block text-[11px]">Use-By Time:</span>
                  <span className="font-semibold text-foreground">
                    {selectedDonation.useBy ? new Date(selectedDonation.useBy).toLocaleString() : "None provided"}
                  </span>
                </div>
                <div>
                  <span className="text-foreground-muted block text-[11px]">Prepared Time:</span>
                  <span className="font-semibold text-foreground">
                    {new Date(selectedDonation.preparedAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-foreground-muted block text-[11px]">Allergens:</span>
                  <span className="font-semibold text-foreground">
                    {selectedDonation.allergenNotes || "None"}
                  </span>
                </div>
              </div>

              {/* Triggered Rule Alert */}
              <div className="p-3.5 rounded-xl bg-warning-subtle text-warning text-xs space-y-1 border border-warning/30">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Rule Triggered: {selectedDonation.safetyRuleId}</span>
                </div>
                <p className="text-foreground text-[11px]">
                  {selectedDonation.safetyReason}
                </p>
              </div>

              {/* Justification Note Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">
                  Coordinator Review Note (Mandatory, Recorded in Audit Trail)
                </label>
                <textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="e.g. Verified cold chain handling documentation with bakery manager; approved for matching."
                  className="w-full text-xs px-3 py-2 rounded-md border border-border-strong bg-surface text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
                />
              </div>

              {/* Decision Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleDecision("eligible_by_review")}
                  disabled={isProcessing}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-brand text-brand-on hover:bg-brand-hover transition-colors shadow-xs disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve for Matching</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDecision("blocked")}
                  disabled={isProcessing}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-danger text-white hover:bg-danger/90 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  <span>Block Listing</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
