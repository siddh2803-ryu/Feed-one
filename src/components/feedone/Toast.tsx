import React from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

export function Toast({
  type = "success",
  message,
  onClose
}: {
  type?: "success" | "error";
  message: string;
  onClose?: () => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-surface border border-border text-sm">
      {type === "success" ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
      ) : (
        <AlertTriangle className="w-4 h-4 text-red-600" />
      )}
      <span className="text-foreground">{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-foreground-muted hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
