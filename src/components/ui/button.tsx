import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-xl px-4 py-2 text-sm font-semibold transition",
        variant === "primary" && "bg-[var(--primary)] text-white hover:brightness-95",
        variant === "secondary" && "border border-[var(--line)] bg-white text-[var(--ink)] hover:bg-[var(--primary-soft)]",
        variant === "ghost" && "text-[var(--ink-subtle)] hover:bg-white",
        className
      )}
      {...props}
    />
  );
}

