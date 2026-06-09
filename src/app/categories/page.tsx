import { AppShell } from "@/components/layout/app-shell";
import { CategoryForm } from "@/components/categories/category-form";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteCategoryAction } from "@/server/actions/category-actions";

export default async function CategoriesPage({
  searchParams
}: {
  searchParams: Promise<{ editId?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: [{ type: "asc" }, { name: "asc" }]
  });
  const categoryToEdit = params.editId ? await prisma.category.findFirst({ where: { id: params.editId, userId: user.id } }) : null;

  async function deleteCategory(formData: FormData) {
    "use server";
    const id = formData.get("id");
    if (typeof id === "string") {
      await deleteCategoryAction(id);
    }
  }

  return (
    <AppShell pathname="/categories" email={user.email} title="Categorias">
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <CategoryForm category={categoryToEdit} />
        <Card>
          <h2 className="text-xl font-bold">Tus categorias</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {categories.map((category) => (
              <div key={category.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{category.name}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${category.type === "INCOME" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {category.type === "INCOME" ? "Ingreso" : "Gasto"}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-stone-600">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color ?? "#78716c" }} />
                  {category.icon ?? "Sin icono"}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={`/categories?editId=${category.id}`} className="rounded-xl border px-3 py-1.5 text-xs font-semibold">
                    Editar
                  </a>
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={category.id} />
                    <button className="rounded-xl bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700">Eliminar</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
