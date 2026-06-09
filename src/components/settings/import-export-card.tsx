"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { importDataAction } from "@/server/actions/settings-actions";
import type { ActionState } from "@/types";

const initialState: ActionState = { success: false, message: "" };

export function ImportExportCard({ exportedJson }: { exportedJson: string }) {
  const [state, action] = useActionState(importDataAction, initialState);
  const [downloadUrl, setDownloadUrl] = useState("");

  function handleExport() {
    const blob = new Blob([exportedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <h2 className="text-xl font-bold">Exportar tus datos</h2>
        <p className="mt-2 text-sm text-stone-600">Descargá todas tus categorías, movimientos y presupuestos en formato JSON.</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={handleExport} className="rounded-2xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white">
            Preparar exportacion
          </button>
          {downloadUrl ? (
            <a href={downloadUrl} download="puchito-app-export.json" className="rounded-2xl border border-stone-300 px-4 py-2.5 text-sm font-semibold">
              Descargar JSON
            </a>
          ) : null}
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-bold">Importar JSON</h2>
        <p className="mt-2 text-sm text-stone-600">Los registros importados siempre se reasignan al usuario autenticado actual.</p>
        <form action={action} className="mt-5 space-y-4">
          <Field label="Archivo JSON">
            <Input name="file" type="file" accept="application/json" required />
          </Field>
          <Button pendingLabel="Importando...">Importar datos</Button>
          <FormMessage message={state.message} success={state.success} />
        </form>
      </Card>
    </div>
  );
}
