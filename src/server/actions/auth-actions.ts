"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authSchema } from "@/lib/validations";
import { defaultCategories } from "@/server/default-categories";
import type { ActionState } from "@/types";

export async function registerAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const parsed = authSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password")
    });

    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message ?? "Datos invalidos." };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email }
    });

    if (existingUser) {
      return { success: false, message: "Este email ya esta registrado." };
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        passwordHash,
        categories: {
          create: defaultCategories
        }
      }
    });

    await createSession(user.id);
  } catch (error) {
    return { success: false, message: "No se pudo crear tu cuenta." };
  }

  redirect("/dashboard");
}

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const parsed = authSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password")
    });

    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message ?? "Credenciales invalidas." };
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email }
    });

    if (!user) {
      return { success: false, message: "Credenciales invalidas." };
    }

    const validPassword = await bcrypt.compare(parsed.data.password, user.passwordHash);

    if (!validPassword) {
      return { success: false, message: "Credenciales invalidas." };
    }

    await createSession(user.id);
  } catch (error) {
    return { success: false, message: "No se pudo iniciar sesion." };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
