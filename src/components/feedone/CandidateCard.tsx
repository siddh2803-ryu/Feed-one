"use client";

import React, { useState } from "react";
import { Sparkles, MapPin, Clock, Package, HelpCircle, Send } from "lucide-react";
import { CandidateEvaluation, DonationSnapshot } from "@/domain/matching/types";
import { ExplanationSheet } from "./ExplanationSheet";

interface CandidateCardProps {
  candidate: CandidateEvaluation;
  donation: DonationSnapshot;
  onSendOffer?: (candidateId: string) => void;
  isSendingOffer?: boolean;
}

export function CandidateCard({
  candidate,
  donation,
  onSendOffer,
  isSendingOffer = false,
}: CandidateCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  const isRecommended =
    candidate.group === "eligible" && candidate.rank === 1;

  const cardBorder = isRecommended
    ? "border-brand shadow-sm bg-brand-subtle/10"
    : candidate.group === "needs_confirmation"
    ? "border-warning/40 bg-surface"
    : "border-border bg-surface-muted/30 opacity-80";

  return (
    <>
      <div
        className={`p-4 rounded-xl border transition-all hover:shadow-md ${cardBorder}`}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-foreground">
                {candidate.recipientName}
              </h4>
              {isRecommended && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand bg-brand-subtle px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  Recommended
                </span>
              )}
              {candidate.group === "needs_confirmation" && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-warning bg-warning-subtle px-2 py-0.5 rounded-full">
                  <HelpCircle className="w-3 h-3" />
                  Needs confirmation
                </span>
              )}
              {candidate.group === "excluded" && (
                <span className="text-[11px] font-medium text-danger bg-danger-subtle px-2 py-0.5 rounded-full">
                  Not suitable
                </span>
              )}
            </div>
            {candidate.isLead && (
              <span className="text-[11px] text-accent block mt-0.5">
                Public website record (unverified lead)
              </span>
            )}
          </div>

          <button
            onClick={() => setShowExplanation(true)}
            className="text-xs font-semibold text-brand hover:underline px-2 py-1 rounded hover:bg-surface-muted transition-colors shrink-0"
          >
            Why?
          </button>
        </div>

        {/* Operational Attributes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-3 text-xs text-foreground-muted">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
            <span>
              {candidate.distanceKm !== null
                ? `approx. ${candidate.distanceKm} km`
                : "Distance unknown"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand shrink-0" />
            <span>
              {candidate.earliestFeasiblePickup
                ? `Earliest: ${new Date(
                    candidate.earliestFeasiblePickup
                  ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "No matching slot"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
            <Package className="w-3.5 h-3.5 text-brand shrink-0" />
            <span>
              {candidate.leftoverCapacity !== null
                ? `Fits donation (+${candidate.leftoverCapacity})`
                : "Capacity unknown"}
            </span>
          </div>
        </div>

        {/* Short explanation line */}
        <p className="text-xs text-foreground-muted line-clamp-2 mb-3">
          {candidate.explanation}
        </p>

        {/* Actions */}
        {candidate.group === "eligible" && onSendOffer && (
          <div className="pt-2 border-t border-border flex justify-end">
            <button
              onClick={() => onSendOffer(candidate.recipientId)}
              disabled={isSendingOffer}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-brand text-brand-on hover:bg-brand-hover transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Offer</span>
            </button>
          </div>
        )}
      </div>

      <ExplanationSheet
        candidate={candidate}
        donation={donation}
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
      />
    </>
  );
}
