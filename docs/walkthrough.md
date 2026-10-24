# Walkthrough & verification report

Verified with headless Chromium (Playwright) against the production build (`vite preview`), at
**1440×900** and **390×844 (touch)**. Screenshots are in `docs/screens/` (`desktop-*`, `mobile-*`).

## Results
| Check | Result |
|---|---|
| Console errors / page errors | **None** (desktop and mobile) |
| Horizontal overflow (checked on 9 sections) | **None** |
| Column click expands, second click switches | ✅ `desktop-05`, `desktop-06`, `mobile-05` |
| Our Selection menu opens, hover state | ✅ `desktop-07`, `desktop-08` |
| Colour-panel transition | ✅ `desktop-09` (mid-wipe, destination title) |
| Hero frame grows into full-screen slider | ✅ `desktop-10 → 11 → 12` |
| Slider arrows (mask wipe, caption/counter roll) | ✅ `desktop-13` (mid) → `desktop-14` |
| Resize 1440 → 1100 → 1440, pins re-measure | ✅ `desktop-16` (ScrollTrigger refreshInit re-measures the slot and columns) |
| Next strip: hover zoom, scroll-to-end advances | ✅ `desktop-17/18`, URL becomes `#/singular` on both viewports |
| Keyboard | Columns are `role=button` (Enter/Space), ←/→ drive the hero slider, Esc closes the menu and collapses columns, skip link, visible `:focus-visible` outlines |

## Tour
1. **Home hero** (`01`): full-bleed photo, drifting motto marquee, H1, price.
2. **Scroll** (`02–04`): the photo drops away while four coloured columns rise in a stagger. Photo
   strips then grow from 22% to 56% of the column height.
3. **Click** a column (`05/06`): it widens to 52% with a blurb and "Explore"; clicking it again
   opens the collection.
4. **Menu** (`07/08`): the sheet slides down and the cards rise.
5. **Category page** (`10–15`): pinned hero frame → full-screen slider → intro + parallax portrait →
   quote band with marquee → full-bleed parallax → alternating feature rows → pull quote →
   parallax → CTA band in the collection colour → **Next strip** (`17–19`).

## Differences found and what happened to them
| Difference / issue | Status |
|---|---|
| Category H1 floated mid-screen (flex `space-between` with 3 children) | **Fixed**: bottom group wrapper |
| Text inherited brand navy instead of the collection colour | **Fixed**: `--c` set on `.page` and `<html>` |
| Collapsed-column descriptor collided with the vertical title | **Fixed**: narrower measure, fades on dimmed columns |
| Cursor label blurry (it scaled with the ring) and stale after a route swap | **Fixed**: unscaled sibling label, reset on `hashchange` |
| Feature stats on one line (reference stacks them on two) | **Fixed**: `max-width: 6.4em` |
| Mobile hero had a large empty band | **Fixed**: frame enlarged to 64vw |
| Reference uses a preloader that morphs four category images into the hero | Simplified to a counter preloader (fewer, better animations) |
| Reference slider is a −8° tilted ribbon | Replaced by the brief's full-screen hero slider with arrows |
| Reference "flight" transition scales the next image to full screen | Replaced by the requested colour-panel wipe |
| Research done from source (HTML/CSS/JS), not screen captures | Environment limitation; see `site-analysis.md` |
