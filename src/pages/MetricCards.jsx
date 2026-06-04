import { useApp } from "../context/AppContext";
import {
  Building2,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

export default function MetricCards() {
  const { propiedades, mensualidades } = useApp();

  const totalProps = propiedades.length;
  const ocupadasProps = propiedades.filter((p) => p.estado).length;
  const ocupacionPorcentaje =
    totalProps > 0 ? Math.round((ocupadasProps / totalProps) * 100) : 0;

  const hoy = new Date();
  const mesActual = `${String(hoy.getMonth() + 1).padStart(2, "0")}-${hoy.getFullYear()}`;
  const mensualidadesMes = mensualidades.filter((m) => m.mes_anio === mesActual);

  const totalEsperado = mensualidadesMes.reduce(
    (acc, curr) => acc + Number(curr.total_cobrado || 0),
    0
  );
  const totalCobrado = mensualidadesMes
    .filter((m) => m.estado === "Pagado")
    .reduce((acc, curr) => acc + Number(curr.total_cobrado || 0), 0);
  const totalPendiente = mensualidadesMes
    .filter((m) => m.estado === "Pendiente")
    .reduce((acc, curr) => acc + Number(curr.total_cobrado || 0), 0);

  const cobranzaPorcentaje =
    totalEsperado > 0 ? Math.round((totalCobrado / totalEsperado) * 100) : 0;
  const facturasPendientesTotal = mensualidades.filter(
    (m) => m.estado === "Pendiente"
  ).length;

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6" aria-label="Métricas principales">
      <article className="card-container flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <span className="block text-base font-extrabold text-slate-600">
            Ocupación de inmuebles
          </span>
          <h3 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
            {ocupadasProps} <span className="text-lg font-semibold text-slate-500">/ {totalProps}</span>
          </h3>
          <p className="mt-2 flex items-center gap-1 text-sm font-extrabold text-emerald-700">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
            <span>{ocupacionPorcentaje}% ocupado</span>
          </p>
        </div>

        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
            <path
              className="text-slate-100"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-blue-700 transition-all duration-500"
              strokeDasharray={`${ocupacionPorcentaje}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute text-sm font-black text-slate-900">{ocupacionPorcentaje}%</div>
        </div>
      </article>

      <article className="card-container flex flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="block text-base font-extrabold text-slate-600">
              Recaudación ({mesActual})
            </span>
            <h3 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
              S/ {totalCobrado.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>

        <div>
          <div className="mb-1 flex justify-between text-sm font-extrabold text-slate-600">
            <span>Progreso de cobros</span>
            <span>{cobranzaPorcentaje}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${cobranzaPorcentaje}%` }}
            />
          </div>
          <span className="mt-2 block text-sm font-semibold text-slate-500">
            Meta del mes: S/ {totalEsperado.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </article>

      <article className="card-container bg-red-50/70 border-red-200 flex items-center justify-between gap-4">
        <div>
          <span className="block text-base font-extrabold text-red-950">
            Cuentas pendientes
          </span>
          <h3 className="mt-1 text-3xl font-black tracking-tight text-red-700">
            S/ {totalPendiente.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
          </h3>
          <p className="mt-2 text-sm font-extrabold text-red-900">
            {facturasPendientesTotal} recibo(s) sin cancelar
          </p>
        </div>

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-red-700 shadow-sm">
          {facturasPendientesTotal > 0 ? (
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Building2 className="h-6 w-6" aria-hidden="true" />
          )}
        </div>
      </article>
    </section>
  );
}
