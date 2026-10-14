"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, ArrowDownToLine, ArrowLeft, ArrowRight, Check, CircleAlert, ClipboardList, LayoutDashboard, Leaf, LogOut, Package, Pencil, Plus, RefreshCw, Search, SlidersHorizontal, Snowflake, Trash2, Warehouse } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { PantryPalLogo } from "@/components/brand/pantrypal-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { InventoryError, inventoryRequest } from "@/lib/inventory/client";
import { categoryLabels, formatQuantity, storageLabels, unitLabels, type Ingredient, type IngredientPage, type InventoryOptions, type InventoryOverview } from "@/lib/inventory/types";
import { IngredientDialog } from "./ingredient-dialog";
import { StockDialog } from "./stock-dialog";
import { DeleteIngredientDialog } from "./delete-ingredient-dialog";

type Modal = { kind: "add" } | { kind: "edit" | "intake" | "adjustment" | "delete"; ingredient: Ingredient };
const storageIcons = { PANTRY: Warehouse, REFRIGERATOR: Package, FREEZER: Snowflake };

export function InventoryWorkspace() {
  const auth = useAuth();
  const router = useRouter();
  const [logoutError, setLogoutError] = useState("");
  useEffect(() => { if (auth.status === "anonymous") router.replace("/login"); }, [auth.status, router]);
  async function logout() {
    setLogoutError("");
    try { await auth.logout(); router.replace("/login"); router.refresh(); }
    catch { setLogoutError("We couldn't sign you out. Please try again."); }
  }
  const permitted = auth.user && auth.user.role !== "ORDER_STAFF";
  return <div className="min-h-dvh lg:pl-64">
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-card px-5 py-8 lg:flex">
      <Link href="/dashboard" aria-label="PantryPal workspace"><PantryPalLogo /></Link>
      <p className="mt-3 pl-1 text-xs text-muted-foreground">A little order. A lot of possibility.</p>
      <p className="mt-12 px-3 text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">Your workspace</p>
      <nav className="mt-3 space-y-2" aria-label="Workspace navigation">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground hover:bg-muted"><LayoutDashboard className="size-4" />Workspace</Link>
        <Link href="/inventory" aria-current="page" className="flex items-center gap-3 rounded-xl bg-primary/10 px-3 py-3 text-sm font-semibold text-primary"><Package className="size-4" />Inventory</Link>
      </nav>
      <div className="mt-auto rounded-2xl border bg-background p-4"><Leaf className="mb-3 size-5 text-primary" /><p className="text-sm font-medium">Good food starts here.</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Keep ingredients in view and your kitchen ready for the next creation.</p></div>
    </aside>
    <header className="border-b bg-card/80 px-4 py-4 sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="lg:hidden"><Link href="/dashboard" aria-label="PantryPal workspace"><PantryPalLogo /></Link></div>
        <p className="hidden text-sm text-muted-foreground lg:block">Workspace <span className="mx-2 text-border">/</span><span className="font-medium text-foreground">Inventory</span></p>
        <div className="flex items-center gap-2 sm:gap-4"><ThemeToggle />
          {auth.user && <><div className="hidden text-right sm:block"><p className="text-sm font-medium">{auth.user.name}</p><p className="text-xs text-muted-foreground">{auth.user.role.replace(/_/g, " ").toLowerCase()}</p></div>
            <Button variant="ghost" size="icon-lg" aria-label="Sign out" disabled={auth.status === "logging-out"} onClick={() => void logout()}><LogOut className="size-4" /></Button></>}
        </div>
      </div>
    </header>
    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-8 sm:py-10">
      {logoutError && <p role="alert" className="mb-5 text-sm text-destructive">{logoutError}</p>}
      {auth.status === "error" ? <StateCard icon={<CircleAlert />} title="Your workspace is temporarily unavailable" description={auth.message}><Button onClick={() => void auth.restore()}>Try again</Button></StateCard>
        : auth.status === "authenticated" && permitted ? <InventoryContent key={auth.user!.id} canDelete={auth.user!.role !== "INVENTORY_STAFF"} />
        : auth.status === "authenticated" && !permitted ? <StateCard icon={<ClipboardList />} title="Inventory access is restricted" description="Your role handles customer orders. Inventory is available to owners, managers, and inventory staff."><Button asChild><Link href="/dashboard">Back to workspace</Link></Button></StateCard>
        : <StateCard icon={<Package />} title={auth.status === "logging-out" ? "Signing out…" : "Opening your pantry…"} description="Checking your session securely." />}
    </main>
  </div>;
}

function InventoryContent({ canDelete }: { canDelete: boolean }) {
  const { restore } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [storage, setStorage] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState<{ list: IngredientPage; overview: InventoryOverview; options: InventoryOptions } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modal, setModal] = useState<Modal | null>(null);
  const expire = useCallback(() => { void restore(); router.replace("/login"); }, [restore, router]);

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(0); }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Resolve session through the same HttpOnly cookie boundary as authentication.
  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ page: String(page), size: "25", lowStock: String(lowStock) });
    if (debouncedSearch.trim()) query.set("search", debouncedSearch.trim());
    if (category) query.set("category", category);
    if (storage) query.set("storageLocation", storage);
    async function load() {
      setLoading(true); setError("");
      try {
        const [list, overview, options] = await Promise.all([
          inventoryRequest<IngredientPage>(`ingredients?${query}`, { signal: controller.signal }),
          inventoryRequest<InventoryOverview>("overview", { signal: controller.signal }),
          inventoryRequest<InventoryOptions>("options", { signal: controller.signal }),
        ]);
        if (controller.signal.aborted) return;
        if (list.page > 0 && list.items.length === 0) { setPage(Math.max(0, list.totalPages - 1)); return; }
        setData({ list, overview, options });
      } catch (caught) {
        if (!controller.signal.aborted) {
          if (caught instanceof InventoryError && caught.status === 401) expire();
          setError(caught instanceof InventoryError ? caught.message : "We couldn't load inventory. Please try again.");
        }
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [debouncedSearch, category, storage, lowStock, page, revision, expire]);

  function saved(message: string) { setModal(null); setSuccess(message); setLoading(true); setRevision((current) => current + 1); }
  function resetFilters() { setSearch(""); setDebouncedSearch(""); setCategory(""); setStorage(""); setLowStock(false); setPage(0); }
  const filtered = Boolean(search || category || storage || lowStock);
  const overview = error ? undefined : data?.overview;

  return <>
    <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div><p className="mb-2 text-xs font-semibold tracking-[0.18em] text-primary uppercase">Your kitchen, in balance</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Inventory</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Know what’s on hand. Make room for what’s next.</p></div>
      <Button className="h-11 gap-2 self-start px-5 shadow-sm" disabled={!data || loading || Boolean(error)} onClick={() => setModal({ kind: "add" })}><Plus className="size-4" />Add ingredient</Button>
    </div>
    {success && <div role="status" className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"><span className="flex items-center gap-2"><Check className="size-4 shrink-0" />{success}</span><Button variant="ghost" size="sm" onClick={() => setSuccess("")}>Dismiss</Button></div>}
    <section aria-label="Inventory overview" className="mb-7 grid grid-cols-2 gap-3 xl:grid-cols-4 sm:gap-4">
      <Metric title="Total ingredients" value={overview?.totalIngredients} icon={<Package className="size-5" />} note="Across your kitchen" />
      <Metric title="Low stock" value={overview?.lowStock} icon={<AlertTriangle className="size-5" />} note="Below minimum levels" warning />
      <Metric title="Out of stock" value={overview?.outOfStock} icon={<ClipboardList className="size-5" />} note="Ready to replenish" />
      <Metric title="Storage locations" value={data ? 3 : undefined} icon={<Warehouse className="size-5" />} note="Pantry · Fridge · Freezer" />
    </section>
    <section aria-label="Ingredient inventory" className="overflow-hidden rounded-2xl border bg-card shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-5 sm:px-6"><div><h2 className="text-lg font-semibold">Your ingredients</h2><p className="mt-1 text-xs text-muted-foreground">A clear view of every essential.</p></div>
        <Button variant="outline" className="h-9" disabled={loading} onClick={() => setRevision((current) => current + 1)}><RefreshCw className="size-4" />Refresh</Button>
      </div>
      <div className="flex flex-wrap gap-2 border-b px-5 py-4 sm:px-6" aria-label="Storage locations">
        <Button variant={!storage ? "secondary" : "ghost"} className="h-9" aria-pressed={!storage} onClick={() => { setStorage(""); setPage(0); }}>All locations{overview && <span className="ml-1 text-xs opacity-70">{overview.totalIngredients}</span>}</Button>
        {data?.options.storageLocations.map((location) => {
          const Icon = storageIcons[location];
          return <Button key={location} variant={storage === location ? "secondary" : "ghost"} className="h-9" aria-pressed={storage === location} onClick={() => { setStorage(location); setPage(0); }}><Icon className="size-4" />{storageLabels[location]}<span className="ml-1 text-xs opacity-70">{overview?.[location.toLowerCase() as "pantry" | "refrigerator" | "freezer"]}</span></Button>;
        })}
      </div>
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:flex-wrap sm:px-6">
        <div className="relative min-w-0 flex-1 sm:min-w-52"><Search className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" /><Input aria-label="Search ingredients" className="h-10 pl-9" placeholder="Search ingredients…" maxLength={120} value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        <Select aria-label="Filter by category" className="sm:w-52" value={category} onChange={(event) => { setCategory(event.target.value); setPage(0); }}><option value="">All categories</option>{data?.options.categories.map((category) => <option key={category} value={category}>{categoryLabels[category]}</option>)}</Select>
        <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm"><input type="checkbox" className="size-4 accent-primary" checked={lowStock} onChange={(event) => { setLowStock(event.target.checked); setPage(0); }} />Low stock only</label>
        {filtered && <Button variant="ghost" className="h-10" onClick={resetFilters}>Clear filters</Button>}
      </div>
      {error ? <StateCard icon={<CircleAlert />} title="Inventory could not be loaded" description={error}><Button onClick={() => setRevision((current) => current + 1)}>Try again</Button></StateCard>
        : loading ? <div className="space-y-3 px-6 py-8" role="status" aria-label="Loading inventory"><p className="mb-4 text-sm text-muted-foreground">Loading your ingredients…</p>{[0, 1, 2, 3].map((row) => <div key={row} className="h-14 rounded-xl bg-muted" />)}</div>
        : data?.list.items.length ? <>
          <div className="divide-y sm:hidden">{data.list.items.map((ingredient) => <IngredientMobileCard key={ingredient.id} ingredient={ingredient} canDelete={canDelete} onAction={(kind) => setModal({ kind, ingredient })} />)}</div>
          <div className="hidden overflow-x-auto sm:block"><table className="w-full text-left text-sm"><caption className="sr-only">Ingredients with quantities, storage, expiry dates, and stock actions</caption>
            <thead className="border-y bg-muted/40 text-xs text-muted-foreground"><tr><th scope="col" className="px-6 py-3 font-medium">Ingredient</th><th scope="col" className="px-4 py-3 font-medium">Available stock</th><th scope="col" className="px-4 py-3 font-medium">Storage</th><th scope="col" className="px-4 py-3 font-medium">Next expiry</th><th scope="col" className="px-4 py-3 font-medium">Status</th><th scope="col" className="px-4 py-3 text-right font-medium">Actions</th></tr></thead>
            <tbody className="divide-y">{data.list.items.map((ingredient) => <IngredientRow key={ingredient.id} ingredient={ingredient} canDelete={canDelete} onAction={(kind) => setModal({ kind, ingredient })} />)}</tbody>
          </table></div>
          <div className="flex items-center justify-between gap-3 border-t px-5 py-4 text-xs text-muted-foreground sm:px-6"><p>{page * data.list.size + 1}–{Math.min((page + 1) * data.list.size, data.list.totalElements)} of {data.list.totalElements} ingredients</p><div className="flex items-center gap-2"><Button variant="outline" size="icon" aria-label="Previous page" disabled={page === 0} onClick={() => setPage((current) => current - 1)}><ArrowLeft /></Button><span>{page + 1} / {Math.max(1, data.list.totalPages)}</span><Button variant="outline" size="icon" aria-label="Next page" disabled={page + 1 >= data.list.totalPages} onClick={() => setPage((current) => current + 1)}><ArrowRight /></Button></div></div>
        </> : <StateCard icon={<Leaf />} title={filtered ? "No ingredients match your filters" : "A fresh start for your pantry"} description={filtered ? "Try a different name, category, or storage location." : "Add your first ingredient to start keeping track of stock, storage, and the essentials your kitchen needs."}>
          <Button onClick={() => filtered ? resetFilters() : setModal({ kind: "add" })}>{filtered ? "Clear filters" : "Add your first ingredient"}</Button>
        </StateCard>}
    </section>
    <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Stock warnings use each ingredient’s minimum level. Expiry dates reflect the earliest remaining receipt.</p>
    {modal && data && (modal.kind === "add" || modal.kind === "edit" ? <IngredientDialog key={modal.kind === "edit" ? modal.ingredient.id : "new"} ingredient={modal.kind === "edit" ? modal.ingredient : undefined} options={data.options} onClose={() => setModal(null)} onSaved={saved} onExpired={expire} />
      : modal.kind === "delete" ? <DeleteIngredientDialog ingredient={modal.ingredient} onClose={() => setModal(null)} onSaved={saved} onExpired={expire} />
      : <StockDialog ingredient={modal.ingredient} mode={modal.kind} options={data.options} onClose={() => setModal(null)} onSaved={saved} onExpired={expire} />)}
  </>;
}

function IngredientRow({ ingredient: i, canDelete, onAction }: { ingredient: Ingredient; canDelete: boolean; onAction: (kind: "edit" | "intake" | "adjustment" | "delete") => void }) {
  const out = /^0(\.0*)?$/.test(i.quantity);
  return <tr className="hover:bg-muted/25">
    <th scope="row" className="px-6 py-5 font-normal"><div className="flex items-center gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Leaf className="size-5" /></div><div className="min-w-40"><p className="max-w-64 break-words font-semibold">{i.name}</p><p className="mt-1 text-xs text-muted-foreground">{categoryLabels[i.category]}</p></div></div></th>
    <td className="px-4 py-5"><p className="whitespace-nowrap font-semibold tabular-nums">{formatQuantity(i.quantity)} <span className="font-normal text-muted-foreground">{unitLabels[i.unit]}</span></p><p className="mt-1 whitespace-nowrap text-xs text-muted-foreground">Min. {formatQuantity(i.minimumStock)} {unitLabels[i.unit]}</p></td>
    <td className="px-4 py-5"><span className="whitespace-nowrap rounded-md bg-muted px-2 py-1 text-xs">{storageLabels[i.storageLocation]}</span></td>
    <td className="px-4 py-5"><span className={`whitespace-nowrap text-xs ${i.expiredStock ? "font-medium text-destructive" : "text-muted-foreground"}`}>{i.nextExpiryDate ? new Date(`${i.nextExpiryDate}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "No expiry recorded"}</span>{i.expiredStock && <p className="mt-1 text-xs text-destructive">Expired stock</p>}</td>
    <td className="px-4 py-5"><span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${out ? "bg-destructive/10 text-destructive" : i.lowStock ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}><span className="size-1.5 rounded-full bg-current" />{out ? "Out of stock" : i.lowStock ? "Low stock" : "In stock"}</span></td>
    <td className="px-4 py-5"><div className="flex items-center justify-end gap-1"><Button variant="outline" className="h-9" aria-label={`Receive stock for ${i.name}`} onClick={() => onAction("intake")}><ArrowDownToLine className="size-4" /><span>Receive</span></Button><Button variant="ghost" size="icon-lg" aria-label={`Adjust stock for ${i.name}`} title="Adjust stock" onClick={() => onAction("adjustment")}><SlidersHorizontal /></Button><Button variant="ghost" size="icon-lg" aria-label={`Edit ${i.name}`} title="Edit ingredient" onClick={() => onAction("edit")}><Pencil /></Button>{canDelete && <Button variant="ghost" size="icon-lg" className="text-muted-foreground hover:text-destructive" aria-label={`Delete ${i.name}`} title="Delete ingredient" onClick={() => onAction("delete")}><Trash2 /></Button>}</div></td>
  </tr>;
}

function Metric({ title, value, icon, note, warning }: { title: string; value?: number; icon: ReactNode; note: string; warning?: boolean }) {
  return <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-muted-foreground sm:text-sm">{title}</p><span className={warning ? "text-warning" : "text-primary"}>{icon}</span></div><p className={`mt-4 text-3xl font-semibold tracking-tight tabular-nums ${warning && value ? "text-warning" : ""}`}>{value ?? "—"}</p><p className="mt-2 text-[11px] text-muted-foreground sm:text-xs">{note}</p></div>;
}

function IngredientMobileCard({ ingredient: i, canDelete, onAction }: { ingredient: Ingredient; canDelete: boolean; onAction: (kind: "edit" | "intake" | "adjustment" | "delete") => void }) {
  const out = /^0(\.0*)?$/.test(i.quantity);
  return <article className="space-y-4 p-5">
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words font-semibold">{i.name}</h3><p className="mt-1 text-xs text-muted-foreground">{categoryLabels[i.category]}</p></div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${out ? "bg-destructive/10 text-destructive" : i.lowStock ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>{out ? "Out of stock" : i.lowStock ? "Low stock" : "In stock"}</span>
    </div>
    <div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-lg font-semibold tabular-nums">{formatQuantity(i.quantity)} <span className="text-sm font-normal text-muted-foreground">{unitLabels[i.unit]}</span></p><p className="mt-1 text-xs text-muted-foreground">Min. {formatQuantity(i.minimumStock)} {unitLabels[i.unit]}</p></div><div className="text-right"><p className="text-xs">{storageLabels[i.storageLocation]}</p><p className={`mt-2 text-xs ${i.expiredStock ? "text-destructive" : "text-muted-foreground"}`}>{i.nextExpiryDate ? `${i.expiredStock ? "Expired" : "Expires"} ${new Date(`${i.nextExpiryDate}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}` : "No expiry recorded"}</p></div></div>
    <div className="flex flex-wrap items-center gap-1.5"><Button variant="outline" className="h-10 px-3" aria-label={`Receive stock for ${i.name}`} onClick={() => onAction("intake")}><ArrowDownToLine />Receive</Button><Button variant="outline" className="h-10 px-3" aria-label={`Adjust stock for ${i.name}`} onClick={() => onAction("adjustment")}><SlidersHorizontal />Adjust</Button><Button variant="ghost" size="icon-lg" aria-label={`Edit ${i.name}`} onClick={() => onAction("edit")}><Pencil /></Button>{canDelete && <Button variant="ghost" size="icon-lg" aria-label={`Delete ${i.name}`} onClick={() => onAction("delete")}><Trash2 /></Button>}</div>
  </article>;
}

function StateCard({ icon, title, description, children }: { icon: ReactNode; title: string; description: string; children?: ReactNode }) {
  return <div className="flex flex-col items-center px-5 py-16 text-center" role="status"><span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">{icon}</span><h2 className="text-lg font-semibold">{title}</h2><p className="mt-2 mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>{children}</div>;
}
