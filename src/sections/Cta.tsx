import type { Category } from "../data/categories";
import { useSite } from "../context/SiteContext";
import { Arrow } from "../components/ui";

export function Cta({ cat }: { cat: Category }) {
  const { openContact } = useSite();

  return (
    <section className="cta" data-nav-theme="light">
      <span className="hairline" data-hair />
      <h2 className="h2" data-lines>
        {cat.cta}
      </h2>
      <button
        type="button"
        className="u-link"
        data-up
        data-cursor="Inquire"
        onClick={() => openContact(cat.slug)}
      >
        Book a private viewing <Arrow />
      </button>
    </section>
  );
}
