import { useState } from "react";
import { useApp } from "../context/AppContext";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import {
  BadgeCheck,
  Bed,
  Bath,
  Building,
  Circle,
  Edit,
  Eye,
  Trash2,
  User,
  Utensils,
} from "lucide-react";

export default function DeptoGrid({ onEditDepto }) {
  const { propiedades, inquilinos, deletePropiedad, setSelectedInquilinoId, setActivePage } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [blockedDelete, setBlockedDelete] = useState("");

  const handleDelete = (id, ident, estado) => {
    setBlockedDelete("");
    if (estado) {
      setBlockedDelete(`No se puede eliminar el inmueble ${ident} porque esta ocupado. Libera primero al inquilino.`);
      return;
    }
    setConfirmDelete({ id, ident });
  };

  const confirmDeleteDepto = async () => {
    if (!confirmDelete) return;
    await deletePropiedad(confirmDelete.id);
    setConfirmDelete(null);
  };

  const handleVerInquilino = (propId) => {
    const inq = inquilinos.find((i) => i.propiedad_id === propId);
    if (inq) {
      setSelectedInquilinoId(inq.id);
      setActivePage("inquilinos");
    }
  };

  return (
    <>
      {blockedDelete && (
        <div className="app-alert-warning mb-4" role="alert">
          <span>{blockedDelete}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {propiedades.map((prop) => {
          const inq = inquilinos.find((i) => i.propiedad_id === prop.id);
          const hasPhoto = prop.fotos && prop.fotos.length > 0;
          const StatusIcon = prop.estado ? BadgeCheck : Circle;

          return (
            <article key={prop.id} className="depto-card">
              <div className="depto-media">
                {hasPhoto ? (
                  <img
                    src={prop.fotos[0]}
                    alt={`Departamento ${prop.identificador}`}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="text-center">
                    <div
                      className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full border shadow-sm"
                      style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                        color: "var(--primary)",
                      }}
                    >
                      <Building className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <span className="text-[15px] font-extrabold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                      Sin fotos subidas
                    </span>
                  </div>
                )}

                <div className="absolute right-3 top-3">
                  <span className={`status-badge ${prop.estado ? "status-badge-success" : "status-badge-neutral"}`}>
                    <StatusIcon className="h-4 w-4" aria-hidden="true" />
                    {prop.estado ? "Ocupado" : "Disponible"}
                  </span>
                </div>

                <div
                  className="absolute bottom-3 left-3 rounded-lg border px-3.5 py-1.5 shadow-sm backdrop-blur-sm"
                  style={{
                    background: "color-mix(in srgb, var(--surface) 88%, transparent)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                >
                  <span className="text-base font-black tracking-wide">
                    Depto {prop.identificador}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="rounded-xl border p-3" style={{ background: "var(--surface-muted)", borderColor: "var(--border)" }}>
                  <span className="block text-[15px] font-bold" style={{ color: "var(--text-secondary)" }}>
                    Costo mensual
                  </span>
                  <span className="mt-1 block text-2xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
                    S/ {Number(prop.costo_base).toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 border-y py-3 text-[15px] font-bold" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                  <div className="flex flex-col items-center justify-center gap-1 text-center" title="Habitaciones">
                    <Bed className="h-5 w-5" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
                    <span>{prop.caracteristicas.habitaciones} Hab.</span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1 border-x text-center" style={{ borderColor: "var(--border)" }} title="Bano propio">
                    <Bath className="h-5 w-5" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
                    <span>{prop.caracteristicas.bano_propio ? "Bano prop." : "Compart."}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1 text-center" title="Cocina propia">
                    <Utensils className="h-5 w-5" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
                    <span>{prop.caracteristicas.cocina ? "Cocina" : "Sin coc."}</span>
                  </div>
                </div>

                {prop.estado && inq ? (
                  <div className="tenant-panel">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: "var(--success-soft)", color: "var(--success-on-soft)" }}
                        >
                          <User className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <span className="block truncate text-base font-black" style={{ color: "var(--text-primary)" }}>
                            {inq.nombre}
                          </span>
                          <span className="block text-[15px] font-semibold" style={{ color: "var(--text-secondary)" }}>
                            {inq.telefono}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleVerInquilino(prop.id)}
                        className="tenant-view-button"
                        title="Ver ficha completa"
                      >
                        <Eye className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Ver ficha completa</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="tenant-panel">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg status-badge-neutral">
                        <Circle className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <span className="block text-base font-black" style={{ color: "var(--text-primary)" }}>
                          Sin inquilino
                        </span>
                        <span className="block text-[15px] font-semibold" style={{ color: "var(--text-secondary)" }}>
                          Disponible para asignar
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center gap-2 border-t pt-3" style={{ borderColor: "var(--border)" }}>
                <button
                  type="button"
                  onClick={() => onEditDepto(prop)}
                  className="action-button-secondary"
                >
                  <Edit className="h-5 w-5" aria-hidden="true" />
                  <span>Editar</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(prop.id, prop.identificador, prop.estado)}
                  disabled={prop.estado}
                  className="action-button-danger"
                  title="Eliminar inmueble"
                >
                  <Trash2 className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Eliminar inmueble</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        danger
        title="Eliminar inmueble"
        message={`Estas a punto de eliminar el inmueble ${confirmDelete?.ident}. No se borrara definitivamente, pero dejara de mostrarse en la vista principal y quedara registrado en el historial.`}
        confirmLabel="Confirmar accion"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteDepto}
      />
    </>
  );
}
