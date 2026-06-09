import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { loginAction } from "@/server/actions/auth-actions";
import { AuthCard } from "@/components/auth/auth-card";
import { ClientActionForm } from "@/components/ui/client-action-form";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <AuthCard
        title="Bienvenido de nuevo"
        description="Iniciá sesión y mantené bajo control esos gastos chicos que se escapan."
        footerText="¿Todavía no tenés cuenta?"
        footerLink="/register"
        footerLabel="Crear cuenta"
      >
        <ClientActionForm action={loginAction} className="space-y-4">
          <Field label="Email">
            <Input name="email" type="email" required />
          </Field>
          <Field label="Contraseña">
            <Input name="password" type="password" required />
          </Field>
          <Button pendingLabel="Ingresando..." className="w-full">
            Iniciar sesión
          </Button>
        </ClientActionForm>
      </AuthCard>
    </div>
  );
}
