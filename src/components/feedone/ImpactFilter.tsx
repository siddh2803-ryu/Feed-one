import React from "react";
import { Calendar, Download } from "lucide-react";

export function ImpactFilter({
  selectedRange,
  onRangeChange
}: {
  selectedRange: string;
  onRangeChange: (range: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-surface border border-border">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-foreground-muted" />
        <span className="text-xs font-medium text-foreground-muted">Time Period:</span>
        <select
          value={selectedRange}
          onChange={(e) => onRangeChange(e.target.value)}
          className="text-xs rounded bg-surface border border-border px-2 py-1 text-foreground"
        >
          <option value="all">All Time</option>
          <option value="30d">Last 30 Days</option>
          <option value="7d">Last 7 Days</option>
        </select>
      </div>
      <button className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium border border-border hover:bg-surface-muted">
        <Download className="w-3.5 h-3.5" />
        <span>Export CSV</span>
      </button>
    </div>
  );
}
