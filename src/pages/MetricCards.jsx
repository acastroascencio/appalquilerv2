import React from "react";
import { useApp } from "../context/AppContext";
import { 
  Building, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight
} from "lucide-react";

export default function MetricCards() {
  const { propiedades, mensualidades } = useApp();

  // Calcular métricas de propiedades
  const totalProps = propiedades.length;
  const ocupadasProps = propiedades.filter(p => p.estado).length;
  const ocupacionPorcentaje = totalProps > 0 ? Math.round((ocupadasProps / totalProps) * 100) : 0;

  // Calcular métricas de ingresos (Mes actual, ej: "05-2026")
  const mesActual = "05-2026"; // Simulado o dinámico
  const mensualidadesMes = mensualidades.filter(m => m.mes_anio === mesActual);
  
  const totalEsperado = mensualidadesMes.reduce((acc, curr) => acc + curr.total_cobrado, 0);
  const totalCobrado = mensualidadesMes
    .filter(m => m.estado === "Pagado")
    .reduce((acc, curr) => acc + curr.total_cobrado, 0);
  const totalPendiente = mensualidadesMes
    .filter(m => m.estado === "Pendiente")
    .reduce((acc, curr) => acc + curr.total_cobrado, 0);

  const cobranzaPorcentaje = totalEsperado > 0 ? Math.round((totalCobrado / totalEsperado) * 100) : 0;

  // Pendientes globales
  const facturasPendientesTotal = mensualidades.filter(m => m.estado === "Pendiente").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* TARJETA 1: OCUPACIÓN */}
      <div className="card-container flex items-center justify-between relative overflow-hidden group">
        <div className="flex-1">
          <span className="text-sm font-semibold text-slate-500 block mb-1">Ocupación de Inmuebles</span>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {ocupadasProps} <span className="text-lg font-medium text-slate-400">/ {totalProps}</span>
          </h3>
          <p className="text-xs font-semibold text-status-success mt-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>{ocupacionPorcentaje}% ocupado</span>
          </p>
        </div>

        {/* Círculo SVG de Progreso */}
        <div className="relative h-20 w-20 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-100"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-blue-600 transition-all duration-500"
              strokeDasharray={`${ocupacionPorcentaje}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute text-xs font-extrabold text-slate-800">{ocupacionPorcentaje}%</div>
        </div>
      </div>

      {/* TARJETA 2: RECAUDACIÓN MENSUAL */}
      <div className="card-container flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-sm font-semibold text-slate-500 block">Recaudación ({mesActual})</span>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              S/ {totalCobrado.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-50 text-status-success flex items-center justify-center">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>

        <div className="w-full">
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Progreso de cobros</span>
            <span>{cobranzaPorcentaje}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${cobranzaPorcentaje}%` }}
            />
          </div>
          <span className="text-xs text-slate-400 block mt-1.5">
            Meta del mes: S/ {totalEsperado.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* TARJETA 3: CUENTAS PENDIENTES */}
      <div className="card-container flex items-center justify-between group border-l-4 border-l-status-danger">
        <div>
          <span className="text-sm font-semibold text-slate-500 block mb-1">Cuentas Pendientes</span>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight text-status-danger">
            S/ {totalPendiente.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-xs font-semibold text-slate-500 mt-2">
            {facturasPendientesTotal} recibo(s) sin cancelar actualmente
          </p>
        </div>

        <div className="h-14 w-14 rounded-full bg-red-50 text-status-danger flex items-center justify-center animate-pulse">
          <AlertTriangle className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
