import { useEffect, useRef, useState } from "react";
import { useSite } from "../context/SiteContext";
import {
  gsap,
  useGSAP,
  useFinePointer,
  useReducedMotion,
  isReducedMotion,
} from "../hooks/useMediaPreferences";
import { Marquee, TLink } from "./ui";
import { categories } from "../data/categories";

/* ── Page transition panel ───────────────────────────────────────────── */
export function Transition() {
  const { registerTransitionNodes } = useSite();
  const panelRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    registerTransitionNodes(panelRef.current, labelRef.current);
  }, [registerTransitionNodes]);

  return (
    <div className="wipe" ref={panelRef} aria-hidden="true">
      <div className="wipe__mask">
        <span className="wipe__label" ref={labelRef} />
      </div>
    </div>
  );
}

/* ── Custom cursor (desktop / fine pointer only) ─────────────────────── */
export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [cursorText, setCursorText] = useState("");

  useEffect(() => {
    if (!fine || reduced) {
      document.documentElement.classList.remove("has-cursor");
      return;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    document.documentElement.classList.add("has-cursor");
    const dx = gsap.quickTo(dot, "x", { duration: 0.15, ease: "power3.out" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.15, ease: "power3.out" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.55, ease: "power3.out" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.55, ease: "power3.out" });
    const lx = gsap.quickTo(label, "x", { duration: 0.55, ease: "power3.out" });
    const ly = gsap.quickTo(label, "y", { duration: 0.55, ease: "power3.out" });

    gsap.set([dot, ring], { opacity: 0 });
    let shown = false;
    let hoverEl: Element | null = null;
    let currentLabelText = "";

    const reset = () => {
      hoverEl = null;
      currentLabelText = "";
      setCursorText("");
      gsap.to(ring, { scale: 1, duration: 0.5, ease: "expo.out" });
      gsap.to(dot, { scale: 1, duration: 0.3 });
      gsap.to(label, { opacity: 0, duration: 0.2 });
    };

    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.to([dot, ring], { opacity: 1, duration: 0.4 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      lx(e.clientX);
      ly(e.clientY);

      const target =
        (e.target as Element)?.closest?.(
          "a, button, [role=button], [data-cursor]"
        ) ?? null;

      if (target !== hoverEl) {
        hoverEl = target;
        const txt = target?.getAttribute("data-cursor") ?? "";
        currentLabelText = txt;
        setCursorText(txt);
        gsap.to(ring, {
          scale: target ? (txt ? 2.4 : 1.5) : 1,
          duration: 0.6,
          ease: "expo.out",
        });
        gsap.to(dot, {
          scale: target ? 0 : 1,
          duration: 0.4,
          ease: "power3.out",
        });
        gsap.to(label, { opacity: txt ? 1 : 0, duration: 0.3 });
      }
    };

    const leave = () => {
      shown = false;
      gsap.to([dot, ring], { opacity: 0, duration: 0.3 });
    };
    const down = () => gsap.to(ring, { scale: "*=0.85", duration: 0.2 });
    const up = () =>
      gsap.to(ring, {
        scale: hoverEl ? (currentLabelText ? 2.4 : 1.5) : 1,
        duration: 0.5,
        ease: "expo.out",
      });

    window.addEventListener("hashchange", reset);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);

    return () => {
      window.removeEventListener("hashchange", reset);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [fine, reduced]);

  if (!fine || reduced) return null;

  return (
    <div className="cursor" ref={rootRef} aria-hidden="true">
      <div className="cursor__dot" ref={dotRef} />
      <div className="cursor__ring" ref={ringRef} />
      <span className="cursor__label" ref={labelRef}>
        {cursorText}
      </span>
    </div>
  );
}

/* ── Preloader: React counter while fonts + first image settle ──────── */
export function Preloader() {
  const { markReady } = useSite();
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState<number>(0);
  const [hidden, setHidden] = useState<boolean>(false);

  useGSAP(
    () => {
      const el = rootRef.current;
      const bar = barRef.current;
      if (!el || !bar) return;

      let cancelled = false;
      const counter = { v: 0 };
      const fontsReady = Promise.race([
        document.fonts?.ready ?? Promise.resolve(),
        new Promise((r) => setTimeout(r, 2500)),
      ]);
      const r = isReducedMotion();

      const tl = gsap.timeline();
      tl.to(counter, {
        v: 100,
        duration: r ? 0.2 : 1.6,
        ease: "power3.inOut",
        onUpdate: () => {
          setCount(Math.round(counter.v));
          gsap.set(bar, { scaleX: counter.v / 100 });
        },
      });

      Promise.all([fontsReady, tl.then()]).then(() => {
        if (cancelled) return;
        markReady();
        gsap.to(el, {
          yPercent: r ? 0 : -100,
          opacity: r ? 0 : 1,
          duration: r ? 0.3 : 1.1,
          ease: "expo.inOut",
          delay: 0.1,
          onComplete: () => {
            if (!cancelled) setHidden(true);
          },
        });
      });

      return () => {
        cancelled = true;
        tl.kill();
      };
    },
    { scope: rootRef }
  );

  if (hidden) return null;

  return (
    <div className="loader" ref={rootRef} aria-hidden="true">
      <span className="loader__brand">Nemo</span>
      <div>
        <div className="loader__count">{String(count).padStart(2, "0")}</div>
        <div className="loader__bar">
          <span ref={barRef} />
        </div>
      </div>
    </div>
  );
}

/* ── Footer ──────────────────────────────────────────────────────────── */
export function Footer() {
  const { openContact } = useSite();

  return (
    <footer className="footer">
      <div className="footer__top">
        <p className="footer__lead">
          Homes chosen for the places around them.
        </p>
        <div className="footer__col">
          <span className="label">Collections</span>
          {categories.map((c) => (
            <TLink
              key={c.slug}
              to={`/${c.slug}`}
              className="u-link u-link--rev"
              cursor="Open"
            >
              {c.name}
            </TLink>
          ))}
        </div>
        <div className="footer__col">
          <span className="label">Studio</span>
          <button
            type="button"
            className="u-link u-link--rev"
            style={{ alignSelf: "flex-start" }}
            onClick={() => openContact()}
          >
            hello@nemo.example
          </button>
          <span>+00 000 000 000</span>
          <span>Mon–Fri, 9–18</span>
        </div>
      </div>
      <Marquee text="Nemo" dur={50} className="footer__mark" />
      <div className="footer__base">
        <span>© 2026 Nemo</span>
        <span>Photography: Pexels (placeholders)</span>
      </div>
    </footer>
  );
}
