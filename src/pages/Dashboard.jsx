import React from "react";
import MetricCards from "./MetricCards";
import QuickActionsList from "./QuickActionsList";
import { useApp } from "../context/AppContext";
import { PlusCircle, Users } from "lucide-react";

export default function Dashboard() {
  const { setActivePage } = useApp();

  return (
    <div className="space-y-6">
      {/* Saludo y Accesos Rápidos */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">¡Bienvenido de nuevo!</h3>
          <p className="text-sm font-semibold text-slate-500">Aquí está el resumen financiero y de ocupación del día.</p>
        </div>
        
        {/* Atajos Rápidos */}
        <div className="flex gap-3">
          <button 
            onClick={() => setActivePage("departamentos")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-all duration-150 flex items-center gap-2 shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Nuevo Depto</span>
          </button>
          <button 
            onClick={() => setActivePage("inquilinos")}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg text-sm transition-all duration-150 flex items-center gap-2 shadow-sm"
          >
            <Users className="h-4 w-4" />
            <span>Ver Inquilinos</span>
          </button>
        </div>
      </div>

      {/* Tarjetas Métricas Bento Grid */}
      <MetricCards />

      {/* Tabla de Cobros Pendientes y WhatsApp */}
      <QuickActionsList />
    </div>
  );
}
