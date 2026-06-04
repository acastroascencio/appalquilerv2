import { useState } from "react";
import { useApp } from "../context/AppContext";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import {
  Edit,
  Trash2,
  Bed,
  Bath,
  Utensils,
  User,
  Eye,
  Building,
} from "lucide-react";

export default function DeptoGrid({ onEditDepto }) {
  const { propiedades, inquilinos, deletePropiedad, setSelectedInquilinoId, setActivePage } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [blockedDelete, setBlockedDelete] = useState("");

  const handleDelete = (id, ident, estado) => {
    setBlockedDelete("");
    if (estado) {
      setBlockedDelete(`No se puede eliminar el departamento ${ident} porque está ocupado. Libera primero al inquilino.`);
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {propiedades.map((prop) => {
          const inq = inquilinos.find((i) => i.propiedad_id === prop.id);
          const hasPhoto = prop.fotos && prop.fotos.length > 0;

          return (
            <article
              key={prop.id}
              className={`card-container relative flex flex-col justify-between overflow-hidden border-2 transition-all duration-200 ${
                prop.estado
                  ? "border-emerald-500/10 hover:border-emerald-500/20"
                  : "border-blue-500/10 hover:border-blue-500/20"
              }`}
            >
              <div className="relative -mx-5 -mt-5 mb-4 flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 text-slate-300">
                {hasPhoto ? (
                  <img
                    src={prop.fotos[0]}
                    alt={`Departamento ${prop.identificador}`}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-800/80 text-blue-400 shadow-sm">
                      <Building className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Sin fotos subidas
                    </span>
                  </div>
                )}

                <div className="absolute right-3 top-3 shadow-md">
                  {prop.estado ? (
                    <span className="badge-success">Ocupado</span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-extrabold text-blue-900 shadow-sm">
                      Disponible
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 rounded-lg border border-slate-700/50 bg-slate-900/85 px-3.5 py-1.5 shadow-sm backdrop-blur-sm">
                  <span className="text-sm font-extrabold tracking-wide text-white">
                    Depto {prop.identificador}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Costo mensual
                  </span>
                  <span className="text-xl font-black text-slate-950">
                    S/ {Number(prop.costo_base).toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 border-y border-slate-100 py-3 text-xs font-bold text-slate-600">
                  <div className="flex items-center justify-center gap-1.5" title="Habitaciones">
                    <Bed className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    <span>{prop.caracteristicas.habitaciones} Hab.</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 border-x border-slate-100" title="Baño propio">
                    <Bath className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    <span>{prop.caracteristicas.bano_propio ? "Baño prop." : "Compart."}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5" title="Cocina propia">
                    <Utensils className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    <span>{prop.caracteristicas.cocina ? "Cocina" : "Sin coc."}</span>
                  </div>
                </div>

                {prop.estado && inq && (
                  <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/70 p-3 text-xs">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                      <div>
                        <span className="block font-bold text-slate-800">{inq.nombre}</span>
                        <span className="font-medium text-slate-500">{inq.telefono}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleVerInquilino(prop.id)}
                      className="rounded bg-emerald-100 p-2 font-semibold text-emerald-800 transition-colors hover:bg-emerald-200"
                      title="Ver ficha completa"
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Ver ficha completa</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => onEditDepto(prop)}
                  className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Edit className="h-4 w-4" aria-hidden="true" />
                  <span>Editar</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(prop.id, prop.identificador, prop.estado)}
                  disabled={prop.estado}
                  className="flex min-h-11 items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-2 text-red-700 transition-all duration-150 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                  title="Eliminar departamento"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Eliminar departamento</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        danger
        title="Eliminar departamento"
        message={`Estas a punto de eliminar el departamento ${confirmDelete?.ident}. No se borrara definitivamente, pero dejara de mostrarse en la vista principal y quedara registrado en el historial.`}
        confirmLabel="Confirmar accion"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteDepto}
      />
    </>
  );
}
