import { Link, NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `link-underline text-sm font-medium tracking-wide transition-colors duration-200 ${
    isActive
      ? "text-white is-active"
      : "text-white/60 hover:text-white"
  }`;

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-black">
      <div className="container-page flex items-center justify-between h-20">

        {/* LOGO */}
        <Link
          to="/"
          className="group flex items-center shrink-0"
        >
          <img
            src="/logo.png"
            alt="EM Cars"
            className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </Link>

        {/* NAVIGATION */}
        <nav className="hidden md:flex items-center gap-9">
          <NavLink to="/" end className={linkClass}>
            Forside
          </NavLink>

          <NavLink to="/biler" className={linkClass}>
            Biler
          </NavLink>

          <NavLink to="/saelg-din-bil" className={linkClass}>
            Sælg din bil
          </NavLink>

          <NavLink to="/om-os" className={linkClass}>
            Om os
          </NavLink>

          <NavLink to="/kontakt" className={linkClass}>
            Kontakt
          </NavLink>
        </nav>

      </div>
    </header>
  );
}