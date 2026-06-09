import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm outline-none ring-0 transition placeholder:text-stone-400 focus:border-brand-500",
        props.className
      )}
      {...props}
    />
  );
}
