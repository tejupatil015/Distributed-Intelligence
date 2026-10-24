import { useCallback, useEffect, useRef } from "react";
import Lenis from "lenis";

import { gsap, ScrollTrigger, useReducedMotion } from "./useMediaPreferences";

/**
 * Lenis smooth scroll configuration.
 * Adjust `lerp` (0.05 = floatier, 0.09 = default, 0.15 = snappier)
 * or `wheelMultiplier` to tune scroll speed across the React app.
 */
export const LENIS_OPTIONS = {
  lerp: 0.09,
  wheelMultiplier: 1,
  smoothWheel: true,
};

export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);
  const refreshTimerRef = useRef<number | undefined>(undefined);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      return;
    }

    const instance = new Lenis(LENIS_OPTIONS);
    lenisRef.current = instance;

    instance.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const onLoad = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      gsap.ticker.remove(raf);
      instance.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  const stopScroll = useCallback(() => {
    lenisRef.current?.stop();
    document.documentElement.classList.add("is-locked");
  }, []);

  const startScroll = useCallback(() => {
    lenisRef.current?.start();
    document.documentElement.classList.remove("is-locked");
  }, []);

  const scrollToTop = useCallback(() => {
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, []);

  const scrollToY = useCallback(
    (y: number) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(y, { duration: 1.4 });
      } else {
        window.scrollTo({
          top: y,
          behavior: reducedMotion ? "auto" : "smooth",
        });
      }
    },
    [reducedMotion]
  );

  const queueRefresh = useCallback(() => {
    window.clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 120);
  }, []);

  return {
    lenisRef,
    stopScroll,
    startScroll,
    scrollToTop,
    scrollToY,
    queueRefresh,
  };
}
