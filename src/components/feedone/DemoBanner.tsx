import React from "react";
import { FlaskConical } from "lucide-react";

export function DemoBanner() {
  return (
    <div
      role="banner"
      className="w-full bg-[#6B3FA0] text-white px-4 py-1.5 text-xs font-medium flex items-center justify-between shadow-sm"
    >
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <FlaskConical className="w-4 h-4 shrink-0 animate-pulse text-[#C4A2EE]" />
        <span>
          <strong className="font-semibold">DEMO MODE ACTIVE:</strong> All
          organisations, listings, and outcomes are simulated demo data. Never
          asserts legal food safety compliance.
        </span>
      </div>
    </div>
  );
}
