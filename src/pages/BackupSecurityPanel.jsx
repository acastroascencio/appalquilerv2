import { useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import {
  Archive,
  Clock,
  Download,
  FileClock,
  History,
  RefreshCcw,
  ShieldCheck,
  Upload,
  Undo2
} from "lucide-react";

const moduleLabels = {
  propiedades: "Inmuebles",
  inquilinos: "Inquilinos",
  mensualidades: "Mensualidades",
  configuracion: "Configuracion",
  seguridad: "Seguridad"
};

const formatDate = (value) => {
  if (!value) return "Sin registro";
  try {
    return new Date(value).toLocaleString("es-PE", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  } catch {
    return value;
  }
};

const downloadJson = (payload) => {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `alquilerapp-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
};

export default function BackupSecurityPanel() {
  const {
    backupMeta,
    changeHistory,
    deletedRecords,
    exportBackup,
    importBackup,
    restoreRecord
  } = useApp();

  const fileInputRef = useRef(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const [pendingBackup, setPendingBackup] = useState(null);
  const [pendingRestore, setPendingRestore] = useState(null);

  const handleExport = async () => {
    setWorking(true);
    setError("");
    setStatus("");
    try {
      const backup = await exportBackup();
      downloadJson(backup);
      setStatus(`Backup generado correctamente con ${backup.record_count} registros.`);
    } catch (err) {
      console.error("Error al exportar backup:", err);
      setError("No se pudo generar el backup. Intenta nuevamente.");
    } finally {
      setWorking(false);
    }
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files?.[0];
    setError("");
    setStatus("");
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".json")) {
      setError("Selecciona un archivo .json generado por AlquilerApp.");
      event.target.value = "";
      return;
    }

    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      if (payload?.app !== "AlquilerApp" || payload?.type !== "full_backup") {
        throw new Error("Formato invalido.");
      }
      setPendingBackup(payload);
    } catch (err) {
      console.error("Backup invalido:", err);
      setError("El archivo no es un backup valido o esta corrupto.");
    } finally {
      event.target.value = "";
    }
  };

  const confirmImport = async () => {
    if (!pendingBackup) return;
    setWorking(true);
    setError("");
    setStatus("");
    try {
      const result = await importBackup(pendingBackup);
      setStatus(`Backup importado correctamente. Registros revisados: ${result.record_count}.`);
      setPendingBackup(null);
    } catch (err) {
      console.error("Error al importar backup:", err);
      setError(err.message || "No se pudo importar el backup.");
    } finally {
      setWorking(false);
    }
  };

  const confirmRestore = async () => {
    if (!pendingRestore) return;
    setWorking(true);
    setError("");
    setStatus("");
    try {
      await restoreRecord(pendingRestore.module, pendingRestore.id);
      setStatus("Registro restaurado correctamente.");
      setPendingRestore(null);
    } catch (err) {
      console.error("Error al restaurar registro:", err);
      setError("No se pudo restaurar el registro seleccionado.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <section className="card-container space-y-6" aria-labelledby="backup-security-title">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <ShieldCheck className="h-7 w-7" aria-hidden="true" />
          </div>
          <div>
            <h4 id="backup-security-title" className="text-xl font-black text-slate-950">
              Backup y seguridad de datos
            </h4>
            <p className="section-subtitle">
              Protege la informacion con respaldo, importacion validada, historial y restauracion.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button type="button" onClick={handleExport} disabled={working} className="btn-primary">
            <Download className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>Exportar backup</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={working}
            className="btn-secondary"
          >
            <Upload className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>Importar backup</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFileSelected}
          />
        </div>
      </div>

      {status && <div className="app-alert-success">{status}</div>}
      {error && <div className="app-alert-error">{error}</div>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-slate-700">
            <Clock className="h-5 w-5 text-blue-700" aria-hidden="true" />
            <span className="text-sm font-black uppercase">Ultimo backup</span>
          </div>
          <p className="mt-3 text-lg font-black text-slate-950">
            {formatDate(backupMeta?.last_backup_at)}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            {backupMeta?.record_count ? `${backupMeta.record_count} registros incluidos` : "Aun no se ha generado respaldo."}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-slate-700">
            <Archive className="h-5 w-5 text-blue-700" aria-hidden="true" />
            <span className="text-sm font-black uppercase">Eliminacion segura</span>
          </div>
          <p className="mt-3 text-lg font-black text-slate-950">
            {deletedRecords.length} registro(s)
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            Se conservan para auditoria y recuperacion.
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-slate-700">
            <FileClock className="h-5 w-5 text-blue-700" aria-hidden="true" />
            <span className="text-sm font-black uppercase">Historial</span>
          </div>
          <p className="mt-3 text-lg font-black text-slate-950">
            {changeHistory.length} evento(s)
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            Cambios, eliminaciones, restauraciones e importaciones.
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-slate-700">
            <RefreshCcw className="h-5 w-5 text-blue-700" aria-hidden="true" />
            <span className="text-sm font-black uppercase">Backup automatico</span>
          </div>
          <p className="mt-3 text-lg font-black text-slate-950">
            Pendiente
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            Requiere tarea programada en Firebase, Vercel o servidor.
          </p>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Undo2 className="h-5 w-5 text-blue-700" aria-hidden="true" />
            <h5 className="text-base font-black text-slate-900">Registros eliminados</h5>
          </div>
          {deletedRecords.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-500">
              No hay registros eliminados para restaurar.
            </div>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {deletedRecords.map((record) => (
                <article key={`${record.module}-${record.id}`} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="badge-warning">{moduleLabels[record.module] || record.module}</span>
                      <h6 className="mt-2 truncate text-base font-black text-slate-950">
                        {record.nombre || record.identificador || record.mes_anio || record.id}
                      </h6>
                      <p className="text-sm font-semibold text-slate-500">
                        Eliminado: {formatDate(record.deleted_at)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn-secondary min-h-11 px-3 py-2 text-sm"
                      onClick={() => setPendingRestore(record)}
                    >
                      <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                      <span>Restaurar</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-700" aria-hidden="true" />
            <h5 className="text-base font-black text-slate-900">Historial de cambios</h5>
          </div>
          {changeHistory.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-500">
              Todavia no hay cambios registrados.
            </div>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {changeHistory.slice(0, 20).map((entry) => (
                <article key={entry.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h6 className="text-sm font-black text-slate-950">
                        {entry.action_type} · {moduleLabels[entry.module] || entry.module}
                      </h6>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {formatDate(entry.changed_at)}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">
                      {entry.record_id}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingBackup}
        title="Importar backup"
        message="Estas a punto de importar informacion desde un backup. Esta accion puede modificar o restaurar datos en tu cuenta. Antes de importar se generara un respaldo de seguridad. ¿Deseas continuar?"
        confirmLabel="Confirmar importacion"
        onCancel={() => setPendingBackup(null)}
        onConfirm={confirmImport}
      />

      <ConfirmDialog
        open={!!pendingRestore}
        title="Restaurar informacion"
        message="El registro volvera a mostrarse en las vistas principales y la accion quedara registrada en el historial. ¿Deseas continuar?"
        confirmLabel="Restaurar"
        onCancel={() => setPendingRestore(null)}
        onConfirm={confirmRestore}
      />
    </section>
  );
}
