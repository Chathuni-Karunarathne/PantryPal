import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/server";
import { InventoryWorkspace } from "@/components/inventory/inventory-workspace";

export const metadata: Metadata = { title: "Inventory | PantryPal" };

export default async function InventoryPage() {
  const store = await cookies();
  if (!store.has(ACCESS_COOKIE) && !store.has(REFRESH_COOKIE)) redirect("/login");
  return <InventoryWorkspace />;
}
