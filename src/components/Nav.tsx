import { useSite } from "../context/SiteContext";
import { Mark, TLink } from "./ui";

export function Nav() {
  const { menuOpen, toggleMenu, closeMenu, scrollToAbout, openContact } = useSite();

  return (
    <header className="nav">
      <TLink
        to="/"
        className="nav__logo"
        aria-label="Solenne Estates — home"
        cursor="Home"
        onNavigate={closeMenu}
      >
        <Mark />
        <span>Solenne</span>
      </TLink>
      <nav className="nav__links" aria-label="Secondary">
        <button
          type="button"
          className="u-link u-link--rev"
          onClick={scrollToAbout}
          data-cursor="About"
        >
          About
        </button>
        <button
          type="button"
          className="u-link u-link--rev"
          onClick={() => openContact()}
          data-cursor="Inquire"
        >
          Contact
        </button>
      </nav>
      <div className="nav__actions">
        <button
          type="button"
          className="nav__sel"
          aria-expanded={menuOpen}
          aria-controls="selection-menu"
          onClick={toggleMenu}
        >
          <span className="nav__sel-text">
            {menuOpen ? "Close" : "Our Selection"}
          </span>
          <span className="nav__sel-icon" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
        </button>
        <button
          type="button"
          className="nav__burger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="selection-menu"
          onClick={toggleMenu}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
