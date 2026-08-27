import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { Car } from "../../types";
import StatusBadge from "../../components/StatusBadge";

interface DashboardData {
  counts: {
    forSale: number;
    reserved: number;
    sold: number;
  };
  latest: Car[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api
      .get<DashboardData>("/admin/dashboard")
      .then(setData);
  }, []);

  return (
    <div className="text-white">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">

        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-accent mb-2">
            EM Cars
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Dashboard
          </h1>
        </div>

        <Link
          to="/admin/biler/ny"
          className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#131316] transition-all duration-200 hover:bg-white/90 hover:-translate-y-0.5"
        >
          + Tilføj bil
        </Link>

      </div>

      {/* STATS */}
      <div className="grid gap-5 sm:grid-cols-3 mb-10">

        {[
          ["Biler til salg", data?.counts.forSale ?? "–"],
          ["Reserverede biler", data?.counts.reserved ?? "–"],
          ["Solgte biler", data?.counts.sold ?? "–"],
        ].map(([label, value]) => (

          <div
            key={label}
            className="rounded-xl border border-white/10 bg-[#1c1c1f] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
          >
            <div className="text-3xl font-semibold tracking-tight text-white">
              {value}
            </div>

            <div className="text-sm text-white/45 mt-2">
              {label}
            </div>
          </div>

        ))}

      </div>

      {/* LATEST CARS */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-white">
          Senest tilføjede biler
        </h2>

        <p className="text-sm text-white/40 mt-1">
          De seneste biler i systemet.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#1c1c1f] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.2)]">

        {data?.latest.length === 0 && (
          <p className="p-8 text-white/40">
            Ingen biler endnu.
          </p>
        )}

        {data?.latest.map((c) => (

          <Link
            key={c.id}
            to={`/admin/biler/${c.id}`}
            className="flex items-center gap-4 p-4 border-b border-white/10 last:border-b-0 hover:bg-white/[0.03] transition-colors"
          >

            {/* IMAGE */}
            <div className="h-14 w-20 rounded-lg overflow-hidden bg-[#131316] border border-white/10 shrink-0">

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

            {/* INFO */}
            <div className="flex-1 min-w-0">

              <p className="font-medium text-white truncate">
                {c.make} {c.model} {c.variant}
              </p>

              <p className="text-sm text-white/45 mt-0.5">
                {c.price.toLocaleString("da-DK")} kr. · {c.year}
              </p>

            </div>

            {/* STATUS */}
            <StatusBadge status={c.status} />

          </Link>

        ))}

      </div>

    </div>
  );
}