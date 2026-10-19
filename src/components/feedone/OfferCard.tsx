"use client";

import React, { useState } from "react";
import { Hourglass, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { StoredDonation, StoredOffer } from "@/server/db/store";
import { DeadlineCountdown } from "./DeadlineCountdown";

interface OfferCardProps {
  offer: StoredOffer;
  donation: StoredDonation;
  onAccept: (plannedPickupAt: string) => void;
  onDecline: (reason: string, note?: string) => void;
  isProcessing?: boolean;
}

export function OfferCard({
  offer,
  donation,
  onAccept,
  onDecline,
  isProcessing = false,
}: OfferCardProps) {
  const [selectedSlot, setSelectedSlot] = useState(donation.availableFrom);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("no_capacity");
  const [declineNote, setDeclineNote] = useState("");

  const handleDeclineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDecline(declineReason, declineNote);
    setShowDeclineModal(false);
  };

  return (
    <div className="bg-surface rounded-xl border border-brand/40 shadow-sm overflow-hidden">
      {/* Top Banner */}
      <div className="bg-brand-subtle px-4 py-3 flex items-center justify-between border-b border-brand/20">
        <div className="flex items-center gap-2">
          <Hourglass className="w-4 h-4 text-brand animate-pulse" />
          <span className="text-xs font-bold text-brand uppercase tracking-wider">
            Incoming Surplus Offer
          </span>
        </div>
        <DeadlineCountdown deadlineIso={offer.respondBy} label="Respond in" />
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-base font-bold text-foreground">
            {donation.quantity} {donation.unitLabel ?? donation.unit} of {donation.title}
          </h3>
          <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
            {donation.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs bg-surface-muted p-3 rounded-lg border border-border">
          <div>
            <span className="text-foreground-muted block text-[11px]">Storage:</span>
            <span className="font-semibold text-foreground capitalize">
              {donation.storageCategory.replace(/_/g, " ")} (
              {donation.packagedSealed ? "Packaged" : "Unpackaged"})
            </span>
          </div>
          <div>
            <span className="text-foreground-muted block text-[11px]">Allergens:</span>
            <span className="font-semibold text-foreground">
              {donation.allergenNotes || "None reported"}
            </span>
          </div>
        </div>

        {/* Handoff Safety Reminder (PRD §6.3, FR-SAF-05) */}
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-warning-subtle text-warning text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Reminder:</strong> Check the food upon physical collection. You have the right to refuse it at handoff if quality or temperature does not meet requirements.
          </span>
        </div>

        {/* Select Pickup Time Slot */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground block">
            Select Planned Pickup Time:
          </label>
          <input
            type="datetime-local"
            value={new Date(selectedSlot).toISOString().slice(0, 16)}
            onChange={(e) => setSelectedSlot(new Date(e.target.value).toISOString())}
            className="w-full text-xs px-3 py-2 rounded-md border border-border-strong bg-surface text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => onAccept(selectedSlot)}
            disabled={isProcessing}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold bg-brand text-brand-on hover:bg-brand-hover transition-colors shadow-sm disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Accept and Confirm Pickup</span>
          </button>

          <button
            onClick={() => setShowDeclineModal(true)}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-md text-xs font-semibold border border-danger text-danger hover:bg-danger-subtle transition-colors disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Decline Reason Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-xl border border-border shadow-2xl max-w-sm w-full p-5 text-xs">
            <h3 className="text-sm font-bold text-foreground mb-1">
              Decline Offer
            </h3>
            <p className="text-foreground-muted mb-4">
              Declining this offer will return the listing to other potential recipients. Please select a reason:
            </p>

            <form onSubmit={handleDeclineSubmit} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1">Reason</label>
                <select
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border-strong bg-surface text-foreground text-xs"
                >
                  <option value="no_capacity">No current capacity</option>
                  <option value="cannot_collect_in_time">Cannot collect in time</option>
                  <option value="food_type_not_suitable">Food type not suitable</option>
                  <option value="other">Other reason</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Optional Note</label>
                <input
                  type="text"
                  placeholder="e.g. Fridge undergoing maintenance"
                  value={declineNote}
                  onChange={(e) => setDeclineNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border-strong bg-surface text-foreground text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeclineModal(false)}
                  className="px-3 py-1.5 rounded-md border border-border text-foreground hover:bg-surface-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-md bg-danger text-white font-semibold hover:bg-danger/90"
                >
                  Confirm Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
