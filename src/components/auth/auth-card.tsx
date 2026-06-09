import Link from "next/link";
import type { Route } from "next";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";

export function AuthCard({
  title,
  description,
  footerText,
  footerLink,
  footerLabel,
  children
}: {
  title: string;
  description: string;
  footerText: string;
  footerLink: Route;
  footerLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="w-full max-w-md border-stone-200 bg-[#fffaf2]/95 p-6 sm:p-8">
      <Logo clean />
      <div className="mt-7">
        <h1 className="text-3xl font-black tracking-tight text-stone-900">{title}</h1>
        <p className="mt-2 text-sm text-stone-600">{description}</p>
      </div>
      <div className="mt-6">{children}</div>
      <p className="mt-6 text-sm text-stone-600">
        {footerText}{" "}
        <Link href={footerLink} className="font-semibold text-brand-700">
          {footerLabel}
        </Link>
      </p>
    </Card>
  );
}
