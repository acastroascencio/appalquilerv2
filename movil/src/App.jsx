import React, { useState, useEffect } from "react";
import { clienteSupabase } from "./config/supabase";
import Login from "./components/Login";
import BottomNav from "./components/BottomNav";
import Inicio from "./components/Inicio";
import Departamentos from "./components/Departamentos";
import MiCuenta from "./components/MiCuenta";
import { Building, Zap, User } from "lucide-react";

export default function App() {
  const [sesionActiva, setSesionActiva] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [paginaActiva, setPaginaActiva] = useState("inicio"); // inicio, departamentos, cuenta

  useEffect(() => {
    // 1. Validar si hay una sesión activa al cargar
    async function chequearSesion() {
      try {
        const { data } = await clienteSupabase.auth.getSession();
        setSesionActiva(data?.session || null);
      } catch (err) {
        console.error("Error al validar sesión:", err);
      } finally {
        setCargandoSesion(false);
      }
    }

    chequearSesion();

    // 2. Escuchar cambios de estado en la sesión de Supabase
    const { data: suscripcion } = clienteSupabase.auth.onAuthStateChange(
      (evento, sesion) => {
        setSesionActiva(sesion);
        setCargandoSesion(false);
      }
    );

    return () => {
      suscripcion.subscription.unsubscribe();
    };
  }, []);

  // Pantalla de carga accesible y premium
  if (cargandoSesion) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen bg-slate-950 text-white flex-col gap-4"
        role="status"
        aria-live="polite"
      >
        <div className="relative flex items-center justify-center" aria-hidden="true">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-600"></div>
          <div className="absolute h-8 w-8 bg-slate-950 rounded-full"></div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-base font-black tracking-widest text-slate-300 uppercase">AlquilerApp</p>
          <span className="text-sm text-slate-500 font-semibold">Cargando Caja Fuerte...</span>
        </div>
      </div>
    );
  }

  // Redirigir a login si no hay sesión
  if (!sesionActiva) {
    return <Login setSesionActiva={setSesionActiva} />;
  }

  // Renderizar la pestaña activa (Single Page Navigation)
  const renderizarPantalla = () => {
    switch (paginaActiva) {
      case "inicio":
        return <Inicio sesion={sesionActiva} />;
      case "departamentos":
        return <Departamentos sesion={sesionActiva} />;
      case "cuenta":
        return <MiCuenta sesion={sesionActiva} setSesionActiva={setSesionActiva} />;
      default:
        return <Inicio sesion={sesionActiva} />;
    }
  };

  const obtenerTituloCabecera = () => {
    switch (paginaActiva) {
      case "inicio": return "Panel de Inicio";
      case "departamentos": return "Tus Inmuebles";
      case "cuenta": return "Ajustes de Cobro";
      default: return "AlquilerApp";
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans select-none pb-24">
      {/* Cabecera Superior Fija con Estilos Accesibles */}
      <header 
        className="h-16 bg-slate-950 text-white px-6 flex items-center justify-between shadow-md sticky top-0 z-30"
        role="banner"
      >
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-blue-500" aria-hidden="true" />
          <h2 className="text-lg font-black tracking-wide">
            {obtenerTituloCabecera()}
          </h2>
        </div>
        <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shadow-inner">
          <User className="h-4 w-4" aria-hidden="true" />
        </div>
      </header>

      {/* Contenedor Principal de la Pestaña Activa */}
      <main className="flex-1 p-6 max-w-4xl w-full mx-auto" role="main">
        {renderizarPantalla()}
      </main>

      {/* Menú Inferior de Botones Gigantes Standalone */}
      <BottomNav paginaActiva={paginaActiva} setPaginaActiva={setPaginaActiva} />
    </div>
  );
}
