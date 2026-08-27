import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "Login fejlede.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#131316] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1c1c1f] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">

        {/* HEADER */}
        <div className="mb-7">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a9683f]">
            EM Cars
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Forhandler login
          </h1>

          <p className="mt-2 text-sm text-white/50">
            Log ind for at administrere dine biler.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={submit} className="space-y-5">

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/45">
              Email
            </label>

            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full
                rounded-lg
                border border-white/10
                bg-[#131316]
                px-4
                py-3
                text-sm
                text-white
                placeholder:text-white/25
                outline-none
                transition-all
                duration-200
                focus:border-white/25
                focus:ring-2
                focus:ring-white/[0.05]
              "
              placeholder="admin@emcars.dk"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/45">
              Adgangskode
            </label>

            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full
                rounded-lg
                border border-white/10
                bg-[#131316]
                px-4
                py-3
                text-sm
                text-white
                outline-none
                transition-all
                duration-200
                focus:border-white/25
                focus:ring-2
                focus:ring-white/[0.05]
              "
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-rose-400/20 bg-rose-400/5 px-4 py-3">
              <p className="text-sm text-rose-300">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              rounded-lg
              bg-white
              px-4
              py-3
              text-sm
              font-semibold
              text-[#131316]
              transition-all
              duration-200
              hover:bg-white/90
              active:scale-[0.99]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading ? "Logger ind..." : "Log ind"}
          </button>

        </form>
      </div>
    </div>
  );
}