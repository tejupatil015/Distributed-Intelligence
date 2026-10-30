import { useState, type MouseEvent, type ReactNode } from "react";
import { useSite } from "../context/SiteContext";
import { bySlug } from "../data/categories";

/** Image component with React loaded state and gradient placeholder underneath. */
export function Img({
  src,
  alt = "",
  eager = false,
  className = "",
}: {
  src: string;
  alt?: string;
  eager?: boolean;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const { queueRefresh } = useSite();

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      onLoad={() => {
        setLoaded(true);
        queueRefresh();
      }}
      onError={() => setLoaded(false)}
      className={`img ${loaded ? "is-loaded" : ""} ${className}`}
    />
  );
}

/** Internal navigation link that triggers the React colour-panel transition via SiteContext. */
export function TLink({
  to,
  children,
  className,
  cursor,
  onNavigate,
  ...rest
}: {
  to: string;
  children: ReactNode;
  className?: string;
  cursor?: string;
  onNavigate?: () => void;
  tabIndex?: number;
  "aria-label"?: string;
}) {
  const { navigateTo } = useSite();

  const onClick = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    e.stopPropagation();
    onNavigate?.();
    const cat = bySlug(to.replace("/", ""));
    navigateTo(to, cat?.color ?? "#1E2754", cat?.name ?? "Nemo");
  };

  return (
    <a
      href={`#${to}`}
      onClick={onClick}
      className={className}
      data-cursor={cursor}
      {...rest}
    >
      {children}
    </a>
  );
}

export const Arrow = ({ dir = "right" }: { dir?: "left" | "right" }) => (
  <svg
    viewBox="0 0 18 14"
    fill="none"
    aria-hidden="true"
    width="17"
    height="13"
    style={{ transform: dir === "left" ? "scaleX(-1)" : undefined }}
  >
    <path d="M0 7h16M10.5 1 16.5 7l-6 6" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

/** Original brand mark: a sun disc setting into a horizon line. */
export const Mark = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 14a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" />
    <path d="M1 18h22" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export function Marquee({
  text,
  accent,
  dur = 38,
  className = "",
}: {
  text: string;
  accent?: string;
  dur?: number;
  className?: string;
}) {
  return (
    <div className={`marquee ${className}`} aria-hidden="true">
      <div
        className="marquee__track"
        style={{ ["--marquee-dur" as string]: `${dur}s` }}
      >
        {[0, 1, 2, 3].map((k) => (
          <span className="marquee__item" key={k}>
            {text}
            {accent && <i>{accent}</i>}
          </span>
        ))}
      </div>
    </div>
  );
}
