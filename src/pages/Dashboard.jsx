import MetricCards from "./MetricCards";
import QuickActionsList from "./QuickActionsList";
import { useApp } from "../context/AppContext";
import { PlusCircle, Users } from "lucide-react";

export default function Dashboard() {
  const { setActivePage } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            ¡Bienvenido de nuevo!
          </h3>
          <p className="section-subtitle">
            Aquí está el resumen financiero y de ocupación del día.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-3 sm:w-auto sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setActivePage("departamentos")}
            className="btn-primary"
          >
            <PlusCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>Nuevo Depto</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePage("inquilinos")}
            className="btn-secondary"
          >
            <Users className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>Ver Inquilinos</span>
          </button>
        </div>
      </div>

      <MetricCards />
      <QuickActionsList />
    </div>
  );
}
