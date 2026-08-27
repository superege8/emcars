import { Link } from "react-router-dom";
import { Car } from "../types";
import StatusBadge from "./StatusBadge";

const fuelLabels: Record<string, string> = {
  BENZIN: "Benzin", DIESEL: "Diesel", EL: "El", HYBRID: "Hybrid", PLUGIN_HYBRID: "Plugin-hybrid",
};
const gearLabels: Record<string, string> = { MANUEL: "Manuel", AUTOMATIK: "Automatik" };

export default function CarCard({ car, showStatus = false }: { car: Car; showStatus?: boolean }) {
  const cover = car.images[0]?.url;
  return (
    <Link
      to={`/biler/${car.slug}`}
      className="group block overflow-hidden rounded-lg border border-ink/8 bg-white transition-all duration-300 ease-out hover:-translate-y-1 hover:border-ink/15 hover:shadow-card-lg"
    >
      <div className="aspect-[3/2] overflow-hidden bg-ink/5 relative">
        {cover ? (
          <img
            src={cover}
            alt={`${car.make} ${car.model}`}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink/25 text-sm">Intet billede</div>
        )}
        <div className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/[0.02]" />
        {showStatus && <div className="absolute top-3 left-3"><StatusBadge status={car.status} /></div>}
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold tracking-tight leading-tight transition-colors duration-200 group-hover:text-accent">{car.make} {car.model}</h3>
            {car.variant && <p className="text-sm text-ink/45 mt-0.5">{car.variant}</p>}
          </div>
          <span className="text-xs text-ink/40 shrink-0 pt-1">{car.year}</span>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-ink/8 pt-5">
          <span className="text-xl font-semibold tracking-tight">{car.price.toLocaleString("da-DK")} kr.</span>
          <div className="flex gap-2.5 text-xs text-ink/45">
            <span>{car.mileage.toLocaleString("da-DK")} km</span>
            <span>·</span>
            <span>{fuelLabels[car.fuel]}</span>
            <span>·</span>
            <span>{gearLabels[car.transmission]}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
