import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

/** Additive motion for the data interfaces; existing editorial timelines stay untouched. */
export function initEnhancements(): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") return () => {};

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) return () => {};

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const contexts: gsap.Context[] = [];
  const animated = new Set<Element>();
  const splits: SplitType[] = [];
  const cleanups: Array<() => void> = [];
  let disposed = false;
  let resizeTimer = 0;
  let scanFrame = 0;

  const inExistingMotion = (element: Element) => Boolean(
    element.closest("[data-lines], [data-up], [data-hair], [data-parallax], .hstage, .chero, .next, .statement, .intelligence-reveal, .intelligence-card-reveal")
  );

  const animateElement = (element: Element, animation: () => void) => {
    if (animated.has(element) || inExistingMotion(element)) return;
    animated.add(element);
    const context = gsap.context(animation, element);
    contexts.push(context);
  };

  const revealCards = (selector: string, triggerSelector: string) => {
    document.querySelectorAll(selector).forEach((element) => {
      animateElement(element, () => {
        gsap.fromTo(element,
          { y: 26, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.05,
            ease: "power4.out",
            scrollTrigger: {
              trigger: element.closest(triggerSelector) ?? element,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    });
  };

  const revealDataHeadings = () => {
    const selectors = [".di-section-heading h2", ".order-heading h1"];
    document.querySelectorAll<HTMLElement>(selectors.join(", ")).forEach((heading) => {
      if (animated.has(heading) || inExistingMotion(heading)) return;
      animated.add(heading);
      const split = new SplitType(heading, { types: "words", wordClass: "split-word" });
      splits.push(split);
      const words = split.words ?? [];
      if (!words.length) return;
      const context = gsap.context(() => {
        gsap.fromTo(words,
          { opacity: 0.22 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.08,
            scrollTrigger: {
              trigger: heading,
              start: "top 82%",
              end: "bottom 45%",
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          }
        );
      }, heading);
      contexts.push(context);
    });
  };

  const scan = () => {
    if (disposed || reduced.matches) return;
    revealDataHeadings();
    revealCards(".analytics-card", ".analytics-section");
    revealCards(".forecast-panel, .forecast-chart-panel", ".analytics-section");
    revealCards(".di-kpi-card, .di-panel", ".di-dashboard");
    revealCards(".tracking-stat-card, .tracking-panel, .tracking-latest-panel", ".order-tracking-page");

    if (finePointer.matches) {
      document.querySelectorAll<HTMLElement>(".analytics-section button, .di-dashboard button, .order-tracking-page button").forEach((button) => {
        if (animated.has(button) || inExistingMotion(button)) return;
        animateElement(button, () => {
          const xTo = gsap.quickTo(button, "x", { duration: 0.35, ease: "power3.out" });
          const yTo = gsap.quickTo(button, "y", { duration: 0.35, ease: "power3.out" });
          const move = (event: PointerEvent) => {
            const rect = button.getBoundingClientRect();
            xTo((event.clientX - rect.left - rect.width / 2) * 0.08);
            yTo((event.clientY - rect.top - rect.height / 2) * 0.08);
          };
          const reset = () => { xTo(0); yTo(0); };
          button.addEventListener("pointermove", move);
          button.addEventListener("pointerleave", reset);
          cleanups.push(() => {
            button.removeEventListener("pointermove", move);
            button.removeEventListener("pointerleave", reset);
          });
        });
      });
    }
  };

  const queueScan = () => {
    if (scanFrame) cancelAnimationFrame(scanFrame);
    scanFrame = requestAnimationFrame(scan);
  };

  const observer = new MutationObserver(queueScan);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  queueScan();

  const onImageLoad = () => ScrollTrigger.refresh();
  document.querySelectorAll("img").forEach((img) => {
    if (!img.complete) img.addEventListener("load", onImageLoad, { once: true });
  });
  window.addEventListener("load", onImageLoad, { once: true });

  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      contexts.splice(0).forEach((context) => context.revert());
      cleanups.splice(0).forEach((dispose) => dispose());
      splits.splice(0).forEach((split) => split.revert());
      animated.clear();
      queueScan();
      ScrollTrigger.refresh();
    }, 180);
  };
  window.addEventListener("resize", onResize, { passive: true });

  const onMotionPreference = () => {
    if (reduced.matches) cleanup();
  };
  reduced.addEventListener("change", onMotionPreference);

  function cleanup() {
    if (disposed) return;
    disposed = true;
    observer.disconnect();
    window.removeEventListener("resize", onResize);
    window.removeEventListener("load", onImageLoad);
    reduced.removeEventListener("change", onMotionPreference);
    if (scanFrame) cancelAnimationFrame(scanFrame);
    window.clearTimeout(resizeTimer);
    contexts.splice(0).forEach((context) => context.revert());
    cleanups.splice(0).forEach((dispose) => dispose());
    splits.splice(0).forEach((split) => split.revert());
    animated.clear();
  }

  return cleanup;
}
