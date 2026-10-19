"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { StoredDonation, StoredOffer } from "@/server/db/store";
import { OfferCard } from "@/components/feedone/OfferCard";

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [offer, setOffer] = useState<StoredOffer | null>(null);
  const [donation, setDonation] = useState<StoredDonation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/offers/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setOffer(data.data.offer);
          setDonation(data.data.donation);
        }
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleAccept = async (plannedPickupAt: string) => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/offers/${id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plannedPickupAt }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to accept offer.");
      }
      router.push("/recipient");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to accept offer.");
      setIsProcessing(false);
    }
  };

  const handleDecline = async (reason: string, note?: string) => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/offers/${id}/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to decline offer.");
      }
      router.push("/recipient");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to decline offer.");
      setIsProcessing(false);
    }
  };

  if (isLoading || !offer || !donation) {
    return <div className="text-center py-12 text-xs text-foreground-muted">Loading offer...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <div>
        <Link
          href="/recipient"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Inbox</span>
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-bold text-foreground font-display">
          Surplus Food Offer Review
        </h1>
        <p className="text-xs text-foreground-muted mt-1">
          Review the quantities, storage criteria, and confirm a feasible collection time.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-danger-subtle text-danger text-xs flex items-center gap-2 border border-danger/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <OfferCard
        offer={offer}
        donation={donation}
        onAccept={handleAccept}
        onDecline={handleDecline}
        isProcessing={isProcessing}
      />
    </div>
  );
}
