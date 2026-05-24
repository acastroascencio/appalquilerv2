import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { X, Upload, Trash } from "lucide-react";

export default function DeptoFormModal({ deptoToEdit, onClose }) {
  const { savePropiedad } = useApp();
  
  const [identificador, setIdentificador] = useState("");
  const [costoBase, setCostoBase] = useState("");
  const [habitaciones, setHabitaciones] = useState(1);
  const [banoPropio, setBanoPropio] = useState(true);
  const [cocina, setCocina] = useState(true);
  const [fotos, setFotos] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (deptoToEdit) {
      setIdentificador(deptoToEdit.identificador);
      setCostoBase(deptoToEdit.costo_base);
      setHabitaciones(deptoToEdit.caracteristicas?.habitaciones || 1);
      setBanoPropio(deptoToEdit.caracteristicas?.bano_propio ?? true);
      setCocina(deptoToEdit.caracteristicas?.cocina ?? true);
      setFotos(deptoToEdit.fotos || []);
    } else {
      setIdentificador("");
      setCostoBase("");
      setHabitaciones(1);
      setBanoPropio(true);
      setCocina(true);
      setFotos([]);
    }
  }, [deptoToEdit]);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotos(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idxToRemove) => {
    setFotos(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identificador || !costoBase) {
      alert("Por favor rellene todos los campos requeridos.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: deptoToEdit?.id || null,
        identificador,
        costo_base: Number(costoBase),
        estado: deptoToEdit?.estado || false,
        caracteristicas: {
          habitaciones: Number(habitaciones),
          bano_propio: banoPropio,
          cocina
        },
        fotos
      };

      await savePropiedad(payload);
      onClose();
    } catch (error) {
      console.error("Error al guardar propiedad:", error);
      alert("Ocurrió un error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col my-8 page-enter">
        {/* Cabecera Modal */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <h4 className="font-extrabold text-base tracking-wide">
            {deptoToEdit ? `Editar Departamento ${deptoToEdit.identificador}` : "Añadir Nuevo Departamento"}
          </h4>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors duration-150"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Identificador & Costo Base */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Identificador *</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Ej. 2A, 3B, Local 1"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value.toUpperCase())}
                required
              />
            </div>
            <div>
              <label className="label-text">Costo Base Alquiler (S/) *</label>
              <input 
                type="number" 
                className="input-field" 
                placeholder="Ej. 1100"
                value={costoBase}
                onChange={(e) => setCostoBase(e.target.value)}
                required
                min="0"
              />
            </div>
          </div>

          {/* Características */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500">Características del Inmueble</h5>
            
            <div>
              <label className="label-text">Cantidad de Habitaciones</label>
              <input 
                type="number" 
                className="input-field" 
                value={habitaciones}
                onChange={(e) => setHabitaciones(e.target.value)}
                min="1"
                max="10"
              />
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  checked={banoPropio}
                  onChange={(e) => setBanoPropio(e.target.checked)}
                />
                <span className="text-sm font-semibold text-slate-700">¿Tiene Baño Propio?</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  checked={cocina}
                  onChange={(e) => setCocina(e.target.checked)}
                />
                <span className="text-sm font-semibold text-slate-700">¿Tiene Cocina propia?</span>
              </label>
            </div>
          </div>

          {/* Carga de fotos */}
          <div>
            <label className="label-text">Fotos del Departamento</label>
            <div className="mt-2 flex items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-lg p-4 cursor-pointer relative bg-slate-50/50 group transition-colors duration-150">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
              />
              <div className="text-center">
                <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1 group-hover:text-blue-500 transition-colors" />
                <span className="text-xs font-bold text-slate-600 block">Subir fotos (JPG, PNG)</span>
                <span className="text-[10px] text-slate-400 block font-medium">Puedes elegir múltiples archivos</span>
              </div>
            </div>

            {/* Grid de Previsualización de Fotos */}
            {fotos.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {fotos.map((photo, index) => (
                  <div key={index} className="h-16 rounded border border-slate-200 overflow-hidden relative group">
                    <img src={photo} alt="Previsualización" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-primary text-xs font-bold"
            >
              {saving ? "Guardando..." : "Guardar Departamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
