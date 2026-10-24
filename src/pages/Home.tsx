import { useRef } from "react";
import { useSite } from "../context/SiteContext";
import { ScrollTrigger, useGSAP } from "../hooks/useMediaPreferences";
import { HomeStage } from "../sections/HomeStage";
import { HomeStatement } from "../sections/HomeStatement";
import { Footer } from "../components/Chrome";

export function HomePage() {
  const { setNavTheme } = useSite();
  const footWrapRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = footWrapRef.current;
      if (!el) return;
      ScrollTrigger.create({
        trigger: ".footer",
        start: "top 4%",
        end: "bottom top",
        onToggle: (s) => {
          if (s.isActive) setNavTheme("light");
        },
      });
    },
    { scope: footWrapRef, dependencies: [setNavTheme] }
  );

  return (
    <div className="page">
      <HomeStage />
      <HomeStatement />
      <div ref={footWrapRef}>
        <Footer />
      </div>
    </div>
  );
}
