import React, { useState } from "react";
import { clienteSupabase } from "../config/supabase";
import { KeyRound, Mail, AlertCircle, Building } from "lucide-react";

export default function Login({ setSesionActiva }) {
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const iniciarSesion = async (e) => {
    e.preventDefault();
    if (!correo || !clave) {
      setMensajeError("Por favor completa todos los campos.");
      return;
    }

    setProcesando(true);
    setMensajeError("");

    try {
      const { data, error } = await clienteSupabase.auth.signInWithPassword({
        email: correo,
        password: clave,
      });

      if (error) throw error;
      
      if (data?.session) {
        setSesionActiva(data.session);
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      // Muestra el cartel de error gigante solicitado
      setMensajeError("⚠️ Hubo un problema al ingresar. Revisa tu conexión a internet");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center bg-[#F9FAFB] px-6 py-12 select-none font-sans">
      <div className="max-w-md w-full mx-auto space-y-8">
        
        {/* Marca y Logotipo */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20" aria-hidden="true">
            <Building className="h-9 w-9" />
          </div>
          <h1 className="mt-6 titulo-grande">AlquilerApp</h1>
          <p className="text-sm font-semibold text-slate-500 mt-2">
            Gestión inteligente de inmuebles y consumo eléctrico
          </p>
        </div>

        {/* Mensaje de error gigante */}
        {mensajeError && (
          <div 
            className="p-5 bg-red-100 border-l-4 border-red-600 text-red-950 font-bold rounded-r-lg flex items-start gap-3 shadow-md transicion-pantalla"
            role="alert"
          >
            <AlertCircle className="h-6 w-6 shrink-0 text-red-700" aria-hidden="true" />
            <div>
              <span className="block font-black text-lg text-red-900 mb-1">Error de Ingreso</span>
              <p className="text-base font-extrabold leading-tight">{mensajeError}</p>
            </div>
          </div>
        )}

        {/* Formulario de Entrada */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl">
          <h2 className="titulo-mediano text-center border-b border-slate-100 pb-3 mb-6">
            Entrar a la Cuenta
          </h2>

          <form onSubmit={iniciarSesion} className="space-y-6">
            
            {/* Campo Correo */}
            <div className="space-y-2">
              <label htmlFor="correo-input" className="etiqueta-gigante">
                Correo Electrónico *
              </label>
              <div className="relative">
                <input
                  id="correo-input"
                  type="email"
                  className="campo-entrada-gigante pl-11"
                  placeholder="ejemplo@correo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  autoComplete="email"
                  required
                />
                <Mail className="absolute left-4 top-4.5 h-5 w-5 text-slate-400" aria-hidden="true" />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-2">
              <label htmlFor="clave-input" className="etiqueta-gigante">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  id="clave-input"
                  type="password"
                  className="campo-entrada-gigante pl-11"
                  placeholder="Tu contraseña secreta"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <KeyRound className="absolute left-4 top-4.5 h-5 w-5 text-slate-400" aria-hidden="true" />
              </div>
            </div>

            {/* Botón Gigante (Mínimo 60px) */}
            <button
              type="submit"
              className="w-full boton-accion-gigante shadow-lg shadow-blue-500/10 mt-4"
              disabled={procesando}
            >
              {procesando ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" aria-hidden="true"></div>
                  <span>Verificando...</span>
                </>
              ) : (
                <span>Entrar</span>
              )}
            </button>

          </form>
        </section>
      </div>
    </main>
  );
}
