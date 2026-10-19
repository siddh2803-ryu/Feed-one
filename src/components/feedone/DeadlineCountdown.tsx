"use client";

import React, { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface DeadlineCountdownProps {
  deadlineIso: string;
  label?: string;
  showIcon?: boolean;
}

export function DeadlineCountdown({
  deadlineIso,
  label = "Deadline in",
  showIcon = true,
}: DeadlineCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalMinutes: number;
    isPassed: boolean;
  }>({ hours: 0, minutes: 0, seconds: 0, totalMinutes: 0, isPassed: false });

  useEffect(() => {
    function calculate() {
      const diffMs = new Date(deadlineIso).getTime() - Date.now();
      if (diffMs <= 0) {
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalMinutes: 0,
          isPassed: true,
        });
        return;
      }

      const totalSec = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSec / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;
      const totalMinutes = Math.floor(totalSec / 60);

      setTimeLeft({ hours, minutes, seconds, totalMinutes, isPassed: false });
    }

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [deadlineIso]);

  if (timeLeft.isPassed) {
    return (
      <span className="inline-flex items-center gap-1.5 text-danger font-medium text-xs tabular-nums">
        {showIcon && <AlertTriangle className="w-3.5 h-3.5" />}
        <span>Deadline passed</span>
      </span>
    );
  }

  const isCritical = timeLeft.totalMinutes <= 15;
  const isUrgent = timeLeft.totalMinutes <= 60;

  const colorClass = isCritical
    ? "text-accent-strong bg-accent-subtle px-2 py-0.5 rounded font-semibold border border-accent"
    : isUrgent
    ? "text-accent font-semibold"
    : "text-foreground-muted";

  const formatted =
    timeLeft.hours > 0
      ? `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`
      : `${timeLeft.minutes}m ${timeLeft.seconds}s`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs tabular-nums ${colorClass}`}
      aria-live="polite"
    >
      {showIcon && <Clock className="w-3.5 h-3.5 shrink-0" />}
      <span>
        {label} {formatted}
      </span>
    </span>
  );
}
