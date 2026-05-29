import * as React from "react";

import { cn } from "@/lib/utils";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export function Dialog({ open, onClose, title, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171723]/45 p-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className={cn(
          "relative z-10 w-full max-w-2xl rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-glow"
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">{title}</h3>
          <button
            aria-label="Close dialog"
            className="rounded-full p-2 text-ink/50 transition hover:bg-black/5 hover:text-ink"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
