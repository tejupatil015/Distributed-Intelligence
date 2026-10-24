import { useRef } from "react";
import type { Category } from "../data/categories";

import { useSite } from "../context/SiteContext";
import { useSectionMotion } from "../hooks/useReveal";

import { CategoryHero } from "../sections/CategoryHero";
import { Dashboard } from "../sections/Dashboard";
import { OrderTracking } from "../sections/OrderTracking";
import { Analytics } from "../sections/Analytics";
import { IntelligenceFlow } from "../sections/IntelligenceFlow";
import { Cta } from "../sections/Cta";
import { NextStrip } from "../sections/NextStrip";



export function CategoryPage({ cat }: { cat: Category }) {
  const { setNavTheme } = useSite();
  const bodyRef = useRef<HTMLDivElement>(null);

  useSectionMotion(bodyRef, setNavTheme, [cat]);

  const isDashboard = cat.name === "Dashboard";
  const isOrderTracking = cat.name === "Order Tracking";
  const isAnalytics = cat.name === "Analytics";
  const isIntelligenceFlow = cat.name === "Intelligence Flow";

  return (
    <div
      className={`page category-page category-${cat.slug}`}
      style={{
        ["--c" as string]: cat.color,
        ["--cm" as string]: cat.muted,
        ["--ph" as string]: cat.gradient,
      }}
    >
      <CategoryHero cat={cat} />

      <div ref={bodyRef} className="category-body">
        <div key={cat.slug} className="category-content">
          {isDashboard && <Dashboard cat={cat} />}

          {isOrderTracking && <OrderTracking />}

          {isAnalytics && <Analytics />}

          {isIntelligenceFlow && <IntelligenceFlow />}

          {!isDashboard &&
            !isOrderTracking &&
            !isAnalytics &&
            !isIntelligenceFlow && <Dashboard cat={cat} />}

          <Cta cat={cat} />
        </div>
      </div>

      <NextStrip cat={cat} />
    </div>
  );
}