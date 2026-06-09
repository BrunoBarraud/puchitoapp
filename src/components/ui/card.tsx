import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-[2rem] border border-[#eadfcb] bg-[#fffaf2]/95 p-5 shadow-[0_18px_40px_-28px_rgba(58,38,18,0.35)] backdrop-blur", className)}
      {...props}
    />
  );
}
