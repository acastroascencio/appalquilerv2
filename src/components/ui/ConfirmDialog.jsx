import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <section
        className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-2xl page-enter"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              danger ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
            }`}
          >
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h2 id="confirm-title" className="text-xl font-black text-slate-950">
              {title}
            </h2>
            <p className="mt-2 text-base font-semibold leading-relaxed text-slate-600">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? "btn-danger" : "btn-primary"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
