import { AppShell } from "@/components/layout/app-shell";
import { ImportExportCard } from "@/components/settings/import-export-card";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { exportDataAction } from "@/server/actions/settings-actions";

export default async function SettingsPage() {
  const user = await requireUser();
  const exportedJson = await exportDataAction();

  return (
    <AppShell pathname="/settings" email={user.email} title="Configuración">
      <ImportExportCard exportedJson={exportedJson} />
      <Card>
        <h2 className="text-xl font-bold">Notas de seguridad</h2>
        <ul className="mt-4 space-y-2 text-sm text-stone-600">
          <li>Tus datos principales viven en PostgreSQL usando `DATABASE_URL`.</li>
          <li>La autenticación usa una cookie httpOnly firmada con `AUTH_SECRET`.</li>
          <li>Los datos importados siempre se reasignan a tu usuario actual.</li>
        </ul>
      </Card>
    </AppShell>
  );
}
