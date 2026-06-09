"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/ui/form-message";
import type { ActionState } from "@/types";

const initialState: ActionState = {
  success: false,
  message: ""
};

export function ClientActionForm({
  action,
  children,
  className
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className={className}>
      {children}
      <FormMessage message={state.message} success={state.success} />
    </form>
  );
}
