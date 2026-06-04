import { useApp } from "../context/AppContext";
import { buildWhatsAppLink } from "../utils/WhatsAppLinkBuilder";
import {
  MessageSquare,
  CheckCircle,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "../components/ui/ConfirmDialog";

export default function QuickActionsList() {
  const {
    inquilinos,
    propiedades,
    mensualidades,
    config,
    saveMensualidad,
    setSelectedInquilinoId,
    setActivePage,
  } = useApp();
  const [confirmPayment, setConfirmPayment] = useState(null);

  const cobrosPendientes = mensualidades.filter((m) => m.estado === "Pendiente");

  const handleMarkAsPaid = async (mensualidad) => {
    await saveMensualidad({
      ...mensualidad,
      estado: "Pagado",
    });
    setConfirmPayment(null);
  };

  const handleVerFicha = (inquilinoId) => {
    setSelectedInquilinoId(inquilinoId);
    setActivePage("inquilinos");
  };

  const getCobroRows = () =>
    cobrosPendientes
      .map((mens) => {
        const inq = inquilinos.find((i) => i.id === mens.inquilino_id);
        if (!inq) return null;
        const prop = propiedades.find((p) => p.id === inq.propiedad_id);
        if (!prop) return null;

        return {
          mens,
          inq,
          prop,
          waLink: buildWhatsAppLink({
            inquilino: inq,
            propiedad: prop,
            mensualidad: mens,
            config,
          }),
        };
      })
      .filter(Boolean);

  const rows = getCobroRows();

  return (
    <section className="card-container" aria-labelledby="quick-actions-title">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 id="quick-actions-title" className="section-heading">
            Acciones rápidas de cobro
          </h4>
          <p className="section-subtitle">Mensualidades pendientes para cobro inmediato.</p>
        </div>
        <span className="w-fit rounded-full border border-red-100 bg-red-50 px-3 py-1 text-sm font-extrabold text-red-700">
          {cobrosPendientes.length} pendiente(s)
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="app-alert-success">
          <CheckCircle className="h-6 w-6 shrink-0 text-emerald-700" aria-hidden="true" />
          <div>
            <span className="block font-black">Todo al día</span>
            <span>No hay cobros pendientes para este periodo.</span>
          </div>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="pb-3">Depto</th>
                  <th className="pb-3">Inquilino</th>
                  <th className="pb-3">Periodo</th>
                  <th className="pb-3">Total a cobrar</th>
                  <th className="pb-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {rows.map(({ mens, inq, prop, waLink }) => (
                  <tr key={mens.id} className="transition-colors duration-150 hover:bg-slate-50">
                    <td className="py-4 font-bold text-slate-900">
                      <span className="rounded-md bg-slate-100 px-3 py-1 text-slate-700">
                        {prop.identificador}
                      </span>
                    </td>
                    <td className="py-4 font-semibold text-slate-700">
                      <div>
                        {inq.nombre}
                        <span className="block text-sm font-semibold text-slate-500">{inq.telefono}</span>
                      </div>
                    </td>
                    <td className="py-4 font-semibold text-slate-600">{mens.mes_anio}</td>
                    <td className="py-4 font-extrabold text-slate-950">
                      S/ {Number(mens.total_cobrado).toFixed(2)}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleVerFicha(inq.id)}
                          className="rounded-lg bg-slate-100 p-3 text-slate-700 transition-colors duration-150 hover:bg-slate-200"
                          title="Ver ficha detallada"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">Ver ficha detallada</span>
                        </button>

                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center rounded-lg bg-[#25d366]/10 p-3 text-[#128c4a] transition-colors duration-150 hover:bg-[#25d366]/20"
                          title="Cobrar por WhatsApp"
                        >
                          <MessageSquare className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">Cobrar por WhatsApp</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => setConfirmPayment(mens)}
                          className="btn-primary min-h-11 px-4 py-2 text-sm"
                        >
                          <CheckCircle className="h-4 w-4" aria-hidden="true" />
                          <span>Pagado</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {rows.map(({ mens, inq, prop, waLink }) => (
              <article key={mens.id} className="mobile-record-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-sm font-extrabold text-slate-500">Depto {prop.identificador}</span>
                    <h5 className="text-lg font-black leading-tight text-slate-950">{inq.nombre}</h5>
                    <p className="text-sm font-semibold text-slate-500">{inq.telefono}</p>
                  </div>
                  <span className="badge-danger">Pendiente</span>
                </div>

                <dl className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
                  <div>
                    <dt className="text-xs font-extrabold uppercase text-slate-500">Periodo</dt>
                    <dd className="text-base font-black text-slate-900">{mens.mes_anio}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-extrabold uppercase text-slate-500">Total</dt>
                    <dd className="text-base font-black text-slate-900">
                      S/ {Number(mens.total_cobrado).toFixed(2)}
                    </dd>
                  </div>
                </dl>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmPayment(mens)}
                    className="btn-primary"
                  >
                    <CheckCircle className="h-5 w-5" aria-hidden="true" />
                    <span>Marcar como pagado</span>
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleVerFicha(inq.id)}
                      className="btn-secondary"
                    >
                      <ExternalLink className="h-5 w-5" aria-hidden="true" />
                      <span>Ficha</span>
                    </button>
                    <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                      <MessageSquare className="h-5 w-5" aria-hidden="true" />
                      <span>Cobrar</span>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {cobrosPendientes.length > 0 && rows.length === 0 && (
        <div className="app-alert-warning mt-4">
          <AlertCircle className="h-6 w-6 shrink-0 text-amber-700" aria-hidden="true" />
          <span>Hay cobros pendientes sin inquilino o departamento asociado.</span>
        </div>
      )}
      <ConfirmDialog
        open={!!confirmPayment}
        title="Registrar pago"
        message="Confirma que el inquilino ya realizó el pago. El recibo pasará a estado pagado."
        confirmLabel="Sí, marcar pagado"
        onCancel={() => setConfirmPayment(null)}
        onConfirm={() => handleMarkAsPaid(confirmPayment)}
      />
    </section>
  );
}
