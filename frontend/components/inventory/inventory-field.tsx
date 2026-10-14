import type { ReactNode } from "react";

export function InventoryField({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return <div className="space-y-2">
    <label className="block text-sm font-medium" htmlFor={id}>{label}</label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    {error && <p id={`${id}-error`} role="alert" className="text-xs text-destructive">{error}</p>}
  </div>;
}
