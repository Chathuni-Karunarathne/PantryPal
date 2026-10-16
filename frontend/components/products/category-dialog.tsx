"use client";

import { useRef, useState, type FormEvent } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductError, productRequest } from "@/lib/products/client";
import type { ProductCategory } from "@/lib/products/types";

export function CategoryDialog({ categories: initial, onClose, onChanged, onExpired }: {
  categories: ProductCategory[]; onClose: () => void; onChanged: () => void; onExpired: () => void;
}) {
  const [categories, setCategories] = useState(initial);
  const [editing, setEditing] = useState<ProductCategory | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving.current) return;
    saving.current = true; setBusy(true); setError(""); setSuccess("");
    try {
      const category = await productRequest<ProductCategory>(editing ? `categories/${editing.id}` : "categories", {
        method: editing ? "PUT" : "POST", body: { name: name.trim() },
      });
      setCategories((current) => [...current.filter((c) => c.id !== category.id), category].sort((a, b) => a.name.localeCompare(b.name)));
      setSuccess(editing ? "Category updated." : "Category added."); setEditing(null); setName(""); onChanged();
    } catch (caught) {
      if (caught instanceof ProductError && caught.status === 401) onExpired();
      setError(caught instanceof ProductError ? caught.message : "We couldn't save this category. Please try again.");
    } finally { saving.current = false; setBusy(false); }
  }
  return <Dialog open onOpenChange={(open) => { if (!open && !saving.current) onClose(); }}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto p-6 sm:max-w-lg" showCloseButton={!busy}>
      <DialogHeader><DialogTitle>Product categories</DialogTitle><DialogDescription>Organize your menu with categories that suit your kitchen.</DialogDescription></DialogHeader>
      <ul className="max-h-60 space-y-1 overflow-y-auto">{categories.map((c) => <li key={c.id} className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2"><span className="break-words text-sm">{c.name}</span><Button variant="ghost" size="icon" disabled={busy} aria-label={`Edit category ${c.name}`} onClick={() => { setEditing(c); setName(c.name); setError(""); setSuccess(""); }}><Pencil className="size-4" /></Button></li>)}</ul>
      {!categories.length && <p className="text-sm text-muted-foreground">Add your first category below.</p>}
      <form onSubmit={(event) => void submit(event)} className="space-y-3" aria-busy={busy}>
        <label htmlFor="category-name" className="text-sm font-medium">{editing ? "Edit category name" : "New category name"}</label>
        <Input id="category-name" required maxLength={120} value={name} disabled={busy} onChange={(event) => setName(event.target.value)} aria-describedby={error ? "category-error" : undefined} />
        {error && <p id="category-error" role="alert" className="text-sm text-destructive">{error}</p>}
        {success && <p role="status" className="text-sm text-success">{success}</p>}
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={busy} onClick={() => { if (editing) { setEditing(null); setName(""); setError(""); } else onClose(); }}>{editing ? "Cancel edit" : "Done"}</Button><Button type="submit" disabled={busy}>{!editing && <Plus className="size-4" />}{busy ? "Saving…" : editing ? "Save category" : "Add category"}</Button></div>
      </form>
    </DialogContent>
  </Dialog>;
}
