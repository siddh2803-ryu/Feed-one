import React from "react";
import { ShieldCheck, AlertCircle } from "lucide-react";

export function SafetyReviewModal({
  ruleId,
  reason,
  onApprove,
  onReject
}: {
  ruleId: string;
  reason: string;
  onApprove: (notes: string) => void;
  onReject: () => void;
}) {
  return (
    <div className="p-4 rounded-lg bg-surface border border-border space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <ShieldCheck className="w-4 h-4 text-brand" />
        <span>Coordinator Safety Review - {ruleId}</span>
      </div>
      <p className="text-xs text-foreground-muted">{reason}</p>
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => onApprove("Inspected and cleared under standard protocol.")}
          className="px-3 py-1.5 rounded text-xs font-semibold bg-brand text-brand-on hover:bg-brand-hover"
        >
          Approve (Eligible by Review)
        </button>
        <button
          onClick={onReject}
          className="px-3 py-1.5 rounded text-xs font-semibold bg-surface-muted text-foreground-muted hover:bg-border"
        >
          Reject Listing
        </button>
      </div>
    </div>
  );
}
