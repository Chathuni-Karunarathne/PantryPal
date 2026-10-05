import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cn("size-10", className)}
    >
      <rect width="40" height="40" rx="12" fill="currentColor" />
      <path
        d="M12 27V13h9a6 6 0 0 1 0 12h-3v-5h3a1 1 0 1 0 0-2h-4v9z"
        fill="var(--primary-foreground)"
      />
      <path
        d="M25 9c4 0 7 2 7 6-4 0-7-2-7-6Z"
        fill="var(--primary-foreground)"
      />
    </svg>
  );
}

export function PantryPalLogo() {
  return (
    <div className="brand-logo" aria-label="PantryPal">
      <BrandMark className="text-primary" />
      <span>
        pantry<span className="font-normal">pal</span>
        <span className="brand-period">.</span>
      </span>
    </div>
  );
}
