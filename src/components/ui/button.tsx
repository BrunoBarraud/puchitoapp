"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingLabel?: string;
};

export function Button({ className, children, pendingLabel, ...props }: ButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      disabled={pending || props.disabled}
      {...props}
    >
      {pending ? pendingLabel ?? "Guardando..." : children}
    </button>
  );
}
