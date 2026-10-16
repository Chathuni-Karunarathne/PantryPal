"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InventoryField as Field } from "@/components/inventory/inventory-field";
import { ProductError, productRequest } from "@/lib/products/client";
import type { Product, ProductCategory } from "@/lib/products/types";

export function ProductDialog({ product, categories, onClose, onSaved, onExpired }: {
  product?: Product; categories: ProductCategory[]; onClose: () => void; onSaved: (message: string) => void; onExpired: () => void;
}) {
  const saving = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const invalid = (field: string) => ({ "aria-invalid": Boolean(fields[field]), "aria-describedby": fields[field] ? `${field}-error` : undefined });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving.current) return;
    const data = new FormData(event.currentTarget);
    saving.current = true; setBusy(true); setError(""); setFields({});
    try {
      await productRequest(product?.id ?? "", {
        method: product ? "PUT" : "POST",
        body: { name: String(data.get("name")).trim(), description: String(data.get("description")).trim(),
          categoryId: data.get("categoryId"), sellingPrice: data.get("sellingPrice"), active: data.get("active") === "true" },
      });
      onSaved(product ? "Product details updated." : "Product added. Open its recipe to add ingredients.");
    } catch (caught) {
      if (caught instanceof ProductError) {
        if (caught.status === 401) onExpired();
        setFields(caught.fieldErrors); setError(caught.message);
      } else setError("We couldn't confirm the change. Refresh products before trying again.");
    } finally { saving.current = false; setBusy(false); }
  }

  return <Dialog open onOpenChange={(open) => { if (!open && !saving.current) onClose(); }}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto p-6 sm:max-w-lg" showCloseButton={!busy}>
      <DialogHeader><DialogTitle className="text-xl">{product ? "Edit product" : "Add a product"}</DialogTitle>
        <DialogDescription>Set up your menu details. Manage ingredients and yield in the product’s recipe.</DialogDescription></DialogHeader>
      <form onSubmit={(event) => void submit(event)} className="space-y-5" aria-busy={busy}>
        <fieldset disabled={busy} className="space-y-5">
          <Field id="name" label="Product name" error={fields.name}><Input id="name" name="name" className="h-10" required maxLength={120} defaultValue={product?.name} placeholder="e.g. Butter Cake (1 kg)" autoFocus {...invalid("name")} /></Field>
          <Field id="description" label="Description (optional)" error={fields.description}>
            <textarea id="description" name="description" rows={3} maxLength={2000} defaultValue={product?.description} className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" {...invalid("description")} />
          </Field>
          <Field id="categoryId" label="Category" error={fields.categoryId}>
            <Select id="categoryId" name="categoryId" required defaultValue={product?.categoryId ?? ""} {...invalid("categoryId")}><option value="" disabled>Choose a category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="sellingPrice" label="Selling price" error={fields.sellingPrice}><Input id="sellingPrice" name="sellingPrice" className="h-10" type="number" min="0" max="9999999999.99" step="0.01" required defaultValue={product?.sellingPrice} {...invalid("sellingPrice")} /></Field>
            <Field id="active" label="Availability" error={fields.active}><Select id="active" name="active" defaultValue={String(product?.active ?? true)} {...invalid("active")}><option value="true">Active</option><option value="false">Inactive</option></Select></Field>
          </div>
        </fieldset>
        {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" disabled={busy} onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy || !categories.length}>{busy ? "Saving…" : product ? "Save changes" : "Add product"}</Button></div>
      </form>
    </DialogContent>
  </Dialog>;
}
