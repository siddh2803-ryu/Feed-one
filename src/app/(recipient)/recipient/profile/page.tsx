"use client";

import React, { useEffect, useState } from "react";
import { Save, Plus, Trash2, Check, User } from "lucide-react";
import { RecipientSnapshot, CollectionWindow } from "@/domain/matching/types";

export default function RecipientProfilePage() {
  const [recipient, setRecipient] = useState<RecipientSnapshot | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [capacityItems, setCapacityItems] = useState<number>(50);
  const [capacityKg, setCapacityKg] = useState<number>(30);
  const [canCollect, setCanCollect] = useState<boolean>(true);
  const [windows, setWindows] = useState<CollectionWindow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // Load Recipient B by default for recipient role demo
    fetch("/api/recipients/r0000000-0000-4000-8000-000000000002")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          const r = data.data;
          setRecipient(r);
          setCategories(r.acceptedCategories || []);
          setCapacityItems(r.capacityItems || 0);
          setCapacityKg(r.capacityKg || 0);
          setCanCollect(r.canCollect ?? true);
          setWindows(r.collectionWindows || []);
        }
      });
  }, []);

  const handleToggleCategory = (cat: string) => {
    if (categories.includes(cat)) {
      setCategories(categories.filter((c) => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  const handleAddWindow = () => {
    setWindows([
      ...windows,
      {
        dayOfWeek: 1, // Monday
        startTime: "18:00",
        endTime: "21:00",
        provenance: "recipient_confirmed",
      },
    ]);
  };

  const handleRemoveWindow = (index: number) => {
    setWindows(windows.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      await fetch("/api/recipients/r0000000-0000-4000-8000-000000000002", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acceptedCategories: categories,
          capacityItems: Number(capacityItems),
          capacityKg: Number(capacityKg),
          canCollect,
          collectionWindows: windows,
        }),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const allCategories = [
    { key: "bakery", label: "Bakery" },
    { key: "produce", label: "Produce" },
    { key: "packaged_dry", label: "Packaged Dry Goods" },
    { key: "cooked_meals", label: "Cooked Meals" },
    { key: "dairy_eggs", label: "Dairy & Eggs" },
    { key: "beverages", label: "Beverages" },
  ];

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  if (!recipient) {
    return <div className="text-center py-12 text-xs text-foreground-muted">Loading profile...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">
            Recipient Operational Profile
          </h1>
          <p className="text-xs text-foreground-muted mt-1">
            Setting your criteria marks attributes as{" "}
            <strong className="text-brand">Organisation Confirmed</strong>. Feed One only matches you against food you can accept and collect.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-brand bg-brand-subtle px-2.5 py-1 rounded-md border border-brand/20 font-semibold">
          <User className="w-3.5 h-3.5" />
          <span>{recipient.name}</span>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-lg bg-success-subtle text-success text-xs font-semibold flex items-center gap-2 border border-success/30">
          <Check className="w-4 h-4" />
          <span>Profile updated and marked as organisation confirmed!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-6">
        {/* Accepted Food Categories */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
            Accepted Food Categories (C1)
          </label>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((c) => {
              const active = categories.includes(c.key);
              return (
                <button
                  type="button"
                  key={c.key}
                  onClick={() => handleToggleCategory(c.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                    active
                      ? "bg-brand text-brand-on border-brand"
                      : "bg-surface-muted text-foreground-muted border-border hover:text-foreground"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Capacities */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
            Maximum Single-Donation Capacity (C2)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-foreground-muted block mb-1">Items (Packets / Trays)</label>
              <input
                type="number"
                value={capacityItems}
                onChange={(e) => setCapacityItems(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-md border border-border-strong bg-surface text-foreground"
              />
            </div>
            <div>
              <label className="text-xs text-foreground-muted block mb-1">Kilograms (kg)</label>
              <input
                type="number"
                value={capacityKg}
                onChange={(e) => setCapacityKg(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-md border border-border-strong bg-surface text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Collection Capability */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
            Collection Capability (C4)
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={canCollect}
              onChange={(e) => setCanCollect(e.target.checked)}
              className="rounded text-brand focus:ring-brand"
            />
            <span className="font-medium text-foreground">
              We have transport/volunteers to collect directly from donors
            </span>
          </label>
        </div>

        {/* Weekly Collection Windows (D14, D29) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Weekly Collection Windows (C3)
            </label>
            <button
              type="button"
              onClick={handleAddWindow}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Window</span>
            </button>
          </div>

          <div className="space-y-2">
            {windows.map((w, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg bg-surface-muted border border-border"
              >
                <select
                  value={w.dayOfWeek}
                  onChange={(e) => {
                    const copy = [...windows];
                    copy[idx].dayOfWeek = Number(e.target.value);
                    setWindows(copy);
                  }}
                  className="text-xs px-2.5 py-1.5 rounded-md border border-border bg-surface text-foreground"
                >
                  {days.map((d, dayIdx) => (
                    <option key={dayIdx} value={dayIdx}>
                      {d}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1 text-xs text-foreground">
                  <input
                    type="time"
                    value={w.startTime}
                    onChange={(e) => {
                      const copy = [...windows];
                      copy[idx].startTime = e.target.value;
                      setWindows(copy);
                    }}
                    className="px-2 py-1 rounded border border-border bg-surface"
                  />
                  <span>to</span>
                  <input
                    type="time"
                    value={w.endTime}
                    onChange={(e) => {
                      const copy = [...windows];
                      copy[idx].endTime = e.target.value;
                      setWindows(copy);
                    }}
                    className="px-2 py-1 rounded border border-border bg-surface"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveWindow(idx)}
                  className="p-1 text-foreground-muted hover:text-danger ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-brand text-brand-on hover:bg-brand-hover transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save Profile & Windows"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
