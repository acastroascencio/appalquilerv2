import React from "react";
import { useApp } from "../context/AppContext";
import { buildWhatsAppLink } from "../utils/WhatsAppLinkBuilder";
import { 
  MessageSquare, 
  CheckCircle, 
  ExternalLink,
  DollarSign
} from "lucide-react";

export default function QuickActionsList() {
  const { 
    inquilinos, 
    propiedades, 
    mensualidades, 
    config, 
    saveMensualidad,
    setSelectedInquilinoId,
    setActivePage
  } = useApp();

  // Filtrar cobros pendientes
  const cobrosPendientes = mensualidades.filter(m => m.estado === "Pendiente");

  const handleMarkAsPaid = async (mensualidad) => {
    if (window.confirm(`¿Confirmas que deseas registrar el pago de este recibo?`)) {
      await saveMensualidad({
        ...mensualidad,
        estado: "Pagado"
      });
    }
  };

  const handleVerFicha = (inquilinoId) => {
    setSelectedInquilinoId(inquilinoId);
    setActivePage("inquilinos");
  };

  return (
    <div className="card-container">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div>
          <h4 className="font-bold text-slate-800 text-lg">Acciones Rápidas de Cobro</h4>
          <p className="text-xs font-semibold text-slate-400">Mensualidades pendientes para cobro inmediato</p>
        </div>
        <span className="bg-red-50 text-status-danger text-xs font-bold px-2.5 py-1 rounded-full border border-red-100 animate-pulse">
          {cobrosPendientes.length} Pendiente(s)
        </span>
      </div>

      {cobrosPendientes.length === 0 ? (
        <div className="py-8 text-center text-slate-400 font-semibold text-sm">
          🎉 ¡Excelente! No hay cobros pendientes para este periodo.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Depto</th>
                <th className="pb-3">Inquilino</th>
                <th className="pb-3">Periodo</th>
                <th className="pb-3">Total a Cobrar</th>
                <th className="pb-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {cobrosPendientes.map((mens) => {
                const inq = inquilinos.find(i => i.id === mens.inquilino_id);
                if (!inq) return null;

                const prop = propiedades.find(p => p.id === inq.propiedad_id);
                if (!prop) return null;

                const waLink = buildWhatsAppLink({
                  inquilino: inq,
                  propiedad: prop,
                  mensualidad: mens,
                  config: config
                });

                return (
                  <tr key={mens.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                    <td className="py-4 font-bold text-slate-900">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">
                        {prop.identificador}
                      </span>
                    </td>
                    <td className="py-4 font-semibold text-slate-700">
                      <div>
                        {inq.nombre}
                        <span className="block text-xs font-medium text-slate-400">{inq.telefono}</span>
                      </div>
                    </td>
                    <td className="py-4 font-medium text-slate-500">
                      {mens.mes_anio}
                    </td>
                    <td className="py-4 font-bold text-slate-900">
                      S/ {Number(mens.total_cobrado).toFixed(2)}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Ver Ficha Completa */}
                        <button
                          onClick={() => handleVerFicha(inq.id)}
                          className="p-2 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors duration-150"
                          title="Ver Ficha Detallada"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>

                        {/* Enviar WhatsApp */}
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded bg-[#25d366]/10 text-[#15a845] hover:bg-[#25d366]/20 transition-colors duration-150 flex items-center justify-center"
                          title="Cobrar por WhatsApp"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </a>

                        {/* Marcar como Pagado */}
                        <button
                          onClick={() => handleMarkAsPaid(mens)}
                          className="px-3 py-2 rounded bg-emerald-500 text-white hover:bg-emerald-600 font-semibold text-xs transition-colors duration-150 flex items-center gap-1.5 shadow-sm"
                          title="Marcar como Pagado"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Pagado</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
