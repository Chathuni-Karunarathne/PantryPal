"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InventoryError, inventoryRequest } from "@/lib/inventory/client";
import type { Ingredient } from "@/lib/inventory/types";

export function DeleteIngredientDialog({ ingredient, onClose, onSaved, onExpired }: {
  ingredient: Ingredient; onClose: () => void; onSaved: (message: string) => void; onExpired: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [error, setError] = useState("");
  const hasStock = !/^0(\.0*)?$/.test(ingredient.quantity);
  async function remove() {
    if (saving.current) return;
    saving.current = true; setBusy(true); setError("");
    try {
      await inventoryRequest(`ingredients/${ingredient.id}`, { method: "DELETE" });
      onSaved(`${ingredient.name} removed from inventory.`);
    } catch (caught) {
      if (caught instanceof InventoryError && caught.status === 401) onExpired();
      setError(caught instanceof InventoryError ? caught.message : "We couldn't confirm deletion. Refresh inventory before trying again.");
    } finally { saving.current = false; setBusy(false); }
  }
  return <Dialog open onOpenChange={(open) => { if (!open && !saving.current) onClose(); }}>
    <DialogContent className="p-6 sm:max-w-md" showCloseButton={!busy}>
      <DialogHeader><DialogTitle>Delete {ingredient.name}?</DialogTitle>
        <DialogDescription>{hasStock ? "This ingredient still has stock. Record a stock adjustment to bring it to zero before deleting." : "This ingredient will be removed from active inventory. Its stock history will be retained."}</DialogDescription></DialogHeader>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2"><Button variant="outline" className="h-10 px-4" disabled={busy} onClick={onClose}>Cancel</Button>
        <Button variant="destructive" className="h-10 px-4" disabled={busy || hasStock} onClick={() => void remove()}>{busy ? "Deleting…" : "Delete ingredient"}</Button></div>
    </DialogContent>
  </Dialog>;
}
