import React from "react";
import { Info } from "lucide-react";

interface MetricTileProps {
  label: string;
  value: string | number;
  unit?: string;
  scopeLabel: string;
  definition: string;
}

export function MetricTile({
  label,
  value,
  unit,
  scopeLabel,
  definition,
}: MetricTileProps) {
  return (
    <div className="bg-surface p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
          {label}
        </span>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-surface-muted text-foreground-muted border border-border">
          {scopeLabel}
        </span>
      </div>

      <div className="my-2">
        <span className="text-3xl font-extrabold text-foreground tabular-nums font-display">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-semibold text-foreground-muted ml-1.5">
            {unit}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-foreground-muted pt-2 border-t border-border/60">
        <Info className="w-3.5 h-3.5 shrink-0 text-brand" />
        <span className="truncate" title={definition}>
          {definition}
        </span>
      </div>
    </div>
  );
}
