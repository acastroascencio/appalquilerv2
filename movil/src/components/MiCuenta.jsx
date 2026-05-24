import React, { useState, useEffect } from "react";
import { clienteSupabase } from "../config/supabase";
import { Shield, CreditCard, DollarSign, Save, LogOut, AlertCircle } from "lucide-react";

export default function MiCuenta({ sesion, setSesionActiva }) {
  const adminId = sesion?.user?.id;

  // Estados del perfil
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [yape, setYape] = useState("");
  const [plin, setPlin] = useState("");
  const [bcpCuenta, setBcpCuenta] = useState("");
  const [bcpCci, setBcpCci] = useState("");
  const [interbankCuenta, setInterbankCuenta] = useState("");
  const [interbankCci, setInterbankCci] = useState("");

  // Tarifas estándar
  const [tarifaLuz, setTarifaLuz] = useState(1.0);
  const [tarifaAgua, setTarifaAgua] = useState(4.0);

  // Estados de control
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState("");
  const [exitoGuardado, setExitoGuardado] = useState(false);

  useEffect(() => {
    async function cargarPerfil() {
      if (!adminId) return;
      setCargando(true);
      setErrorGuardado("");
      try {
        // Cargar desde tabla perfiles (RLS)
        const { data, error } = await clienteSupabase
          .from("perfiles")
          .select("nombre_completo, datos_pago")
          .eq("id", adminId)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (data) {
          setNombreCompleto(data.nombre_completo || "");
          
          const pago = data.datos_pago || {};
          setYape(pago.yape || "");
          setPlin(pago.plin || "");
          setBcpCuenta(pago.bcp_cuenta || "");
          setBcpCci(pago.bcp_cci || "");
          setInterbankCuenta(pago.interbank_cuenta || "");
          setInterbankCci(pago.interbank_cci || "");

          // Tarifas
          setTarifaLuz(pago.tarifa_luz || 1.0);
          setTarifaAgua(pago.tarifa_agua || 4.0);
        }
      } catch (err) {
        console.error("Error al cargar perfil de Supabase:", err);
        setErrorGuardado("⚠️ Hubo un problema al cargar. Revisa tu conexión a internet");
      } finally {
        setCargando(false);
      }
    }
    cargarPerfil();
  }, [adminId]);

  const guardarCambiosPerfil = async (e) => {
    e.preventDefault();
    if (!nombreCompleto) {
      setErrorGuardado("El nombre del propietario es requerido.");
      return;
    }

    setGuardando(true);
    setErrorGuardado("");
    setExitoGuardado(false);

    try {
      const payload = {
        id: adminId,
        nombre_completo: nombreCompleto,
        datos_pago: {
          yape,
          plin,
          bcp_cuenta: bcpCuenta,
          bcp_cci: bcpCci.toUpperCase(),
          interbank_cuenta: interbankCuenta,
          interbank_cci: interbankCci.toUpperCase(),
          tarifa_luz: Number(tarifaLuz) || 1.0,
          tarifa_agua: Number(tarifaAgua) || 4.0
        }
      };

      // Guardar mediante upsert
      const { error } = await clienteSupabase
        .from("perfiles")
        .upsert(payload);

      if (error) throw error;

      setExitoGuardado(true);
    } catch (err) {
      console.error("Error al guardar perfil:", err);
      // Muestra el mensaje gigante de error requerido
      setErrorGuardado("⚠️ Hubo un problema al guardar. Revisa tu conexión a internet");
    } finally {
      setGuardando(false);
    }
  };

  const cerrarSesionApp = async () => {
    if (window.confirm("¿Confirmas que deseas salir de tu cuenta?")) {
      await clienteSupabase.auth.signOut();
      setSesionActiva(null);
    }
  };

  return (
    <div className="space-y-6 pb-[100px] transicion-pantalla">
      
      <div className="border-b border-slate-200 pb-4">
        <h2 className="titulo-grande">Mi Cuenta</h2>
        <p className="text-sm font-semibold text-slate-500">
          Caja fuerte y métodos de pago del administrador
        </p>
      </div>

      {/* Cartel de Error Gigante */}
      {errorGuardado && (
        <div 
          className="p-5 bg-red-100 border-l-4 border-red-600 text-red-950 font-bold rounded-r-lg flex items-start gap-3 shadow-md"
          role="alert"
        >
          <AlertCircle className="h-6 w-6 shrink-0 text-red-700" aria-hidden="true" />
          <div className="text-base font-extrabold leading-tight">
            {errorGuardado}
          </div>
        </div>
      )}

      {/* Mensaje de éxito */}
      {exitoGuardado && (
        <div 
          className="p-4 bg-green-100 border-l-4 border-green-600 text-green-950 font-bold rounded-r-lg shadow-sm"
          role="status"
        >
          <span className="block font-black text-lg text-green-900 mb-1">¡Caja Fuerte Actualizada!</span>
          <span className="text-base font-extrabold">Tus métodos de pago y tarifas fueron guardados con éxito.</span>
        </div>
      )}

      {cargando ? (
        <p className="text-center py-10 font-bold text-slate-400 animate-pulse text-lg">
          Consultando Caja Fuerte en Supabase...
        </p>
      ) : (
        <form onSubmit={guardarCambiosPerfil} className="space-y-6">
          
          {/* 1. SECCIÓN: DATOS PERSONALES */}
          <section className="tarjeta-premium space-y-4">
            <h3 className="titulo-mediano flex items-center gap-2 border-b border-slate-100 pb-3 mb-2 text-slate-800">
              <Shield className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <span>Titular del Alquiler</span>
            </h3>
            
            <div>
              <label htmlFor="nombre-prop" className="etiqueta-gigante">Nombre Completo *</label>
              <input
                id="nombre-prop"
                type="text"
                className="campo-entrada-gigante"
                placeholder="Ej: Mario Andres Castro Ascencio"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                required
              />
            </div>
          </section>

          {/* 2. SECCIÓN: MÉTODOS DE PAGO */}
          <section className="tarjeta-premium space-y-4">
            <h3 className="titulo-mediano flex items-center gap-2 border-b border-slate-100 pb-3 mb-2 text-slate-800">
              <CreditCard className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <span>Métodos de Pago</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="yape-cel" className="etiqueta-gigante">Número de Yape</label>
                <input
                  id="yape-cel"
                  type="text"
                  className="campo-entrada-gigante"
                  placeholder="987654321"
                  value={yape}
                  onChange={(e) => setYape(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="plin-cel" className="etiqueta-gigante">Número de Plin</label>
                <input
                  id="plin-cel"
                  type="text"
                  className="campo-entrada-gigante"
                  placeholder="987654321"
                  value={plin}
                  onChange={(e) => setPlin(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label htmlFor="bcp-cta" className="etiqueta-gigante">Cuenta BCP</label>
                <input
                  id="bcp-cta"
                  type="text"
                  className="campo-entrada-gigante"
                  placeholder="191-98765432-0-12"
                  value={bcpCuenta}
                  onChange={(e) => setBcpCuenta(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="bcp-cci" className="etiqueta-gigante">CCI BCP (Interbancario)</label>
                <input
                  id="bcp-cci"
                  type="text"
                  className="campo-entrada-gigante"
                  placeholder="002-19198765432012-54"
                  value={bcpCci}
                  onChange={(e) => setBcpCci(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label htmlFor="ibk-cta" className="etiqueta-gigante">Cuenta Interbank</label>
                <input
                  id="ibk-cta"
                  type="text"
                  className="campo-entrada-gigante"
                  placeholder="200-300456789"
                  value={interbankCuenta}
                  onChange={(e) => setInterbankCuenta(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="ibk-cci" className="etiqueta-gigante">CCI Interbank (Interbancario)</label>
                <input
                  id="ibk-cci"
                  type="text"
                  className="campo-entrada-gigante"
                  placeholder="003-200300456789-11"
                  value={interbankCci}
                  onChange={(e) => setInterbankCci(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* 3. SECCIÓN: TARIFAS DE SERVICIO */}
          <section className="tarjeta-premium space-y-4">
            <h3 className="titulo-mediano flex items-center gap-2 border-b border-slate-100 pb-3 mb-2 text-slate-800">
              <DollarSign className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <span>Tarifas de Servicios por Defecto</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tarifa-luz-def" className="etiqueta-gigante">Luz Eléctrica (S/ por kWh)</label>
                <input
                  id="tarifa-luz-def"
                  type="number"
                  step="0.01"
                  className="campo-entrada-gigante"
                  placeholder="1.0"
                  value={tarifaLuz}
                  onChange={(e) => setTarifaLuz(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="tarifa-agua-def" className="etiqueta-gigante">Agua Potable (S/ por m³)</label>
                <input
                  id="tarifa-agua-def"
                  type="number"
                  step="0.01"
                  className="campo-entrada-gigante"
                  placeholder="4.0"
                  value={tarifaAgua}
                  onChange={(e) => setTarifaAgua(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* BOTÓN GUARDAR GIGANTE */}
          <button
            type="submit"
            disabled={guardando}
            className="w-full boton-positivo-gigante shadow-xl shadow-green-500/10"
          >
            <Save className="h-6 w-6" aria-hidden="true" />
            <span>{guardando ? "Guardando en Caja Fuerte..." : "Guardar en Caja Fuerte"}</span>
          </button>

          {/* BOTÓN CERRAR SESIÓN GIGANTE */}
          <button
            type="button"
            onClick={cerrarSesionApp}
            className="w-full boton-peligro-gigante mt-4 shadow-xl shadow-red-500/10"
          >
            <LogOut className="h-6 w-6" aria-hidden="true" />
            <span>Cerrar Sesión</span>
          </button>

        </form>
      )}
    </div>
  );
}
