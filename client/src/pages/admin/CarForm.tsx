import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/client";
import { Car, CarImage } from "../../types";
import ImageUploader from "../../components/ImageUploader";

const emptyCar = {
  make: "",
  model: "",
  variant: "",
  year: new Date().getFullYear(),
  price: 0,
  mileage: 0,
  registration: "",
  registrationPublic: false,
  vin: "",
  fuel: "BENZIN",
  transmission: "MANUEL",
  horsepower: 0,
  color: "",
  description: "",
  equipmentText: "",
};

export default function CarForm() {
  const { id } = useParams();
  const isNew = !id || id === "ny";
  const navigate = useNavigate();

  const [form, setForm] = useState<any>(emptyCar);
  const [carId, setCarId] = useState<string | null>(
    isNew ? null : id!
  );
  const [images, setImages] = useState<CarImage[]>([]);
  const [status, setStatus] =
    useState<Car["status"]>("DRAFT");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(isNew);

  useEffect(() => {
    if (isNew) return;

    api.get<Car>(`/admin/cars/${id}`).then((c) => {
      setForm({
        make: c.make,
        model: c.model,
        variant: c.variant || "",
        year: c.year,
        price: c.price,
        mileage: c.mileage,
        registration: c.registration || "",
        registrationPublic: c.registrationPublic,
        vin: c.vin || "",
        fuel: c.fuel,
        transmission: c.transmission,
        horsepower: c.horsepower || 0,
        color: c.color || "",
        description: c.description,
        equipmentText: c.equipment.join("\n"),
      });

      setImages(c.images);
      setStatus(c.status);
      setLoaded(true);
    });
  }, [id, isNew]);

  function set<K extends string>(
    key: K,
    value: any
  ) {
    setForm((f: any) => ({
      ...f,
      [key]: value,
    }));
  }

  function payload() {
    return {
      make: form.make,
      model: form.model,
      variant: form.variant || undefined,
      year: Number(form.year),
      price: Number(form.price),
      mileage: Number(form.mileage),
      registration: form.registration || undefined,
      registrationPublic: !!form.registrationPublic,
      vin: form.vin || undefined,
      fuel: form.fuel,
      transmission: form.transmission,
      horsepower: form.horsepower
        ? Number(form.horsepower)
        : undefined,
      color: form.color || undefined,
      description: form.description || "",
      equipment: form.equipmentText
        .split("\n")
        .map((s: string) => s.trim())
        .filter(Boolean),
    };
  }

  async function saveDraft(e?: React.FormEvent) {
    e?.preventDefault();

    setSaving(true);
    setError("");

    try {
      if (carId) {
        const c = await api.put<Car>(
          `/admin/cars/${carId}`,
          payload()
        );

        setStatus(c.status);
      } else {
        const c = await api.post<Car>(
          "/admin/cars",
          payload()
        );

        setCarId(c.id);
        setStatus(c.status);

        navigate(`/admin/biler/${c.id}`, {
          replace: true,
        });
      }
    } catch (err: any) {
      setError(
        err.message || "Kunne ikke gemme bilen."
      );
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    await saveDraft();

    const targetId = carId;

    if (!targetId) return;

    const c = await api.put<Car>(
      `/admin/cars/${targetId}/status`,
      {
        status: "FOR_SALE",
      }
    );

    setStatus(c.status);
  }

  async function setCarStatus(
    next: Car["status"]
  ) {
    if (!carId) return;

    const c = await api.put<Car>(
      `/admin/cars/${carId}/status`,
      {
        status: next,
      }
    );

    setStatus(c.status);
  }

  async function remove() {
    if (
      !carId ||
      !confirm("Slet denne bil permanent?")
    ) {
      return;
    }

    await api.del(`/admin/cars/${carId}`);
    navigate("/admin/biler");
  }

  if (!loaded) {
    return (
      <p className="text-white/40">
        Indlæser...
      </p>
    );
  }

  return (
    <div className="max-w-4xl text-white">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">

        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-accent mb-2">
            Lager
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {isNew && !carId
              ? "Tilføj bil"
              : "Rediger bil"}
          </h1>
        </div>

        {carId && (
          <span className="text-xs rounded-full border border-white/10 bg-[#1c1c1f] px-3 py-1.5 text-white/65">
            {status}
          </span>
        )}

      </div>

      <form
        onSubmit={saveDraft}
        className="space-y-7"
      >

        {/* BASIC INFORMATION */}
        <section className="rounded-xl border border-white/10 bg-[#1c1c1f] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">

          <h2 className="text-lg font-semibold tracking-tight text-white mb-5">
            Grundlæggende information
          </h2>

          <div className="grid sm:grid-cols-3 gap-4">

            <div>
              <label className="label">
                Mærke *
              </label>
              <input
                required
                className="input"
                value={form.make}
                onChange={(e) =>
                  set("make", e.target.value)
                }
              />
            </div>

            <div>
              <label className="label">
                Model *
              </label>
              <input
                required
                className="input"
                value={form.model}
                onChange={(e) =>
                  set("model", e.target.value)
                }
              />
            </div>

            <div>
              <label className="label">
                Variant
              </label>
              <input
                className="input"
                value={form.variant}
                onChange={(e) =>
                  set("variant", e.target.value)
                }
              />
            </div>

            <div>
              <label className="label">
                Årgang *
              </label>
              <input
                required
                type="number"
                className="input"
                value={form.year}
                onChange={(e) =>
                  set("year", e.target.value)
                }
              />
            </div>

            <div>
              <label className="label">
                Pris (kr.) *
              </label>
              <input
                required
                type="number"
                className="input"
                value={form.price}
                onChange={(e) =>
                  set("price", e.target.value)
                }
              />
            </div>

            <div>
              <label className="label">
                Kilometer *
              </label>
              <input
                required
                type="number"
                className="input"
                value={form.mileage}
                onChange={(e) =>
                  set("mileage", e.target.value)
                }
              />
            </div>

            <div>
              <label className="label">
                Nummerplade
              </label>
              <input
                className="input"
                value={form.registration}
                onChange={(e) =>
                  set(
                    "registration",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="label">
                VIN / stelnummer
              </label>
              <input
                className="input"
                value={form.vin}
                onChange={(e) =>
                  set("vin", e.target.value)
                }
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                id="regPublic"
                type="checkbox"
                checked={form.registrationPublic}
                onChange={(e) =>
                  set(
                    "registrationPublic",
                    e.target.checked
                  )
                }
                className="h-4 w-4 rounded border-white/20 bg-[#131316]"
              />

              <label
                htmlFor="regPublic"
                className="text-sm text-white/65 cursor-pointer"
              >
                Vis nummerplade offentligt
              </label>
            </div>

            <div>
              <label className="label">
                Brændstof *
              </label>

              <select
                className="input"
                value={form.fuel}
                onChange={(e) =>
                  set("fuel", e.target.value)
                }
              >
                <option value="BENZIN">
                  Benzin
                </option>
                <option value="DIESEL">
                  Diesel
                </option>
                <option value="EL">
                  El
                </option>
                <option value="HYBRID">
                  Hybrid
                </option>
                <option value="PLUGIN_HYBRID">
                  Plugin-hybrid
                </option>
              </select>
            </div>

            <div>
              <label className="label">
                Gearkasse *
              </label>

              <select
                className="input"
                value={form.transmission}
                onChange={(e) =>
                  set(
                    "transmission",
                    e.target.value
                  )
                }
              >
                <option value="MANUEL">
                  Manuel
                </option>
                <option value="AUTOMATIK">
                  Automatik
                </option>
              </select>
            </div>

            <div>
              <label className="label">
                HK
              </label>

              <input
                type="number"
                className="input"
                value={form.horsepower}
                onChange={(e) =>
                  set(
                    "horsepower",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="label">
                Farve
              </label>

              <input
                className="input"
                value={form.color}
                onChange={(e) =>
                  set("color", e.target.value)
                }
              />
            </div>

          </div>
        </section>

        {/* DESCRIPTION */}
        <section className="rounded-xl border border-white/10 bg-[#1c1c1f] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">

          <h2 className="text-lg font-semibold tracking-tight text-white mb-5">
            Beskrivelse
          </h2>

          <label className="label">
            Lang beskrivelse
          </label>

          <textarea
            rows={5}
            className="input mb-5"
            value={form.description}
            onChange={(e) =>
              set(
                "description",
                e.target.value
              )
            }
          />

          <label className="label">
            Udstyrsliste (ét pr. linje)
          </label>

          <textarea
            rows={5}
            className="input"
            value={form.equipmentText}
            onChange={(e) =>
              set(
                "equipmentText",
                e.target.value
              )
            }
            placeholder={
              "Navigation\nSkindsæder\nBakkamera"
            }
          />

        </section>

        {/* IMAGES */}
        <section className="rounded-xl border border-white/10 bg-[#1c1c1f] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">

          <h2 className="text-lg font-semibold tracking-tight text-white mb-5">
            Billeder
          </h2>

          {carId ? (
            <ImageUploader
              carId={carId}
              images={images}
              onChange={setImages}
            />
          ) : (
            <p className="text-sm text-white/45">
              Gem bilen som kladde først for at kunne
              uploade billeder.
            </p>
          )}

        </section>

        {/* ERROR */}
        {error && (
          <div className="rounded-lg border border-rose-400/20 bg-rose-400/5 px-4 py-3">
            <p className="text-sm text-rose-300">
              {error}
            </p>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex flex-wrap items-center gap-3">

          <button
            type="submit"
            disabled={saving}
            className="
              inline-flex
              items-center
              justify-center
              rounded-lg
              border
              border-white/10
              bg-[#1c1c1f]
              px-5
              py-3
              text-sm
              font-medium
              text-white
              transition-all
              duration-200
              hover:bg-[#242427]
              hover:border-white/20
              disabled:opacity-50
            "
          >
            {saving
              ? "Gemmer..."
              : carId
              ? "Opdater"
              : "Gem som kladde"}
          </button>

          {status !== "FOR_SALE" && (
            <button
              type="button"
              onClick={publish}
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
              Udgiv
            </button>
          )}

          {status === "FOR_SALE" && (
            <button
              type="button"
              onClick={() =>
                setCarStatus("RESERVED")
              }
              className="
                inline-flex
                items-center
                justify-center
                rounded-lg
                border
                border-white/10
                bg-[#1c1c1f]
                px-5
                py-3
                text-sm
                font-medium
                text-white
                hover:bg-[#242427]
                transition-colors
              "
            >
              Marker som reserveret
            </button>
          )}

          {(status === "FOR_SALE" ||
            status === "RESERVED") && (
            <button
              type="button"
              onClick={() =>
                setCarStatus("SOLD")
              }
              className="
                inline-flex
                items-center
                justify-center
                rounded-lg
                border
                border-white/10
                bg-[#1c1c1f]
                px-5
                py-3
                text-sm
                font-medium
                text-white
                hover:bg-[#242427]
                transition-colors
              "
            >
              Marker som solgt
            </button>
          )}

          {status !== "DRAFT" && carId && (
            <button
              type="button"
              onClick={() =>
                setCarStatus("DRAFT")
              }
              className="
                inline-flex
                items-center
                justify-center
                rounded-lg
                border
                border-white/10
                bg-[#1c1c1f]
                px-5
                py-3
                text-sm
                font-medium
                text-white
                hover:bg-[#242427]
                transition-colors
              "
            >
              Sæt tilbage til kladde
            </button>
          )}

          {carId && (
            <button
              type="button"
              onClick={remove}
              className="
                text-sm
                text-rose-400
                hover:text-rose-300
                hover:underline
                ml-auto
              "
            >
              Slet bil
            </button>
          )}

        </div>
      </form>
    </div>
  );
}