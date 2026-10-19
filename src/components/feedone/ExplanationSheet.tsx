"use client";

import React from "react";
import { X, Sparkles, HelpCircle, AlertOctagon, Info } from "lucide-react";
import { CandidateEvaluation, DonationSnapshot } from "@/domain/matching/types";
import { ConstraintRow } from "./ConstraintRow";
import { generateConstraintSummary } from "@/domain/matching/explanations";

interface ExplanationSheetProps {
  candidate: CandidateEvaluation;
  donation: DonationSnapshot;
  isOpen: boolean;
  onClose: () => void;
}

const CONSTRAINT_LABELS: Record<string, string> = {
  C1: "Food Category Accepted",
  C2: "Capacity Requirement",
  C3: "Pickup Window Feasibility",
  C4: "Collection Capability",
  C5: "Food Safety Screening",
  C6: "Geographic Service Area",
};

export function ExplanationSheet({
  candidate,
  donation,
  isOpen,
  onClose,
}: ExplanationSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg h-full bg-surface border-l border-border shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="explanation-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-muted/50">
          <div>
            <div className="flex items-center gap-2">
              <h2
                id="explanation-title"
                className="text-base font-bold text-foreground font-display"
              >
                Recommendation Explanation
              </h2>
              {candidate.group === "eligible" && candidate.rank === 1 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand bg-brand-subtle px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  Recommended
                </span>
              )}
            </div>
            <p className="text-xs text-foreground-muted mt-0.5">
              Target: <strong className="text-foreground">{candidate.recipientName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-surface-muted text-foreground-muted hover:text-foreground transition-colors"
            aria-label="Close explanation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* 1. Summary Explanation */}
          <div className="p-4 rounded-lg bg-surface-muted border border-border">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-brand" />
              Evaluation Summary
            </h3>
            <p className="text-xs text-foreground leading-relaxed">
              {candidate.explanation}
            </p>
          </div>

          {/* 2. Hard Constraints Checklist (Ref §8.2.1) */}
          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Hard Operational Constraints (C1 – C6)
            </h3>
            <div className="bg-surface rounded-lg border border-border px-3">
              {candidate.constraints.map((c) => (
                <ConstraintRow
                  key={c.id}
                  outcome={c}
                  label={CONSTRAINT_LABELS[c.id] || c.id}
                  summary={generateConstraintSummary(c, donation)}
                />
              ))}
            </div>
          </div>

          {/* 3. Disclosed Unknowns */}
          {candidate.unknowns.length > 0 && (
            <div className="p-4 rounded-lg bg-warning-subtle/50 border border-warning/30">
              <h3 className="text-xs font-semibold text-warning uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                Unconfirmed Details ({candidate.unknowns.length})
              </h3>
              <ul className="space-y-1.5 text-xs text-foreground">
                {candidate.unknowns.map((u, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-warning font-bold">•</span>
                    <span>{u.resolution}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 4. Lead Source Details */}
          {candidate.isLead && (
            <div className="p-4 rounded-lg bg-accent-subtle/40 border border-accent/30 text-xs">
              <h3 className="font-semibold text-accent uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5" />
                Discovered Public Record
              </h3>
              <p className="text-foreground-muted mb-2">
                This organisation was discovered from public website information.
                Feed One has not confirmed their availability.
              </p>
              {candidate.publicContactRoute && (
                <div className="text-foreground">
                  <span className="font-medium">Public Contact:</span>{" "}
                  {candidate.publicContactRoute}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-surface-muted/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-surface border border-border-strong text-xs font-medium text-foreground hover:bg-surface-muted transition-colors"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
}
