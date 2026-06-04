import CuentasBancariasForm from "./CuentasBancariasForm";
import { Settings } from "lucide-react";

export default function Configuracion() {
  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700 shadow-sm">
          <Settings className="h-7 w-7" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-2xl font-black tracking-tight text-slate-950">Configuración de Cobros</h3>
          <p className="text-sm font-semibold text-slate-600">
            Define los métodos de pago y las tarifas por defecto para las facturaciones mensuales.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <CuentasBancariasForm />
    </div>
  );
}
