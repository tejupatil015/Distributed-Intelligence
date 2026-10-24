import { Img } from "../components/ui";

export function Parallax({ src, label }: { src: string; label: string }) {
  return (
    <section
      className="wide ph"
      data-parallax="10"
      data-nav-theme="light"
      aria-label={label}
    >
      <div className="wide__inner" data-parallax-inner>
        <Img src={src} alt="" />
      </div>
    </section>
  );
}
