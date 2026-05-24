import React, { useState } from "react";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
            <Building className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Departamentos</h3>
            <p className="text-xs font-semibold text-slate-400">Total: {total} | Ocupados: {ocupados} | Disponibles: {disponibles}</p>
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="btn-primary text-sm font-semibold py-2.5 px-4 shadow-md shadow-blue-500/10 flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Añadir Departamento</span>
        </button>
      </div>

      {/* Grid de Departamentos */}
      {total === 0 ? (
        <div className="card-container py-16 text-center text-slate-400 font-semibold text-sm">
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
