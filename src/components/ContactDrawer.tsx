import { useEffect, useRef, useState, type FormEvent } from "react";
import { categories } from "../data/categories";
import { useSite } from "../context/SiteContext";
import { gsap, useGSAP, isReducedMotion } from "../hooks/useMediaPreferences";
import { Arrow } from "./ui";

export function ContactDrawer() {
  const {
    contactOpen,
    contactDefaultSlug,
    closeContact,
    stopScroll,
    startScroll,
  } = useSite();

  const rootRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const firstRenderRef = useRef(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedSlug, setSelectedSlug] = useState(contactDefaultSlug);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSelectedSlug(contactDefaultSlug);
  }, [contactDefaultSlug]);

  useGSAP(
    () => {
      const el = rootRef.current;
      if (!el) return;
      const r = isReducedMotion();
      tlRef.current = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .set(el, { visibility: "visible" })
        .fromTo(
          ".cdrawer__veil",
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: "power2.out" },
          0
        )
        .fromTo(
          ".cdrawer__panel",
          { xPercent: r ? 0 : 100, opacity: r ? 0 : 1 },
          { xPercent: 0, opacity: 1, duration: r ? 0.3 : 0.85, ease: "expo.inOut" },
          0
        )
        .fromTo(
          ".cdrawer__item",
          { y: r ? 0 : 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.06 },
          r ? 0.15 : 0.35
        );
    },
    { scope: rootRef }
  );

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    const tl = tlRef.current;
    if (!tl) return;

    if (contactOpen) {
      setSubmitted(false);
      stopScroll();
      tl.timeScale(1).play();
    } else {
      tl.timeScale(1.5).reverse();
      startScroll();
    }
  }, [contactOpen, stopScroll, startScroll]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && contactOpen) closeContact();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [contactOpen, closeContact]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitted(true);
  };

  return (
    <div
      className="cdrawer"
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Private inquiry"
      aria-hidden={!contactOpen}
      inert={!contactOpen}
    >
      <div className="cdrawer__veil" onClick={closeContact} />
      <aside className="cdrawer__panel">
        <div className="cdrawer__head cdrawer__item">
          <span className="label muted">Private Advisory</span>
          <button
            type="button"
            className="u-link u-link--rev"
            onClick={closeContact}
          >
            Close
          </button>
        </div>

        {submitted ? (
          <div className="cdrawer__thanks">
            <span className="label muted">Inquiry received</span>
            <h3 className="h2" style={{ fontSize: "clamp(28px, 3vw, 46px)" }}>
              Thank you, {name}.
            </h3>
            <p className="muted">
              Our senior advisor for{" "}
              {categories.find((c) => c.slug === selectedSlug)?.name ??
                "Solenne"}{" "}
              will write to <strong>{email}</strong> within one business day with
              a private dossier.
            </p>
            <button
              type="button"
              className="u-link"
              onClick={() => {
                setSubmitted(false);
                setName("");
                setEmail("");
                setMessage("");
                closeContact();
              }}
            >
              Return to page <Arrow />
            </button>
          </div>
        ) : (
          <form className="cdrawer__form" onSubmit={handleSubmit}>
            <h2
              className="h2 cdrawer__item"
              style={{ fontSize: "clamp(28px, 3.2vw, 48px)" }}
            >
              Arrange a private conversation
            </h2>
            <p className="muted cdrawer__item">
              Tell us which landscape calls to you and we will share floor
              plans, off-market availability and viewing dates.
            </p>

            <div className="cdrawer__field cdrawer__item">
              <span className="label">Collection of interest</span>
              <div className="cdrawer__pills">
                {categories.map((c) => {
                  const active = selectedSlug === c.slug;
                  return (
                    <button
                      type="button"
                      key={c.slug}
                      onClick={() => setSelectedSlug(c.slug)}
                      className={`cdrawer__pill ${active ? "is-active" : ""}`}
                      style={
                        active
                          ? { backgroundColor: c.color, borderColor: c.color, color: "#fff" }
                          : undefined
                      }
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="cdrawer__field cdrawer__item">
              <span className="label">Your name</span>
              <input
                type="text"
                required
                placeholder="Elena Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label className="cdrawer__field cdrawer__item">
              <span className="label">Email address</span>
              <input
                type="email"
                required
                placeholder="elena@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="cdrawer__field cdrawer__item">
              <span className="label">Notes (optional)</span>
              <textarea
                rows={3}
                placeholder="Preferred dates, bedroom count, or investment horizon..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>

            <div className="cdrawer__foot cdrawer__item">
              <button type="submit" className="u-link" data-cursor="Send">
                Request private dossier <Arrow />
              </button>
              <a
                href="mailto:hello@nemo.example"
                className="label muted u-link--rev"
              >
                Or email hello@nemo.example
              </a>
            </div>
          </form>
        )}
      </aside>
    </div>
  );
}
