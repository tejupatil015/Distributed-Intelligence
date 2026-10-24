# Solenne Estates — React + GSAP + Lenis Real-Estate Showcase

A fictional property brand ("Solenne Estates") built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, **GSAP 3 + ScrollTrigger + `@gsap/react` (`useGSAP`)**, **Lenis**, and **SplitType**.

```bash
npm install
npm run dev        # local dev server
npm run build      # production build → dist/index.html
```

## React Architecture

```
src/
  main.tsx                        React root entry
  App.tsx                         <SiteProvider> + <AppShell>
  index.css                       Design tokens, typography, responsive layout
  context/
    SiteContext.tsx               Global React context (routing, transitions, nav theme, menu, contact drawer, Lenis scroll)
  hooks/
    useMediaPreferences.ts        useReducedMotion, useFinePointer, useIsMobile + GSAP plugin registration
    useLenis.ts                   Lenis smooth scroll lifecycle hook wired to ScrollTrigger & gsap.ticker
    useReveal.ts                  useSectionMotion (via useGSAP), revealLines, revealUp, revealHairline, parallax
  data/
    images.ts                     Single source of truth for all photography URLs
    categories.ts                 4 collections: Shoreline, Canopy, Cityscape, Singular
  components/
    Nav.tsx                       Top navbar (logo, About, Contact, Our Selection, burger)
    SelectionMenu.tsx             Full-screen "Our Selection" overlay menu
    ContactDrawer.tsx             Interactive slide-over consultation drawer with React form state
    Chrome.tsx                    <Transition>, <Cursor>, <Preloader>, <Footer>
    ui.tsx                        <Img>, <TLink>, <Marquee>, <Arrow>, <Mark>
  sections/
    HomeStage.tsx                 Pinned Home hero + 4-column interactive React selection stage
    HomeStatement.tsx             About statement & key figures
    CategoryHero.tsx              Pinned Category hero with growing frame & full-screen slider
    Intro.tsx                     Category intro + parallax portrait
    QuoteBand.tsx                 Marquee + square portrait + serif quote
    Parallax.tsx                  Full-bleed scroll-linked parallax image
    Features.tsx                  Alternating 12-column feature rows
    PullQuote.tsx                 Hanging quote mark + pull quote
    Cta.tsx                       Category-coloured CTA band
    NextStrip.tsx                 Pinned Next-category strip with auto-advance on scroll
  pages/
    Home.tsx                      Composes <HomeStage>, <HomeStatement>, <Footer>
    Category.tsx                  Composes all category sections for the active collection
```

---

## Swap Images
Every photo is referenced from **`src/data/images.ts`**.
1. Place your files in `public/images/`.
2. Replace a key in `src/data/images.ts`, e.g. `cityHero: "/images/city-hero.jpg"`.

Every `<Img>` renders inside a `.ph` frame that paints the category gradient (`gradient` in `categories.ts`) underneath and calls `queueRefresh()` from `useSite()` on load so `ScrollTrigger` pin measurements stay exact.

## Change Colours & Fonts
- **Brand & page tokens:** top of **`src/index.css`** (`--ink`, `--ink-muted`, `--paper`).
- **Collection palettes:** **`src/data/categories.ts`** (`color`, `muted`, `gradient`). `SiteContext` and `<CategoryPage>` sync `--c`, `--cm`, and `--ph` automatically.
- **Fonts:** update the Google Fonts `<link>` in `index.html` and `--font-display` / `--font-sans` in `src/index.css`.

## Tune Scroll Speed & Motion
| Parameter | File | Notes |
|---|---|---|
| Smoothness (`lerp`) | `LENIS_OPTIONS` in `src/hooks/useLenis.ts` | `0.05` = floaty, `0.09` = default, `0.15` = snappy |
| Wheel multiplier | `LENIS_OPTIONS.wheelMultiplier` in `src/hooks/useLenis.ts` | `0.8` slower · `1.2` faster |
| Category hero pin length | `end: "+=120%"` in `src/sections/CategoryHero.tsx` | Controls frame growth duration |
| Home stage pin length | `end: "+=240%"` in `src/sections/HomeStage.tsx` | Controls hero drop → columns → photo strips |
| Next-strip advance distance | `end: "+=60%"` in `src/sections/NextStrip.tsx` | Progress bar fill before auto-advancing |
| Page transition wipe speed | `duration = 0.9` in `src/context/SiteContext.tsx` | Wipe-in / wipe-out duration |
