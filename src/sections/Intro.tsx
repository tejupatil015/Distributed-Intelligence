import type { Category } from "../data/categories";
import { Img } from "../components/ui";

export function Intro({ cat }: { cat: Category }) {
  return (
    <section className="intro sec-pad" data-nav-theme="dark">
      <span
        className="hairline"
        data-hair
        style={{ color: "var(--c)" }}
      />

      <h2 className="h2 intro__title" data-lines>
        Understand Your Distributed System
      </h2>

      <p className="intro__body" data-lines>
        {cat.blurb}
      </p>

      <div className="intro__media">
        <figure className="intro__fig ph" data-parallax="8">
          <div className="intro__fig-inner" data-parallax-inner>
            <Img src={cat.cover} alt={cat.name} />
          </div>
        </figure>

        <div className="intro__cap" data-up>
          <span className="label">(01) System Intelligence</span>
          <p>{cat.heroTitle}</p>
        </div>
      </div>
    </section>
  );
}