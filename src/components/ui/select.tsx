import { cn } from "@/lib/utils";

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-500",
        props.className
      )}
      {...props}
    />
  );
}
