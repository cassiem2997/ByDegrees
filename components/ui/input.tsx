import * as React from "react";

import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm text-ink outline-none ring-0 backdrop-blur placeholder:text-ink/40 focus:border-coral/50",
        className
      )}
      {...props}
    />
  );
}
