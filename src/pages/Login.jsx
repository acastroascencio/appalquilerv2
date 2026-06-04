import { useState } from "react";
import { AlertCircle, Building, KeyRound, Mail } from "lucide-react";
import ThemeToggle from "../components/ui/ThemeToggle";

const demoAccounts = [
  {
    id: "demo-mario",
    initials: "MC",
    name: "Mario Castro",
    role: "Admin Residencial (3 Deptos)",
    colorClass: "bg-emerald-500",
  },
  {
    id: "demo-sofia",
    initials: "SR",
    name: "Sofia Rodriguez",
    role: "Admin Condominio (4 Deptos)",
    colorClass: "bg-blue-500",
  },
  {
    id: "demo-carlos",
    initials: "CM",
    name: "Carlos Mendoza",
    role: "Admin Comercial (3 Locales)",
    colorClass: "bg-amber-500",
  },
];

export default function Login({ setSesionActiva, theme, resolvedTheme, onToggleTheme }) {
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const activarSesion = (session) => {
    localStorage.setItem("alquiler_web_session", JSON.stringify(session));
    setSesionActiva(session);
  };

  const iniciarSesion = (e) => {
    e.preventDefault();
    if (!correo || !clave) {
      setMensajeError("Por favor completa todos los campos.");
      return;
    }

    setProcesando(true);
    setMensajeError("");

    window.setTimeout(() => {
      activarSesion({
        user: {
          id: "web-local",
          nombre: "Administrador Web",
          correo,
        },
      });
      setProcesando(false);
    }, 350);
  };

  return (
    <main className="flex min-h-screen flex-col justify-center overflow-x-hidden px-5 py-8 font-sans sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-md space-y-7">
        <div className="flex justify-end">
          <ThemeToggle theme={theme} resolvedTheme={resolvedTheme} onToggle={onToggleTheme} />
        </div>

        <div className="text-center">
          <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-blue-700 text-white shadow-xl shadow-blue-900/15" aria-hidden="true">
            <Building className="h-9 w-9" />
          </div>
          <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">
            AlquilerApp
          </h1>
          <p className="mt-2 text-base font-semibold leading-relaxed text-slate-500 dark:text-slate-300">
            Gestion inteligente de inmuebles y consumo electrico
          </p>
        </div>

        {mensajeError && (
          <div className="app-alert-error" role="alert">
            <AlertCircle className="h-6 w-6 shrink-0 text-red-700 dark:text-red-300" aria-hidden="true" />
            <div>
              <span className="block text-lg font-black text-red-900 dark:text-red-100">Error de ingreso</span>
              <p>{mensajeError}</p>
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-300/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-6">
          <h2 className="mb-6 border-b border-slate-100 pb-3 text-center text-2xl font-black text-slate-950 dark:border-slate-800 dark:text-slate-50">
            Entrar a la cuenta
          </h2>

          <form onSubmit={iniciarSesion} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="correo-input" className="label-text">
                Correo electronico *
              </label>
              <div className="relative">
                <input
                  id="correo-input"
                  type="email"
                  className="input-field pl-11"
                  placeholder="ejemplo@correo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  autoComplete="email"
                  required
                />
                <Mail className="field-icon" aria-hidden="true" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="clave-input" className="label-text">
                Contrasena *
              </label>
              <div className="relative">
                <input
                  id="clave-input"
                  type="password"
                  className="input-field pl-11"
                  placeholder="Tu contrasena secreta"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <KeyRound className="field-icon" aria-hidden="true" />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full shadow-lg shadow-blue-500/10" disabled={procesando}>
              {procesando ? "Verificando..." : "Entrar"}
            </button>

            <div className="mt-6 space-y-4 border-t border-slate-100 pt-5 dark:border-slate-800">
              <span className="block text-center text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Ingresar en modo demostracion
              </span>
              <div className="grid grid-cols-1 gap-3">
                {demoAccounts.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => activarSesion({ user: { id: account.id, nombre: account.name } })}
                    className="flex min-h-16 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-left transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-800"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`${account.colorClass} flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-black text-white`}>
                        {account.initials}
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate text-base font-black text-slate-800 dark:text-slate-100">{account.name}</span>
                        <span className="block truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{account.role}</span>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-black uppercase text-blue-700 dark:text-blue-300">Entrar</span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
