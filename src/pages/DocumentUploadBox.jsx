import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  FileText, 
  Upload, 
  Trash, 
  Eye, 
  X, 
  Calendar, 
  AlertTriangle, 
  Download, 
  CheckCircle 
} from "lucide-react";

// Extensiones permitidas por los requerimientos
const ALLOWED_EXTENSIONS = ["docx", "doc", "pdf", "png", "jpg", "jpj", "jpeg"];

export default function DocumentUploadBox({ inquilino }) {
  const { saveInquilino } = useApp();
  const [loadingType, setLoadingType] = useState(null); // 'dni' o 'contrato'
  
  // Estados para Modal de Confirmación de Carga
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingUpload, setPendingUpload] = useState(null); // { file, type }

  // Estados para Modal de Previsualización
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null); // { nombre, url, fecha, tipo }

  // 1. Validación de Formatos
  const validateFile = (file) => {
    if (!file) return false;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      alert(`Formato de archivo no permitido.\nSolo se aceptan: .docx, .doc, .pdf, .png, .jpg, .jpj, .jpeg`);
      return false;
    }
    return true;
  };

  // Manejo de la selección de archivo
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateFile(file)) {
      e.target.value = ""; // Reiniciar input
      return;
    }

    const currentUrl = inquilino.documentos?.[`${type}_url`];
    if (currentUrl) {
      // Requerimiento 2: Confirmación si ya existe un archivo
      setPendingUpload({ file, type });
      setShowConfirmModal(true);
    } else {
      // Si no existe, cargar directamente
      processUpload(file, type);
    }
    e.target.value = ""; // Reiniciar input
  };

  // Procesamiento y guardado de archivo en el Historial y como Activo
  const processUpload = (file, type) => {
    setLoadingType(type);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const timestamp = new Date().toISOString();
        const newRecord = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          tipo: type,
          nombre: file.name,
          url: reader.result,
          fecha: timestamp
        };

        const updatedHistorial = [...(inquilino.documentos?.historial || []), newRecord];
        const updatedDocs = {
          ...inquilino.documentos,
          [`${type}_url`]: reader.result,
          historial: updatedHistorial
        };

        await saveInquilino({
          ...inquilino,
          documentos: updatedDocs
        });
        
        alert(`Documento ${type.toUpperCase()} cargado y registrado en el historial.`);
      } catch (error) {
        console.error("Error al subir archivo:", error);
        alert("Ocurrió un error al subir.");
      } finally {
        setLoadingType(null);
        setPendingUpload(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Confirmación desde el Modal
  const handleConfirmUpload = () => {
    if (pendingUpload) {
      processUpload(pendingUpload.file, pendingUpload.type);
    }
    setShowConfirmModal(false);
  };

  // Cancelación desde el Modal
  const handleCancelUpload = () => {
    setPendingUpload(null);
    setShowConfirmModal(false);
  };

  // 3. Eliminar archivos específicos del historial
  const handleDeleteHistoryItem = async (docId, type) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar este documento del historial?`)) {
      try {
        const currentHistorial = inquilino.documentos?.historial || [];
        const updatedHistorial = currentHistorial.filter(doc => doc.id !== docId);
        
        let activeUrl = inquilino.documentos?.[`${type}_url`] || "";
        const deletedDoc = currentHistorial.find(doc => doc.id === docId);

        // Si el documento eliminado era el activo, asignar el último restante del mismo tipo
        if (deletedDoc && activeUrl === deletedDoc.url) {
          const remainingOfType = updatedHistorial.filter(doc => doc.tipo === type);
          if (remainingOfType.length > 0) {
            activeUrl = remainingOfType[remainingOfType.length - 1].url;
          } else {
            activeUrl = "";
          }
        }

        const updatedDocs = {
          ...inquilino.documentos,
          [`${type}_url`]: activeUrl,
          historial: updatedHistorial
        };

        await saveInquilino({
          ...inquilino,
          documentos: updatedDocs
        });

        alert("Documento eliminado del historial.");
      } catch (error) {
        console.error("Error al eliminar documento del historial:", error);
        alert("Ocurrió un error al eliminar.");
      }
    }
  };

  // Eliminar el documento activo (mantiene el comportamiento original pero sincronizado)
  const handleDeleteActive = async (type) => {
    if (window.confirm(`¿Está seguro de que desea eliminar el archivo activo ${type.toUpperCase()}?`)) {
      try {
        const updatedDocs = {
          ...inquilino.documentos,
          [`${type}_url`]: ""
        };
        await saveInquilino({
          ...inquilino,
          documentos: updatedDocs
        });
        alert(`Documento ${type.toUpperCase()} desactivado.`);
      } catch (error) {
        console.error("Error al eliminar archivo activo:", error);
        alert("Ocurrió un error al eliminar.");
      }
    }
  };

  // Helper para identificar la categoría del archivo
  const getFileCategory = (fileName, url) => {
    if (!fileName) return "unknown";
    const ext = fileName.split('.').pop().toLowerCase();
    if (["png", "jpg", "jpeg", "jpj"].includes(ext) || url?.startsWith("data:image/")) {
      return "image";
    }
    if (ext === "pdf" || url?.startsWith("data:application/pdf")) {
      return "pdf";
    }
    if (["doc", "docx"].includes(ext)) {
      return "word";
    }
    return "other";
  };

  // Formateador de Fecha y Hora en Español
  const formatDate = (isoString) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch (e) {
      return isoString;
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
                <span className="text-sm font-bold text-slate-700 block truncate">Archivo Activo</span>
                <span className="text-[10px] font-semibold text-slate-400 block truncate">Listo para consulta rápida</span>
              </div>
            </div>
          ) : (
            <span className="text-xs font-semibold text-slate-400 block italic">Sin archivo asignado</span>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200/60 relative">
          <input 
            type="file" 
            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
            accept=".docx,.doc,.pdf,.png,.jpg,.jpj,.jpeg"
            onChange={(e) => handleFileChange(e, type)}
            disabled={isUploading}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              disabled={isUploading}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{isUploading ? "Cargando..." : "Subir Archivo"}</span>
            </button>
            {fileUrl && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteActive(type);
                }}
                className="py-2 px-3 rounded border border-red-200 text-status-danger bg-white hover:bg-red-50 text-xs font-bold transition-colors flex items-center justify-center z-20"
                title="Desactivar documento"
              >
                <Trash className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const historial = inquilino.documentos?.historial || [];

  return (
    <div className="space-y-6">
      {/* Cajas de Carga Activas */}
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

      {/* Historial de Documentos */}
      <div className="card-container space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">Historial de Archivos</h4>
          </div>
          <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {historial.length} documento(s)
          </span>
        </div>

        {historial.length === 0 ? (
          <div className="text-center py-8 text-slate-400 font-semibold text-xs italic">
            No hay registros de cargas previas para este inquilino.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="pb-2">Archivo</th>
                  <th className="pb-2">Tipo</th>
                  <th className="pb-2">Fecha y Hora de Carga</th>
                  <th className="pb-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {historial.map((doc) => {
                  const category = getFileCategory(doc.nombre, doc.url);
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                      <td className="py-3 font-bold text-slate-700 max-w-[200px] truncate">
                        {doc.nombre}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                          doc.tipo === "dni" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {doc.tipo}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 font-medium">
                        {formatDate(doc.fecha)}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setPreviewDoc(doc);
                              setShowPreviewModal(true);
                            }}
                            className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                            title="Previsualizar"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteHistoryItem(doc.id, doc.tipo)}
                            className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-status-danger transition-colors"
                            title="Eliminar del historial"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. MODAL DE CONFIRMACIÓN DE CARGA */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 page-enter p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h5 className="font-extrabold text-slate-800 text-base">Archivo Existente</h5>
            </div>
            <p className="text-sm font-semibold text-slate-600 leading-relaxed">
              ¿Estás seguro de adjuntar un nuevo documento? Esto registrará la nueva versión en el historial de forma permanente.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleCancelUpload}
                className="flex-1 btn-secondary text-xs py-2"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmUpload}
                className="flex-1 btn-primary text-xs py-2 bg-blue-600 hover:bg-blue-700"
              >
                Sí, adjuntar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL DE PREVISUALIZACIÓN */}
      {showPreviewModal && previewDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-slate-100 page-enter flex flex-col">
            {/* Cabecera del modal */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    previewDoc.tipo === "dni" ? "bg-blue-500 text-white" : "bg-emerald-500 text-white"
                  }`}>
                    {previewDoc.tipo}
                  </span>
                  <h4 className="font-extrabold text-sm tracking-wide truncate max-w-[300px] sm:max-w-md">
                    {previewDoc.nombre}
                  </h4>
                </div>
                <p className="text-[10px] text-slate-400 font-bold mt-1">
                  Subido el: {formatDate(previewDoc.fecha)}
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewDoc(null);
                }}
                className="p-1 rounded text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenedor de visualización */}
            <div className="p-6 bg-slate-100 flex-1 overflow-y-auto flex flex-col items-center justify-center min-h-[40vh] max-h-[60vh]">
              {getFileCategory(previewDoc.nombre, previewDoc.url) === "image" && (
                <img 
                  src={previewDoc.url} 
                  alt={previewDoc.nombre}
                  className="max-w-full max-h-[55vh] object-contain rounded-md shadow-sm border border-slate-200"
                />
              )}

              {getFileCategory(previewDoc.nombre, previewDoc.url) === "pdf" && (
                <iframe 
                  src={previewDoc.url} 
                  title="PDF Document Preview"
                  className="w-full h-[55vh] rounded-md shadow-inner border border-slate-300"
                />
              )}

              {getFileCategory(previewDoc.nombre, previewDoc.url) === "word" && (
                <div className="text-center p-8 bg-white border border-slate-200 rounded-lg shadow-sm max-w-md space-y-4">
                  <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border border-blue-100 shadow-sm">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-800 text-sm">Documento de Word (.doc / .docx)</h5>
                    <p className="text-xs font-semibold text-slate-400 mt-2 leading-relaxed">
                      Los archivos de Microsoft Word no pueden previsualizarse directamente en el navegador. Haz clic a continuación para descargar el archivo y revisarlo.
                    </p>
                  </div>
                  <a
                    href={previewDoc.url}
                    download={previewDoc.nombre}
                    className="inline-flex items-center gap-2 py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-all shadow-md shadow-blue-500/10 hover:shadow-lg"
                  >
                    <Download className="h-4 w-4" />
                    <span>Descargar Documento</span>
                  </a>
                </div>
              )}

              {getFileCategory(previewDoc.nombre, previewDoc.url) === "other" && (
                <div className="text-center p-8 bg-white border border-slate-200 rounded-lg shadow-sm max-w-md space-y-4">
                  <div className="h-16 w-16 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center mx-auto border border-slate-100 shadow-sm">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-800 text-sm">Archivo no previsualizable</h5>
                    <p className="text-xs font-semibold text-slate-400 mt-2 leading-relaxed">
                      Este tipo de archivo no admite la previsualización directa en el navegador. Puedes descargarlo haciendo clic en el botón inferior.
                    </p>
                  </div>
                  <a
                    href={previewDoc.url}
                    download={previewDoc.nombre}
                    className="inline-flex items-center gap-2 py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-all shadow-md shadow-blue-500/10 hover:shadow-lg"
                  >
                    <Download className="h-4 w-4" />
                    <span>Descargar Archivo</span>
                  </a>
                </div>
              )}
            </div>

            {/* Pie del modal */}
            <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end">
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewDoc(null);
                }}
                className="py-2 px-5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded text-xs font-bold transition-colors shadow-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>);
