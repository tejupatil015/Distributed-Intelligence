import { useRef } from "react";
import { nextOf, type Category } from "../data/categories";
import { useSite } from "../context/SiteContext";
import { gsap, useGSAP, isReducedMotion } from "../hooks/useMediaPreferences";
import { parallax, revealLines, revealUp } from "../hooks/useReveal";
import { Img, TLink } from "../components/ui";

export function NextStrip({ cat }: { cat: Category }) {
  const { navigateTo, isTransitioningRef } = useSite();
  const rootRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const next = nextOf(cat.slug);

  useGSAP(
    () => {
      const el = rootRef.current;
      if (!el) return;

      parallax(el, mediaRef.current, 8);
      if (isReducedMotion()) return;

      let fired = false;
      gsap
        .timeline({
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "+=60%",
            pin: true,
            scrub: 0.6,
            onUpdate: (self) => {
              if (
                !fired &&
                self.progress > 0.985 &&
                self.direction === 1 &&
                !isTransitioningRef.current
              ) {
                fired = true;
                navigateTo(`/${next.slug}`, next.color, next.name);
              }
            },
          },
        })
        .to(".next__progress span", { scaleX: 1, ease: "none" }, 0)
        .fromTo(
          titleRef.current,
          { yPercent: 0 },
          { yPercent: -12, ease: "none" },
          0
        );

      revealLines(titleRef.current, { start: "top 60%" });
      revealUp(Array.from(el.querySelectorAll(".next__fade")), {
        start: "top 60%",
        y: 20,
      });
    },
    { scope: rootRef, dependencies: [cat, next] }
  );

  return (
    <section
      className="next"
      ref={rootRef}
      aria-label={`Next collection: ${next.name}`}
      data-nav-theme="light"
    >
      <TLink to={`/${next.slug}`} className="next__link" cursor="Next">
        <span
          className="next__zoom"
          style={{ ["--ph" as string]: next.gradient }}
        >
          <span
            className="next__media ph"
            ref={mediaRef}
            style={{ display: "block" }}
          >
            {/* SWAP: next-strip photo = next category's cover */}
            <Img src={next.cover} alt="" />
          </span>
        </span>
        <span className="next__veil" />
        <span className="next__content">
          <span className="label next__fade">Next</span>
          <span className="next__title" ref={titleRef}>
            {next.name}
          </span>
          <span className="next__desc next__fade">
            {next.tagline.join(" ")}
          </span>
        </span>
        <span className="next__hint">Keep scrolling</span>
        <span className="next__progress">
          <span />
        </span>
      </TLink>
    </section>
  );
}
