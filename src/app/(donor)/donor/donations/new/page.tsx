"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function NewDonationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initial defaults set for the 40-Packet Bread Demo (PRD §8.6)
  const now = new Date();
  const defaultDeadline = new Date(now.getTime() + 3 * 3600000);
  const defaultPrepared = new Date(now.getTime() - 6 * 3600000);
  const defaultUseBy = new Date(now.getTime() + 24 * 3600000);

  const [formData, setFormData] = useState({
    category: "bakery",
    title: "Bread packets",
    description: "Sliced white and brown bread, freshly baked this morning.",
    quantity: 40,
    unit: "items",
    unitLabel: "packets",
    availableFrom: now.toISOString().slice(0, 16),
    pickupDeadline: defaultDeadline.toISOString().slice(0, 16),
    storageCategory: "ambient",
    packagedSealed: true,
    preparedAt: defaultPrepared.toISOString().slice(0, 16),
    useBy: defaultUseBy.toISOString().slice(0, 16),
    allergenNotes: "Contains wheat (gluten). May contain sesame.",
    pickupInstructions: "Side door at rear, ask for shift lead.",
    attestation: true,
  });

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 1) {
      if (!formData.title || !formData.category) {
        setErrorMsg("Please fill in category and title.");
        return;
      }
    } else if (step === 2) {
      if (formData.quantity <= 0) {
        setErrorMsg("Quantity must be greater than 0.");
        return;
      }
      if (
        new Date(formData.pickupDeadline).getTime() <=
        new Date(formData.availableFrom).getTime()
      ) {
        setErrorMsg("Pickup deadline must be after available time.");
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.attestation) {
      setErrorMsg("You must confirm the attestation before submitting.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          availableFrom: new Date(formData.availableFrom).toISOString(),
          pickupDeadline: new Date(formData.pickupDeadline).toISOString(),
          preparedAt: new Date(formData.preparedAt).toISOString(),
          useBy: formData.useBy ? new Date(formData.useBy).toISOString() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to create donation.");
      }

      router.push(`/donor/donations/${data.data.donation.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      {/* Stepper Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground font-display">
          List Surplus Food
        </h1>
        <p className="text-xs text-foreground-muted mt-1">
          Complete the 4 steps below. Hard constraints will evaluate eligible recipients immediately.
        </p>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-4 gap-2 mt-5">
          {[
            { num: 1, label: "Food" },
            { num: 2, label: "Quantity & Time" },
            { num: 3, label: "Safety & Handling" },
            { num: 4, label: "Review & Match" },
          ].map((s) => (
            <div key={s.num} className="space-y-1">
              <div
                className={`h-1.5 rounded-full transition-colors ${
                  step >= s.num ? "bg-brand" : "bg-border"
                }`}
              />
              <span className="text-[11px] font-semibold text-foreground-muted block truncate">
                {s.num}. {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3.5 rounded-lg bg-danger-subtle text-danger text-xs flex items-center gap-2 border border-danger/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-6">
        {/* STEP 1: Food Details */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-foreground">Step 1: Food Category & Description</h2>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Food Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-md border border-border-strong bg-surface text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
              >
                <option value="bakery">Bakery (Bread, Pastries)</option>
                <option value="produce">Fresh Produce (Fruits, Vegetables)</option>
                <option value="packaged_dry">Packaged Dry Goods (Grains, Canned)</option>
                <option value="cooked_meals">Cooked Prepared Meals</option>
                <option value="dairy_eggs">Dairy & Eggs</option>
                <option value="beverages">Beverages</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-md border border-border-strong bg-surface text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
                placeholder="e.g. Bread packets"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-md border border-border-strong bg-surface text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
                placeholder="Describe food contents and packaging details"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Quantity & Timing */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-foreground">Step 2: Quantity & Pickup Timing</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 rounded-md border border-border-strong bg-surface text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Unit
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unit: e.target.value,
                      unitLabel: e.target.value === "items" ? "packets" : "kg",
                    })
                  }
                  className="w-full text-xs px-3 py-2 rounded-md border border-border-strong bg-surface text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
                >
                  <option value="items">Items (Packets, Trays)</option>
                  <option value="kg">Kilograms (kg)</option>
                </select>
              </div>
            </div>

            {formData.unit === "items" && (
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Unit Label
                </label>
                <input
                  type="text"
                  value={formData.unitLabel}
                  onChange={(e) => setFormData({ ...formData, unitLabel: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-md border border-border-strong bg-surface text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
                  placeholder="e.g. packets, trays, boxes"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Available From
                </label>
                <input
                  type="datetime-local"
                  value={formData.availableFrom}
                  onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-md border border-border-strong bg-surface text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Pickup Deadline
                </label>
                <input
                  type="datetime-local"
                  value={formData.pickupDeadline}
                  onChange={(e) => setFormData({ ...formData, pickupDeadline: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-md border border-border-strong bg-surface text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Handling & Safety */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-foreground">Step 3: Food Safety & Handling Attestation</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Storage Category (D10)
                </label>
                <select
                  value={formData.storageCategory}
                  onChange={(e) => setFormData({ ...formData, storageCategory: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-md border border-border-strong bg-surface text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
                >
                  <option value="ambient">Ambient (Room Temperature)</option>
                  <option value="chilled">Chilled (Refrigerated)</option>
                  <option value="frozen">Frozen</option>
                  <option value="hot_held">Hot Held</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Packaged and Sealed?
                </label>
                <select
                  value={formData.packagedSealed ? "true" : "false"}
                  onChange={(e) =>
                    setFormData({ ...formData, packagedSealed: e.target.value === "true" })
                  }
                  className="w-full text-xs px-3 py-2 rounded-md border border-border-strong bg-surface text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
                >
                  <option value="true">Yes, sealed packaging</option>
                  <option value="false">No, loose or unpackaged</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Prepared / Baked At
                </label>
                <input
                  type="datetime-local"
                  value={formData.preparedAt}
                  onChange={(e) => setFormData({ ...formData, preparedAt: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-md border border-border-strong bg-surface text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Use-By Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.useBy}
                  onChange={(e) => setFormData({ ...formData, useBy: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-md border border-border-strong bg-surface text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Allergen Notes
              </label>
              <input
                type="text"
                value={formData.allergenNotes}
                onChange={(e) => setFormData({ ...formData, allergenNotes: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-md border border-border-strong bg-surface text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
                placeholder="e.g. Contains gluten, dairy"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Pickup Instructions (Disclosed after acceptance)
              </label>
              <input
                type="text"
                value={formData.pickupInstructions}
                onChange={(e) => setFormData({ ...formData, pickupInstructions: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-md border border-border-strong bg-surface text-foreground focus:ring-2 focus:ring-brand focus:outline-none"
                placeholder="e.g. Ring side buzzer, ask for shift manager"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Review & Attest */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-foreground">Step 4: Review Listing & Attest</h2>

            <div className="bg-surface-muted p-4 rounded-xl border border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Listing:</span>
                <span className="font-bold text-foreground">
                  {formData.quantity} {formData.unitLabel} of {formData.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Category:</span>
                <span className="font-semibold text-foreground capitalize">{formData.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Storage:</span>
                <span className="font-semibold text-foreground capitalize">
                  {formData.storageCategory} ({formData.packagedSealed ? "Packaged" : "Unpackaged"})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Pickup Window:</span>
                <span className="font-semibold text-foreground">
                  Until {new Date(formData.pickupDeadline).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-brand-subtle/30 border border-brand/20 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.attestation}
                  onChange={(e) => setFormData({ ...formData, attestation: e.target.checked })}
                  className="mt-0.5 rounded text-brand focus:ring-brand"
                />
                <span className="text-xs text-foreground leading-relaxed">
                  <strong>Mandatory Attestation (D10):</strong> I attest that the food handling, preparation, and expiry information above is accurate to the best of my knowledge. Feed One screens listings using configured rules and does not certify legal compliance.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-border text-foreground hover:bg-surface-muted transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-brand text-brand-on hover:bg-brand-hover shadow-sm transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-brand text-brand-on hover:bg-brand-hover shadow-sm disabled:opacity-50 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? "Matching..." : "Submit & Find Recipients"}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
