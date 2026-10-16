"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InventoryField as Field } from "@/components/inventory/inventory-field";
import { InventoryError, inventoryRequest } from "@/lib/inventory/client";
import { compatibleUnits, formatQuantity, unitLabels, type Ingredient, type IngredientPage, type MeasurementUnit } from "@/lib/inventory/types";
import { ProductError, productRequest } from "@/lib/products/client";
import type { Product, Recipe } from "@/lib/products/types";

type DraftLine = { key: string; ingredientId: string; quantity: string; unit: MeasurementUnit };
const units: MeasurementUnit[] = ["G", "KG", "ML", "L", "PCS"];

export function RecipeDialog({ product, onClose, onSaved, onExpired }: {
  product: Product; onClose: () => void; onSaved: (message: string) => void; onExpired: () => void;
}) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [inventory, setInventory] = useState<Ingredient[]>([]);
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [yieldQuantity, setYieldQuantity] = useState("1");
  const [yieldDescription, setYieldDescription] = useState("finished products");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError(""); setLoaded(false);
      try {
        const [savedRecipe, available] = await Promise.all([
          productRequest<Recipe>(`${product.id}/recipe`, { signal: controller.signal }).catch((caught) => {
            if (caught instanceof ProductError && caught.code === "RECIPE_NOT_FOUND") return null;
            throw caught;
          }),
          (async () => {
            const all: Ingredient[] = [];
            let page = 0;
            while (true) {
              const batch = await inventoryRequest<IngredientPage>(`ingredients?size=100&page=${page}`, { signal: controller.signal });
              all.push(...batch.items);
              if (++page >= batch.totalPages) return all;
            }
          })(),
        ]);
        if (controller.signal.aborted) return;
        setRecipe(savedRecipe); setInventory(available); setEditing(!savedRecipe);
        setYieldQuantity(savedRecipe?.yieldQuantity ?? "1"); setYieldDescription(savedRecipe?.yieldDescription ?? "finished products");
        setLines(savedRecipe?.ingredients.map((line) => ({ key: crypto.randomUUID(), ingredientId: line.ingredientId, quantity: line.quantity, unit: line.unit }))
          ?? [{ key: crypto.randomUUID(), ingredientId: "", quantity: "", unit: "G" }]);
        setLoaded(true);
      } catch (caught) {
        if (controller.signal.aborted) return;
        if ((caught instanceof ProductError || caught instanceof InventoryError) && caught.status === 401) onExpired();
        setError(caught instanceof Error ? caught.message : "We couldn't load this recipe. Try again.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [product.id, revision, onExpired]);

  function change(key: string, patch: Partial<DraftLine>) { setLines((current) => current.map((line) => line.key === key ? { ...line, ...patch } : line)); }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving.current) return;
    if (!lines.length) { setError("Add at least one ingredient."); return; }
    if (new Set(lines.map((line) => line.ingredientId)).size !== lines.length) { setError("Use each ingredient once in the recipe."); return; }
    if (lines.some((line) => !inventory.some((i) => i.id === line.ingredientId))) { setError("Replace or remove archived ingredients before saving."); return; }
    saving.current = true; setBusy(true); setError(""); setFields({});
    try {
      await productRequest(`${product.id}/recipe`, { method: "PUT", body: {
        yieldQuantity, yieldDescription: yieldDescription.trim(), ingredients: lines.map(({ ingredientId, quantity, unit }) => ({ ingredientId, quantity, unit })),
      } });
      onSaved("Recipe saved. Inventory stock is unchanged.");
    } catch (caught) {
      if (caught instanceof ProductError) {
        if (caught.status === 401) onExpired();
        setError(caught.message); setFields(caught.fieldErrors);
      } else setError("We couldn't confirm the change. Reopen the recipe before trying again.");
    } finally { saving.current = false; setBusy(false); }
  }
  const invalid = (field: string) => ({ "aria-invalid": Boolean(fields[field]), "aria-describedby": fields[field] ? `${field}-error` : undefined });
  return <Dialog open onOpenChange={(open) => { if (!open && !saving.current) onClose(); }}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto p-5 sm:max-w-3xl sm:p-6" showCloseButton={!busy}>
      <DialogHeader><DialogTitle className="pr-6 text-xl break-words">{product.name} · Recipe</DialogTitle><DialogDescription>Define what goes into a batch and how many products it makes.</DialogDescription></DialogHeader>
      {loading ? <p role="status" className="py-10 text-center text-muted-foreground">Loading recipe and inventory ingredients…</p>
        : !loaded ? <div role="alert" className="space-y-4"><p className="text-destructive">{error}</p><Button onClick={() => setRevision((value) => value + 1)}>Try again</Button></div>
        : !editing && recipe ? <>
          <div className="rounded-xl bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Recipe yield</p><p className="mt-1 font-semibold">{formatQuantity(recipe.yieldQuantity)} {recipe.yieldDescription}</p></div>
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Recipe ingredients and quantities for the full yield</caption><thead className="border-b text-xs text-muted-foreground"><tr><th scope="col" className="py-3">Ingredient</th><th scope="col" className="py-3 text-right">Quantity</th><th scope="col" className="py-3 pl-4">Unit</th></tr></thead><tbody className="divide-y">{recipe.ingredients.map((line) => <tr key={line.ingredientId}><th scope="row" className="py-4 pr-3 font-medium">{line.ingredientName}{line.archived && <span className="mt-1 block text-xs text-warning">Archived in inventory</span>}</th><td className="py-4 text-right tabular-nums">{formatQuantity(line.quantity)}</td><td className="py-4 pl-4">{unitLabels[line.unit]}</td></tr>)}</tbody></table></div>
          <p className="text-xs text-muted-foreground">Updated {new Date(recipe.updatedAt).toLocaleString("en-GB")}. Quantities above produce the full recipe yield.</p>
          <div className="flex justify-end gap-2 border-t pt-4"><Button variant="outline" onClick={onClose}>Close</Button><Button onClick={() => setEditing(true)}>Edit recipe</Button></div>
        </> : <form className="space-y-5" onSubmit={(event) => void submit(event)} aria-busy={busy}>
          <fieldset disabled={busy} className="min-w-0 space-y-5">
            <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
              <Field id="yieldQuantity" label="Recipe yield" error={fields.yieldQuantity} hint="Number of products made by this batch."><Input id="yieldQuantity" type="number" min="0.000001" max="9999999999999.999999" step="0.000001" required value={yieldQuantity} onChange={(e) => setYieldQuantity(e.target.value)} {...invalid("yieldQuantity")} /></Field>
              <Field id="yieldDescription" label="Yield description" error={fields.yieldDescription} hint="Use the same product size you sell."><Input id="yieldDescription" maxLength={120} required value={yieldDescription} placeholder="e.g. 1 kg cakes, muffins, or cups" onChange={(e) => setYieldDescription(e.target.value)} {...invalid("yieldDescription")} /></Field>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">Ingredients for the full batch</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">Choose from your inventory. Units are matched to each ingredient; g/kg and ml/L convert exactly.</p>
              {!inventory.length && <p role="status" className="rounded-lg bg-warning/10 p-3 text-sm text-warning">No active inventory ingredients are available. Add ingredients in Inventory before saving a recipe.</p>}
              {lines.map((line, index) => {
                const ingredient = inventory.find((i) => i.id === line.ingredientId);
                const archived = !ingredient && line.ingredientId ? recipe?.ingredients.find((i) => i.ingredientId === line.ingredientId) : null;
                const prefix = `ingredients[${index}]`;
                return <div key={line.key} className="grid min-w-0 grid-cols-[1fr_1fr_auto] items-start gap-3 rounded-xl border bg-muted/20 p-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_5rem_auto]">
                  <div className="col-span-3 min-w-0 sm:col-span-1"><Field id={`ingredient-${line.key}`} label={`Ingredient ${index + 1}`} error={fields[`${prefix}.ingredientId`]}>
                    <Select id={`ingredient-${line.key}`} required value={line.ingredientId} onChange={(e) => { const selected = inventory.find((i) => i.id === e.target.value); change(line.key, { ingredientId: e.target.value, unit: selected?.unit ?? "G" }); }} aria-invalid={Boolean(fields[`${prefix}.ingredientId`])}>
                      <option value="" disabled>Choose an ingredient</option>{archived && <option value={archived.ingredientId} disabled>{archived.ingredientName} (archived)</option>}
                      {inventory.map((i) => <option key={i.id} value={i.id} disabled={lines.some((other) => other.key !== line.key && other.ingredientId === i.id)}>{i.name} ({unitLabels[i.unit]})</option>)}
                    </Select>
                  </Field>{ingredient && <p className="mt-1.5 text-xs text-muted-foreground">Stock unit: {unitLabels[ingredient.unit]}</p>}{archived && <p role="alert" className="mt-1 text-xs text-warning">Choose an active ingredient or remove this row.</p>}</div>
                  <Field id={`quantity-${line.key}`} label="Quantity" error={fields[`${prefix}.quantity`]}><Input id={`quantity-${line.key}`} type="number" min="0.000001" max="9999999999999.999999" step="0.000001" required value={line.quantity} onChange={(e) => change(line.key, { quantity: e.target.value })} aria-label={`Quantity for ingredient ${index + 1}`} aria-invalid={Boolean(fields[`${prefix}.quantity`])} /></Field>
                  <Field id={`unit-${line.key}`} label="Unit" error={fields[`${prefix}.unit`]}><Select id={`unit-${line.key}`} value={line.unit} onChange={(e) => change(line.key, { unit: e.target.value as MeasurementUnit })} disabled={!ingredient} aria-label={`Unit for ingredient ${index + 1}`}>{compatibleUnits(ingredient?.unit ?? line.unit, units).map((u) => <option key={u} value={u}>{unitLabels[u]}</option>)}</Select></Field>
                  <Button type="button" variant="ghost" size="icon" className="mt-7" aria-label={`Remove ingredient ${index + 1}`} onClick={() => setLines((current) => current.filter((item) => item.key !== line.key))}><Trash2 className="size-4" /></Button>
                </div>;
              })}
              {fields.ingredients && <p role="alert" className="text-sm text-destructive">{fields.ingredients}</p>}
              <Button type="button" variant="outline" disabled={lines.length >= inventory.length || lines.length >= 200} onClick={() => setLines((current) => [...current, { key: crypto.randomUUID(), ingredientId: "", quantity: "", unit: "G" }])}><Plus className="size-4" />Add ingredient</Button>
            </div>
          </fieldset>
          {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <p className="text-xs text-muted-foreground">Saving a recipe leaves your stock quantities unchanged.</p>
          <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" disabled={busy} onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy || !inventory.length}>{busy ? "Saving…" : "Save recipe"}</Button></div>
        </form>}
    </DialogContent>
  </Dialog>;
}
