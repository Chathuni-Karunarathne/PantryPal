import { Leaf, MoveUpRight } from "lucide-react";
import { PantryIllustration } from "@/components/auth/pantry-illustration";

export function BrandPanel() {
  return (
    <section className="brand-panel" aria-labelledby="brand-heading">
      <div className="brand-intro">
        <p className="eyebrow brand-eyebrow">
          <span /> A FRESH PERSPECTIVE ON YOUR BUSINESS
        </p>
        <h2 id="brand-heading">
          Your kitchen.
          <br />
          In perfect <em>balance.</em>
        </h2>
        <p className="brand-description">
          From the first ingredient to the final order.
          <br className="desktop-break" /> A little intelligence, working behind
          every great day.
        </p>
      </div>
      <PantryIllustration />
      <div className="brand-footnote">
        <span className="footnote-icon">
          <Leaf size={19} />
        </span>
        <p>
          Less waste. More possibility.
          <span>Thoughtfully built for cookery &amp; bakery businesses.</span>
        </p>
        <MoveUpRight size={18} aria-hidden="true" />
      </div>
    </section>
  );
}
