"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, RotateCcw, Check } from "lucide-react";

interface RoleSwitcherProps {
  currentPersona?: string;
}

export function RoleSwitcher({ currentPersona = "donor" }: RoleSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const personas = [
    {
      key: "donor",
      label: "Demo Bakery (Donor)",
      role: "Donor",
      targetPath: "/donor",
    },
    {
      key: "recipient_b",
      label: "Recipient B (Shelter)",
      role: "Recipient",
      targetPath: "/recipient",
    },
    {
      key: "recipient_a",
      label: "Recipient A (Kitchen)",
      role: "Recipient",
      targetPath: "/recipient",
    },
    {
      key: "recipient_c",
      label: "Recipient C (NGO)",
      role: "Recipient",
      targetPath: "/recipient",
    },
    {
      key: "coordinator",
      label: "Demo Coordinator",
      role: "Coordinator",
      targetPath: "/coordinator",
    },
  ];

  const handleSwitch = (key: string, targetPath: string) => {
    document.cookie = `feedone_persona=${key}; path=/; max-age=86400`;
    setIsOpen(false);
    router.push(targetPath);
    router.refresh();
  };

  const handleReset = async () => {
    if (confirm("Reset demo data to initial anchor state?")) {
      setIsResetting(true);
      try {
        await fetch("/api/demo/reset", { method: "POST" });
        router.refresh();
      } catch (err) {
        console.error("Reset failed", err);
      } finally {
        setIsResetting(false);
      }
    }
  };

  const active = personas.find((p) => p.key === currentPersona) || personas[0];

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border border-border-strong bg-surface hover:bg-surface-muted transition-colors text-foreground"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Users className="w-3.5 h-3.5 text-brand" />
          <span>
            Acting as: <strong className="font-semibold">{active.label}</strong>
          </span>
        </button>

        <button
          onClick={handleReset}
          disabled={isResetting}
          title="Reset demo data"
          className="p-1.5 rounded-md border border-border-strong bg-surface hover:bg-surface-muted text-foreground transition-colors disabled:opacity-50"
        >
          <RotateCcw
            className={`w-3.5 h-3.5 text-accent ${
              isResetting ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg bg-surface shadow-xl border border-border z-50 p-1 text-sm">
          <div className="px-3 py-2 text-xs font-semibold text-foreground-muted border-b border-border">
            Switch Demo Persona (Ref §5, D11)
          </div>
          <div className="py-1">
            {personas.map((p) => (
              <button
                key={p.key}
                onClick={() => handleSwitch(p.key, p.targetPath)}
                className="w-full text-left px-3 py-2 rounded-md flex items-center justify-between text-xs hover:bg-surface-muted transition-colors"
              >
                <div>
                  <div className="font-medium text-foreground">{p.label}</div>
                  <div className="text-[11px] text-foreground-muted">
                    {p.role}
                  </div>
                </div>
                {p.key === currentPersona && (
                  <Check className="w-4 h-4 text-brand shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
