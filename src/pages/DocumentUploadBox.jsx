import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { FileText, Upload, Trash, Eye } from "lucide-react";

export default function DocumentUploadBox({ inquilino }) {
  const { saveInquilino } = useApp();
  const [loadingType, setLoadingType] = useState(null); // 'dni' o 'contrato'

  const handleUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingType(type);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const updatedDocs = {
          ...inquilino.documentos,
          [`${type}_url`]: reader.result
        };
        await saveInquilino({
          ...inquilino,
          documentos: updatedDocs
        });
        alert(`Documento ${type.toUpperCase()} guardado correctamente.`);
      } catch (error) {
        console.error("Error al subir archivo:", error);
        alert("Ocurrió un error al subir.");
      } finally {
        setLoadingType(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (type) => {
    if (window.confirm(`¿Está seguro de que desea eliminar el archivo ${type.toUpperCase()}?`)) {
      try {
        const updatedDocs = {
          ...inquilino.documentos,
          [`${type}_url`]: ""
        };
        await saveInquilino({
          ...inquilino,
          documentos: updatedDocs
        });
        alert(`Documento ${type.toUpperCase()} eliminado.`);
      } catch (error) {
        console.error("Error al eliminar archivo:", error);
        alert("Ocurrió un error al eliminar.");
      }
    }
  };

  const renderUploadBox = (type, label) => {
    const fileUrl = inquilino.documentos?.[`${type}_url`];
    const isUploading = loadingType === type;

    return (
      <div className="border border-slate-200 rounded-lg p-5 flex flex-col justify-between h-48 bg-slate-50 relative group transition-all hover:bg-slate-50/70">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block mb-2">{label}</span>
          {fileUrl ? (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200 shadow-sm">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-slate-700 block truncate">Archivo Guardado</span>
                <span className="text-[10px] font-semibold text-slate-400">Listo para consulta</span>
              </div>
            </div>
          ) : (
            <span className="text-xs font-semibold text-slate-400 block italic">Sin archivo asignado</span>
          )}
        </div>

        {fileUrl ? (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200/60">
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 py-1.5 px-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Ver</span>
            </a>
            <button
              onClick={() => handleDelete(type)}
              className="py-1.5 px-3 rounded border border-red-200 text-status-danger bg-white hover:bg-red-50 text-xs font-bold transition-colors flex items-center justify-center"
              title="Eliminar documento"
            >
              <Trash className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="mt-4 pt-3 border-t border-slate-200/60 relative">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              accept="image/*,application/pdf"
              onChange={(e) => handleUpload(e, type)}
              disabled={isUploading}
            />
            <button
              type="button"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              disabled={isUploading}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{isUploading ? "Cargando..." : "Subir Archivo"}</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card-container space-y-5">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
        <FileText className="h-5 w-5 text-blue-500" />
        <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">Documentación Gradual</h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {renderUploadBox("dni", "Documento de Identidad (DNI)")}
        {renderUploadBox("contrato", "Contrato de Arrendamiento")}
      </div>
    </div>
  );
}
