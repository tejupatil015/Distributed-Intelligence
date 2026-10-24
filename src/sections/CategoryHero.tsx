import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import type { Category } from "../data/categories";
import { useSite } from "../context/SiteContext";
import {
  gsap,
  ScrollTrigger,
  useGSAP,
  isReducedMotion,
} from "../hooks/useMediaPreferences";
import "./Dashboard"
import { revealLines } from "../hooks/useReveal";
import { Arrow, Img, Marquee } from "../components/ui";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function CategoryHero({ cat }: { cat: Category }) {
  const { setNavTheme, pageEnterCount, menuOpen, isTransitioningRef } = useSite();

  const rootRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const capTextRef = useRef<HTMLSpanElement>(null);
  const countNowRef = useRef<HTMLSpanElement>(null);

  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const slideInnerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const progressStateRef = useRef({ p: 0 });
  const currentSlideRef = useRef(0);
  const slideBusyRef = useRef(false);
  const pointerStartXRef = useRef(0);
  const introTlRef = useRef<gsap.core.Timeline | null>(null);
  const titleTweenRef = useRef<gsap.core.Tween | null>(null);

  // Setup pinned frame growth & initial slide positioning with useGSAP
  useGSAP(
    () => {
      const el = rootRef.current;
      const frame = frameRef.current;
      const inner = innerRef.current;
      const slot = slotRef.current;
      const ui = uiRef.current;
      if (!el || !frame || !inner || !slot || !ui) return;

      let rect = { x: 0, y: 0, sx: 0.2, sy: 0.3 };
      const state = progressStateRef.current;
      state.p = 0;

      const measure = () => {
        const s = slot.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        rect = {
          x: s.left - r.left,
          y: s.top - r.top,
          sx: s.width / r.width,
          sy: s.height / r.height,
        };
      };

      const render = () => {
        const p = state.p;
        const sx = lerp(rect.sx, 1, p);
        const sy = lerp(rect.sy, 1, p);
        const k = Math.max(sx, sy);
        gsap.set(frame, {
          x: lerp(rect.x, 0, p),
          y: lerp(rect.y, 0, p),
          scaleX: sx,
          scaleY: sy,
          force3D: false,
        });
        gsap.set(inner, {
          scaleX: k / sx,
          scaleY: k / sy,
          force3D: false,
        });
        setNavTheme(p > 0.72 ? "light" : "dark");
      };

      measure();
      render();
      ScrollTrigger.addEventListener("refreshInit", measure);
      ScrollTrigger.addEventListener("refresh", render);

      if (!isReducedMotion()) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "+=120%",
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              onUpdate: (self) => {
                if (self.progress > 0.02) {
                  setNavTheme(state.p > 0.72 ? "light" : "dark");
                }
              },
            },
          })
          .to(state, { p: 1, ease: "power1.inOut", duration: 1, onUpdate: render }, 0)
          .to(".chero__layout", { yPercent: -6, opacity: 0, ease: "none", duration: 0.4 }, 0)
          .to(ui, { autoAlpha: 1, duration: 0.15, ease: "none" }, 0.85);
      } else {
        state.p = 1;
        render();
        gsap.set(ui, { autoAlpha: 1 });
        gsap.set(".chero__layout", { opacity: 0 });
      }

      // Position slides
      slideRefs.current.forEach((s, i) => {
        if (!s) return;
        gsap.set(s, { xPercent: i === 0 ? 0 : 100, zIndex: i === 0 ? 1 : 0 });
      });

      // Prepare page enter timeline
      titleTweenRef.current = revealLines(titleRef.current, {
        scroll: false,
        delay: 0.25,
      });

      const intro = gsap.timeline({ paused: true });
      if (!isReducedMotion()) {
        intro
          .from(frame, { opacity: 0, duration: 1.2, ease: "power2.out" }, 0)
          .from(
            ".slide.is-current .slide__inner",
            { scale: 1.3, duration: 1.8, ease: "expo.out" },
            0
          )
          .from(
            ".chero__marquee-in",
            { yPercent: 105, duration: 1.4, ease: "expo.out" },
            0.1
          )
          .from(
            [".chero__meta", ".chero__scroll"],
            { y: 30, opacity: 0, duration: 1.2, stagger: 0.08 },
            0.45
          );
      }
      introTlRef.current = intro;

      return () => {
        ScrollTrigger.removeEventListener("refreshInit", measure);
        ScrollTrigger.removeEventListener("refresh", render);
      };
    },
    { scope: rootRef, dependencies: [cat] }
  );

  // Play entrance animation when SiteContext signals page enter
  useEffect(() => {
    if (pageEnterCount === 0) return;
    introTlRef.current?.play();
    titleTweenRef.current?.play();
  }, [pageEnterCount]);

  // Slide navigation callback
  const goToSlide = useCallback(
    (dir: number) => {
      if (slideBusyRef.current) return;
      const slides = slideRefs.current.filter(Boolean) as HTMLDivElement[];
      if (slides.length < 2) return;

      slideBusyRef.current = true;
      const current = currentSlideRef.current;
      const next = (current + dir + slides.length) % slides.length;
      const a = slides[current];
      const b = slides[next];
      const ai = slideInnerRefs.current[current];
      const bi = slideInnerRefs.current[next];
      const d = isReducedMotion() ? 0.01 : 1.2;

      a.classList.remove("is-current");
      b.classList.add("is-current");
      gsap.set(b, { xPercent: 100 * dir, zIndex: 2 });
      gsap.set(a, { zIndex: 1 });

      gsap
        .timeline({
          defaults: { duration: d, ease: "expo.inOut" },
          onComplete: () => {
            gsap.set(a, { xPercent: 100, zIndex: 0 });
            if (ai) gsap.set(ai, { xPercent: 0 });
            slideBusyRef.current = false;
          },
        })
        .to(b, { xPercent: 0 }, 0)
        .fromTo(
          bi,
          { xPercent: -70 * dir, scale: 1.12 },
          { xPercent: 0, scale: 1 },
          0
        )
        .to(ai, { xPercent: -30 * dir }, 0);

      const roll = (node: HTMLElement | null, text: string) => {
        if (!node) return;
        gsap
          .timeline()
          .to(node, {
            yPercent: -110 * dir,
            opacity: 0,
            duration: 0.45,
            ease: "power3.in",
          })
          .add(() => {
            node.textContent = text;
          })
          .fromTo(
            node,
            { yPercent: 110 * dir, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.8, ease: "expo.out" }
          );
      };

      roll(capTextRef.current, cat.slides[next].caption);
      roll(countNowRef.current, String(next + 1).padStart(2, "0"));
      currentSlideRef.current = next;
    },
    [cat.slides]
  );

  // Keyboard arrow navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTransitioningRef.current || menuOpen) return;
      const el = rootRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < window.innerHeight * 0.5 || r.top > window.innerHeight * 0.5)
        return;
      if (e.key === "ArrowRight") goToSlide(1);
      if (e.key === "ArrowLeft") goToSlide(-1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goToSlide, isTransitioningRef, menuOpen]);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointerStartXRef.current = e.clientX;
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const dx = e.clientX - pointerStartXRef.current;
    if (Math.abs(dx) > 50 && progressStateRef.current.p > 0.8) {
      goToSlide(dx < 0 ? 1 : -1);
    }
  };

  return (
    <section
      className="chero"
      ref={rootRef}
      aria-label={`${cat.name} — featured residences`}
    >
      <div className="chero__layout">
        <div className="chero__top">
          <div className="chero__slot" ref={slotRef} aria-hidden="true" />
          <div className="chero__marquee" style={{ overflow: "hidden" }}>
            <div className="chero__marquee-in">
              <Marquee text={cat.name} accent="—" dur={30} />
            </div>
          </div>
        </div>
        <div className="chero__foot">
          <div className="chero__bottom">
            <h1 className="chero__title" ref={titleRef}>
              {cat.heroTitle}
            </h1>
            <div className="chero__meta">
              <span className="label muted">Collection {cat.index} / 04</span>
              <span className="chero__price">{cat.price}</span>
            </div>
          </div>
          <span className="chero__scroll">(Scroll)</span>
        </div>
      </div>

      <div
        className="chero__frame"
        ref={frameRef}
        data-cursor="Drag"
        style={{ touchAction: "pan-y" }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <div className="chero__frame-inner" ref={innerRef}>
          {cat.slides.map((s, i) => (
            <div
              className={`slide ${i === 0 ? "is-current" : ""}`}
              key={s.src}
              ref={(node) => {
                slideRefs.current[i] = node;
              }}
              aria-hidden={i !== 0}
            >
              <div
                className="slide__inner"
                ref={(node) => {
                  slideInnerRefs.current[i] = node;
                }}
              >
                <div className="ph">
                  {/* SWAP: slide photos come from categories.ts → slides[] */}
                  <Img src={s.src} alt={s.caption} eager={i === 0} />
                </div>
              </div>
            </div>
          ))}
          <div className="chero__shade" />
        </div>
      </div>

      <div className="chero__ui" ref={uiRef}>
        <div className="chero__caption" aria-live="polite">
          <span className="chero__count">
            <span className="chero__count-mask">
              <span className="chero__count-now" ref={countNowRef}>
                01
              </span>
            </span>
            <span>/ {String(cat.slides.length).padStart(2, "0")}</span>
          </span>
          <span className="chero__count-mask" style={{ height: "auto" }}>
            <span className="chero__cap-text" ref={capTextRef}>
              {cat.slides[0].caption}
            </span>
          </span>
        </div>
        <div className="chero__arrows">
          <button
            type="button"
            className="arrow chero__prev"
            aria-label="Previous residence"
            onClick={() => goToSlide(-1)}
          >
            <Arrow dir="left" />
          </button>
          <button
            type="button"
            className="arrow chero__next"
            aria-label="Next residence"
            onClick={() => goToSlide(1)}
          >
            <Arrow />
          </button>
        </div>
      </div>
    </section>
  );
}
