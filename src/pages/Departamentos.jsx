import { useState } from "react";
import { useApp } from "../context/AppContext";
import DeptoGrid from "./DeptoGrid";
import DeptoFormModal from "./DeptoFormModal";
import { PlusCircle, Building } from "lucide-react";

export default function Departamentos() {
  const { propiedades } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [selectedDepto, setSelectedDepto] = useState(null);

  const handleEdit = (depto) => {
    setSelectedDepto(depto);
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedDepto(null);
    setShowModal(true);
  };

  // Contadores
  const total = propiedades.length;
  const ocupados = propiedades.filter(p => p.estado).length;
  const disponibles = total - ocupados;

  return (
    <div className="space-y-6">
      {/* Cabecera y Resumen rápido */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700 shadow-sm">
            <Building className="h-7 w-7" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight text-slate-950">Departamentos</h3>
            <p className="text-sm font-semibold text-slate-600">Total: {total} | Ocupados: {ocupados} | Disponibles: {disponibles}</p>
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="btn-primary self-start text-sm shadow-md shadow-blue-500/10 sm:self-auto"
        >
          <PlusCircle className="h-5 w-5" aria-hidden="true" />
          <span>Añadir Departamento</span>
        </button>
      </div>

      {/* Grid de Departamentos */}
      {total === 0 ? (
        <div className="card-container flex min-h-56 flex-col items-center justify-center gap-3 py-16 text-center text-base font-extrabold text-slate-700">
          🏢 No hay departamentos registrados. ¡Añade tu primer inmueble arriba!
        </div>
      ) : (
        <DeptoGrid onEditDepto={handleEdit} />
      )}

      {/* Modal Formulario */}
      {showModal && (
        <DeptoFormModal
          deptoToEdit={selectedDepto}
          onClose={() => {
            setShowModal(false);
            setSelectedDepto(null);
          }}
        />
      )}
    </div>
  );
}
