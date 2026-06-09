export function FormMessage({ message, success = false }: { message?: string; success?: boolean }) {
  if (!message) {
    return null;
  }

  return (
    <p className={`rounded-2xl px-4 py-3 text-sm ${success ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
      {message}
    </p>
  );
}
