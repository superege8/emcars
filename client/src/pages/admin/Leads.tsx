import { useEffect, useState } from "react";

interface Lead {
  id: string;
  type: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
  car?: { make: string; model: string; slug: string } | null;
}

import { api } from "../../api/client";

const typeLabels: Record<string, string> = {
  GENERAL: "Generel", BIL_FORSPORGSEL: "Bilforespørgsel", FINANSIERING: "Finansiering",
};

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  useEffect(() => { api.get<{ items: Lead[] }>("/admin/leads").then((r) => setLeads(r.items)); }, []);

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Henvendelser</h1>
      <div className="space-y-4">
        {leads.length === 0 && <p className="text-ink/40">Ingen henvendelser endnu.</p>}
        {leads.map((l) => (
          <div key={l.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">{l.name} <span className="text-ink/40 font-normal">· {l.email}</span></p>
              <span className="text-xs rounded-full bg-ink/10 px-2 py-1">{typeLabels[l.type] || l.type}</span>
            </div>
            {l.car && <p className="text-xs text-ink/50 mb-1">Om: {l.car.make} {l.car.model}</p>}
            <p className="text-sm text-ink/70">{l.message}</p>
            <p className="text-xs text-ink/30 mt-2">{new Date(l.createdAt).toLocaleString("da-DK")}{l.phone ? ` · ${l.phone}` : ""}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
