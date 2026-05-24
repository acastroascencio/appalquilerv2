import React from "react";
import { useApp } from "../context/AppContext";
import { 
  Edit, 
  Trash2, 
  Bed, 
  Bath, 
  Utensils, 
  User, 
  Eye 
} from "lucide-react";

export default function DeptoGrid({ onEditDepto }) {
  const { propiedades, inquilinos, deletePropiedad, setSelectedInquilinoId, setActivePage } = useApp();

  const handleDelete = async (id, ident, estado) => {
    if (estado) {
      alert(`No se puede eliminar el departamento ${ident} porque está OCUPADO. Libere primero al inquilino.`);
      return;
    }
    if (window.confirm(`¿Está seguro de que desea eliminar el departamento ${ident}?`)) {
      await deletePropiedad(id);
    }
  };

  const handleVerInquilino = (propId) => {
    const inq = inquilinos.find(i => i.propiedad_id === propId);
    if (inq) {
      setSelectedInquilinoId(inq.id);
      setActivePage("inquilinos");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {propiedades.map((prop) => {
        const inq = inquilinos.find(i => i.propiedad_id === prop.id);
        const hasPhoto = prop.fotos && prop.fotos.length > 0;
        
        return (
          <div 
            key={prop.id} 
            className={`card-container flex flex-col justify-between overflow-hidden relative group transition-all duration-200 border-2 ${
              prop.estado 
                ? "border-emerald-500/10 hover:border-emerald-500/20" 
                : "border-blue-500/10 hover:border-blue-500/20"
            }`}
          >
            {/* Foto o Gradiente visual */}
            <div className="h-40 -mx-5 -mt-5 mb-4 relative overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-300">
              {hasPhoto ? (
                <img 
                  src={prop.fotos[0]} 
                  alt={`Departamento ${prop.identificador}`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto mb-2 shadow-sm text-blue-400">
                    <Building className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold tracking-wide uppercase text-slate-400">Sin Fotos Subidas</span>
                </div>
              )}

              {/* Badge de Estado */}
              <div className="absolute top-3 right-3 shadow-md">
                {prop.estado ? (
                  <span className="badge-success border border-emerald-200 py-1 px-3 text-xs font-bold shadow-sm">
                    Ocupado
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 shadow-sm">
                    Disponible
                  </span>
                )}
              </div>
              
              {/* Identificador Grande */}
              <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-sm px-3.5 py-1.5 rounded-lg border border-slate-700/50 shadow-sm">
                <span className="text-white font-extrabold text-sm tracking-wide">Depto {prop.identificador}</span>
              </div>
            </div>

            {/* Detalles de Características */}
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Costo Mensual</span>
                <span className="text-xl font-black text-slate-900">S/ {Number(prop.costo_base).toFixed(2)}</span>
              </div>

              {/* Características en Iconos */}
              <div className="grid grid-cols-3 gap-2 border-y border-slate-100 py-3 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-1.5 justify-center" title="Habitaciones">
                  <Bed className="h-4 w-4 text-slate-400" />
                  <span>{prop.caracteristicas.habitaciones} Hab.</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center border-x border-slate-100" title="Baño propio">
                  <Bath className="h-4 w-4 text-slate-400" />
                  <span>{prop.caracteristicas.bano_propio ? "Baño Prop." : "Compart."}</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center" title="Cocina propia">
                  <Utensils className="h-4 w-4 text-slate-400" />
                  <span>{prop.caracteristicas.cocina ? "Cocina" : "Sin Coc."}</span>
                </div>
              </div>

              {/* Mostrar nombre de inquilino si está ocupado */}
              {prop.estado && inq && (
                <div className="bg-emerald-50/50 rounded-lg p-3 border border-emerald-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-emerald-500" />
                    <div>
                      <span className="font-bold text-slate-700 block">{inq.nombre}</span>
                      <span className="text-slate-400 font-medium">{inq.telefono}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleVerInquilino(prop.id)}
                    className="p-1.5 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors font-semibold"
                    title="Ver Ficha Completa"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Acciones de Edición/Eliminación */}
            <div className="flex items-center gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => onEditDepto(prop)}
                className="flex-1 py-2 px-3 text-xs font-bold border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => handleDelete(prop.id, prop.identificador, prop.estado)}
                disabled={prop.estado}
                className="py-2 px-3 rounded-lg border border-red-200 text-status-danger bg-white hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center"
                title="Eliminar departamento"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Icono auxiliar de Casa/Inmueble
function Building(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}
