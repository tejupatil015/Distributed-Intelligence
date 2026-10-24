# Implementation plan — "Solenne Estates"

Fictional brand: **Solenne Estates** — curated residential property in four collections.
All copy is original; photography is royalty-free stock (Pexels) referenced from one file
(`src/data/images.ts`) with gradient placeholders underneath every image.

## Stack decision

The project template mandates React + Vite (`src/App.tsx` is the entry). React is used as a
*thin rendering shell only*: every animation lives in plain TypeScript ES modules under
`src/motion/` that operate on DOM refs with GSAP 3 + ScrollTrigger, Lenis and SplitType —
exactly the vanilla architecture requested, just mounted from React components.

## File structure

```
index.html                    fonts (Fraunces + Inter Tight), title, theme-color
src/
  main.tsx                    React root
  App.tsx                     router state, Lenis boot, global chrome
  index.css                   design tokens, base type, utilities, component CSS
  data/
    images.ts                 ← SWAP PHOTOS HERE (one URL map, commented)
    categories.ts             4 collections: colours, copy, image keys, order
  motion/
    env.ts                    gsap.registerPlugin, reduced-motion flag, desktop flag
    smooth.ts                 Lenis ⇄ ScrollTrigger wiring, stop/start, refresh helpers
    reveal.ts                 SplitType line reveals, fades, hairlines, parallax
    transition.ts             colour-panel page wipe (in → swap → out)
    columns.ts                overlapping-column layout engine (transform-only expand)
  components/
    Nav.tsx  SelectionMenu.tsx  Cursor.tsx  Transition.tsx  Img.tsx  Footer.tsx
  pages/
    Home.tsx                  hero + pinned selection experience + statement + footer
    Category.tsx              composes the category sections below
  sections/
    CategoryHero.tsx          pinned hero: small frame grows into full-screen slider
    Intro.tsx  QuoteBand.tsx  Features.tsx  PullQuote.tsx  Parallax.tsx  Cta.tsx  NextStrip.tsx
docs/  site-analysis.md  implementation-plan.md  walkthrough.md
README.md
```

Routing: hash routes (`#/`, `#/shoreline`, `#/canopy`, `#/cityscape`, `#/singular`) so the
single-file build works on any static host.

## Design tokens

| Token | Value |
|---|---|
| `--ink` (brand) | `#1E2754` |
| `--ink-muted` | `#666E93` |
| `--paper` | `#F6F4EF` (warm off-white page) |
| `--white` | `#FFFFFF` |
| Shoreline | `#1D2A48` / muted `#5E6A8E` |
| Canopy | `#2F5745` / muted `#7E978A` |
| Cityscape | `#33202F` / muted `#76606F` |
| Singular | `#1B191D` / muted `#5F5B61` |
| Display font | Fraunces 200/300, opsz 144, `ss01`-like soft forms |
| Sans font | Inter Tight 400/500, tracking −0.01em |
| Grid | 12 cols, padding `4.5vw`, gap `2.6vw` (mobile: padding 6vw, gap 4vw) |
| Type (desktop) | marquee 16vw · h2 5.2vw/.94 · h3 3.1vw/.95 · lead 1.75vw · body clamp(15px,1.15vw,20px) · label 0.78vw caps |
| Ease | `expo.out` (reveals), `expo.inOut` (wipes, slider), `power3.out` (UI), `none` (scrubs) |
| Durations | reveals 1.0–1.4s · wipe 0.9s each way · hover 0.8s CSS `cubic-bezier(.7,.6,0,1)` |
| Stagger | lines 0.08 · columns 0.1 · cards 0.08 |

## Wireframes

### Category page
```
┌──────────────────────────────────────────────────────────────┐
│ SOLENNE          About  Contact          Our Selection ▪▪  ≡ │  fixed nav
│ ┌──────┐                                                     │
│ │ frame│  ← 20vw square = full-screen slider scaled down     │  PINNED
│ └──────┘                                                     │  (+=120%)
│ CITYSCAPE · CITYSCAPE · CITYSCAPE   (16vw drifting marquee)  │
│ Downtown residences & old-town          Portfolio from €…    │
│ addresses for everyday life (h1)                     03 / 04 │
│ (Scroll)                                                     │
└──────────────────────────────────────────────────────────────┘
        ↓ frame grows to 100vw×100svh, text lifts away, slider UI fades in
┌──────────────────────────────────────────────────────────────┐
│ [full-bleed slide image]                                     │
│ caption 01 — 04                              ( ← )  ( → )    │
└──────────────────────────────────────────────────────────────┘
│                    |  hairline                               │  INTRO
│        Serif h2 two–three lines, centred                     │
│        muted paragraph                                       │
│   ┌──────────── parallax portrait ─────┐   small caption     │
├──────────────────────────────────────────────────────────────┤
│            [■ square]                                        │  QUOTE BAND
│      “Serif quote at h2 size, centred.”                      │
│        Name  / source / year                                 │
├──────────────────────────────────────────────────────────────┤
│ [full-bleed parallax image]                                  │
├──────────────────────────────────────────────────────────────┤
│ [figure cols 1–5]            Stat title / paragraph (9–12)   │  FEATURES ×3
│ Stat / paragraph (1–4)                [figure cols 8–12]     │  alternating
│ [figure]                                     Stat / para     │
│        “ Large pull quote …”                                 │
├──────────────────────────────────────────────────────────────┤
│ [full-bleed parallax image]                                  │
├────────────── category colour band ──────────────────────────┤
│                 | hairline                                   │  CTA
│          Make the city your address                          │
│               Book a private viewing →                       │
├──────────────────────────────────────────────────────────────┤
│ [next category photo, parallax, 20% veil]   PINNED (+=60%)   │  NEXT STRIP
│                    Next                                      │
│                  Singular       (serif)                      │
│        One-off architecture & landmark homes                 │
│        ───────── progress line fills → auto-advance          │
└──────────────────────────────────────────────────────────────┘
```

### Home
```
HERO (full screen photo, veil, marquee motto, h1, price)        ┐
  ↓ scroll: photo drops (y→110%, scale .92), text lifts           │ ONE PINNED
COLUMNS: four tall coloured columns rise (stagger .1)            │ TIMELINE
 ┌────┐┌────┐┌────┐┌────┐  symbol top-left · vertical title     │ (+=240%)
 │    ││    ││    ││    │  bottom-right · descriptor            │
 │▒▒▒▒││▒▒▒▒││▒▒▒▒││▒▒▒▒│  photo strip grows 22% → 60%          ┘
 click → column widens to ~52%, others share the rest; "Explore →"
STATEMENT (serif lead + 3 figures) → FOOTER
```
Mobile: rows stacked vertically (same engine on the Y axis), titles horizontal, photo strip
reveals from the right.

### Selection menu
Full-screen white sheet slides down (`yPercent -100→0`, 0.9s expo.inOut); four cards rise
(`yPercent 110→0`, 1.2s expo.out, stagger .08); each card: colour panel, title, two-line
descriptor, photo strip; hover = brightness + image scale 1.05.

## GSAP timelines

**Smooth scroll** — `new Lenis({ lerp: .09 })`; `lenis.on('scroll', ScrollTrigger.update)`;
`gsap.ticker.add(t => lenis.raf(t*1000))`; `gsap.ticker.lagSmoothing(0)`.

**Category hero** (`pin: true, start: 'top top', end: '+=120%', scrub: 1`)
```
0.00 → 1.00  frame progress p: outer scale (sx,sy) → (1,1); inner img counter-scale k/sx,k/sy
0.00 → 0.45  marquee + h1 + price: y → -12vh, opacity → 0   (ease none)
0.80 → 1.00  slider UI (arrows, counter, caption) opacity 0 → 1
```
Load intro: marquee chars-line `yPercent 100→0` (1.4s expo.out), h1 lines stagger .08,
frame `scale .6→1` + opacity (1.2s expo.out).

**Hero slider** (click / ←→ keys): incoming slide wrapper `xPercent ±100→0` with inner image
`xPercent ∓100→0` (mask wipe) + outgoing image `xPercent 0→∓30`, 1.2s expo.inOut; counter
digits roll (`yPercent`).

**Reveals** (`start: 'top 85%'`, once): SplitType lines in masks, `yPercent 110→0`, 1.2s
expo.out, stagger .08; split reverted after completion so resize can't break lines.
Hairlines `scaleY 0→1` 1.2s expo.out. Figures `y 60→0, opacity 0→1` 1.2s power3.out.

**Parallax** (`start: 'top bottom', end: 'bottom top', scrub: true`): inner image
`yPercent -10 → 10` on an image 120% tall.

**Next strip** (`pin`, `end: '+=60%'`, scrub): image `scale 1.15→1`, title `y 40→0`,
progress line `scaleX 0→1`; `onLeave`/progress ≥ .999 → `transition.go(next)`.

**Home pinned timeline** (`end: '+=240%'`, scrub 1)
```
0.00 → 0.40  hero photo y 0→110%, scale 1→.92 ; hero text y→-15vh, opacity→0
0.10 → 0.50  columns yPercent 105→0, stagger .1, ease power3.out
0.50 → 1.00  photo strip reveal 0.22 → 0.60 (mask translate), ease power1.inOut
```
**Column expand** (click): new column widths (expanded .52, others share), positions
`x` + mask offsets tweened 1.1s expo.inOut — transform-only via overlapping columns.

**Page transition**: panel (`--target-colour`) `xPercent -100→0` 0.9s expo.inOut, title
fades in → swap route, `lenis.scrollTo(0,{immediate:true})`, `ScrollTrigger.refresh()` →
panel `xPercent 0→100` 0.9s expo.inOut → page intro timeline.

**Cursor**: `gsap.quickTo(x/y, .5, power3.out)`; ring `scale 1→2.6` with label on
`[data-cursor]` targets. Disabled unless `(hover:hover) and (pointer:fine)`.

**Reduced motion**: Lenis off, no pins or scrubs, reveals become instant opacity, wipe becomes a
0.3s fade, cursor off.
