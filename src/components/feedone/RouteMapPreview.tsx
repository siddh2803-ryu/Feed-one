import React from "react";
import { MapPin, Navigation } from "lucide-react";

export function RouteMapPreview({ distanceKm }: { distanceKm: number | null }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded bg-surface border border-border text-xs text-foreground-muted">
      <Navigation className="w-3.5 h-3.5 text-brand" />
      <span>Approx. Haversine Distance:</span>
      <span className="font-semibold text-foreground">{distanceKm ? `${distanceKm.toFixed(1)} km` : "N/A"}</span>
    </div>
  );
}
