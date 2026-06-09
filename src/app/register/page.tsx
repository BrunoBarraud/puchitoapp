import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { registerAction } from "@/server/actions/auth-actions";
import { AuthCard } from "@/components/auth/auth-card";
import { ClientActionForm } from "@/components/ui/client-action-form";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <AuthCard
        title="Crea tu cuenta"
        description="Empeza a registrar ingresos, gastos y presupuestos en un solo lugar."
        footerText="Ya estas registrado?"
        footerLink="/login"
        footerLabel="Iniciar sesion"
      >
        <ClientActionForm action={registerAction} className="space-y-4">
          <Field label="Email">
            <Input name="email" type="email" required />
          </Field>
          <Field label="Contrasena">
            <Input name="password" type="password" minLength={6} required />
          </Field>
          <Button pendingLabel="Creando cuenta..." className="w-full">
            Crear cuenta
          </Button>
        </ClientActionForm>
      </AuthCard>
    </div>
  );
}
