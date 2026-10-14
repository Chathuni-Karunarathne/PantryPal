"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InventoryField } from "./inventory-field";
import { InventoryError, inventoryRequest } from "@/lib/inventory/client";
import { categoryLabels, storageLabels, unitLabels, type Ingredient, type InventoryOptions } from "@/lib/inventory/types";

export function IngredientDialog({ ingredient, options, onClose, onSaved, onExpired }: {
  ingredient?: Ingredient; options: InventoryOptions; onClose: () => void; onSaved: (message: string) => void; onExpired: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [initialQuantity, setInitialQuantity] = useState("0");
  const [unit, setUnit] = useState(ingredient?.unit ?? "KG");

  const invalid = (field: string) => ({ "aria-invalid": Boolean(fields[field]), "aria-describedby": fields[field] ? `${field}-error` : undefined });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving.current) return;
    const data = new FormData(event.currentTarget);
    const metadata = { name: String(data.get("name")).trim(), category: data.get("category"), unit,
      storageLocation: data.get("storageLocation"), minimumStock: data.get("minimumStock") };
    saving.current = true; setBusy(true); setError(""); setFields({});
    try {
      await inventoryRequest(ingredient ? `ingredients/${ingredient.id}` : "ingredients", {
        method: ingredient ? "PUT" : "POST",
        body: ingredient ? metadata : { ingredient: metadata, initialQuantity, expiryDate: data.get("expiryDate") || null },
      });
      onSaved(ingredient ? "Ingredient details updated." : "Ingredient added to your inventory.");
    } catch (caught) {
      if (caught instanceof InventoryError) {
        if (caught.status === 401) onExpired();
        setFields(caught.fieldErrors); setError(caught.message);
      } else setError("We couldn't confirm the change. Refresh inventory before trying again.");
    } finally { saving.current = false; setBusy(false); }
  }

  return <Dialog open onOpenChange={(open) => { if (!open && !saving.current) onClose(); }}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto p-6 sm:max-w-lg" showCloseButton={!busy}>
      <DialogHeader><DialogTitle className="text-xl">{ingredient ? "Edit ingredient" : "Add an ingredient"}</DialogTitle>
        <DialogDescription>{ingredient ? "Keep your ingredient details up to date. Use stock actions to change quantities." : "Set up an ingredient and its opening stock. You can receive more stock at any time."}</DialogDescription>
      </DialogHeader>
      <form onSubmit={(event) => void submit(event)} className="space-y-5" aria-busy={busy}>
        <fieldset disabled={busy} className="space-y-5">
          <InventoryField id="name" label="Ingredient name" error={fields.name}>
            <Input id="name" name="name" className="h-10" required maxLength={120} defaultValue={ingredient?.name} placeholder="e.g. All-purpose flour" autoFocus {...invalid("name")} />
          </InventoryField>
          <InventoryField id="category" label="Category" error={fields.category}>
            <Select id="category" name="category" defaultValue={ingredient?.category ?? "FLOUR_AND_GRAINS"} {...invalid("category")}>
              {options.categories.map((category) => <option key={category} value={category}>{categoryLabels[category]}</option>)}
            </Select>
          </InventoryField>
          <div className="grid gap-4 sm:grid-cols-2">
            <InventoryField id="unit" label="Stock unit" error={fields.unit} hint={ingredient ? "Fixed to keep quantities and history consistent." : "All stock is stored in this unit."}>
              <Select id="unit" value={unit} onChange={(event) => setUnit(event.target.value as typeof unit)} disabled={Boolean(ingredient)} {...invalid("unit")}>
                {options.units.map((unit) => <option key={unit} value={unit}>{unitLabels[unit]}</option>)}
              </Select>
            </InventoryField>
            <InventoryField id="storageLocation" label="Storage location" error={fields.storageLocation}>
              <Select id="storageLocation" name="storageLocation" defaultValue={ingredient?.storageLocation ?? "PANTRY"} {...invalid("storageLocation")}>
                {options.storageLocations.map((location) => <option key={location} value={location}>{storageLabels[location]}</option>)}
              </Select>
            </InventoryField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <InventoryField id="minimumStock" label={`Minimum stock (${unitLabels[unit]})`} error={fields.minimumStock} hint="A warning appears when stock falls below this level.">
              <Input id="minimumStock" name="minimumStock" className="h-10" type="number" min="0" max="9999999999999.999999" step="0.000001" required defaultValue={ingredient?.minimumStock ?? "0"} {...invalid("minimumStock")} />
            </InventoryField>
            {!ingredient && <InventoryField id="initialQuantity" label={`Opening stock (${unitLabels[unit]})`} error={fields.initialQuantity}>
              <Input id="initialQuantity" name="initialQuantity" className="h-10" type="number" min="0" max="9999999999999.999999" step="0.000001" required value={initialQuantity} onChange={(event) => setInitialQuantity(event.target.value)} {...invalid("initialQuantity")} />
            </InventoryField>}
          </div>
          {!ingredient && <InventoryField id="expiryDate" label="Opening stock expiry (optional)" error={fields.expiryDate}>
            <Input id="expiryDate" name="expiryDate" className="h-10" type="date" min={new Date().toISOString().slice(0, 10)} disabled={!initialQuantity || /^0(\.0*)?$/.test(initialQuantity)} {...invalid("expiryDate")} />
          </InventoryField>}
        </fieldset>
        {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" className="h-10 px-4" disabled={busy} onClick={onClose}>Cancel</Button>
          <Button type="submit" className="h-10 px-4" disabled={busy}>{busy ? "Saving…" : ingredient ? "Save changes" : "Add ingredient"}</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}
