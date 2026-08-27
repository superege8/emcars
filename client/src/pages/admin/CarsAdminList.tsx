import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { Car, CarStatus } from "../../types";
import StatusBadge from "../../components/StatusBadge";

export default function CarsAdminList() {
  const [cars, setCars] = useState<Car[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);

    const qs = new URLSearchParams();

    if (q) qs.set("q", q);
    if (status) qs.set("status", status);

    api
      .get<{ items: Car[] }>(`/admin/cars?${qs.toString()}`)
      .then((r) => setCars(r.items))
      .finally(() => setLoading(false));
  }

  useEffect(load, [q, status]);

  async function changeStatus(car: Car, next: CarStatus) {
    await api.put(`/admin/cars/${car.id}/status`, {
      status: next,
    });

    load();
  }

  async function remove(car: Car) {
    if (
      !confirm(
        `Slet ${car.make} ${car.model}? Dette kan ikke fortrydes.`
      )
    ) {
      return;
    }

    await api.del(`/admin/cars/${car.id}`);
    load();
  }

  return (
    <div className="text-white">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-accent mb-2">
            Lager
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Biler
          </h1>
        </div>

        <Link
          to="/admin/biler/ny"
          className="
            inline-flex
            items-center
            justify-center
            rounded-lg
            bg-white
            px-5
            py-3
            text-sm
            font-semibold
            text-[#131316]
            transition-all
            duration-200
            hover:bg-white/90
            hover:-translate-y-0.5
          "
        >
          + Tilføj bil
        </Link>
      </div>

      {/* FILTER */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          className="
            input
            max-w-xs
            !bg-[#1c1c1f]
            !border-white/10
            !text-white
          "
          placeholder="Søg..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <select
          className="
            input
            max-w-xs
            !bg-[#1c1c1f]
            !border-white/10
            !text-white
          "
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Alle statusser</option>
          <option value="DRAFT">Kladde</option>
          <option value="FOR_SALE">Til salg</option>
          <option value="RESERVED">Reserveret</option>
          <option value="SOLD">Solgt</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="rounded-xl border border-white/10 bg-[#1c1c1f] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.25)]">

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">

            <thead className="bg-[#151517] text-left text-white/40 uppercase text-xs tracking-wide">
              <tr>
                <th className="p-4">Billede</th>
                <th className="p-4">Bil</th>
                <th className="p-4">Pris</th>
                <th className="p-4">Km</th>
                <th className="p-4">Årgang</th>
                <th className="p-4">Status</th>
                <th className="p-4">Handlinger</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">

              {loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-10 text-center text-white/40"
                  >
                    Indlæser...
                  </td>
                </tr>
              )}

              {!loading && cars.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-10 text-center text-white/40"
                  >
                    Ingen biler fundet.
                  </td>
                </tr>
              )}

              {cars.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-white/[0.025] transition-colors"
                >

                  {/* IMAGE */}
                  <td className="p-4">
                    <div className="h-14 w-20 rounded-lg overflow-hidden bg-[#131316] border border-white/10">
                      {c.images[0] ? (
                        <img
                          src={c.images[0].url}
                          className="h-full w-full object-cover"
                          alt=""
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-white/25">
                          Intet
                        </div>
                      )}
                    </div>
                  </td>

                  {/* CAR */}
                  <td className="p-4">
                    <p className="font-medium text-white">
                      {c.make} {c.model}
                    </p>

                    <p className="text-white/45 text-xs mt-1">
                      {c.variant}
                    </p>
                  </td>

                  {/* PRICE */}
                  <td className="p-4 text-white/80">
                    {c.price.toLocaleString("da-DK")} kr.
                  </td>

                  {/* KM */}
                  <td className="p-4 text-white/60">
                    {c.mileage.toLocaleString("da-DK")} km
                  </td>

                  {/* YEAR */}
                  <td className="p-4 text-white/60">
                    {c.year}
                  </td>

                  {/* STATUS */}
                  <td className="p-4">
                    <StatusBadge status={c.status} />
                  </td>

                  {/* ACTIONS */}
                  <td className="p-4">
                    <div className="flex items-center gap-3 text-xs">

                      <Link
                        to={`/admin/biler/${c.id}`}
                        className="text-accent hover:underline"
                      >
                        Rediger
                      </Link>

                      {c.status === "FOR_SALE" && (
                        <a
                          href={`/biler/${c.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-white/60 hover:text-white hover:underline"
                        >
                          Se
                        </a>
                      )}

                      <select
                        className="
                          rounded-md
                          border border-white/10
                          bg-[#131316]
                          text-white
                          text-xs
                          py-1.5
                          px-2
                          outline-none
                          focus:border-white/25
                        "
                        value={c.status}
                        onChange={(e) =>
                          changeStatus(
                            c,
                            e.target.value as CarStatus
                          )
                        }
                      >
                        <option value="DRAFT">Kladde</option>
                        <option value="FOR_SALE">Til salg</option>
                        <option value="RESERVED">Reserveret</option>
                        <option value="SOLD">Solgt</option>
                      </select>

                      <button
                        onClick={() => remove(c)}
                        className="text-rose-400 hover:text-rose-300 hover:underline"
                      >
                        Slet
                      </button>

                    </div>
                  </td>

                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}