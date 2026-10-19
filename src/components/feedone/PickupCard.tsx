"use client";

import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  PackageCheck,
  Building,
} from "lucide-react";
import { StoredDonation, StoredOffer } from "@/server/db/store";
import { DeadlineCountdown } from "./DeadlineCountdown";

interface PickupCardProps {
  donation: StoredDonation;
  offer?: StoredOffer;
  userRole: "donor" | "recipient" | "coordinator";
  onRecordCollected?: () => void;
  onRecordDelivered?: () => void;
  isProcessing?: boolean;
}

export function PickupCard({
  donation,
  offer,
  userRole,
  onRecordCollected,
  onRecordDelivered,
  isProcessing = false,
}: PickupCardProps) {
  const isConfirmed = donation.status === "confirmed";
  const isCollected = donation.status === "collected";
  const isDelivered = donation.status === "delivered";

  return (
    <div className="bg-surface rounded-xl border border-brand/40 shadow-sm overflow-hidden">
      {/* Top Banner */}
      <div className="bg-brand text-brand-on px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isDelivered ? (
            <CheckCircle2 className="w-4 h-4 text-brand-on" />
          ) : isCollected ? (
            <PackageCheck className="w-4 h-4 text-brand-on" />
          ) : (
            <Clock className="w-4 h-4 text-brand-on" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider">
            {isDelivered
              ? "Rescue Completed & Delivered"
              : isCollected
              ? "Collected: In Transit"
              : "Handoff Confirmed"}
          </span>
        </div>
        {!isDelivered && (
          <DeadlineCountdown
            deadlineIso={donation.pickupDeadline}
            label="Pickup deadline in"
          />
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Revealed Contact & Location (Ref §14.3, D26) */}
        <div className="bg-brand-subtle/20 border border-brand/20 p-3.5 rounded-lg space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <Building className="w-4 h-4 text-brand shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground block">
                Pickup Address:
              </span>
              <span className="text-foreground">
                Main Shop, 10 Bakery Lane, Central (demo)
              </span>
              {donation.pickupInstructions && (
                <p className="text-foreground-muted mt-0.5 italic">
                  Note: {donation.pickupInstructions}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-brand/10">
            <Phone className="w-4 h-4 text-brand shrink-0" />
            <div>
              <span className="text-foreground-muted">Direct Phone:</span>{" "}
              <strong className="text-foreground">+00 0000 000 001</strong>
            </div>
          </div>

          {offer?.plannedPickupAt && (
            <div className="flex items-center gap-2 pt-1 border-t border-brand/10">
              <Clock className="w-4 h-4 text-brand shrink-0" />
              <div>
                <span className="text-foreground-muted">Planned Pickup:</span>{" "}
                <strong className="text-foreground">
                  {new Date(offer.plannedPickupAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>
              </div>
            </div>
          )}
        </div>

        {/* Physical Handover Reminder */}
        {!isCollected && !isDelivered && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-surface-muted text-xs text-foreground-muted border border-border">
            <ShieldCheck className="w-4 h-4 text-brand shrink-0 mt-0.5" />
            <span>
              <strong>Physical Verification:</strong> The recipient must inspect packaging, appearance, and smell at collection. Either party may cancel if items do not meet expectations.
            </span>
          </div>
        )}

        {/* Handover Action Buttons */}
        <div className="flex gap-3 pt-2">
          {isConfirmed && onRecordCollected && (
            <button
              onClick={onRecordCollected}
              disabled={isProcessing}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold bg-brand text-brand-on hover:bg-brand-hover transition-colors shadow-sm disabled:opacity-50"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Record Collected</span>
            </button>
          )}

          {isCollected && userRole === "recipient" && onRecordDelivered && (
            <button
              onClick={onRecordDelivered}
              disabled={isProcessing}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold bg-success text-white hover:bg-success/90 transition-colors shadow-sm disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Delivered</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
