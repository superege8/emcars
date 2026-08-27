import { useState } from "react";
import { api } from "../api/client";
import Eyebrow from "../components/Eyebrow";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  make: "",
  model: "",
  year: "",
  mileage: "",
  message: "",
};

export default function SellCar() {
  const [form, setForm] = useState(emptyForm);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      const carLine = [
        form.make,
        form.model,
        form.year && `(${form.year})`,
      ]
        .filter(Boolean)
        .join(" ");

      const message = [
        carLine && `Bil: ${carLine}`,
        form.mileage && `Kilometer: ${form.mileage} km`,
        "",
        form.message,
      ]
        .filter((l) => l !== undefined)
        .join("\n")
        .trim();

      await api.post("/leads", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: message || "Ønsker vurdering af bil til salg.",
        type: "GENERAL",
      });

      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-[#131316] text-white">
      {/* HEADER */}
      <section className="border-b border-white/10 bg-[#131316]">
        <div className="container-page py-16 max-w-2xl">
          <Eyebrow className="mb-3">
            Sælg din bil
          </Eyebrow>

          <h1 className="text-4xl mb-4 text-white">
            Vil du sælge din bil?
          </h1>

          <p className="text-white/60 leading-relaxed">
            Fortæl os lidt om din bil, så vender vi tilbage med en
            uforpligtende vurdering. Jo flere detaljer, jo bedre kan vi
            give dig et retvisende bud.
          </p>
        </div>
      </section>

      {/* FORM */}
      <div className="container-page py-16 max-w-2xl">
        {sent ? (
          <div className="card p-8">
            <p className="font-medium mb-1 text-white">
              Tak for din henvendelse!
            </p>

            <p className="text-white/60 text-sm">
              Vi gennemgår oplysningerne og vender tilbage hurtigst muligt.
            </p>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="card p-8 space-y-8"
          >
            {/* OM BILEN */}
            <div>
              <h2 className="text-sm uppercase tracking-[0.15em] text-white/50 mb-4">
                Om bilen
              </h2>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="label">
                    Mærke
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
                    Model
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
                    Årgang
                  </label>

                  <input
                    className="input"
                    type="number"
                    value={form.year}
                    onChange={(e) =>
                      set("year", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="label">
                  Kilometer
                </label>

                <input
                  className="input"
                  type="number"
                  value={form.mileage}
                  onChange={(e) =>
                    set("mileage", e.target.value)
                  }
                />
              </div>

              <div className="mt-4">
                <label className="label">
                  Beskriv bilens stand
                </label>

                <textarea
                  rows={4}
                  className="input"
                  value={form.message}
                  onChange={(e) =>
                    set("message", e.target.value)
                  }
                  placeholder="Servicehistorik, eventuelle skader, udstyr m.m."
                />
              </div>
            </div>

            {/* DINE OPLYSNINGER */}
            <div>
              <h2 className="text-sm uppercase tracking-[0.15em] text-white/50 mb-4">
                Dine oplysninger
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    Navn
                  </label>

                  <input
                    required
                    className="input"
                    value={form.name}
                    onChange={(e) =>
                      set("name", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="label">
                    Telefon
                  </label>

                  <input
                    className="input"
                    value={form.phone}
                    onChange={(e) =>
                      set("phone", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="label">
                  Email
                </label>

                <input
                  required
                  type="email"
                  className="input"
                  value={form.email}
                  onChange={(e) =>
                    set("email", e.target.value)
                  }
                />
              </div>
            </div>

            {/* FEJL */}
            {error && (
              <p className="text-rose-400 text-sm">
                {error}
              </p>
            )}

            {/* SEND */}
            <button
              disabled={sending}
              className="btn-primary w-full"
            >
              {sending
                ? "Sender..."
                : "Send til vurdering"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}