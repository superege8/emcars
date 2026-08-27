import { FilterOptions } from "../types";

export interface FilterState {
  make: string; model: string; fuel: string; transmission: string;
  priceFrom: string; priceTo: string; yearFrom: string; yearTo: string;
  kmFrom: string; kmTo: string; q: string; sort: string;
}

export const emptyFilters: FilterState = {
  make: "", model: "", fuel: "", transmission: "",
  priceFrom: "", priceTo: "", yearFrom: "", yearTo: "",
  kmFrom: "", kmTo: "", q: "", sort: "newest",
};

const fuelLabels: Record<string, string> = {
  BENZIN: "Benzin", DIESEL: "Diesel", EL: "El", HYBRID: "Hybrid", PLUGIN_HYBRID: "Plugin-hybrid",
};

export default function Filters({
  options, value, onChange,
}: { options: FilterOptions | null; value: FilterState; onChange: (v: FilterState) => void }) {
  function set<K extends keyof FilterState>(key: K, v: FilterState[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="card p-6 space-y-6">
      <h3 className="text-xs uppercase tracking-[0.2em] text-ink/45 -mb-1">Filtrer</h3>
      <div>
        <label className="label">Søg</label>
        <input className="input" placeholder="Mærke, model..." value={value.q} onChange={(e) => set("q", e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Mærke</label>
          <select className="input" value={value.make} onChange={(e) => set("make", e.target.value)}>
            <option value="">Alle</option>
            {options?.makes.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Model</label>
          <select className="input" value={value.model} onChange={(e) => set("model", e.target.value)}>
            <option value="">Alle</option>
            {options?.models.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Pris (kr.)</label>
        <div className="flex gap-2">
          <input className="input" type="number" placeholder="Fra" value={value.priceFrom} onChange={(e) => set("priceFrom", e.target.value)} />
          <input className="input" type="number" placeholder="Til" value={value.priceTo} onChange={(e) => set("priceTo", e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label">Årgang</label>
        <div className="flex gap-2">
          <input className="input" type="number" placeholder="Fra" value={value.yearFrom} onChange={(e) => set("yearFrom", e.target.value)} />
          <input className="input" type="number" placeholder="Til" value={value.yearTo} onChange={(e) => set("yearTo", e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label">Kilometer</label>
        <div className="flex gap-2">
          <input className="input" type="number" placeholder="Fra" value={value.kmFrom} onChange={(e) => set("kmFrom", e.target.value)} />
          <input className="input" type="number" placeholder="Til" value={value.kmTo} onChange={(e) => set("kmTo", e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label">Brændstof</label>
        <select className="input" value={value.fuel} onChange={(e) => set("fuel", e.target.value)}>
          <option value="">Alle</option>
          {options?.fuels.map((f) => <option key={f} value={f}>{fuelLabels[f] || f}</option>)}
        </select>
      </div>

      <div>
        <label className="label">Gearkasse</label>
        <select className="input" value={value.transmission} onChange={(e) => set("transmission", e.target.value)}>
          <option value="">Alle</option>
          {options?.transmissions.map((t) => <option key={t} value={t}>{t === "MANUEL" ? "Manuel" : "Automatik"}</option>)}
        </select>
      </div>

      <button className="btn-secondary w-full" onClick={() => onChange(emptyFilters)}>Nulstil filtre</button>
    </div>
  );
}
