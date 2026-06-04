import { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Circle, Info, XCircle } from "lucide-react";

const statuses = [
  {
    label: "Al dia",
    description: "Registro correcto, pagado u ocupado.",
    icon: CheckCircle2,
    className: "status-badge-success",
  },
  {
    label: "Pendiente",
    description: "Requiere revision o seguimiento.",
    icon: AlertTriangle,
    className: "status-badge-warning",
  },
  {
    label: "Vencido",
    description: "Deuda, error o accion peligrosa.",
    icon: XCircle,
    className: "status-badge-danger",
  },
  {
    label: "Informativo",
    description: "Accion principal o dato de ayuda.",
    icon: Info,
    className: "status-badge-info",
  },
  {
    label: "Sin datos",
    description: "Disponible, inactivo o sin informacion.",
    icon: Circle,
    className: "status-badge-neutral",
  },
];

export default function StatusLegend({ compact = false }) {
  const [open, setOpen] = useState(!compact);

  return (
    <section className="card-container" aria-label="Leyenda de estados">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="section-heading">Indicadores de estado</h3>
          <p className="section-subtitle">Color, icono y texto trabajan juntos para evitar confusiones.</p>
        </div>
        {compact && (
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="btn-secondary self-start px-4 py-2 text-base sm:self-auto"
            aria-expanded={open}
          >
            <span>Ver leyenda</span>
            <ChevronDown className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
        )}
      </div>

      {open && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {statuses.map((status) => {
            const Icon = status.icon;

            return (
              <article
                key={status.label}
                className={`rounded-xl border p-3 ${status.className}`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="text-base font-black">{status.label}</span>
                </div>
                <p className="mt-1 text-[15px] font-semibold leading-snug">{status.description}</p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
