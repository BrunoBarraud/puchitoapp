"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { exportTransactionsCsvAction, importDataAction, importTransactionsCsvAction } from "@/server/actions/settings-actions";
import type { ActionState } from "@/types";

const initialState: ActionState = { success: false, message: "" };

export function ImportExportCard({ exportedJson }: { exportedJson: string }) {
  const [jsonState, jsonAction] = useActionState(importDataAction, initialState);
  const [csvState, csvAction] = useActionState(importTransactionsCsvAction, initialState);
  const [jsonDownloadUrl, setJsonDownloadUrl] = useState("");
  const [csvDownloadUrl, setCsvDownloadUrl] = useState("");

  function handleJsonExport() {
    const blob = new Blob([exportedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    setJsonDownloadUrl(url);
  }

  async function handleCsvExport() {
    const exportedCsv = await exportTransactionsCsvAction();
    const blob = new Blob([exportedCsv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    setCsvDownloadUrl(url);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <h2 className="text-xl font-bold">Exportar tus datos</h2>
        <p className="mt-2 text-sm text-stone-600">Descargá un backup completo en JSON, incluyendo gastos fijos y cierres anuales, o tus movimientos en CSV para Excel/Sheets.</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={handleJsonExport} className="rounded-2xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white">
            Preparar JSON
          </button>
          {jsonDownloadUrl ? (
            <a href={jsonDownloadUrl} download="puchito-app-export.json" className="rounded-2xl border border-stone-300 px-4 py-2.5 text-sm font-semibold">
              Descargar JSON
            </a>
          ) : null}
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={handleCsvExport} className="rounded-2xl border border-brand-700 px-4 py-2.5 text-sm font-semibold text-brand-800">
            Preparar CSV
          </button>
          {csvDownloadUrl ? (
            <a href={csvDownloadUrl} download="puchito-app-movimientos.csv" className="rounded-2xl border border-stone-300 px-4 py-2.5 text-sm font-semibold">
              Descargar CSV
            </a>
          ) : null}
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-bold">Importar datos</h2>
        <p className="mt-2 text-sm text-stone-600">Los registros importados siempre se reasignan al usuario autenticado actual.</p>
        <form action={csvAction} className="mt-5 space-y-4">
          <Field label="Archivo CSV de movimientos">
            <Input name="file" type="file" accept=".csv,text/csv" required />
          </Field>
          <Button pendingLabel="Importando CSV...">Importar CSV</Button>
          <FormMessage message={csvState.message} success={csvState.success} />
        </form>
        <form action={jsonAction} className="mt-6 space-y-4 border-t border-[#eadfcb] pt-5">
          <Field label="Archivo JSON de backup">
            <Input name="file" type="file" accept="application/json,.json" required />
          </Field>
          <Button pendingLabel="Importando JSON..." className="border border-stone-300 bg-white text-stone-900 hover:bg-stone-50">Importar JSON</Button>
          <FormMessage message={jsonState.message} success={jsonState.success} />
        </form>
      </Card>
    </div>
  );
}
