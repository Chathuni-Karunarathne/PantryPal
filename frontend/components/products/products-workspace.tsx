"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, LayoutDashboard, Leaf, LogOut, Package, Pencil, Plus, RefreshCw, Search, Tags } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { PantryPalLogo } from "@/components/brand/pantrypal-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatQuantity } from "@/lib/inventory/types";
import { ProductError, productRequest } from "@/lib/products/client";
import type { Product, ProductCategory, ProductOverview, ProductPage } from "@/lib/products/types";
import { ProductDialog } from "./product-dialog";
import { CategoryDialog } from "./category-dialog";
import { RecipeDialog } from "./recipe-dialog";

type Modal = { kind: "add" } | { kind: "categories" } | { kind: "edit" | "recipe" | "availability"; product: Product };

export function ProductsWorkspace() {
  const auth = useAuth();
  const router = useRouter();
  const [logoutError, setLogoutError] = useState("");
  useEffect(() => { if (auth.status === "anonymous") router.replace("/login"); }, [auth.status, router]);
  async function logout() {
    setLogoutError("");
    try { await auth.logout(); router.replace("/login"); router.refresh(); }
    catch { setLogoutError("We couldn't sign you out. Please try again."); }
  }
  return <div className="min-h-dvh lg:pl-64">
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-card px-5 py-8 lg:flex">
      <Link href="/dashboard" aria-label="PantryPal workspace"><PantryPalLogo /></Link>
      <p className="mt-3 pl-1 text-xs text-muted-foreground">A little order. A lot of possibility.</p>
      <p className="mt-12 px-3 text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">Your workspace</p>
      <nav className="mt-3 space-y-2" aria-label="Workspace navigation">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground hover:bg-muted"><LayoutDashboard className="size-4" />Workspace</Link>
        {auth.user?.role !== "ORDER_STAFF" && <Link href="/inventory" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground hover:bg-muted"><Package className="size-4" />Inventory</Link>}
        <Link href="/products" aria-current="page" className="flex items-center gap-3 rounded-xl bg-primary/10 px-3 py-3 text-sm font-semibold text-primary"><BookOpen className="size-4" />Products & recipes</Link>
      </nav>
      <div className="mt-auto rounded-2xl border bg-background p-4"><Leaf className="mb-3 size-5 text-primary" /><p className="text-sm font-medium">Made with a little care.</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Keep your menu and recipes together, ready for your next creation.</p></div>
    </aside>
    <header className="border-b bg-card/80 px-4 py-4 sm:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
      <div className="lg:hidden"><Link href="/dashboard" aria-label="PantryPal workspace"><PantryPalLogo /></Link></div>
      <p className="hidden text-sm text-muted-foreground lg:block">Workspace <span className="mx-2 text-border">/</span><span className="font-medium text-foreground">Products & recipes</span></p>
      <div className="flex items-center gap-2 sm:gap-4"><ThemeToggle />{auth.user && <><div className="hidden text-right sm:block"><p className="text-sm font-medium">{auth.user.name}</p><p className="text-xs text-muted-foreground">{auth.user.role.replace(/_/g, " ").toLowerCase()}</p></div><Button variant="ghost" size="icon-lg" aria-label="Sign out" disabled={auth.status === "logging-out"} onClick={() => void logout()}><LogOut className="size-4" /></Button></>}</div>
    </div></header>
    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-8 sm:py-10">
      <nav aria-label="Mobile workspace navigation" className="mb-6 flex flex-wrap gap-2 lg:hidden"><Button asChild variant="outline"><Link href="/dashboard">Workspace</Link></Button>{auth.user?.role !== "ORDER_STAFF" && <Button asChild variant="outline"><Link href="/inventory">Inventory</Link></Button>}<Button asChild variant="secondary"><Link href="/products" aria-current="page">Products & recipes</Link></Button></nav>
      {logoutError && <p role="alert" className="mb-5 text-sm text-destructive">{logoutError}</p>}
      {auth.status === "error" ? <div role="alert" className="rounded-2xl border bg-card p-8"><p className="mb-4">{auth.message}</p><Button onClick={() => void auth.restore()}>Try again</Button></div>
        : auth.status === "authenticated" && auth.user ? <ProductsContent key={auth.user.id} canManage={["OWNER_ADMIN", "MANAGER"].includes(auth.user.role)} />
        : <p role="status" className="py-12 text-center text-muted-foreground">{auth.status === "logging-out" ? "Signing out…" : "Checking your session securely…"}</p>}
    </main>
  </div>;
}

function ProductsContent({ canManage }: { canManage: boolean }) {
  const { restore } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [active, setActive] = useState("");
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState<{ list: ProductPage; categories: ProductCategory[]; overview: ProductOverview } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modal, setModal] = useState<Modal | null>(null);
  const expire = useCallback(() => { void restore(); router.replace("/login"); }, [restore, router]);
  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(0); }, 250);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError("");
      const query = new URLSearchParams({ page: String(page), size: "24" });
      if (debouncedSearch.trim()) query.set("search", debouncedSearch.trim());
      if (category) query.set("categoryId", category);
      if (active) query.set("active", active);
      try {
        const [list, categories, overview] = await Promise.all([
          productRequest<ProductPage>(`?${query}`, { signal: controller.signal }),
          productRequest<ProductCategory[]>("categories", { signal: controller.signal }),
          productRequest<ProductOverview>("overview", { signal: controller.signal }),
        ]);
        if (!controller.signal.aborted) setData({ list, categories, overview });
      } catch (caught) {
        if (controller.signal.aborted) return;
        if (caught instanceof ProductError && caught.status === 401) expire();
        setError(caught instanceof ProductError ? caught.message : "We couldn't load your products. Please try again.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [debouncedSearch, category, active, page, revision, expire]);
  function resetFilters() { setSearch(""); setDebouncedSearch(""); setCategory(""); setActive(""); setPage(0); }
  function saved(message: string) { setModal(null); setSuccess(message); setRevision((value) => value + 1); }
  const filtered = Boolean(search || category || active);
  const metrics = [
    { title: "Total products", value: data?.overview.totalProducts, icon: Package, note: "Across your menu" },
    { title: "Active products", value: data?.overview.activeProducts, icon: Check, note: "Available for ordering" },
    { title: "Recipes", value: data?.overview.recipes, icon: BookOpen, note: "Your kitchen’s knowledge" },
    { title: "Categories", value: data?.categories.length, icon: Tags, note: "Organized your way" },
  ];
  return <>
    <div className="mb-7 flex flex-col justify-between gap-5 sm:mb-9 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-semibold tracking-[0.2em] text-primary uppercase">Your menu, thoughtfully organized</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Products & recipes</h1><p className="mt-3 text-sm text-muted-foreground">Every kitchen favorite, with the recipe that makes it yours.</p></div>
      {canManage && <div className="flex flex-wrap gap-2"><Button variant="outline" className="h-11" disabled={!data || loading || Boolean(error)} onClick={() => setModal({ kind: "categories" })}><Tags className="size-4" />Categories</Button><Button className="h-11 px-5" disabled={!data || loading || Boolean(error)} onClick={() => setModal({ kind: "add" })}><Plus className="size-4" />Add product</Button></div>}
    </div>
    {success && <div role="status" className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"><span>{success}</span><Button variant="ghost" size="sm" onClick={() => setSuccess("")}>Dismiss</Button></div>}
    <section aria-label="Product overview" className="mb-7 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">{metrics.map(({ title, value, icon: Icon, note }) => <div key={title} className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-muted-foreground sm:text-sm">{title}</p><Icon className="size-5 text-primary" /></div><p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">{value ?? "—"}</p><p className="mt-2 text-xs text-muted-foreground">{note}</p></div>)}</section>
    <section aria-label="Product catalogue" className="overflow-hidden rounded-2xl border bg-card shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-5 sm:px-6"><div><h2 className="text-lg font-semibold">Your products</h2><p className="mt-1 text-xs text-muted-foreground">A recipe for every creation.</p></div><Button variant="outline" className="h-9" disabled={loading} onClick={() => setRevision((value) => value + 1)}><RefreshCw className="size-4" />Refresh</Button></div>
      <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:flex-wrap sm:px-6"><div className="relative min-w-0 flex-1 sm:min-w-52"><Search className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" /><Input aria-label="Search products" className="h-10 pl-9" maxLength={120} placeholder="Search your menu…" value={search} onChange={(e) => setSearch(e.target.value)} /></div><Select aria-label="Filter by product category" className="sm:w-52" value={category} onChange={(e) => { setCategory(e.target.value); setPage(0); }}><option value="">All categories</option>{data?.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select><Select aria-label="Filter by availability" className="sm:w-40" value={active} onChange={(e) => { setActive(e.target.value); setPage(0); }}><option value="">All statuses</option><option value="true">Active</option><option value="false">Inactive</option></Select>{filtered && <Button variant="ghost" onClick={resetFilters}>Clear filters</Button>}</div>
      {error ? <div role="alert" className="space-y-4 px-5 py-14 text-center"><h3 className="text-lg font-semibold">Products could not be loaded</h3><p className="text-sm text-muted-foreground">{error}</p><Button onClick={() => setRevision((value) => value + 1)}>Try again</Button></div>
        : loading ? <div role="status" className="space-y-3 px-6 py-8"><p className="text-sm text-muted-foreground">Loading your products…</p>{[0, 1, 2].map((key) => <div key={key} className="h-28 rounded-xl bg-muted" />)}</div>
        : data?.list.items.length ? <>
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">{data.list.items.map((product) => <article key={product.id} className="flex min-w-0 flex-col rounded-xl border bg-background/40 p-5">
            <div className="mb-4 flex items-start justify-between gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><BookOpen className="size-5" /></span><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${product.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>{product.active ? "Active" : "Inactive"}</span></div>
            <p className="text-xs text-muted-foreground">{product.categoryName}</p><h3 className="mt-1 break-words text-lg font-semibold">{product.name}</h3><p className="mt-2 line-clamp-3 break-words text-sm leading-relaxed text-muted-foreground">{product.description || "No description added."}</p><p className="mt-4 text-lg font-semibold tabular-nums" aria-label={`Selling price ${product.sellingPrice}`}>{formatQuantity(product.sellingPrice)} <span className="text-xs font-normal text-muted-foreground">selling price</span></p>
            <p className={`mt-2 text-xs ${product.hasRecipe ? "text-primary" : "text-muted-foreground"}`}>{product.hasRecipe ? "Recipe saved" : "No recipe yet"}</p>
            {canManage && <div className="mt-5 flex flex-wrap gap-2 border-t pt-4"><Button variant="outline" className="h-9" aria-label={`Recipe for ${product.name}`} onClick={() => setModal({ kind: "recipe", product })}><BookOpen className="size-4" />{product.hasRecipe ? "View recipe" : "Add recipe"}</Button><Button variant="ghost" size="icon" aria-label={`Edit ${product.name}`} onClick={() => setModal({ kind: "edit", product })}><Pencil className="size-4" /></Button><Button variant="ghost" className="h-9 px-2 text-xs" aria-label={`${product.active ? "Deactivate" : "Activate"} ${product.name}`} onClick={() => setModal({ kind: "availability", product })}>{product.active ? "Deactivate" : "Activate"}</Button></div>}
          </article>)}</div>
          <div className="flex items-center justify-between gap-3 border-t px-5 py-4 text-xs text-muted-foreground"><p>{page * data.list.size + 1}–{Math.min((page + 1) * data.list.size, data.list.totalElements)} of {data.list.totalElements} products</p><div className="flex items-center gap-2"><Button variant="outline" size="icon" aria-label="Previous page" disabled={!page} onClick={() => setPage((value) => value - 1)}><ArrowLeft /></Button><span>{page + 1} / {Math.max(1, data.list.totalPages)}</span><Button variant="outline" size="icon" aria-label="Next page" disabled={page + 1 >= data.list.totalPages} onClick={() => setPage((value) => value + 1)}><ArrowRight /></Button></div></div>
        </> : <div role="status" className="px-5 py-16 text-center"><BookOpen className="mx-auto mb-4 size-10 text-primary" /><h3 className="text-lg font-semibold">{filtered ? "No products match your filters" : "Your next favorite starts here"}</h3><p className="mx-auto mt-2 mb-6 max-w-md text-sm text-muted-foreground">{filtered ? "Try a different name, category, or availability." : canManage ? "Add your first product, then bring it to life with a recipe from your inventory." : "Your kitchen’s products will appear here when an owner or manager adds them."}</p>{filtered ? <Button onClick={resetFilters}>Clear filters</Button> : canManage && <Button onClick={() => setModal({ kind: "add" })}>Add your first product</Button>}</div>}
    </section>
    {!canManage && <p className="mt-4 text-xs text-muted-foreground">Owners and managers maintain product details, availability, and recipes.</p>}
    {modal && data && (modal.kind === "add" || modal.kind === "edit" ? <ProductDialog product={modal.kind === "edit" ? modal.product : undefined} categories={data.categories} onClose={() => setModal(null)} onSaved={saved} onExpired={expire} />
      : modal.kind === "categories" ? <CategoryDialog categories={data.categories} onClose={() => setModal(null)} onChanged={() => setRevision((value) => value + 1)} onExpired={expire} />
      : modal.kind === "recipe" ? <RecipeDialog product={modal.product} onClose={() => setModal(null)} onSaved={saved} onExpired={expire} />
      : <AvailabilityDialog product={modal.product} onClose={() => setModal(null)} onSaved={saved} onExpired={expire} />)}
  </>;
}

function AvailabilityDialog({ product, onClose, onSaved, onExpired }: { product: Product; onClose: () => void; onSaved: (message: string) => void; onExpired: () => void }) {
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [error, setError] = useState("");
  async function save() {
    if (saving.current) return;
    saving.current = true; setBusy(true); setError("");
    try {
      await productRequest(`${product.id}/availability`, { method: "PUT", body: { active: !product.active } });
      onSaved(product.active ? "Product deactivated. Its recipe and history are retained." : "Product is active again.");
    } catch (caught) {
      if (caught instanceof ProductError && caught.status === 401) onExpired();
      setError(caught instanceof Error ? caught.message : "We couldn't confirm this change. Refresh products.");
    } finally { saving.current = false; setBusy(false); }
  }
  return <Dialog open onOpenChange={(open) => { if (!open && !saving.current) onClose(); }}><DialogContent showCloseButton={!busy}><DialogHeader><DialogTitle>{product.active ? "Deactivate" : "Activate"} product?</DialogTitle><DialogDescription className="break-words">{product.active ? `${product.name} will become unavailable for new orders. Its recipe and history are retained.` : `${product.name} will become available for ordering.`}</DialogDescription></DialogHeader>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<div className="flex justify-end gap-2"><Button variant="outline" disabled={busy} onClick={onClose}>Cancel</Button><Button disabled={busy} onClick={() => void save()}>{busy ? "Saving…" : product.active ? "Deactivate product" : "Activate product"}</Button></div></DialogContent></Dialog>;
}
