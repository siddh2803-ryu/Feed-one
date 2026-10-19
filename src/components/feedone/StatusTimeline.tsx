import React from "react";
import { CircleDot } from "lucide-react";
import { StoredLifecycleEvent } from "@/server/db/store";

interface StatusTimelineProps {
  events: StoredLifecycleEvent[];
}

export function StatusTimeline({ events }: StatusTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-xs text-foreground-muted py-4 text-center">
        No lifecycle events recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
      {events.map((e) => {
        const timeFormatted = new Date(e.occurredAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        const dateFormatted = new Date(e.occurredAt).toLocaleDateString([], {
          month: "short",
          day: "numeric",
        });

        return (
          <div key={e.id} className="relative group">
            <CircleDot className="absolute -left-6 top-0.5 w-4 h-4 text-brand bg-surface rounded-full" />
            <div className="text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-foreground capitalize">
                  {e.eventType.replace(/_/g, " ")}
                </span>
                <span className="text-[11px] text-foreground-muted tabular-nums">
                  {dateFormatted} at {timeFormatted}
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-surface-muted text-foreground-muted uppercase">
                  {e.actorRole}
                </span>
              </div>

              {e.toStatus && (
                <div className="text-[11px] text-foreground-muted mt-0.5">
                  Status: <strong className="text-foreground">{e.toStatus.replace(/_/g, " ")}</strong>
                </div>
              )}

              {e.reason && (
                <div className="text-xs text-foreground-muted italic mt-0.5">
                  &ldquo;{e.reason}&rdquo;
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
