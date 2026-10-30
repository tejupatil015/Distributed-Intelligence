import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { categories } from "../data/categories";
import { images } from "../data/images";
import { useSite } from "../context/SiteContext";
import {
  gsap,
  ScrollTrigger,
  useGSAP,
  isReducedMotion,
} from "../hooks/useMediaPreferences";
import { revealLines } from "../hooks/useReveal";
import { Arrow, Img, Marquee, TLink } from "../components/ui";

type Axis = "x" | "y";
const EXPANDED: Record<Axis, number> = { x: 0.52, y: 0.46 };

export function HomeStage() {
  const { navigateTo, setNavTheme, pageEnterCount } = useSite();
  const [activeCol, setActiveCol] = useState<number>(-1);

  const stageRef = useRef<HTMLElement>(null);
  const colsContainerRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);

  const colRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const extraRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stripRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stripInnerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const layoutStateRef = useRef<{
    axis: Axis;
    gap: number;
    free: number;
    colSize: number;
    reveal: number;
  }>({
    axis: "x",
    gap: 16,
    free: 0,
    colSize: 0,
    reveal: 0.22,
  });

  const activeColRef = useRef<number>(-1);
  activeColRef.current = activeCol;

  const introTlRef = useRef<gsap.core.Timeline | null>(null);
  const titleTweenRef = useRef<gsap.core.Tween | null>(null);

  const measureColumns = useCallback((nextAxis: Axis) => {
    const container = colsContainerRef.current;
    if (!container) return;
    const st = layoutStateRef.current;
    st.axis = nextAxis;
    container.dataset.axis = nextAxis;
    st.gap =
      parseFloat(getComputedStyle(container).getPropertyValue("--col-gap")) ||
      16;
    const size =
      nextAxis === "x" ? container.clientWidth : container.clientHeight;
    st.free = size - st.gap * (categories.length - 1);
    st.colSize = Math.ceil(st.free * EXPANDED[nextAxis]) + 2;
    container.style.setProperty("--col-size", `${st.colSize}px`);
  }, []);

  const applyColumnPositions = useCallback(
    (activeIndex: number, duration: number) => {
      const { axis, gap, free, colSize } = layoutStateRef.current;
      const n = categories.length;
      const e = EXPANDED[axis];
      const weights = categories.map((_, k) =>
        activeIndex < 0 ? 1 / n : k === activeIndex ? e : (1 - e) / (n - 1)
      );

      let pos = 0;
      const ease = "expo.inOut";

      categories.forEach((_, i) => {
        const col = colRefs.current[i];
        const title = titleRefs.current[i];
        const img = imgRefs.current[i];
        const extra = extraRefs.current[i];
        const v = weights[i] * free;

        if (col) {
          gsap.to(col, {
            ...(axis === "x" ? { x: pos, y: 0 } : { y: pos, x: 0 }),
            duration,
            ease,
            overwrite: "auto",
          });
        }
        if (title) {
          gsap.to(title, {
            x: axis === "x" ? v - colSize : 0,
            duration,
            ease,
            overwrite: "auto",
          });
        }
        if (img) {
          const off = (v - colSize) / 2;
          gsap.to(img, {
            ...(axis === "x" ? { x: off, y: 0 } : { y: off, x: 0 }),
            duration,
            ease,
            overwrite: "auto",
          });
        }
        if (extra) {
          gsap.to(extra, {
            opacity: i === activeIndex ? 1 : 0,
            y: i === activeIndex ? 0 : 20,
            duration: i === activeIndex ? 0.9 : 0.4,
            delay: i === activeIndex ? duration * 0.45 : 0,
            ease: "power3.out",
            overwrite: "auto",
          });
        }
        pos += v + gap;
      });
    },
    []
  );

  const setStripReveal = useCallback((r: number) => {
    const st = layoutStateRef.current;
    st.reveal = r;
    const off = (1 - r) * 100;

    categories.forEach((_, i) => {
      const mask = stripRefs.current[i];
      const inner = stripInnerRefs.current[i];
      if (!mask || !inner) return;
      if (st.axis === "x") {
        gsap.set(mask, { yPercent: off, xPercent: 0 });
        gsap.set(inner, { yPercent: -off, xPercent: 0 });
      } else {
        gsap.set(mask, { xPercent: off, yPercent: 0 });
        gsap.set(inner, { xPercent: -off, yPercent: 0 });
      }
    });
  }, []);

  // Animate columns whenever React `activeCol` state updates
  useEffect(() => {
    if (layoutStateRef.current.free > 0) {
      applyColumnPositions(activeCol, 1.1);
    }
  }, [activeCol, applyColumnPositions]);

  // Collapse on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveCol(-1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Setup GSAP intro and responsive pinned ScrollTrigger timeline
  useGSAP(
    () => {
      const el = stageRef.current;
      if (!el) return;

      titleTweenRef.current = revealLines(heroTitleRef.current, {
        scroll: false,
        delay: 0.2,
      });
      const intro = gsap.timeline({ paused: true });
      if (!isReducedMotion()) {
        intro
          .from(".hhero__img", { scale: 1.25, duration: 2, ease: "expo.out" }, 0)
          .from(
            ".hhero__marquee-in",
            { yPercent: 105, duration: 1.4, ease: "expo.out" },
            0.1
          )
          .from(
            [".hhero__meta", ".hhero__scroll"],
            { y: 30, opacity: 0, duration: 1.2, stagger: 0.08 },
            0.45
          );
      }
      introTlRef.current = intro;

      const mm = gsap.matchMedia();
      mm.add(
        {
          mobile: "(max-width: 767px)",
          desktop: "(min-width: 768px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (c) => {
          const { mobile, reduce } = c.conditions as {
            mobile: boolean;
            reduce: boolean;
          };
          const axis: Axis = mobile ? "y" : "x";
          measureColumns(axis);
          applyColumnPositions(activeColRef.current, 0);

          const strip = { r: 0.22 };
          const finalReveal = mobile ? 0.44 : 0.56;
          setStripReveal(strip.r);
          el.classList.toggle("is-static", reduce);

          const cols = colRefs.current.filter(Boolean);

          if (reduce) {
            setStripReveal(finalReveal);
            gsap.set(".hcols__label", { opacity: 1 });
          } else {
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: el,
                  start: "top top",
                  end: "+=240%",
                  pin: true,
                  scrub: 1,
                  anticipatePin: 1,
                  onUpdate: (self) =>
                    setNavTheme(self.progress < 0.1 ? "light" : "dark"),
                  onLeaveBack: () => setNavTheme("light"),
                },
              })
              .to(
                ".hhero__media",
                { yPercent: 100, scale: 0.9, ease: "power2.in", duration: 0.42 },
                0
              )
              .to(
                ".hhero__content",
                { yPercent: -16, opacity: 0, ease: "none", duration: 0.24 },
                0
              )
              .fromTo(
                cols,
                { yPercent: mobile ? 460 : 105 },
                {
                  yPercent: 0,
                  ease: "power3.out",
                  duration: 0.34,
                  stagger: 0.07,
                },
                0.08
              )
              .fromTo(
                ".hcols__label",
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.12 },
                0.36
              )
              .to(
                strip,
                {
                  r: finalReveal,
                  ease: "power1.inOut",
                  duration: 0.5,
                  onUpdate: () => setStripReveal(strip.r),
                },
                0.5
              );
          }

          const relayout = () => {
            measureColumns(axis);
            applyColumnPositions(activeColRef.current, 0);
            setStripReveal(layoutStateRef.current.reveal);
          };
          ScrollTrigger.addEventListener("refreshInit", relayout);
          return () => {
            ScrollTrigger.removeEventListener("refreshInit", relayout);
          };
        }
      );

      return () => mm.revert();
    },
    {
      scope: stageRef,
      dependencies: [
        measureColumns,
        applyColumnPositions,
        setStripReveal,
        setNavTheme,
      ],
    }
  );

  // Trigger entrance timeline when pageEnterCount updates
  useEffect(() => {
    if (pageEnterCount === 0) return;
    introTlRef.current?.play();
    titleTweenRef.current?.play();
  }, [pageEnterCount]);

  const handleStageClick = (e: ReactMouseEvent<HTMLElement>) => {
    if (!(e.target as Element).closest(".col")) {
      setActiveCol(-1);
    }
  };

  const handleColumnClick = (
    index: number,
    e: ReactMouseEvent<HTMLDivElement>
  ) => {
    if ((e.target as Element).closest(".col-explore")) return;
    if (activeCol === index) {
      const cat = categories[index];
      navigateTo(`/${cat.slug}`, cat.color, cat.name);
    } else {
      setActiveCol(index);
    }
  };

  const handleColumnKeyDown = (
    index: number,
    e: ReactKeyboardEvent<HTMLDivElement>
  ) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (activeCol === index) {
        const cat = categories[index];
        navigateTo(`/${cat.slug}`, cat.color, cat.name);
      } else {
        setActiveCol(index);
      }
    }
  };

  return (
    <section
      className="hstage"
      ref={stageRef}
      aria-label="Nemo — our selection"
      onClick={handleStageClick}
    >
      <div className="hhero">
        <div className="hhero__media ph">
          {/* Full-bleed image behind the entire hero section. */}
          <div className="hhero__img">
            <Img
              src={images.seaWide1}
              alt="Coastal landscape at the water's edge"
              eager
            />
          </div>
          <div className="hhero__veil" />
        </div>
        <div className="hhero__content">
          <div className="hhero__marquee" style={{ overflow: "hidden" }}>
            <div className="hhero__marquee-in">
              <Marquee text="Places that stay" accent="—" dur={40} />
            </div>
          </div>
          <div className="hhero__bottom">
            <h1 className="hhero__title" ref={heroTitleRef}>
              Considered homes on quiet coasts, in deep forests and old capitals
              — chosen for how they live, and how they hold their value.
            </h1>
            <div className="hhero__meta">
              <span className="label hhero__scroll">(Scroll to explore)</span>
              <span>Portfolio from €260,000</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hcols__label label">
        <span>Our Selection</span>
        <span style={{ opacity: 0.5 }}>Select a collection</span>
      </div>
      <div className="hcols" ref={colsContainerRef} role="list">
        {categories.map((c, i) => {
          const isExpanded = activeCol === i;
          const isDim = activeCol >= 0 && activeCol !== i;
          return (
            <div
              className={`col ${isExpanded ? "is-active" : ""} ${
                isDim ? "is-dim" : ""
              }`}
              key={c.slug}
              ref={(node) => {
                colRefs.current[i] = node;
              }}
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              aria-label={`${c.name}: ${c.tagline.join(" ")}`}
              data-cursor="Open"
              style={{
                ["--cc" as string]: c.color,
                ["--cph" as string]: c.gradient,
              }}
              onClick={(e) => handleColumnClick(i, e)}
              onKeyDown={(e) => handleColumnKeyDown(i, e)}
            >
              <div className="col-body">
                <div
                  className="col-strip"
                  ref={(node) => {
                    stripRefs.current[i] = node;
                  }}
                >
                  <div
                    className="col-strip-inner"
                    ref={(node) => {
                      stripInnerRefs.current[i] = node;
                    }}
                  >
                    <div
                      className="col-strip-img"
                      ref={(node) => {
                        imgRefs.current[i] = node;
                      }}
                    >
                      {/* SWAP: column photo strip = category cover (categories.ts) */}
                      <Img src={c.cover} alt="" />
                    </div>
                  </div>
                </div>
                <div className="col-head">
                  <span className="col-index">{c.index}</span>
                  <span className="col-desc">
                    {c.tagline[0]}
                    <br />
                    {c.tagline[1]}
                  </span>
                  <div
                    className="col-extra"
                    ref={(node) => {
                      extraRefs.current[i] = node;
                    }}
                    inert={!isExpanded}
                  >
                    <p>{c.blurb}</p>
                    <TLink
                      to={`/${c.slug}`}
                      className="u-link col-explore"
                      cursor="Open"
                    >
                      Explore {c.name} <Arrow />
                    </TLink>
                  </div>
                </div>
                <span
                  className="col-title"
                  ref={(node) => {
                    titleRefs.current[i] = node;
                  }}
                >
                  <span className="col-title-text">{c.name}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
