import React from "react";
import { Clock } from "lucide-react";

export function UrgencyBadge({ minutesRemaining }: { minutesRemaining: number }) {
  const isUrgent = minutesRemaining <= 5;
  const isWarning = minutesRemaining <= 15 && !isUrgent;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${
      isUrgent
        ? "bg-red-50 text-red-700 border border-red-200 animate-pulse"
        : isWarning
        ? "bg-amber-50 text-amber-700 border border-amber-200"
        : "bg-surface text-foreground-muted border border-border"
    }`}>
      <Clock className="w-3 h-3" />
      <span>{minutesRemaining}m to respond</span>
    </div>
  );
}
