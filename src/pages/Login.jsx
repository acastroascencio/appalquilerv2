import React, { useState } from "react";
import { AlertCircle, Building, KeyRound, Mail } from "lucide-react";

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
    name: "Sofía Rodríguez",
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

export default function Login({ setSesionActiva }) {
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
    <main className="flex min-h-screen flex-col justify-center bg-slate-50 px-6 py-12 font-sans">
      <div className="mx-auto w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-xl shadow-blue-500/20" aria-hidden="true">
            <Building className="h-9 w-9" />
          </div>
          <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-950">AlquilerApp</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            Gestión inteligente de inmuebles y consumo eléctrico
          </p>
        </div>

        {mensajeError && (
          <div className="app-alert-error" role="alert">
            <AlertCircle className="h-6 w-6 shrink-0 text-red-700" aria-hidden="true" />
            <div>
              <span className="block text-lg font-black text-red-900">Error de ingreso</span>
              <p>{mensajeError}</p>
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
          <h2 className="mb-6 border-b border-slate-100 pb-3 text-center text-2xl font-black text-slate-950">
            Entrar a la Cuenta
          </h2>

          <form onSubmit={iniciarSesion} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="correo-input" className="label-text">
                Correo Electrónico *
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
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="clave-input" className="label-text">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  id="clave-input"
                  type="password"
                  className="input-field pl-11"
                  placeholder="Tu contraseña secreta"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full shadow-lg shadow-blue-500/10" disabled={procesando}>
              {procesando ? "Verificando..." : "Entrar"}
            </button>

            <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
              <span className="block text-center text-sm font-black uppercase tracking-wider text-slate-500">
                Ingresar en Modo Demostración (3 Cuentas)
              </span>
              <div className="grid grid-cols-1 gap-3">
                {demoAccounts.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => activarSesion({ user: { id: account.id, nombre: account.name } })}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-left transition-colors hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${account.colorClass} flex h-9 w-9 items-center justify-center rounded-lg text-sm font-black text-white`}>
                        {account.initials}
                      </div>
                      <div>
                        <span className="block text-base font-black text-slate-800">{account.name}</span>
                        <span className="block text-xs font-semibold text-slate-500">{account.role}</span>
                      </div>
                    </div>
                    <span className="text-sm font-black uppercase text-blue-700">Entrar</span>
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
