import Image from "next/image";

export function Logo({ compact = false, clean = false }: { compact?: boolean; clean?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
      <div
        className={`relative shrink-0 overflow-hidden ${
          compact ? "h-11 w-[72px]" : "h-14 w-24 sm:h-[84px] sm:w-32"
        } ${clean ? "rounded-xl bg-[#f6eddc]" : ""}`}
      >
        <Image
          src="/logo-puchito-app.png"
          alt="Puchito App logo"
          fill
          sizes={compact ? "72px" : "(min-width: 640px) 128px, 96px"}
          className={`object-contain ${clean ? "p-1" : "drop-shadow-sm"}`}
        />
      </div>
      <div className="flex min-w-0 flex-col justify-center self-center">
        <div className="flex flex-wrap items-baseline gap-2 leading-none">
          <span className={`font-black tracking-tight text-brand-900 ${compact ? "text-lg" : "text-2xl sm:text-3xl"}`}>Puchito</span>
          <span className={`rounded-lg bg-brand-900 font-black tracking-tight text-brand-100 ${compact ? "px-2 py-1 text-sm" : "px-2 py-1 text-base sm:px-2.5 sm:text-xl"}`}>App</span>
        </div>
        {!compact ? (
          <p className="mt-2 max-w-sm text-xs leading-relaxed text-stone-700 sm:text-sm">
            Para que el sueldo no se te vaya en puchitos.
          </p>
        ) : null}
      </div>
    </div>
  );
}
