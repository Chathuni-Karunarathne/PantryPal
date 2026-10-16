import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/server";
import { ProductsWorkspace } from "@/components/products/products-workspace";

export const metadata: Metadata = { title: "Products & Recipes | PantryPal" };

export default async function ProductsPage() {
  const store = await cookies();
  if (!store.has(ACCESS_COOKIE) && !store.has(REFRESH_COOKIE)) redirect("/login");
  return <ProductsWorkspace />;
}
