import Image from "next/image";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <Image
        src="/logo-puchito-app.png"
        alt="Puchito App logo"
        width={compact ? 44 : 84}
        height={compact ? 44 : 84}
        className={`shrink-0 rounded-2xl object-cover ${compact ? "" : "shadow-soft"}`}
      />
      <div className="flex min-w-0 flex-col justify-center self-center">
        <div className="flex flex-wrap items-baseline gap-2 leading-none">
          <span className={`font-black tracking-tight text-brand-900 ${compact ? "text-lg" : "text-3xl"}`}>Puchito</span>
          <span className={`rounded-lg bg-brand-900 font-black tracking-tight text-brand-100 ${compact ? "px-2 py-1 text-sm" : "px-2.5 py-1 text-xl"}`}>App</span>
        </div>
        {!compact ? (
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone-700">
            Para que el sueldo no se te vaya en puchitos.
          </p>
        ) : null}
      </div>
    </div>
  );
}
