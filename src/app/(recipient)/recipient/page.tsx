"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Inbox, ArrowRight, PackageCheck, Clock } from "lucide-react";
import { StoredDonation, StoredOffer } from "@/server/db/store";
import { DeadlineCountdown } from "@/components/feedone/DeadlineCountdown";
import { PickupCard } from "@/components/feedone/PickupCard";

export default function RecipientDashboardPage() {
  const [offers, setOffers] = useState<(StoredOffer & { donation?: StoredDonation })[]>([]);
  const [activeDonations, setActiveDonations] = useState<StoredDonation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    // 1. Fetch recipient offers
    fetch("/api/offers")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setOffers(data.data.filter((o: StoredOffer) => o.status === "sent"));
        }
      });

    // 2. Fetch all donations for active pickups
    fetch("/api/donations")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setActiveDonations(
            data.data.filter(
              (d: StoredDonation) =>
                d.status === "confirmed" || d.status === "collected"
            )
          );
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRecordDelivered = async (donationId: string) => {
    try {
      await fetch(`/api/donations/${donationId}/delivered`, { method: "POST" });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">
            Recipient Inbox & Operations
          </h1>
          <p className="text-xs text-foreground-muted mt-1">
            Evaluate incoming time-bounded offers and complete scheduled surplus food pickups.
          </p>
        </div>

        <Link
          href="/recipient/profile"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-surface hover:bg-surface-muted text-foreground transition-colors"
        >
          <span>Update Collection Availability</span>
        </Link>
      </div>

      {/* Section 1: Incoming Offers */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Inbox className="w-4 h-4 text-brand" />
          <span>Incoming Offers Awaiting Response ({offers.length})</span>
        </h2>

        {isLoading ? (
          <div className="text-center py-6 text-xs text-foreground-muted">
            Loading offers...
          </div>
        ) : offers.length === 0 ? (
          <div className="p-6 rounded-xl bg-surface border border-border text-center text-xs text-foreground-muted">
            No pending offers right now. Keep your collection windows up to date so donors can coordinate with you.
          </div>
        ) : (
          <div className="grid gap-4">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-surface p-5 rounded-xl border border-brand/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {offer.donation?.quantity} {offer.donation?.unitLabel ?? offer.donation?.unit} of {offer.donation?.title}
                    </span>
                    <span className="text-[11px] font-semibold text-brand bg-brand-subtle px-2 py-0.5 rounded-full">
                      New Offer
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-foreground-muted flex-wrap">
                    <span>From: Demo Bakery (Central)</span>
                    <span>•</span>
                    <DeadlineCountdown deadlineIso={offer.respondBy} label="Respond within" />
                  </div>
                </div>

                <Link
                  href={`/recipient/offers/${offer.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-brand text-brand-on hover:bg-brand-hover shrink-0 transition-colors shadow-xs"
                >
                  <span>Review & Respond</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Active Collections & Pickups */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <PackageCheck className="w-4 h-4 text-brand" />
          <span>Active Scheduled Collections ({activeDonations.length})</span>
        </h2>

        {activeDonations.length === 0 ? (
          <div className="p-6 rounded-xl bg-surface border border-border text-center text-xs text-foreground-muted">
            No active pickups currently scheduled.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {activeDonations.map((d) => (
              <PickupCard
                key={d.id}
                donation={d}
                userRole="recipient"
                onRecordDelivered={() => handleRecordDelivered(d.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
