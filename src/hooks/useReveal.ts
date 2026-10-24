import { type RefObject } from "react";
import SplitType from "split-type";
import { gsap, ScrollTrigger, useGSAP, isReducedMotion } from "./useMediaPreferences";

export type RevealOpts = {
  delay?: number;
  scroll?: boolean;
  start?: string;
};

/**
 * Masked line reveal (SplitType). Lines slide up from behind an overflow mask.
 * Reverts the DOM split upon completion so responsive resizes reflow naturally.
 */
export function revealLines(el: HTMLElement | null, opts: RevealOpts = {}) {
  if (!el) return null;
  const { delay = 0, scroll = true, start = "top 85%" } = opts;

  if (isReducedMotion()) {
    return gsap.from(el, {
      opacity: 0,
      duration: 0.6,
      delay,
      paused: !scroll,
      scrollTrigger: scroll ? { trigger: el, start, once: true } : undefined,
    });
  }

  const split = new SplitType(el, { types: "lines", lineClass: "split-line" });
  const lines = split.lines ?? [];
  lines.forEach((line) => {
    const mask = document.createElement("div");
    mask.className = "line-mask";
    line.parentNode?.insertBefore(mask, line);
    mask.appendChild(line);
  });

  gsap.set(lines, { yPercent: 115 });
  return gsap.to(lines, {
    yPercent: 0,
    duration: 1.2,
    ease: "expo.out",
    stagger: 0.08,
    delay,
    paused: !scroll,
    scrollTrigger: scroll ? { trigger: el, start, once: true } : undefined,
    onComplete: () => split.revert(),
  });
}

/** Fade + rise for figures, labels, paragraphs. */
export function revealUp(
  els: Element | Element[] | null,
  opts: RevealOpts & { y?: number; stagger?: number } = {}
) {
  if (!els || (Array.isArray(els) && !els.length)) return null;
  const { delay = 0, scroll = true, start = "top 88%", y = 50, stagger = 0.1 } = opts;
  const trigger = Array.isArray(els) ? els[0] : els;
  const reduced = isReducedMotion();

  return gsap.from(els, {
    y: reduced ? 0 : y,
    opacity: 0,
    duration: reduced ? 0.5 : 1.2,
    ease: "power3.out",
    delay,
    stagger,
    paused: !scroll,
    scrollTrigger: scroll ? { trigger, start, once: true } : undefined,
  });
}

/** 1px vertical hairline drawing down. */
export function revealHairline(el: Element | null, opts: RevealOpts = {}) {
  if (!el) return null;
  const { delay = 0, scroll = true, start = "top 88%" } = opts;

  return gsap.from(el, {
    scaleY: 0,
    transformOrigin: "top center",
    duration: isReducedMotion() ? 0 : 1.2,
    ease: "expo.out",
    delay,
    paused: !scroll,
    scrollTrigger: scroll ? { trigger: el, start, once: true } : undefined,
  });
}

/** Scroll-linked parallax: the inner element drifts within its frame. */
export function parallax(
  frame: Element | null,
  inner: Element | null,
  amount = 10
) {
  if (!frame || !inner || isReducedMotion()) return null;
  return gsap.fromTo(
    inner,
    { yPercent: -amount },
    {
      yPercent: amount,
      ease: "none",
      scrollTrigger: {
        trigger: frame,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    }
  );
}

/**
 * Declarative React hook using `@gsap/react` `useGSAP` to wire up
 * `[data-lines]`, `[data-hair]`, `[data-up]`, `[data-parallax]`, and `[data-nav-theme]`
 * within a scoped section or page ref.
 */
export function useSectionMotion(
  scopeRef: RefObject<HTMLElement | null>,
  onNavThemeChange: (theme: "light" | "dark") => void,
  dependencies: unknown[] = []
) {
  useGSAP(
    () => {
      const el = scopeRef.current;
      if (!el) return;

      el.querySelectorAll<HTMLElement>("[data-lines]").forEach((node) => {
        revealLines(node);
      });
      el.querySelectorAll("[data-hair]").forEach((node) => {
        revealHairline(node);
      });
      el.querySelectorAll("[data-up]").forEach((node) => {
        revealUp(node);
      });
      el.querySelectorAll<HTMLElement>("[data-parallax]").forEach((frame) => {
        const inner = frame.querySelector("[data-parallax-inner]");
        const amount = Number(frame.dataset.parallax) || 10;
        parallax(frame, inner, amount);
      });
      el.querySelectorAll<HTMLElement>("[data-nav-theme]").forEach((sec) => {
        const theme = (sec.dataset.navTheme as "light" | "dark") || "dark";
        ScrollTrigger.create({
          trigger: sec,
          start: "top 4%",
          end: "bottom 4%",
          onToggle: (self) => {
            if (self.isActive) onNavThemeChange(theme);
          },
        });
      });
    },
    { scope: scopeRef, dependencies }
  );
}
