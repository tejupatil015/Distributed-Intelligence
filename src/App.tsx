import { useEffect, useRef } from "react";
import { initEnhancements } from "./motion/enhance";
import { SiteProvider, useSite } from "./context/SiteContext";
import { Nav } from "./components/Nav";
import { SelectionMenu } from "./components/SelectionMenu";
import { ContactDrawer } from "./components/ContactDrawer";
import { Cursor, Preloader, Transition } from "./components/Chrome";
import { HomePage } from "./pages/Home";
import { CategoryPage } from "./pages/Category";

function AppShell() {
  const { ready, activeCategory } = useSite();
  const mainRef = useRef<HTMLElement>(null);

  return (
    <>
      <a
        href="#main"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Skip to content
      </a>
      <Nav />
      <SelectionMenu />
      <ContactDrawer />
      <main id="main" ref={mainRef} tabIndex={-1} style={{ outline: "none" }}>
        {ready &&
          (activeCategory ? (
            <CategoryPage key={activeCategory.slug} cat={activeCategory} />
          ) : (
            <HomePage key="home" />
          ))}
      </main>
      <Transition />
      <Cursor />
      <Preloader />
    </>
  );
}

export default function App() {
  useEffect(() => initEnhancements(), []);

  return (
    <SiteProvider>
      <AppShell />
    </SiteProvider>
  );
}
