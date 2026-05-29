"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-coral/40 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-ink text-white shadow-glow hover:-translate-y-0.5 hover:bg-[#25253a]",
        variant === "secondary" &&
          "border border-white/70 bg-white/70 text-ink backdrop-blur hover:bg-white",
        variant === "ghost" && "text-ink/70 hover:bg-white/60 hover:text-ink",
        className
      )}
      {...props}
    />
  );
}
