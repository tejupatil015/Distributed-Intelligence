# Site analysis — reference category page (realevate.agency/urbanliving) + home

> **Method & limits.** This environment has no GUI browser agent, screenshot or
> screen-recording capability. The analysis below was produced by downloading and
> reading the live page's HTML (home + category), its production stylesheet
> (`style.min.css`, ~178 KB: design tokens, layout rules, media queries) and its
> application bundle (`realevate-app.js`, ~285 KB: GSAP/ScrollTrigger/SplitText
> timelines, eases, durations). Values marked *(src)* are read directly from source;
> values marked *(est.)* are inferred from the code paths. Nothing (text, images,
> logo, code) is reused in the build — only structure, rhythm and motion ideas.

---

## 1. Section order & layout — category page (`/urbanliving`)

All sections sit on a 12-column grid: `--grid-padding: 4.5vw`, `--grid-gap: 2.601vw` *(src)*.
Sizes are almost entirely in `vw`, so the layout scales proportionally with width;
tablet multiplies by 1.54 and mobile by 2.25 (`--tablet-size-scale`, `--mobile-size-scale`).

| # | Section | Layout |
|---|---------|--------|
| 0 | **Nav** (fixed) | Logo left (20vw wide wordmark), "About" + "Contact" underline links mid, right: "Our Selection" button with a 2×2 square icon + a hamburger (2 bars, the bottom one shorter). |
| 1 | **Category hero** (pinned "scroll stage") | Top: a small square visual (20vw × 20vw) beside a giant single-line **marquee title** (16vw, the category name). Bottom: H1 (≈42vw wide, sans, 3–4 lines) + a "Starting from …€" price line. Footer label "(Scroll)" bottom-left. On scroll the square visual grows (grow-scale 2 → end height 110svh) to become a full-bleed cover, then releases. |
| 2 | **Gallery intro** | Centered column: a 1px vertical hairline (35% opacity, category colour), serif H2 (5.2vw, weight 200, capitalised), muted sans paragraph (max ≈ 34vw). Section padding ≈ 14vw top. |
| 3 | **Projects slider** | Horizontal track of ~52vw × 34vw slides; the *whole track is rotated −8°* and each slide counter-rotated +8°, giving a diagonal tilted ribbon. Drag (grab cursor) + prev/next arrow buttons. |
| 4 | **Outro marquee + quote band** | Marquee repeat of the category name, then a centered block: square image (≈ 9vw), serif quote at H2 size, attribution (name + "/ source / year"). |
| 5 | **Full-bleed parallax image** | 100vw image in an overflow-hidden viewport; image translates on scroll (scrub). |
| 6 | **Values / feature rows** ×3 | Alternating rows on the 12-col grid: figure cols 1–4 ↔ copy cols 10–13 (reversed on the even row). Copy = H3 stat (2 lines, ≈3.1vw) + short paragraph. Row gap 5vw. |
| 7 | **Pull quote** | Large serif quote with an oversized hanging opening quote mark, attribution below. |
| 8 | **Full-bleed parallax image** | Same as #5. |
| 9 | **CTA** | Full-width band in the *category colour*, white text: hairline, H2 "Start your … life", underline link "Speak with us →". |
| 10 | **Next-category strip** | Full-viewport image of the *next* category with a 20% black overlay, centered: label "Next", H2 title, H6 descriptor. Hover scales image to 1.1. Scrolling to the end of it (or clicking) triggers a "flight" page transition into the next category. |

## 2. Home page (`/`)

- Opening preloader: a counter steps 27 → 42 → 68 → 92 → 99 (`power4.out` enter, `expo.out` ticks), while the four category cover images reveal with a clip-path one after another, then morph into the hero image (`power2.inOut`).
- Hero: same grammar as category hero — small visual + giant marquee line ("Elevating Life"-style brand motto), H1 investment headline, price line, © footer.
- **Our Selection** (menu + home category experience): four equal columns (`grid-template-columns: repeat(4,1fr)`), each column = coloured panel (category colour) with a small brand symbol top-left, a **vertical title** (`writing-mode: vertical-rl; rotate(180deg)`, reads bottom-to-top, bottom-right aligned), a two-line descriptor bottom-left at 80% opacity, and a **photo strip** (cover image, ~20svh tall) beneath the panel. Hover: column brightness 1.08, photo scale 1.045 + soft radial light overlay.
- When the menu opens, the current page ("page stage") is pushed down / shrunk to the bottom of the viewport, revealing the cards behind it.

## 3. Colour palette *(src)*

| Token | Hex | Use |
|---|---|---|
| brand navy | `#1F2B5E` | logo, links, home accents |
| muted | `#626C95` | secondary text |
| white | `#FFFFFF` | page background on light sections |
| near-white | `#F7F8FC`, `#E3E5EB`, `#DEDFE4` | rules, form fields |
| By the Sea | `#222A4C` / muted `#5D668D` | category colour |
| Evergreen | `#36614D` / muted `#80988E` | category colour |
| Urban Living | `#2D1C2D` / muted `#6B5A6B` | category colour (also theme-color) |
| Rare Gems | `#1C181D` / muted `#5C585D` | category colour |
| overlay | `rgba(0,0,0,.2)` | next-strip overlay |

Each page sets `--category-color` / `--category-color-muted`, which recolours headings, hairlines, CTA band and the transition panel.

## 4. Fonts *(src)*

- **Sans:** "Google Sans" weight 500 (UI, body, H1, nav). Letter-spacing −0.01em.
- **Display serif:** "Roslindale Display" weight 200–300 with `ss01` (H2 section titles, quotes).
- **Extended:** "Monument Extended" (rare accents).

## 5. Type scale (desktop, `vw` based) *(src)*

| Role | Size | Line-height | Tracking |
|---|---|---|---|
| H1 / marquee | 16vw (marquee), H1 copy ~1.736vw lead | 1 | −0.02em |
| H2 | 5.2vw | 0.94 | −0.03em |
| H3 | 3.646vw (values stat ×0.85) | 0.92 | −0.05em |
| H4 | 1.5vw | 1.3 | −0.01em |
| H5 / lead | 1.736vw | 1.35 | −0.01em |
| H6 | 1.447vw | 1.4 | −0.01em |
| Body | 1.2vw | 1.35 | −0.01em |

At 1440px: body ≈ 17px, H2 ≈ 75px, marquee ≈ 230px.

## 6. Animation inventory

Global easing token: `--standard-easing: cubic-bezier(.7,.6,0,1)` *(src)* (a fast-out, very
long tail curve — visually close to `expo.inOut`/`expo.out`). `--overlay-duration: .8s`.
GSAP ease frequency in bundle *(src)*: `none` (scrubs) ×10, `power2.out` ×8, `expo.inOut` ×8,
`power2.inOut` ×7, `power4.out` ×3, `power3.out` ×2. Durations most used: 1, 1.4, 1.6, 0.6, 0.8.
Staggers: 0.008–0.025 (SplitText chars), 0.045, 0.08 (lines/items).
No Lenis in the bundle — they use a custom `smoothScrollInstance` (lerped virtual scroll).

| Animation | Trigger | What moves | Duration / ease |
|---|---|---|---|
| Hero intro | page load | marquee text slides up through a mask (`.marquee-reveal`), H1 lines reveal, visual clip-path opens | ~1.4–1.6s, `expo.inOut` / `power4.out` |
| Category hero grow | scroll, pinned (`start: top top`, scrub) | square visual scales/grows to full bleed (grow-scale 2, end 110svh); text fades | scrub, `none` |
| Text reveals | ScrollTrigger `top 90%` | SplitText lines/words translateY 100%→0 inside masks | ~1s, `power2.out`/`power3.out`, stagger 0.045–0.08 |
| Hairlines | enter viewport | 1px line scaleY 0→1 from top | ~1s `expo.out` *(est.)* |
| Projects slider | arrow click / drag | track translateX by one slide (on the −8° axis) | ~1–1.2s `expo.out` *(est.)* |
| Parallax images | scroll (`top bottom` → `bottom top`, scrub) | inner image translateY ±10–15% | scrub, `none` |
| Next strip parallax | scroll | `.category-next__parallax` translateY | scrub |
| Next strip hover | hover | image-wrap scale 1 → 1.1, overlay darkens | CSS transition, standard easing ~0.8s |
| Next transition | reach end of strip / click | scroll locked, strip "flies" to full screen, new page fades in under it | ~1.4s `expo.inOut` |
| Selection menu open | "Our Selection" click | page stage drops/shrinks to bottom, cards revealed; hover states active | 0.8–1.4s `expo.inOut` |
| Selection swap | click a card | transition panel in category colour + separator line, new page | ~1.4s `expo.inOut` |
| Custom cursor | mouse (hover-capable devices) | circle scale 0→1 on interactive targets, labels ("Drag", "Play") masked | CSS transition |
| Card hover | hover | brightness 1.08, cover image scale 1.045 | CSS transition |

## 7. Navigation structure

```
/  (home)  ──Our Selection menu──► /bythesea  /evergreen  /urbanliving  /raregems
                                     │            │            │            │
                                     └─ Next ───► └─ Next ───► └─ Next ───► └─ Next ─► (wraps to /bythesea)
/about, /contact (nav links; contact also from each CTA)
```
It is an SPA: links are intercepted, the outgoing page is kept as `#page-stage`, the new
one is mounted as `#page-stage-incoming`, and a transition class drives the animation.

## 8. Responsive changes

- Breakpoints use scale multipliers (desktop 1, tablet 1.54, mobile 2.25), so text grows relative to vw on small screens.
- Selection cards become a **2×2 grid of squares** on tablet/mobile; vertical titles become horizontal, right-aligned at the bottom; descriptor max-width 58%.
- Values rows stack (figure then copy). Slider slides become ~80vw.
- A "Please rotate your device" overlay appears on landscape phones.
- Custom cursor disabled on touch.
