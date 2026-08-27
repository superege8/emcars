import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import { Car } from "../types";
import StatusBadge from "../components/StatusBadge";

const fuelLabels: Record<string, string> = {
  BENZIN: "Benzin", DIESEL: "Diesel", EL: "El", HYBRID: "Hybrid", PLUGIN_HYBRID: "Plugin-hybrid",
};
const gearLabels: Record<string, string> = { MANUEL: "Manuel", AUTOMATIK: "Automatik" };

function setMeta(name: string, content: string, isProperty = false) {
  const attr = isProperty ? "property" : "name";
  let el = document.head.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function CarDetail() {
  const { slug } = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api
      .get<Car>(`/cars/${slug}`)
      .then((c) => {
        setCar(c);
        setForm((f) => ({ ...f, message: `Hej, jeg er interesseret i ${c.make} ${c.model}${c.variant ? " " + c.variant : ""}. Er den stadig til salg?` }));

        const title = `${c.make} ${c.model}${c.variant ? " " + c.variant : ""} ${c.year} – EM Cars`;
        const description = `${c.make} ${c.model}${c.variant ? " " + c.variant : ""}, ${c.year}, ${c.mileage.toLocaleString("da-DK")} km, ${c.price.toLocaleString("da-DK")} kr. ${c.description.slice(0, 120)}`;
        document.title = title;
        setMeta("description", description);
        setMeta("og:title", title, true);
        setMeta("og:description", description, true);
        setMeta("og:type", "product", true);
        if (c.images[0]) setMeta("og:image", window.location.origin + c.images[0].url, true);

        const ld = document.createElement("script");
        ld.type = "application/ld+json";
        ld.id = "car-jsonld";
        ld.text = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Vehicle",
          name: `${c.make} ${c.model} ${c.variant || ""}`.trim(),
          brand: c.make,
          model: c.model,
          vehicleModelDate: String(c.year),
          mileageFromOdometer: { "@type": "QuantitativeValue", value: c.mileage, unitCode: "KMT" },
          fuelType: c.fuel,
          vehicleTransmission: c.transmission,
          offers: { "@type": "Offer", price: c.price, priceCurrency: "DKK", availability: "https://schema.org/InStock" },
        });
        document.getElementById("car-jsonld")?.remove();
        document.head.appendChild(ld);
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    if (!car) return;
    setSending(true);
    try {
      await api.post("/leads", { ...form, carId: car.id, type: "BIL_FORSPORGSEL" });
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  if (notFound) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-3xl mb-4">Bilen blev ikke fundet</h1>
        <Link to="/biler" className="text-sm font-medium text-ink/60 hover:text-ink">← Tilbage til alle biler</Link>
      </div>
    );
  }

  if (!car) return <div className="container-page py-24 text-center text-ink/40">Indlæser...</div>;

  return (
    <div className="container-page py-14">
      <Link to="/biler" className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink/50 hover:text-ink transition-colors">
        <span className="transition-transform duration-300 ease-out group-hover:-translate-x-1">←</span>
        Tilbage til alle biler
      </Link>

      <div className="mt-6 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        {/* GALLERY */}
        <div>
          <div key={activeImage} className="aspect-[3/2] rounded-lg overflow-hidden bg-ink/5 border border-ink/8 animate-fade-in">
            {car.images[activeImage] ? (
              <img src={car.images[activeImage].url} className="h-full w-full object-cover" alt={`${car.make} ${car.model}`} />
            ) : (
              <div className="flex h-full items-center justify-center text-ink/30">Intet billede</div>
            )}
          </div>
          {car.images.length > 1 && (
            <div className="mt-3 grid grid-cols-6 gap-2">
              {car.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`aspect-square rounded-md overflow-hidden ring-2 transition-all duration-200 hover:scale-[1.03] ${i === activeImage ? "ring-ink" : "ring-transparent opacity-60 hover:opacity-100"}`}
                >
                  <img src={img.url} className="h-full w-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-12">
            <h2 className="text-xl mb-3">Beskrivelse</h2>
            <p className="text-ink/65 leading-relaxed whitespace-pre-line">{car.description}</p>
          </div>

          {car.equipment.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl mb-3">Udstyr</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-ink/65">
                {car.equipment.map((e) => (
                  <div key={e} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {e}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="lg:sticky lg:top-24 h-fit space-y-6">
          <div className="card p-7">
            <div className="flex items-center justify-between mb-1">
              <StatusBadge status={car.status} />
              <span className="text-xs text-ink/40">Årgang {car.year}</span>
            </div>
            <h1 className="text-2xl mt-3">{car.make} {car.model}</h1>
            {car.variant && <p className="text-ink/50 mt-1">{car.variant}</p>}
            <p className="text-3xl font-semibold tracking-tight mt-4">{car.price.toLocaleString("da-DK")} kr.</p>

            <dl className="mt-6 grid grid-cols-2 gap-y-3 text-sm border-t border-ink/8 pt-6">
              <dt className="text-ink/40">Kilometer</dt><dd>{car.mileage.toLocaleString("da-DK")} km</dd>
              <dt className="text-ink/40">Brændstof</dt><dd>{fuelLabels[car.fuel]}</dd>
              <dt className="text-ink/40">Gearkasse</dt><dd>{gearLabels[car.transmission]}</dd>
              {car.horsepower && (<><dt className="text-ink/40">Hestekræfter</dt><dd>{car.horsepower} hk</dd></>)}
              {car.color && (<><dt className="text-ink/40">Farve</dt><dd>{car.color}</dd></>)}
              {car.registrationPublic && car.registration && (<><dt className="text-ink/40">Nummerplade</dt><dd>{car.registration}</dd></>)}
            </dl>
          </div>

          {/* CONTACT / LEAD FORM */}
          <div className="card p-7">
            <h2 className="text-lg mb-4">Kontakt om denne bil</h2>
            {sent ? (
              <p className="text-sm text-ink/70">Tak! Vi vender tilbage hurtigst muligt.</p>
            ) : (
              <form onSubmit={submitLead} className="space-y-3">
                <input required className="input" placeholder="Navn" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input required type="email" className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input className="input" placeholder="Telefon (valgfrit)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <textarea required className="input" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                <button disabled={sending} className="btn-primary w-full">{sending ? "Sender..." : "Send henvendelse"}</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
