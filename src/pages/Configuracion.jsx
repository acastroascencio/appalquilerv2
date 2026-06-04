import CuentasBancariasForm from "./CuentasBancariasForm";
import BackupSecurityPanel from "./BackupSecurityPanel";
import { Settings } from "lucide-react";

export default function Configuracion() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-900/70 dark:bg-blue-950/50 dark:text-blue-300">
          <Settings className="h-7 w-7" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50">
            Configuracion de cobros
          </h3>
          <p className="text-sm font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
            Define metodos de pago y tarifas por defecto para las facturaciones mensuales.
          </p>
        </div>
      </div>

      <CuentasBancariasForm />
      <BackupSecurityPanel />
    </div>
  );
}
