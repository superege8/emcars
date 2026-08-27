import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#131316] text-white">
      <div className="container-page py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 pb-8 border-b border-white/10">

          <div className="max-w-xs">
            <div className="mb-3">
              <span className="text-base font-semibold tracking-tight text-white">
                EM Cars
              </span>
            </div>

            <p className="text-white/50 text-sm leading-relaxed">
              Kvalitetstjekkede biler, gennemsigtige priser og en ordentlig
              oplevelse fra henvendelse til levering.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-6 text-sm">

            <div>
              <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/35 mb-3">
                Navigation
              </h3>

              <ul className="space-y-2 text-white/70">
                <li>
                  <Link
                    to="/biler"
                    className="inline-block hover:text-white hover:translate-x-0.5 transition-all duration-200"
                  >
                    Biler
                  </Link>
                </li>

                <li>
                  <Link
                    to="/saelg-din-bil"
                    className="inline-block hover:text-white hover:translate-x-0.5 transition-all duration-200"
                  >
                    Sælg din bil
                  </Link>
                </li>

                <li>
                  <Link
                    to="/om-os"
                    className="inline-block hover:text-white hover:translate-x-0.5 transition-all duration-200"
                  >
                    Om os
                  </Link>
                </li>

                <li>
                  <Link
                    to="/kontakt"
                    className="inline-block hover:text-white hover:translate-x-0.5 transition-all duration-200"
                  >
                    Kontakt
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/35 mb-3">
                Kontakt
              </h3>

              <ul className="space-y-2 text-white/70">
                <li>
                  <a
                    href="tel:+4542318338"
                    className="inline-block hover:text-white hover:translate-x-0.5 transition-all duration-200"
                  >
                    +45 42 31 83 38
                  </a>
                </li>

                <li>
                  <a
                    href="mailto:kontakt@emcars.dk"
                    className="inline-block hover:text-white hover:translate-x-0.5 transition-all duration-200"
                  >
                    kontakt@emcars.dk
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/35">
          <p>
            © {new Date().getFullYear()} EM Cars. Alle rettigheder forbeholdes.
          </p>
        </div>
      </div>
    </footer>
  );
}