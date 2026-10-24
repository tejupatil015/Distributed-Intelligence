import { useEffect, useRef } from "react";
import { categories } from "../data/categories";
import { useSite } from "../context/SiteContext";
import { gsap, useGSAP, isReducedMotion } from "../hooks/useMediaPreferences";
import { Img, TLink } from "./ui";

/**
 * "Our Selection" menu: white sheet slides down (expo.inOut .9s), then the four
 * collection cards rise with a .08s stagger (expo.out 1.2s).
 */
export function SelectionMenu() {
  const { menuOpen, slug, closeMenu, openContact, stopScroll, startScroll } = useSite();
  const rootRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const firstRenderRef = useRef(true);

  useGSAP(
    () => {
      const el = rootRef.current;
      if (!el) return;
      const r = isReducedMotion();
      tlRef.current = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .set(el, { visibility: "visible" })
        .fromTo(
          ".menu__veil",
          { opacity: 0 },
          { opacity: 1, duration: 0.6, ease: "power2.out" },
          0
        )
        .fromTo(
          ".menu__sheet",
          { yPercent: r ? 0 : -100, opacity: r ? 0 : 1 },
          { yPercent: 0, opacity: 1, duration: r ? 0.3 : 0.9, ease: "expo.inOut" },
          0
        )
        .fromTo(
          ".mcard",
          { yPercent: r ? 0 : 110, opacity: r ? 0 : 1 },
          { yPercent: 0, opacity: 1, duration: r ? 0.3 : 1.2, stagger: 0.08 },
          r ? 0.2 : 0.45
        )
        .fromTo(
          [".menu__head", ".menu__foot"],
          { y: r ? 0 : 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 },
          r ? 0.2 : 0.7
        );
    },
    { scope: rootRef }
  );

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    const tl = tlRef.current;
    if (!tl) return;

    if (menuOpen) {
      stopScroll();
      document.documentElement.classList.add("menu-open");
      tl.timeScale(1).play();
      requestAnimationFrame(() =>
        rootRef.current?.querySelector<HTMLElement>(".mcard")?.focus()
      );
    } else {
      document.documentElement.classList.remove("menu-open");
      tl.timeScale(1.6).reverse();
      startScroll();
    }
  }, [menuOpen, stopScroll, startScroll]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen) closeMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, closeMenu]);

  return (
    <div
      id="selection-menu"
      className="menu"
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Our selection"
      aria-hidden={!menuOpen}
      inert={!menuOpen}
    >
      <div className="menu__veil" onClick={closeMenu} />
      <div className="menu__sheet">
        <div className="menu__head">
          <h2 className="menu__title">Our Selection</h2>
          <span className="label muted">Four collections · 2026</span>
        </div>
        <div className="menu__cards">
          {categories.map((c) => (
            <TLink
              key={c.slug}
              to={`/${c.slug}`}
              cursor="Open"
              onNavigate={closeMenu}
              className={`mcard ${slug === c.slug ? "is-current" : ""}`}
            >
              <span
                className="mcard__panel"
                style={{ ["--cc" as string]: c.color }}
              >
                <span className="mcard__index">{c.index}</span>
                <span className="mcard__title">{c.name}</span>
                <span className="mcard__desc">
                  {c.tagline[0]}
                  <br />
                  {c.tagline[1]}
                </span>
              </span>
              <span
                className="mcard__cover"
                style={{ ["--cph" as string]: c.gradient }}
              >
                {/* SWAP: card cover photo comes from categories.ts → cover */}
                <Img src={c.cover} />
              </span>
            </TLink>
          ))}
        </div>
        <div className="menu__foot">
          <nav aria-label="Menu secondary">
            <TLink to="/" className="u-link u-link--rev" onNavigate={closeMenu}>
              Home
            </TLink>
            <button
              type="button"
              className="u-link u-link--rev"
              onClick={() => openContact()}
            >
              Contact
            </button>
          </nav>
          <span className="muted">
            Solenne Estates — homes with a sense of place
          </span>
        </div>
      </div>
    </div>
  );
}
