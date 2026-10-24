import { useRef } from "react";
import { useSite } from "../context/SiteContext";
import { gsap, ScrollTrigger, useGSAP } from "../hooks/useMediaPreferences";
import { revealLines, revealUp } from "../hooks/useReveal";

const HOME_STATS = [
  ["01", "Faster Decisions — Make informed decisions with clear, data-driven insights."],
  ["02", "Less Manual Work — Reduce repetitive tasks through intelligent automation."],
  ["03", "Better Visibility — Track orders, monitor operations, and understand performance in one place."],
] as const;

export function HomeStatement() {
  const { setNavTheme } = useSite();
  const rootRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const el = rootRef.current;
      if (!el) return;
      revealLines(textRef.current);
      revealUp(labelRef.current);
      revealUp(gsap.utils.toArray(".stat", el), { stagger: 0.1 });
      ScrollTrigger.create({
        trigger: el,
        start: "top 4%",
        end: "bottom 4%",
        onToggle: (s) => {
          if (s.isActive) setNavTheme("dark");
        },
      });
    },
    { scope: rootRef, dependencies: [setNavTheme] }
  );

  return (
    <section className="statement" ref={rootRef} id="about">
      <span className="label statement__label" ref={labelRef}>
        (Why Distributed Intelligence)
      </span>

      <p className="statement__text" ref={textRef} data-lines>
        Turn complex data into clear decisions. Distributed Intelligence helps
        you save time, reduce manual effort, improve operational visibility,
        and make smarter decisions through connected data and intelligent insights.
      </p>
      <div className="stats">
        {HOME_STATS.map(([n, t]) => (
          <div className="stat" key={n}>
            <div className="stat__num">{n}</div>
            <p className="stat__txt">{t}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
