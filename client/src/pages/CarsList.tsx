import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../api/client";
import { Car, FilterOptions } from "../types";
import CarCard from "../components/CarCard";
import Eyebrow from "../components/Eyebrow";
import FilterBar, {
  emptyFilters,
  FilterState,
  hasActiveFilters,
} from "../components/FilterBar";

function buildQuery(filters: FilterState, page: number): string {
  const qs = new URLSearchParams();

  if (filters.make.length) {
    qs.set("make", filters.make.join(","));
  }

  if (filters.model.length) {
    qs.set("model", filters.model.join(","));
  }

  if (filters.fuel.length) {
    qs.set("fuel", filters.fuel.join(","));
  }

  if (filters.transmission.length) {
    qs.set("transmission", filters.transmission.join(","));
  }

  if (filters.price) {
    qs.set("priceFrom", String(filters.price[0]));
    qs.set("priceTo", String(filters.price[1]));
  }

  if (filters.year) {
    qs.set("yearFrom", String(filters.year[0]));
    qs.set("yearTo", String(filters.year[1]));
  }

  if (filters.km) {
    qs.set("kmFrom", String(filters.km[0]));
    qs.set("kmTo", String(filters.km[1]));
  }

  if (filters.q.trim()) {
    qs.set("q", filters.q.trim());
  }

  qs.set("sort", filters.sort);
  qs.set("page", String(page));

  return qs.toString();
}

export default function CarsList() {
  const [params] = useSearchParams();

  const [options, setOptions] = useState<FilterOptions | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    ...emptyFilters,
    q: params.get("q") || "",
  });

  const [cars, setCars] = useState<Car[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<FilterOptions>("/cars/filters")
      .then(setOptions)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);

    api
      .get<{ items: Car[]; total: number; totalPages: number }>(
        `/cars?${buildQuery(filters, page)}`
      )
      .then((r) => {
        setCars(r.items);
        setTotal(r.total);
        setTotalPages(r.totalPages);
      })
      .finally(() => setLoading(false));
  }, [filters, page]);

  function updateFilters(next: FilterState) {
    setFilters(next);
    setPage(1);
  }

  const filtersActive = hasActiveFilters(filters);

  return (
    <div className="container-page py-16 text-white">
      {/* OVERSKRIFT */}
      <Eyebrow className="mb-2">Lager</Eyebrow>

      <h1 className="text-4xl mb-2 text-white">
        Biler til salg
      </h1>

      <p className="text-white/50 mb-8">
        {total} bil{total === 1 ? "" : "er"} matcher din søgning
      </p>

      {/* FILTER */}
      <div className="mb-8">
        <FilterBar
          options={options}
          value={filters}
          onChange={updateFilters}
        />
      </div>

      {/* SORTERING */}
      <div className="flex justify-end mb-4">
        <select
          className="
            input
            w-auto
            !bg-[#1c1c1f]
            !text-white
            !border-white/10
          "
          value={filters.sort}
          onChange={(e) =>
            updateFilters({
              ...filters,
              sort: e.target.value,
            })
          }
        >
          <option value="newest">Nyeste</option>
          <option value="price_asc">Pris: Lav til høj</option>
          <option value="price_desc">Pris: Høj til lav</option>
          <option value="km_asc">Laveste km</option>
          <option value="year_desc">Nyeste årgang</option>
        </select>
      </div>

      {/* RESULTATER */}
      {loading ? (
        <p className="text-white/40">
          Indlæser biler...
        </p>
      ) : cars.length === 0 && !filtersActive ? (
        <div className="card px-10 py-20 text-center">
          <p className="text-lg font-medium text-white">
            Vi har i øjeblikket ingen biler på lager.
          </p>

          <p className="!text-white/65 mt-2 max-w-md mx-auto">
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
      ) : cars.length === 0 ? (
        <div className="card px-10 py-16 text-center">
          <p className="font-medium text-white">
            Ingen biler matcher dine filtre.
          </p>

          <p className="!text-white/65 mt-2">
            Prøv at justere eller nulstille dine filtre.
          </p>
        </div>
      ) : (
        <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
          {cars.map((c) => (
            <CarCard
              key={c.id}
              car={c}
            />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from(
            { length: totalPages },
            (_, i) => i + 1
          ).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`
                h-9
                w-9
                rounded-md
                text-sm
                transition-colors
                ${
                  p === page
                    ? "bg-white text-ink"
                    : "bg-[#1c1c1f] text-white/60 border border-white/10 hover:border-white/30 hover:text-white"
                }
              `}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}