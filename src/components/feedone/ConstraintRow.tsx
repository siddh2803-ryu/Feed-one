import React from "react";
import { Check, X, HelpCircle, Globe, Shield, User, Database } from "lucide-react";
import { ConstraintOutcome, ProvenanceLevel } from "@/domain/matching/types";

interface ConstraintRowProps {
  outcome: ConstraintOutcome;
  label: string;
  summary: string;
}

export function ConstraintRow({ outcome, label, summary }: ConstraintRowProps) {
  const getIcon = () => {
    switch (outcome.result) {
      case "pass":
        return <Check className="w-4 h-4 text-success shrink-0" />;
      case "fail":
        return <X className="w-4 h-4 text-danger shrink-0" />;
      case "unknown":
        return <HelpCircle className="w-4 h-4 text-warning shrink-0" />;
    }
  };

  const getResultBadge = () => {
    switch (outcome.result) {
      case "pass":
        return (
          <span className="text-[11px] font-medium text-success bg-success-subtle px-1.5 py-0.5 rounded">
            Pass
          </span>
        );
      case "fail":
        return (
          <span className="text-[11px] font-medium text-danger bg-danger-subtle px-1.5 py-0.5 rounded">
            Fail
          </span>
        );
      case "unknown":
        return (
          <span className="text-[11px] font-medium text-warning bg-warning-subtle px-1.5 py-0.5 rounded">
            Needs confirmation
          </span>
        );
    }
  };

  const getProvenanceBadge = (prov?: ProvenanceLevel) => {
    if (!prov) return null;
    switch (prov) {
      case "recipient_confirmed":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-foreground-muted bg-surface-muted px-1.5 py-0.5 rounded border border-border">
            <User className="w-3 h-3 text-brand" />
            <span>Organisation confirmed</span>
          </span>
        );
      case "coordinator_verified":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-foreground-muted bg-surface-muted px-1.5 py-0.5 rounded border border-border">
            <Shield className="w-3 h-3 text-info" />
            <span>Coordinator verified</span>
          </span>
        );
      case "public_source":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-accent bg-accent-subtle px-1.5 py-0.5 rounded border border-accent">
            <Globe className="w-3 h-3" />
            <span>From website (unconfirmed)</span>
          </span>
        );
      case "seeded_demo":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-demo bg-demo-subtle px-1.5 py-0.5 rounded border border-demo">
            <Database className="w-3 h-3" />
            <span>Demo data</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-xs font-semibold text-foreground">
            {outcome.id}: {label}
          </span>
          {getResultBadge()}
          {outcome.provenance?.[0] && getProvenanceBadge(outcome.provenance[0])}
        </div>
        <p className="text-xs text-foreground-muted leading-relaxed">{summary}</p>
      </div>
    </div>
  );
}
