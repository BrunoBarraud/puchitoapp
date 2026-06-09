import { cn } from "@/lib/utils";

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-500",
        props.className
      )}
      {...props}
    />
  );
}
