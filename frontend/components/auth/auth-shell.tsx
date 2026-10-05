import type { ReactNode } from "react";
import { ArrowDownRight } from "lucide-react";
import { PantryPalLogo } from "@/components/brand/pantrypal-logo";
import { BrandPanel } from "@/components/auth/brand-panel";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="auth-page">
      <a className="skip-link" href="#login">
        Skip to sign in
      </a>
      <div className="ambient-light" aria-hidden="true" />
      <div className="auth-frame">
        <header className="auth-header">
          <PantryPalLogo />
          <span className="header-caption">
            INTELLIGENT INVENTORY. INSPIRED BUSINESS.
            <ArrowDownRight size={15} aria-hidden="true" />
          </span>
        </header>
        <main className="auth-main">
          <BrandPanel />
          <section className="login-panel" aria-labelledby="login-heading">
            {children}
          </section>
        </main>
        <footer className="auth-footer">
          <span>
            PantryPal <span aria-hidden="true">/</span> Made for the way you
            work.
          </span>
          <span>GOOD THINGS START WITH GOOD INGREDIENTS.</span>
        </footer>
      </div>
    </div>
  );
}
