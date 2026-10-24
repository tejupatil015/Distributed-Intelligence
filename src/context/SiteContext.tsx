import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { bySlug, type Category } from "../data/categories";
import { gsap, ScrollTrigger, isReducedMotion } from "../hooks/useMediaPreferences";
import { useLenis } from "../hooks/useLenis";

export type NavTheme = "light" | "dark";

interface SiteContextValue {
  route: string;
  slug: string;
  activeCategory: Category | undefined;
  navTheme: NavTheme;
  setNavTheme: (theme: NavTheme) => void;
  menuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
  contactOpen: boolean;
  contactDefaultSlug: string;
  openContact: (defaultSlug?: string) => void;
  closeContact: () => void;
  ready: boolean;
  markReady: () => void;
  pageEnterCount: number;
  isTransitioningRef: MutableRefObject<boolean>;
  registerTransitionNodes: (panel: HTMLElement | null, label: HTMLElement | null) => void;
  navigateTo: (path: string, color?: string, title?: string) => Promise<void>;
  scrollToAbout: () => void;
  stopScroll: () => void;
  startScroll: () => void;
  scrollToTop: () => void;
  scrollToY: (y: number) => void;
  queueRefresh: () => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

const readHashPath = (): string => {
  if (typeof window === "undefined") return "/";
  return window.location.hash.replace(/^#/, "") || "/";
};

export function SiteProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<string>(readHashPath);
  const [navThemeState, setNavThemeState] = useState<NavTheme>("light");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [contactOpen, setContactOpen] = useState<boolean>(false);
  const [contactDefaultSlug, setContactDefaultSlug] = useState<string>("cityscape");
  const [ready, setReady] = useState<boolean>(false);
  const [pageEnterCount, setPageEnterCount] = useState<number>(0);

  const { stopScroll, startScroll, scrollToTop, scrollToY, queueRefresh } = useLenis();

  const panelRef = useRef<HTMLElement | null>(null);
  const labelRef = useRef<HTMLElement | null>(null);
  const isTransitioningRef = useRef<boolean>(false);
  const resolveRouteCommitRef = useRef<(() => void) | null>(null);
  const firstEnterRef = useRef<boolean>(true);
  const pendingScrollToAboutRef = useRef<boolean>(false);

  const slug = route.replace(/^\//, "");
  const activeCategory = useMemo(() => bySlug(slug), [slug]);

  const setNavTheme = useCallback((theme: NavTheme) => {
    setNavThemeState((prev) => (prev === theme ? prev : theme));
    document.documentElement.dataset.nav = theme;
  }, []);

  const registerTransitionNodes = useCallback(
    (panel: HTMLElement | null, label: HTMLElement | null) => {
      panelRef.current = panel;
      labelRef.current = label;
    },
    []
  );

  const triggerPageEnter = useCallback(() => {
    setPageEnterCount((c) => c + 1);
  }, []);

  const markReady = useCallback(() => {
    setReady(true);
  }, []);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const openContact = useCallback(
    (defaultSlug?: string) => {
      if (defaultSlug) {
        setContactDefaultSlug(defaultSlug);
      } else if (activeCategory) {
        setContactDefaultSlug(activeCategory.slug);
      }
      setMenuOpen(false);
      setContactOpen(true);
    },
    [activeCategory]
  );

  const closeContact = useCallback(() => {
    setContactOpen(false);
  }, []);

  // Listen to browser hashchange & orientation changes
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const onHashChange = () => {
      setMenuOpen(false);
      setContactOpen(false);
      setRoute(readHashPath());
    };

    let resizeTimer: number | undefined;
    const onOrientationOrResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    };

    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("orientationchange", onOrientationOrResize);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("orientationchange", onOrientationOrResize);
    };
  }, []);

  // Sync document title, theme-color, CSS variables, and route mount resolution
  useEffect(() => {
    if (!ready) return;

    document.title = activeCategory
      ? `${activeCategory.name} — Solenne Estates`
      : "Solenne Estates — Homes with a sense of place";

    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", activeCategory?.color ?? "#1E2754");

    setNavTheme(activeCategory ? "dark" : "light");

    const rootStyle = document.documentElement.style;
    rootStyle.setProperty("--c", activeCategory?.color ?? "#1e2754");
    rootStyle.setProperty("--cm", activeCategory?.muted ?? "#666e93");

    // If a programmatic transition is waiting for React to commit the new route:
    if (resolveRouteCommitRef.current) {
      const resolve = resolveRouteCommitRef.current;
      resolveRouteCommitRef.current = null;
      resolve();
      return;
    }

    // Otherwise (initial load or browser Back/Forward button):
    scrollToTop();
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (firstEnterRef.current) {
        firstEnterRef.current = false;
        window.setTimeout(triggerPageEnter, 350);
      } else {
        triggerPageEnter();
      }
    });
  }, [route, ready, activeCategory, setNavTheme, scrollToTop, triggerPageEnter]);

  const navigateTo = useCallback(
    async (path: string, color?: string, title?: string) => {
      const panel = panelRef.current;
      const label = labelRef.current;
      if (isTransitioningRef.current || !panel || !label) return;

      const current = readHashPath();
      if (path === current) {
        scrollToTop();
        return;
      }

      const targetCategory = bySlug(path.replace(/^\//, ""));
      const wipeColor = color ?? targetCategory?.color ?? "#1E2754";
      const wipeTitle = title ?? targetCategory?.name ?? "Solenne";

      isTransitioningRef.current = true;
      stopScroll();
      document.documentElement.classList.add("is-transitioning");
      label.textContent = wipeTitle;
      gsap.set(panel, { backgroundColor: wipeColor, visibility: "visible" });

      const reduced = isReducedMotion();
      const duration = reduced ? 0.01 : 0.9;

      // 1. Wipe in
      await gsap
        .timeline()
        .fromTo(
          panel,
          { xPercent: reduced ? 0 : -100, opacity: reduced ? 0 : 1 },
          {
            xPercent: 0,
            opacity: 1,
            duration: reduced ? 0.3 : duration,
            ease: "expo.inOut",
          }
        )
        .fromTo(
          label,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: reduced ? 0.01 : 0.8,
            ease: "expo.out",
          },
          "-=0.35"
        )
        .then();

      // 2. Commit new route in React and wait for mount
      const mountedPromise = new Promise<void>((resolve) => {
        resolveRouteCommitRef.current = resolve;
      });
      window.location.hash = path;
      setRoute(path);
      await mountedPromise;

      scrollToTop();
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      ScrollTrigger.refresh();

      // 3. Wipe out and fire page enter while panel exits
      const outTl = gsap.timeline();
      outTl
        .to(label, {
          yPercent: -110,
          opacity: 0,
          duration: reduced ? 0.01 : 0.6,
          ease: "power3.in",
        })
        .to(
          panel,
          {
            xPercent: reduced ? 0 : 100,
            opacity: reduced ? 0 : 1,
            duration: reduced ? 0.3 : duration,
            ease: "expo.inOut",
          },
          "-=0.15"
        )
        .add(() => triggerPageEnter(), reduced ? 0 : "-=0.55");

      await outTl.then();
      gsap.set(panel, { visibility: "hidden" });
      document.documentElement.classList.remove("is-transitioning");
      startScroll();
      isTransitioningRef.current = false;

      if (pendingScrollToAboutRef.current) {
        pendingScrollToAboutRef.current = false;
        const aboutEl = document.querySelector<HTMLElement>(".statement");
        if (aboutEl) {
          const top = aboutEl.getBoundingClientRect().top + window.scrollY;
          scrollToY(top);
        }
      }
    },
    [scrollToTop, scrollToY, startScroll, stopScroll, triggerPageEnter]
  );

  const scrollToAbout = useCallback(() => {
    setMenuOpen(false);
    setContactOpen(false);
    if (readHashPath() === "/") {
      const aboutEl = document.querySelector<HTMLElement>(".statement");
      if (aboutEl) {
        const top = aboutEl.getBoundingClientRect().top + window.scrollY;
        scrollToY(top);
      }
    } else {
      pendingScrollToAboutRef.current = true;
      navigateTo("/", "#1E2754", "Solenne");
    }
  }, [navigateTo, scrollToY]);

  const value = useMemo<SiteContextValue>(
    () => ({
      route,
      slug,
      activeCategory,
      navTheme: navThemeState,
      setNavTheme,
      menuOpen,
      toggleMenu,
      closeMenu,
      contactOpen,
      contactDefaultSlug,
      openContact,
      closeContact,
      ready,
      markReady,
      pageEnterCount,
      isTransitioningRef,
      registerTransitionNodes,
      navigateTo,
      scrollToAbout,
      stopScroll,
      startScroll,
      scrollToTop,
      scrollToY,
      queueRefresh,
    }),
    [
      route,
      slug,
      activeCategory,
      navThemeState,
      setNavTheme,
      menuOpen,
      toggleMenu,
      closeMenu,
      contactOpen,
      contactDefaultSlug,
      openContact,
      closeContact,
      ready,
      markReady,
      pageEnterCount,
      registerTransitionNodes,
      navigateTo,
      scrollToAbout,
      stopScroll,
      startScroll,
      scrollToTop,
      scrollToY,
      queueRefresh,
    ]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    throw new Error("useSite must be used within a <SiteProvider>");
  }
  return ctx;
}
