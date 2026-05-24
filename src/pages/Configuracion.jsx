import React from "react";
import CuentasBancariasForm from "./CuentasBancariasForm";
import { Settings } from "lucide-react";

export default function Configuracion() {
  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
        <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Configuración de Cobros</h3>
          <p className="text-xs font-semibold text-slate-400">
            Define los métodos de pago y las tarifas por defecto para las facturaciones mensuales.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <CuentasBancariasForm />
    </div>
  );
}
