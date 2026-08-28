import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { Car } from "../types";

export default function Home() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCars() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get<Car[]>("/cars");

        if (Array.isArray(response)) {
          setCars(response);
        } else {
          setCars([]);
        }
      } catch (err) {
        console.error("Fejl ved hentning af biler:", err);
        setError("Kunne ikke hente biler lige nu.");
        setCars([]);
      } finally {
        setLoading(false);
      }
    }

    loadCars();
  }, []);

  return (
    <div className="min-h-screen bg-[#111113] text-white">

      {/* HEADER */}
      <header className="border-b border-white/10 bg-[#0b0b0d]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link
            to="/"
            className="text-2xl font-semibold tracking-tight"
          >
            EM<span className="text-accent">Cars</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm text-white/60">
            <Link
              to="/"
              className="transition hover:text-white"
            >
              Forside
            </Link>

            <Link
              to="/biler"
              className="transition hover:text-white"
            >
              Biler
            </Link>

            <Link
              to="/admin/login"
              className="transition hover:text-white"
            >
              Admin
            </Link>
          </nav>

        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="max-w-3xl">

            <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-accent">
              EM Cars
            </p>

            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
              Find din næste bil.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/50">
              Kvalitetsbiler udvalgt med fokus på pris, stand og køreglæde.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <Link
                to="/biler"
                className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#111113] transition hover:-translate-y-0.5 hover:bg-white/90"
              >
                Se biler
              </Link>

              <Link
                to="/admin/login"
                className="rounded-lg border border-white/15 px-6 py-3 text-sm font-medium text-white/70 transition hover:border-white/30 hover:text-white"
              >
                Admin
              </Link>

            </div>

          </div>

        </div>
      </section>

      {/* CARS */}
      <section className="mx-auto max-w-7xl px-6 py-16">

        <div className="mb-8 flex items-end justify-between">

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent">
              Lager
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Seneste biler
            </h2>

            <p className="mt-2 text-sm text-white/40">
              Se vores aktuelle biler til salg.
            </p>
          </div>

          <Link
            to="/biler"
            className="hidden text-sm text-white/50 transition hover:text-white sm:block"
          >
            Se alle →
          </Link>

        </div>

        {/* LOADING */}
        {loading && (
          <div className="rounded-xl border border-white/10 bg-[#1c1c1f] p-10 text-center">
            <p className="text-white/40">
              Henter biler...
            </p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-10 text-center">
            <p className="text-red-400">
              {error}
            </p>

            <p className="mt-2 text-sm text-white/30">
              Kontrollér at backend-serveren kører på port 4000.
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && cars.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-[#1c1c1f] p-10 text-center">
            <p className="text-lg font-medium">
              Ingen biler endnu
            </p>

            <p className="mt-2 text-sm text-white/40">
              Der er endnu ikke oprettet biler i systemet.
            </p>
          </div>
        )}

        {/* CAR GRID */}
        {!loading && !error && cars.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {cars.slice(0, 6).map((car) => {

              const image =
                Array.isArray(car.images) && car.images.length > 0
                  ? car.images[0]?.url
                  : null;

              return (
                <Link
                  key={car.id}
                  to={`/biler/${car.slug || car.id}`}
                  className="group overflow-hidden rounded-xl border border-white/10 bg-[#1c1c1f] transition duration-200 hover:-translate-y-1 hover:border-white/20"
                >

                  {/* IMAGE */}
                  <div className="aspect-[16/10] overflow-hidden bg-[#0b0b0d]">

                    {image ? (
                      <img
                        src={image}
                        alt={`${car.make} ${car.model}`}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-white/20">
                        Intet billede
                      </div>
                    )}

                  </div>

                  {/* INFO */}
                  <div className="p-5">

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">

                        <h3 className="truncate text-lg font-semibold">
                          {car.make} {car.model}
                        </h3>

                        {car.variant && (
                          <p className="mt-1 truncate text-sm text-white/40">
                            {car.variant}
                          </p>
                        )}

                      </div>

                      <span className="shrink-0 text-lg font-semibold">
                        {typeof car.price === "number"
                          ? `${car.price.toLocaleString("da-DK")} kr.`
                          : "Pris ikke oplyst"}
                      </span>

                    </div>

                    {/* DETAILS */}
                    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/10 pt-4 text-sm text-white/45">

                      {car.year != null && (
                        <span>
                          {car.year}
                        </span>
                      )}

                      {car.mileage != null && (
                        <span>
                          {car.mileage.toLocaleString("da-DK")} km
                        </span>
                      )}

                      {car.transmission && (
                        <span>
                          {car.transmission}
                        </span>
                      )}

                      {car.fuel && (
                        <span>
                          {car.fuel}
                        </span>
                      )}

                    </div>

                  </div>

                </Link>
              );
            })}

          </div>
        )}

        {/* MOBILE ALL CARS */}
        {!loading && cars.length > 0 && (
          <div className="mt-8 text-center sm:hidden">
            <Link
              to="/biler"
              className="text-sm text-white/50 transition hover:text-white"
            >
              Se alle biler →
            </Link>
          </div>
        )}

      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#0b0b0d]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8">

          <div>
            <div className="font-semibold">
              EM<span className="text-accent">Cars</span>
            </div>

            <p className="mt-1 text-xs text-white/30">
              Kvalitetsbiler til salg
            </p>
          </div>

          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} EM Cars
          </p>

        </div>
      </footer>

    </div>
  );
}