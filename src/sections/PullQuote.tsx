import type { Category } from "../data/categories";

export function PullQuote({ cat }: { cat: Category }) {
  return (
    <section className="pull" data-nav-theme="dark">
      <div style={{ position: "relative", maxWidth: "inherit" }}>
        <blockquote className="h2 pull__text">
          <span className="pull__mark" aria-hidden="true">
            “
          </span>
          <span data-lines style={{ display: "block" }}>
            {cat.pull.text}”
          </span>
        </blockquote>
      </div>
      <div className="attrib" data-up>
        <span className="attrib__name">{cat.pull.name}</span>
        <span className="attrib__src">{cat.pull.source}</span>
      </div>
    </section>
  );
}
