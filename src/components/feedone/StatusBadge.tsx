import React from "react";
import {
  FileText,
  Sparkles,
  SearchX,
  Hourglass,
  Handshake,
  PackageCheck,
  CheckCircle2,
  AlertCircle,
  Slash,
  ShieldCheck,
  UserCheck,
  ShieldAlert,
  ShieldX,
  Loader2,
} from "lucide-react";

export type BadgeType =
  | "listed"
  | "matching"
  | "match_recommended"
  | "no_match"
  | "awaiting_confirmation"
  | "confirmed"
  | "collected"
  | "delivered"
  | "pickup_expired"
  | "cancelled"
  | "eligible_by_rules"
  | "eligible_by_review"
  | "needs_review"
  | "blocked";

interface StatusBadgeProps {
  status: BadgeType | string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";
  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  switch (status) {
    case "listed":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-neutral-subtle text-neutral ${padding}`}
        >
          <FileText className={iconSize} />
          <span>Listed</span>
        </span>
      );

    case "matching":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-info-subtle text-info ${padding}`}
        >
          <Loader2 className={`${iconSize} animate-spin`} />
          <span>Checking recipients</span>
        </span>
      );

    case "match_recommended":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-brand-subtle text-brand ${padding}`}
        >
          <Sparkles className={iconSize} />
          <span>Match recommended</span>
        </span>
      );

    case "no_match":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-warning-subtle text-warning ${padding}`}
        >
          <SearchX className={iconSize} />
          <span>No suitable match</span>
        </span>
      );

    case "awaiting_confirmation":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-info-subtle text-info ${padding}`}
        >
          <Hourglass className={iconSize} />
          <span>Awaiting confirmation</span>
        </span>
      );

    case "confirmed":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-brand-subtle text-brand ${padding}`}
        >
          <Handshake className={iconSize} />
          <span>Confirmed</span>
        </span>
      );

    case "collected":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-success-subtle text-success ${padding}`}
        >
          <PackageCheck className={iconSize} />
          <span>Collected</span>
        </span>
      );

    case "delivered":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-success-subtle text-success ${padding}`}
        >
          <CheckCircle2 className={iconSize} />
          <span>Delivered</span>
        </span>
      );

    case "pickup_expired":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-danger-subtle text-danger ${padding}`}
        >
          <AlertCircle className={iconSize} />
          <span>Pickup expired</span>
        </span>
      );

    case "cancelled":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-neutral-subtle text-neutral ${padding}`}
        >
          <Slash className={iconSize} />
          <span>Cancelled</span>
        </span>
      );

    // Safety Badges (Ref §14.1, D10, D17)
    case "eligible_by_rules":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-success-subtle text-success ${padding}`}
        >
          <ShieldCheck className={iconSize} />
          <span>Eligible under configured rules</span>
        </span>
      );

    case "eligible_by_review":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-success-subtle text-success ${padding}`}
        >
          <UserCheck className={iconSize} />
          <span>Approved by coordinator review</span>
        </span>
      );

    case "needs_review":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-warning-subtle text-warning ${padding}`}
        >
          <ShieldAlert className={iconSize} />
          <span>Needs coordinator review</span>
        </span>
      );

    case "blocked":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-danger-subtle text-danger ${padding}`}
        >
          <ShieldX className={iconSize} />
          <span>Blocked by rule</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-surface-muted text-foreground-muted ${padding}`}
        >
          <span>{status}</span>
        </span>
      );
  }
}
