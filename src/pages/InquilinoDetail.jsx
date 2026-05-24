import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import DataBasicaForm from "./DataBasicaForm";
import DocumentUploadBox from "./DocumentUploadBox";
import ServiciosCalculadora from "./ServiciosCalculadora";
import { ArrowLeft, User, FileText, Calculator } from "lucide-react";

export default function InquilinoDetail() {
  const { 
    inquilinos, 
    propiedades, 
    selectedInquilinoId, 
    setSelectedInquilinoId 
  } = useApp();

  const [activeTab, setActiveTab] = useState("basico"); // basico, documentos, cobros

  const inq = inquilinos.find(i => i.id === selectedInquilinoId);
  if (!inq) {
    return (
      <div className="card-container text-center py-12">
        <span className="text-slate-400 font-bold block">Inquilino no encontrado.</span>
        <button 
          onClick={() => setSelectedInquilinoId(null)}
          className="btn-secondary mt-4 text-xs"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  const prop = propiedades.find(p => p.id === inq.propiedad_id);

  const tabs = [
    { id: "basico", label: "Datos Básicos", icon: User },
    { id: "documentos", label: "Documentos", icon: FileText },
    { id: "cobros", label: "Servicios y Cobros", icon: Calculator },
  ];

  return (
    <div className="space-y-6">
      {/* Botón Volver y Ficha Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedInquilinoId(null)}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            title="Volver a la lista de inquilinos"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{inq.nombre}</h3>
            <p className="text-xs font-semibold text-slate-400">
              Asignado a: {prop ? `Depto ${prop.identificador} (Base: S/ ${prop.costo_base})` : "Sin propiedad asignada"}
            </p>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas con Estilo Premium */}
      <div className="flex border-b border-slate-200 gap-6">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative border-b-2 ${
                isActive 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Renderizado de Subcomponentes */}
      <div className="page-enter">
        {activeTab === "basico" && <DataBasicaForm inquilino={inq} />}
        {activeTab === "documentos" && <DocumentUploadBox inquilino={inq} />}
        {activeTab === "cobros" && <ServiciosCalculadora inquilino={inq} />}
      </div>
    </div>
  );
}
