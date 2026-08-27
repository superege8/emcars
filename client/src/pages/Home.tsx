import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { Car } from "../types";
import CarCard from "../components/CarCard";
import Reveal from "../components/Reveal";
import Eyebrow from "../components/Eyebrow";

function CarMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 220"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M40 150 L85 150 L120 95 Q135 72 165 72 L430 72 Q460 72 478 96 L515 150 L600 150 Q612 150 612 163 L612 178 Q612 190 600 190 L570 190 M40 190 Q28 190 28 178 L28 163 Q28 150 40 150 Z M130 150 L505 150"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="140"
        cy="190"
        r="26"
        stroke="currentColor"
        strokeWidth="6"
      />
      <circle
        cx="490"
        cy="190"
        r="26"
        stroke="currentColor"
        strokeWidth="6"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 12.5L12.5 20a1.5 1.5 0 01-2.12 0l-6.38-6.38a1.5 1.5 0 010-2.12L11.5 4H19a1 1 0 011 1v7.5z" />
      <circle cx="15" cy="9" r="1.4" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 5h16v10H8l-4 4V5z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function ArrowLink({
  to,
  children,
}: {
  to: string;
  children: string;
}) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-1.5 text-sm font-medium text-white/60 hover:text-white transition-colors duration-200"
    >
      {children}
      <span className="transition-transform duration-300 ease-out group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState<Car[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    api
      .get<{ items: Car[] }>("/cars?pageSize=6&sort=newest")
      .then((r) => setFeatured(r.items))
      .catch(() => {})
      .finally(() => setLoaded(true));

    const t = requestAnimationFrame(() => setMounted(true));

    return () => cancelAnimationFrame(t);
  }, []);

  const heroCar = featured[0];
  const restOfLager = featured.slice(1);
  const breakCar = featured[1] || featured[0];

  const heroStyle = (delay: number) => ({
    opacity: mounted ? undefined : 0,
    animationDelay: `${delay}ms`,
  });

  return (
    <div className="bg-[#131316] text-white">

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#131316]">
        <div className="noise-overlay" />

        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-[110px]" />

        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-white/[0.03] blur-[90px]" />

        <div className="relative container-page py-20 sm:py-28 grid gap-14 lg:grid-cols-2 items-center">

          <div className="relative z-10">

            <div
              className={mounted ? "animate-fade-up" : ""}
              style={heroStyle(0)}
            >
              <Eyebrow>EM Cars</Eyebrow>
            </div>

            <h1
              className={`mt-5 text-5xl sm:text-6xl text-white leading-[1.05] ${
                mounted ? "animate-fade-up" : ""
              }`}
              style={heroStyle(90)}
            >
              Kvalitetsbiler til fair priser.
            </h1>

            <p
              className={`mt-6 max-w-md text-white/60 text-lg leading-relaxed ${
                mounted ? "animate-fade-up" : ""
              }`}
              style={heroStyle(180)}
            >
              Vi gennemgår hver bil grundigt og er ærlige om stand, historik
              og pris — så du kan træffe din beslutning med ro i maven.
            </p>

            <div
              className={`mt-10 flex flex-col sm:flex-row gap-4 ${
                mounted ? "animate-fade-up" : ""
              }`}
              style={heroStyle(270)}
            >
              <Link
                to="/biler"
                className="btn-primary group"
              >
                Se vores biler
                <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  window.location.href = `/biler?q=${encodeURIComponent(q)}`;
                }}
                className="flex rounded-md border border-white/20 bg-white/5 overflow-hidden transition-colors duration-300 focus-within:border-white/40 focus-within:bg-white/[0.08]"
              >
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Søg på mærke eller model..."
                  className="w-56 bg-transparent px-4 text-sm text-white placeholder:text-white/40 focus:outline-none"
                />

                <button
                  className="px-5 text-sm font-medium text-white/70 hover:text-white transition-colors"
                  type="submit"
                >
                  Søg
                </button>
              </form>
            </div>
          </div>

          <div
            className={`relative hidden lg:block ${
              mounted ? "animate-fade-up" : ""
            }`}
            style={heroStyle(200)}
          >
            <div className="absolute -inset-4 border border-white/10 rounded-lg" />

            <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-white/5 shadow-card-lg">
              {heroCar?.images[0] ? (
                <img
                  src={heroCar.images[0].url}
                  alt={`${heroCar.make} ${heroCar.model}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <CarMark className="w-3/4 h-auto text-white/15" />
                </div>
              )}
            </div>

            {heroCar && (
              <div className="absolute -bottom-6 -left-6 rounded-xl border border-white/10 bg-[#1c1c1f] px-5 py-4 animate-float">
                <p className="text-xs text-white/45 mb-0.5">
                  {heroCar.make} {heroCar.model}
                </p>

                <p className="text-lg font-semibold tracking-tight text-white">
                  {heroCar.price.toLocaleString("da-DK")} kr.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* LAGER */}
      <section className="container-page py-24">
        <Reveal>
          <div className="flex items-end justify-between mb-10">
            <div>
              <Eyebrow className="mb-2">
                Lager
              </Eyebrow>

              <h2 className="text-3xl text-white">
                Biler på lager
              </h2>
            </div>

            {featured.length > 0 && (
              <ArrowLink to="/biler">
                Se alle biler
              </ArrowLink>
            )}
          </div>
        </Reveal>

        {loaded && featured.length === 0 ? (
          <Reveal delay={80}>
            <div className="rounded-xl border border-white/10 bg-[#1c1c1f] px-10 py-20 text-center">
              <p className="text-lg font-medium text-white">
                Vi har i øjeblikket ingen biler på lager.
              </p>

              <p className="text-white/65 mt-2 max-w-md mx-auto">
                Nye biler bliver løbende lagt op. Kontakt os gerne,
                hvis du leder efter noget specifikt.
              </p>

              <Link
                to="/kontakt"
                className="btn-secondary mt-8"
              >
                Kontakt EM Cars
              </Link>
            </div>
          </Reveal>
        ) : (
          <div className="space-y-6">

            {heroCar && (
              <Reveal delay={80}>
                <Link
                  to={`/biler/${heroCar.slug}`}
                  className="
                    group
                    grid
                    sm:grid-cols-2
                    overflow-hidden
                    rounded-xl
                    border
                    border-white/10
                    bg-[#1c1c1f]
                    transition-all
                    duration-300
                    ease-out
                    hover:-translate-y-1
                    hover:border-white/20
                    hover:shadow-xl
                  "
                >
                  <div className="aspect-[4/3] sm:aspect-auto overflow-hidden bg-[#151517]">
                    {heroCar.images[0] ? (
                      <img
                        src={heroCar.images[0].url}
                        alt={`${heroCar.make} ${heroCar.model}`}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-white/25 text-sm">
                        Intet billede
                      </div>
                    )}
                  </div>

                  <div className="p-8 sm:p-10 flex flex-col justify-center">
                    <Eyebrow className="mb-3">
                      Nyeste i lager
                    </Eyebrow>

                    <h3 className="text-2xl text-white mb-2 transition-colors duration-200 group-hover:text-accent">
                      {heroCar.make} {heroCar.model}
                    </h3>

                    {heroCar.variant && (
                      <p className="text-white/50 mb-5">
                        {heroCar.variant}
                      </p>
                    )}

                    <p className="text-3xl font-semibold tracking-tight text-white mb-6">
                      {heroCar.price.toLocaleString("da-DK")} kr.
                    </p>

                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-white/50 mb-8">
                      <span>{heroCar.year}</span>
                      <span>
                        {heroCar.mileage.toLocaleString("da-DK")} km
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 group-hover:text-accent transition-colors">
                      Se bilen
                      <span className="transition-transform duration-300 ease-out group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            )}

            {restOfLager.length > 0 && (
              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {restOfLager.map((c, i) => (
                  <Reveal key={c.id} delay={120 + i * 70}>
                    <CarCard car={c} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* WHY US */}
      <section className="relative border-y border-white/10 bg-[#1c1c1f] py-20 overflow-hidden">
        <div className="container-page">

          <Reveal>
            <div className="max-w-xl mb-14">
              <Eyebrow className="mb-2">
                Hvorfor EM Cars
              </Eyebrow>

              <h2 className="text-3xl text-white">
                Sådan arbejder vi
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-10 sm:grid-cols-3">
            {[
              [
                TagIcon,
                "Gennemsigtighed",
                "Alle priser og specifikationer står tydeligt på hver bil — ingen overraskelser undervejs.",
              ],
              [
                ShieldIcon,
                "Kvalitetstjek",
                "Hver bil bliver gennemgået, før den lægges op, så du ved præcis, hvad du køber.",
              ],
              [
                ChatIcon,
                "Personlig service",
                "Du taler direkte med os — ved spørgsmål, prøvekørsel eller når du er klar til at handle.",
              ],
            ].map(([Icon, title, text]: any, i) => (
              <Reveal key={title} delay={i * 100}>
                <div className="group">

                  <div className="h-12 w-12 rounded-full bg-white/[0.04] border border-white/10 text-white flex items-center justify-center mb-5 transition-all duration-300 group-hover:border-accent/40 group-hover:text-accent group-hover:-translate-y-0.5">
                    <Icon />
                  </div>

                  <h3 className="text-lg text-white mb-2">
                    {title}
                  </h3>

                  <p className="text-white/60 text-sm leading-relaxed">
                    {text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BREAK */}
      <section className="relative bg-[#131316] text-white overflow-hidden">
        <div className="noise-overlay" />

        <div className="relative container-page py-0">
          <div className="grid lg:grid-cols-2 items-stretch">

            <Reveal className="h-full">
              <div className="aspect-[4/3] lg:aspect-auto lg:h-full overflow-hidden bg-white/5">
                {breakCar?.images[0] ? (
                  <img
                    src={breakCar.images[0].url}
                    alt={`${breakCar.make} ${breakCar.model}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center py-16">
                    <CarMark className="w-2/3 h-auto text-white/10" />
                  </div>
                )}
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="flex flex-col justify-center px-2 py-16 sm:px-10 h-full">
                <Eyebrow className="mb-4">
                  Vores løfte
                </Eyebrow>

                <h2 className="text-3xl text-white mb-5 max-w-md">
                  Ærlighed er ikke en salgstale hos os — det er hele forretningen.
                </h2>

                <p className="text-white/60 leading-relaxed max-w-md">
                  Vi tjener ikke på at skjule ting for dig. Derfor får du den
                  fulde historik, et realistisk billede af standen, og en
                  pris, der er sat til at holde.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SELL YOUR CAR */}
      <section className="container-page py-24">
        <Reveal>
          <div className="relative">

            <div className="absolute -inset-3 border border-white/10 rounded-lg hidden sm:block" />

            <div className="relative rounded-xl bg-[#1c1c1f] border border-white/10 text-white px-8 py-14 sm:px-16 sm:py-16 grid gap-10 md:grid-cols-2 items-center overflow-hidden">
              <div className="noise-overlay" />

              <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-accent/8 blur-[100px]" />

              <div className="relative">
                <Eyebrow className="mb-3">
                  Sælg din bil
                </Eyebrow>

                <h2 className="text-3xl text-white mb-4">
                  Vil du sælge din bil?
                </h2>

                <p className="text-white/60 leading-relaxed mb-6">
                  Send os oplysninger om din bil, så vender vi tilbage med en
                  vurdering — helt uforpligtende.
                </p>

                <ul className="space-y-2.5 text-sm text-white/70">
                  {[
                    "Gratis vurdering",
                    "Ingen forpligtelse",
                    "Svar inden for kort tid",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                        <CheckIcon />
                      </span>

                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative md:text-right">
                <Link
                  to="/saelg-din-bil"
                  className="btn-ghost-light group"
                >
                  Kom i gang
                  <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}