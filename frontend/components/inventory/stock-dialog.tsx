"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowDownToLine, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InventoryField } from "./inventory-field";
import { InventoryError, inventoryRequest } from "@/lib/inventory/client";
import { compatibleUnits, formatQuantity, unitLabels, type Ingredient, type InventoryOptions } from "@/lib/inventory/types";

export function StockDialog({ ingredient, mode, options, onClose, onSaved, onExpired }: {
  ingredient: Ingredient; mode: "intake" | "adjustment"; options: InventoryOptions;
  onClose: () => void; onSaved: (message: string) => void; onExpired: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState("remove");
  const [unit, setUnit] = useState(ingredient.unit);
  const [quantity, setQuantity] = useState("");
  const intake = mode === "intake";
  const quantityError = fields.quantity ?? fields.quantityDelta;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving.current) return;
    const data = new FormData(event.currentTarget);
    const body = intake ? { quantity, unit, expiryDate: data.get("expiryDate") || null, reason: data.get("reason") }
      : { quantityDelta: direction === "remove" ? `-${quantity}` : quantity, unit, reason: data.get("reason") };
    saving.current = true; setBusy(true); setError(""); setFields({});
    try {
      await inventoryRequest(`ingredients/${ingredient.id}/${intake ? "intake" : "adjustments"}`, { method: "POST", body });
      onSaved(intake ? `Stock received for ${ingredient.name}.` : `Stock adjusted for ${ingredient.name}.`);
    } catch (caught) {
      if (caught instanceof InventoryError) {
        if (caught.status === 401) onExpired();
        setFields(caught.fieldErrors); setError(caught.message);
      } else setError("We couldn't confirm the change. Refresh inventory before trying again.");
    } finally { saving.current = false; setBusy(false); }
  }

  return <Dialog open onOpenChange={(open) => { if (!open && !saving.current) onClose(); }}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto p-6 sm:max-w-lg" showCloseButton={!busy}>
      <DialogHeader><DialogTitle className="flex items-center gap-2 text-xl">{intake ? <ArrowDownToLine className="size-5" /> : <SlidersHorizontal className="size-5" />}{intake ? "Receive stock" : "Adjust stock"}</DialogTitle>
        <DialogDescription>{intake ? "Record stock you have received. Confirming will add it to inventory." : "Record a correction, wastage, or a stock count difference. A reason is required."}</DialogDescription>
      </DialogHeader>
      <div className="rounded-xl border bg-muted/50 p-4"><p className="font-semibold">{ingredient.name}</p>
        <p className="mt-1 text-sm text-muted-foreground">Current stock: <span className="font-medium text-foreground">{formatQuantity(ingredient.quantity)} {unitLabels[ingredient.unit]}</span></p>
      </div>
      <form onSubmit={(event) => void submit(event)} className="space-y-5" aria-busy={busy}>
        <fieldset disabled={busy} className="space-y-5">
          {!intake && <InventoryField id="direction" label="Adjustment type">
            <Select id="direction" value={direction} onChange={(event) => setDirection(event.target.value)}>
              <option value="remove">Remove stock</option><option value="add">Add a stock correction</option>
            </Select>
          </InventoryField>}
          <div className="grid grid-cols-2 gap-4">
            <InventoryField id="quantity" label="Quantity" error={quantityError}>
              <Input id="quantity" className="h-10" type="number" min="0.000001" max="9999999999999.999999" step="0.000001" required autoFocus value={quantity} onChange={(event) => setQuantity(event.target.value)} aria-invalid={Boolean(quantityError)} aria-describedby={quantityError ? "quantity-error" : undefined} />
            </InventoryField>
            <InventoryField id="stock-unit" label="Unit" error={fields.unit}>
              <Select id="stock-unit" value={unit} onChange={(event) => setUnit(event.target.value as typeof unit)} aria-invalid={Boolean(fields.unit)} aria-describedby={fields.unit ? "stock-unit-error" : undefined}>
                {compatibleUnits(ingredient.unit, options.units).map((unit) => <option key={unit} value={unit}>{unitLabels[unit]}</option>)}
              </Select>
            </InventoryField>
          </div>
          {intake && <InventoryField id="expiryDate" label="Expiry date (optional)" error={fields.expiryDate} hint="Each receipt keeps its own expiry date.">
            <Input id="expiryDate" name="expiryDate" className="h-10" type="date" min={new Date().toISOString().slice(0, 10)} aria-invalid={Boolean(fields.expiryDate)} aria-describedby={fields.expiryDate ? "expiryDate-error" : undefined} />
          </InventoryField>}
          <InventoryField id="reason" label={intake ? "Intake note" : "Reason for adjustment"} error={fields.reason} hint={!intake && direction === "remove" ? "Stock is removed from receipts with the earliest expiry first." : undefined}>
            <Input id="reason" name="reason" className="h-10" required maxLength={500} defaultValue={intake ? "Stock received" : ""} placeholder={intake ? "e.g. Weekly delivery" : "e.g. Damaged stock or stock count correction"} aria-invalid={Boolean(fields.reason)} aria-describedby={fields.reason ? "reason-error" : undefined} />
          </InventoryField>
        </fieldset>
        {quantity && <p className="rounded-lg bg-muted p-3 text-sm">Confirm to {intake || direction === "add" ? "add" : "remove"} <strong>{quantity} {unitLabels[unit]}</strong> {intake || direction === "add" ? "to" : "from"} {ingredient.name}.</p>}
        {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" className="h-10 px-4" disabled={busy} onClick={onClose}>Cancel</Button>
          <Button type="submit" className="h-10 px-4" disabled={busy}>{busy ? "Saving…" : intake ? "Confirm stock intake" : "Confirm adjustment"}</Button></div>
      </form>
    </DialogContent>
  </Dialog>;
}
