"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  HelpCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { StoredDonation, StoredLifecycleEvent, StoredOffer } from "@/server/db/store";
import { MatchResult } from "@/domain/matching/types";
import { StatusBadge } from "@/components/feedone/StatusBadge";
import { DeadlineCountdown } from "@/components/feedone/DeadlineCountdown";
import { CandidateCard } from "@/components/feedone/CandidateCard";
import { StatusTimeline } from "@/components/feedone/StatusTimeline";
import { PickupCard } from "@/components/feedone/PickupCard";

export default function DonationDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [donation, setDonation] = useState<StoredDonation | null>(null);
  const [matchRun, setMatchRun] = useState<MatchResult | null>(null);
  const [pendingOffer, setPendingOffer] = useState<StoredOffer | null>(null);
  const [events, setEvents] = useState<StoredLifecycleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingOffer, setIsSendingOffer] = useState(false);
  const [isRematching, setIsRematching] = useState(false);
  const [showExcluded, setShowExcluded] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadData = () => {
    fetch(`/api/donations/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setDonation(data.data.donation);
          setMatchRun(data.data.matchRun);
          setPendingOffer(data.data.pendingOffer);
          setEvents(data.data.events);
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // 5s polling for demo
    return () => clearInterval(interval);
  }, [id]);

  const handleSendOffer = async (recipientId: string) => {
    if (!confirm("Send offer to this organisation? They will receive a response deadline.")) return;
    setIsSendingOffer(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/donations/${id}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to send offer.");
      }
      loadData();
    } catch (err: any) {
      setActionError(err.message || "Failed to dispatch offer.");
    } finally {
      setIsSendingOffer(false);
    }
  };

  const handleRematch = async () => {
    setIsRematching(true);
    try {
      await fetch(`/api/donations/${id}/rematch`, { method: "POST" });
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRematching(false);
    }
  };

  const handleRecordCollected = async () => {
    try {
      await fetch(`/api/donations/${id}/collected`, { method: "POST" });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !donation) {
    return <div className="text-center py-12 text-xs text-foreground-muted">Loading donation...</div>;
  }

  const eligibleCandidates =
    matchRun?.candidates.filter((c) => c.group === "eligible") || [];
  const needsConfirmationCandidates =
    matchRun?.candidates.filter((c) => c.group === "needs_confirmation") || [];
  const excludedCandidates =
    matchRun?.candidates.filter((c) => c.group === "excluded") || [];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/donor"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground font-display">
              {donation.quantity} {donation.unitLabel ?? donation.unit} of {donation.title}
            </h1>
            <StatusBadge status={donation.status} />
          </div>

          <div className="flex items-center gap-3 text-xs text-foreground-muted flex-wrap">
            <span>Category: <strong className="capitalize text-foreground">{donation.category}</strong></span>
            <span>•</span>
            <span>Storage: <strong className="capitalize text-foreground">{donation.storageCategory}</strong></span>
            <span>•</span>
            <DeadlineCountdown deadlineIso={donation.pickupDeadline} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRematch}
            disabled={isRematching}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-surface hover:bg-surface-muted transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRematching ? "animate-spin" : ""}`} />
            <span>Re-check Candidates</span>
          </button>
        </div>
      </div>

      {actionError && (
        <div className="p-3.5 rounded-lg bg-danger-subtle text-danger text-xs flex items-center gap-2 border border-danger/20">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Grid: Left Candidates / Right Lifecycle Handover */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Candidates & Match Results */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Handover Pickup Card if Confirmed */}
          {(donation.status === "confirmed" ||
            donation.status === "collected" ||
            donation.status === "delivered") && (
            <PickupCard
              donation={donation}
              offer={pendingOffer || undefined}
              userRole="donor"
              onRecordCollected={handleRecordCollected}
            />
          )}

          {/* Pending Offer Banner if Awaiting Confirmation */}
          {donation.status === "awaiting_confirmation" && pendingOffer && (
            <div className="p-4 rounded-xl bg-info-subtle border border-info/30 text-xs text-info space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-sm font-bold">Offer Awaiting Recipient Response</strong>
                <DeadlineCountdown deadlineIso={pendingOffer.respondBy} label="Response deadline in" />
              </div>
              <p className="text-foreground-muted">
                An offer was dispatched to the selected recipient. If they decline or do not respond in time, the listing returns to the match pool automatically.
              </p>
            </div>
          )}

          {/* No Match Blocker Banner */}
          {donation.status === "no_match" && (
            <div className="p-4 rounded-xl bg-warning-subtle border border-warning/30 text-xs text-warning space-y-1">
              <strong className="text-sm font-bold">No Suitable Match Right Now</strong>
              <p className="text-foreground">
                No organisations currently meet all 6 operational hard constraints for this listing. See unconfirmed leads below or re-check as recipient windows open.
              </p>
            </div>
          )}

          {/* Group 1: Eligible Candidates */}
          {eligibleCandidates.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-brand uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Eligible Candidates ({eligibleCandidates.length})
                </h3>
              </div>
              <div className="space-y-3">
                {eligibleCandidates.map((c) => (
                  <CandidateCard
                    key={c.recipientId}
                    candidate={c}
                    donation={donation}
                    onSendOffer={donation.status === "match_recommended" ? handleSendOffer : undefined}
                    isSendingOffer={isSendingOffer}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Group 2: Needs Confirmation (Leads & Incomplete Profiles) */}
          {needsConfirmationCandidates.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-warning uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Needs Confirmation ({needsConfirmationCandidates.length})
                </h3>
              </div>
              <div className="space-y-3">
                {needsConfirmationCandidates.map((c) => (
                  <CandidateCard
                    key={c.recipientId}
                    candidate={c}
                    donation={donation}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Group 3: Excluded Candidates (Collapsible) */}
          {excludedCandidates.length > 0 && (
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setShowExcluded(!showExcluded)}
                className="text-xs font-semibold text-foreground-muted hover:text-foreground flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5 text-danger" />
                <span>
                  {showExcluded ? "Hide" : "Show"} Not Suitable Candidates ({excludedCandidates.length})
                </span>
              </button>

              {showExcluded && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  {excludedCandidates.map((c) => (
                    <CandidateCard
                      key={c.recipientId}
                      candidate={c}
                      donation={donation}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Status Timeline & Food Safety */}
        <div className="lg:col-span-5 space-y-6">
          {/* Safety Rule Screening Result */}
          <div className="bg-surface p-5 rounded-xl border border-border shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Food Safety Screening (BR-SAF)
            </h3>
            <div className="flex items-center gap-2">
              <StatusBadge status={donation.safetyStatus} size="sm" />
            </div>
            <p className="text-xs text-foreground-muted">
              {donation.safetyReason}
            </p>
          </div>

          {/* Immutable Lifecycle Event Trail (Ref §12.3) */}
          <div className="bg-surface p-5 rounded-xl border border-border shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Status Timeline (Immutable Audit Trail)
            </h3>
            <StatusTimeline events={events} />
          </div>
        </div>
      </div>
    </div>
  );
}
