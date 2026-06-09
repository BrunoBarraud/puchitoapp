import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("min-w-0 rounded-[1.5rem] border border-[#eadfcb] bg-[#fffaf2]/95 p-4 shadow-[0_18px_40px_-28px_rgba(58,38,18,0.35)] backdrop-blur sm:rounded-[2rem] sm:p-5", className)}
      {...props}
    />
  );
}
