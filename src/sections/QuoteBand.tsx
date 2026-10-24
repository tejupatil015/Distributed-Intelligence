import type { Category } from "../data/categories";
import { Marquee } from "../components/ui";

export function QuoteBand({ cat }: { cat: Category }) {
  return (
    <section className="quote" data-nav-theme="dark">
      <Marquee
        text="DISTRIBUTED INTELLIGENCE"
        accent="·"
        dur={46}
        className="quote__marquee"
      />

      <div className="quote__inner">
        <blockquote className="h2 quote__text" data-lines>
          {cat.pull.text}
        </blockquote>

        <div className="attrib" data-up>
          <span className="attrib__name">{cat.pull.name}</span>
          <span className="attrib__src">{cat.pull.source}</span>
        </div>
      </div>
    </section>
  );
}