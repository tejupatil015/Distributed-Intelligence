import type { Category } from "../data/categories";
import { Img } from "../components/ui";

export function Features({ cat }: { cat: Category }) {
  return (
    <section className="features sec-pad" data-nav-theme="dark">
      {cat.features.map((f, i) => (
        <article
          className={`frow ${i % 2 ? "frow--rev" : ""}`}
          key={f.title.join("-")}
        >
          <figure className="frow__fig ph" data-parallax="6">
            <div className="frow__fig-inner" data-parallax-inner>
              <Img src={f.image} alt="" />
            </div>
          </figure>
          <div className="frow__copy">
            <span className="label" data-up>
              ({String(i + 2).padStart(2, "0")})
            </span>
            <h3 className="h3" data-lines>
              {f.title[0]} {f.title[1]}
            </h3>
            <p data-up>{f.body}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
