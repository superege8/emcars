import { useState } from "react";
import { api } from "../api/client";
import Eyebrow from "../components/Eyebrow";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      await api.post("/leads", {
        ...form,
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
            Kontakt
          </Eyebrow>

          <h1 className="text-4xl mb-3 text-white">
            Kontakt EM Cars
          </h1>

          <p className="text-white/60">
            Udfyld formularen, så vender vi tilbage hurtigst muligt —
            eller ring eller skriv til os direkte.
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <div className="container-page py-16 max-w-2xl">

        {/* CONTACT INFO */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row gap-6 text-sm">

            <div>
              <p className="text-white/40 mb-1">
                Telefon
              </p>

              <a
                href="tel:+4542318338"
                className="text-white hover:text-accent transition-colors"
              >
                +45 42 31 83 38
              </a>
            </div>

            <div>
              <p className="text-white/40 mb-1">
                Email
              </p>

              <a
                href="mailto:kontakt@emcars.dk"
                className="text-white hover:text-accent transition-colors"
              >
                kontakt@emcars.dk
              </a>
            </div>

          </div>
        </div>

        {/* FORM */}
        <div className="card p-8">

          {sent ? (
            <div>
              <p className="text-lg font-medium text-white mb-2">
                Tak for din henvendelse!
              </p>

              <p className="text-white/60 text-sm">
                Vi kontakter dig snarest.
              </p>
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="space-y-4"
            >

              <div>
                <label className="label">
                  Navn
                </label>

                <input
                  required
                  className="input"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="label">
                  Email
                </label>

                <input
                  required
                  type="email"
                  className="input"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
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
                    setForm({
                      ...form,
                      phone: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="label">
                  Besked
                </label>

                <textarea
                  required
                  rows={6}
                  className="input"
                  value={form.message}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      message: e.target.value,
                    })
                  }
                />
              </div>

              {error && (
                <p className="text-rose-400 text-sm">
                  {error}
                </p>
              )}

              <button
                disabled={sending}
                className="btn-primary w-full"
              >
                {sending ? "Sender..." : "Send besked"}
              </button>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}