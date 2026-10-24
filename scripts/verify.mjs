// Headless verification pass (Playwright). Not part of the site bundle.
// Usage: npm run build && npx vite preview --port 4173 & node scripts/verify.mjs
import { chromium } from "playwright";
import fs from "fs";
const OUT = process.env.OUT || "/tmp/shots";
fs.mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:4173/";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const log = [];

async function run(name, vp, mobile) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message));
  const shot = async (n) => page.screenshot({ path: `${OUT}/${name}-${n}.png` });
  const overflow = async (label) => {
    const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: window.innerWidth }));
    if (o.sw > o.w) log.push(`[${name}] OVERFLOW at ${label}: ${o.sw} > ${o.w}`);
  };
  const scrollBy = async (px, steps = 8) => {
    if (mobile) { await page.evaluate((y) => window.scrollBy(0, y), px); await wait(1000); return; }
    await page.mouse.move(vp.width / 2, vp.height / 2);
    for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, px / steps); await wait(40); }
    await wait(1200);
  };
  const jumpTo = async (sel, extra = 0) => {
    await page.evaluate(([s, e]) => {
      const el = document.querySelector(s);
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + e);
    }, [sel, extra]);
    await wait(1300);
  };

  await page.goto(BASE, { waitUntil: "networkidle" });
  await wait(3400);
  await shot("01-home-hero"); await overflow("home hero");
  const vh = vp.height;
  await scrollBy(vh * 0.5); await shot("02-home-drop");
  await scrollBy(vh * 0.7); await shot("03-home-columns");
  await scrollBy(vh * 1.0); await shot("04-home-strips");
  const cols = await page.$$(".col");
  await cols[2].click({ position: { x: 30, y: 60 } }); await wait(1600); await shot("05-home-col-expanded");
  await cols[0].click({ position: { x: 30, y: 60 } }); await wait(1600); await shot("06-home-col-switch");
  await overflow("columns");
  await jumpTo(".statement", -100); await shot("06b-home-statement");
  await jumpTo(".footer"); await shot("06c-home-footer");
  await page.click(".nav__burger"); await wait(1900); await shot("07-menu-open");
  if (!mobile) { await page.hover(".mcard:nth-child(2)"); await wait(1000); await shot("08-menu-hover"); }
  await page.click('.mcard[href="#/cityscape"]'); await wait(650); await shot("09-transition-panel");
  await wait(2600); await shot("10-city-hero"); await overflow("city hero");
  await scrollBy(vh * 0.55); await shot("11-city-grow");
  await scrollBy(vh * 0.9); await shot("12-city-slider");
  await page.click(".chero__next"); await wait(550); await shot("13-slider-mid");
  await wait(1200); await shot("14-slider-next");
  for (const s of ["intro", "quote", "wide", "features", "pull", "cta"]) {
    await jumpTo("." + s, vh * 0.1); await shot(`15-city-${s}`); await overflow(s);
  }
  await jumpTo(".intro__media", -vh * 0.2); await shot("15b-city-intro-media");
  if (!mobile) {
    await page.setViewportSize({ width: 1100, height: 800 }); await wait(1500);
    await page.evaluate(() => window.scrollTo(0, 0)); await wait(900);
    await scrollBy(700); await shot("16-after-resize"); await overflow("after resize");
    await page.setViewportSize(vp); await wait(1500);
  }
  await jumpTo(".next"); await shot("17-next-strip");
  if (!mobile) { await page.hover(".next__content"); await wait(1500); await shot("18-next-hover"); }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await wait(300);
  if (!mobile) await scrollBy(300, 3);
  await wait(4000); await shot("19-after-next");
  log.push(`[${name}] url after next strip: ${page.url()}`);
  log.push(`[${name}] console errors: ${errors.length ? errors.join(" | ") : "none"}`);
  await browser.close();
}

await run("desktop", { width: 1440, height: 900 }, false);
await run("mobile", { width: 390, height: 844 }, true);
console.log(log.join("\n"));
