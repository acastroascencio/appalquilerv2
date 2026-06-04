import { useState } from "react";
import { useApp } from "../context/AppContext";
import DeptoGrid from "./DeptoGrid";
import DeptoFormModal from "./DeptoFormModal";
import StatusLegend from "../components/ui/StatusLegend";
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

  const total = propiedades.length;
  const ocupados = propiedades.filter((p) => p.estado).length;
  const disponibles = total - ocupados;

  return (
    <div className="space-y-6">
      <div className="app-surface flex flex-col justify-between gap-4 rounded-2xl border p-5 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border shadow-sm"
            style={{
              background: "var(--primary-soft)",
              borderColor: "color-mix(in srgb, var(--primary) 24%, transparent)",
              color: "var(--primary)",
            }}
          >
            <Building className="h-7 w-7" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="text-2xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
              Inmuebles
            </h3>
            <p className="text-base font-semibold leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Total: {total} | Ocupados: {ocupados} | Disponibles: {disponibles}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="btn-primary self-start text-base shadow-md shadow-blue-500/10 sm:self-auto"
        >
          <PlusCircle className="h-5 w-5" aria-hidden="true" />
          <span>Agregar inmueble</span>
        </button>
      </div>

      <StatusLegend compact />

      {total === 0 ? (
        <div className="card-container flex min-h-56 flex-col items-center justify-center gap-3 py-16 text-center text-base font-extrabold">
          No hay inmuebles registrados. Agrega el primero desde el boton superior.
        </div>
      ) : (
        <DeptoGrid onEditDepto={handleEdit} />
      )}

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
