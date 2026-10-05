import {
  ArrowUpRight,
  BookOpen,
  Boxes,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

/** An editorial illustration of the product workflow, not live inventory data. */
export function PantryIllustration() {
  return (
    <div
      className="pantry-illustration"
      role="img"
      aria-label="Ingredients connect inventory, recipes, and orders. Sunday Specials help turn surplus into possibility."
    >
      <div className="illustration-scene" aria-hidden="true">
        <svg className="orbit-lines" viewBox="0 0 600 340" fill="none">
          <ellipse
            cx="300"
            cy="179"
            rx="225"
            ry="108"
            transform="rotate(-16 300 179)"
          />
          <ellipse
            cx="300"
            cy="179"
            rx="170"
            ry="150"
            transform="rotate(-16 300 179)"
          />
          <path
            d="M30 179h540M300 12v316"
            strokeDasharray="3 7"
            opacity=".45"
          />
          <circle cx="98" cy="230" r="4" className="orbit-point" />
          <circle cx="492" cy="114" r="4" className="orbit-point" />
        </svg>
        <div className="ingredient-tile">
          <span className="ingredient-index">THE GOOD AT THE CORE</span>
          <svg className="botanical" viewBox="0 0 240 200" fill="none">
            <defs>
              <linearGradient
                id="jar-glass"
                x1="65"
                y1="80"
                x2="162"
                y2="194"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="var(--illustration-glass)" stopOpacity=".18" />
                <stop
                  offset="1"
                  stopColor="var(--illustration-glass)"
                  stopOpacity=".02"
                />
              </linearGradient>
              <linearGradient
                id="leaf-fill"
                x1="130"
                y1="30"
                x2="192"
                y2="145"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="var(--illustration-leaf-start)" />
                <stop offset="1" stopColor="var(--illustration-leaf-end)" />
              </linearGradient>
            </defs>
            <ellipse
              cx="117"
              cy="181"
              rx="72"
              ry="9"
              fill="var(--illustration-shadow)"
              opacity=".35"
            />
            <path
              d="M76 83c-6 8-10 11-10 23v61c0 14 86 14 86 0v-61c0-12-4-15-10-23"
              fill="url(#jar-glass)"
              stroke="var(--illustration-outline)"
              strokeOpacity=".45"
            />
            <path
              d="M70 128c21 5 52-9 78-1v39c0 11-78 11-78 0Z"
              fill="var(--illustration-grain)"
              fillOpacity=".3"
            />
            <path
              d="M78 100v62"
              stroke="#ecf1d6"
              strokeOpacity=".4"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect
              x="72"
              y="73"
              width="74"
              height="15"
              rx="5"
              fill="#626b4d"
              stroke="#bac799"
              strokeOpacity=".5"
            />
            <path d="M80 77h58M80 82h58" stroke="#dae2bf" strokeOpacity=".25" />
            <rect x="86" y="118" width="48" height="35" rx="3" fill="#dedbc3" />
            <path
              d="M108 126v15m0-10c-7 0-8-5-8-5 6 0 8 5 8 5Zm0 5c7 0 8-5 8-5-6 0-8 5-8 5Z"
              stroke="#697252"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path d="M98 146h22" stroke="#697252" strokeOpacity=".6" />
            <path
              d="M157 175c-3-37 6-62 19-91 7-16 10-35 8-57"
              stroke="var(--illustration-stem)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M184 58c-27-2-39-19-33-36 21 4 36 15 33 36Z"
              fill="url(#leaf-fill)"
            />
            <path
              d="M179 79c5-28 20-40 39-34-2 22-17 37-39 34Z"
              fill="url(#leaf-fill)"
            />
            <path
              d="M169 106c-26-4-38-22-31-39 23 5 35 17 31 39Z"
              fill="url(#leaf-fill)"
            />
            <path
              d="M161 133c3-27 19-40 40-34-3 22-18 35-40 34Z"
              fill="url(#leaf-fill)"
            />
            <path
              d="m155 27 27 28m31-5-30 25m-41-3 25 29m29 4-31 24"
              stroke="#e2ebc3"
              strokeOpacity=".45"
              strokeLinecap="round"
            />
            <path
              d="M56 172C49 119 42 80 29 42m16 49C21 85 17 74 19 63c17 4 26 13 26 28Zm5 28c-24-6-28-17-26-28 16 4 25 13 26 28Zm-12-52c14-14 15-28 8-36-12 11-15 24-8 36Zm9 36c15-13 19-26 13-36-14 9-19 21-13 36Z"
              stroke="var(--illustration-wheat)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="m53 142 19-25M55 156l-19-14"
              stroke="var(--illustration-wheat)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <div className="ingredient-caption">
            <span>A little more connected.</span>
            <span>A lot less wasted.</span>
          </div>
        </div>
        <div className="workflow-tag tag-inventory">
          <span className="tag-icon">
            <Boxes size={17} />
          </span>
          <div>
            <span className="eyebrow">01 / INVENTORY</span>
            <strong>Know what you have.</strong>
          </div>
        </div>
        <div className="workflow-tag tag-recipes">
          <span className="tag-icon">
            <BookOpen size={17} />
          </span>
          <div>
            <span className="eyebrow">02 / RECIPES</span>
            <strong>Make every ingredient count.</strong>
          </div>
        </div>
        <div className="workflow-tag tag-orders">
          <span className="tag-icon">
            <ShoppingBag size={17} />
          </span>
          <div>
            <span className="eyebrow">03 / ORDERS</span>
            <strong>Keep it all in sync.</strong>
          </div>
        </div>
        <div className="special-tag">
          <Sparkles size={15} />
          <span>Surplus. Meet possibility.</span>
          <ArrowUpRight size={15} />
        </div>
      </div>
    </div>
  );
}
