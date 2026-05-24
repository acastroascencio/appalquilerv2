import React from "react";
import Sidebar from "./Sidebar";
import { useApp } from "../../context/AppContext";
import { User } from "lucide-react";

export default function AppLayout({ children }) {
  const { config, activePage, selectedInquilinoId } = useApp();

  const getPageTitle = () => {
    if (selectedInquilinoId) return "Ficha Detallada del Inquilino";
    switch (activePage) {
      case "dashboard": return "Dashboard Resumen";
      case "departamentos": return "Gestión de Departamentos";
      case "inquilinos": return "Gestión de Inquilinos";
      case "consumo": return "Registro de Consumo (Supabase)";
      case "configuracion": return "Configuración del Sistema";
      default: return "AlquilerApp";
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-800 antialiased">
      {/* Sidebar Fijo */}
      <Sidebar />

      {/* Área de Contenido Principal */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Cabecera / Header Superior */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight transition-all duration-200">
              {getPageTitle()}
            </h2>
          </div>

          {/* Información del Administrador */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {config?.titular || "Administrador"}
              </p>
              <p className="text-xs font-medium text-slate-500">Propietario</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shadow-inner">
              <User className="h-5 w-5" />
            </div>
          </div>
        </header>

        {/* Panel de Contenido */}
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
