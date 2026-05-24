import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Save, User, Phone, DollarSign, Car } from "lucide-react";

export default function DataBasicaForm({ inquilino }) {
  const { propiedades, saveInquilino } = useApp();

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [garantiaMonto, setGarantiaMonto] = useState("");
  const [propiedadId, setPropiedadId] = useState("");
  
  // Vehículo
  const [tieneVehiculo, setTieneVehiculo] = useState(false);
  const [tipo, setTipo] = useState("");
  const [placa, setPlaca] = useState("");
  const [montoAsociacion, setMontoAsociacion] = useState("");
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (inquilino) {
      setNombre(inquilino.nombre);
      setTelefono(inquilino.telefono);
      setGarantiaMonto(inquilino.garantia_monto);
      setPropiedadId(inquilino.propiedad_id);
      
      setTieneVehiculo(inquilino.vehiculo?.tiene_vehiculo || false);
      setTipo(inquilino.vehiculo?.tipo || "");
      setPlaca(inquilino.vehiculo?.placa || "");
      setMontoAsociacion(inquilino.vehiculo?.monto_asociacion || "");
    }
  }, [inquilino]);

  // Filtrar departamentos disponibles más el actualmente asignado a este inquilino
  const deptosDisponibles = propiedades.filter(
    p => !p.estado || p.id === inquilino?.propiedad_id
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !telefono || !propiedadId) {
      alert("Por favor rellene los campos requeridos.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...inquilino,
        nombre,
        telefono,
        garantia_monto: Number(garantiaMonto) || 0,
        propiedad_id: propiedadId,
        vehiculo: {
          tiene_vehiculo: tieneVehiculo,
          tipo: tieneVehiculo ? tipo : "",
          placa: tieneVehiculo ? placa.toUpperCase() : "",
          monto_asociacion: tieneVehiculo ? (Number(montoAsociacion) || 0) : 0
        }
      };

      await saveInquilino(payload);
      alert("Datos básicos actualizados con éxito.");
    } catch (error) {
      console.error("Error al actualizar datos básicos:", error);
      alert("Ocurrió un error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-container space-y-5">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
        <User className="h-5 w-5 text-blue-500" />
        <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">Datos Básicos y Cochera</h4>
      </div>

      {/* Grid General */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre completo */}
        <div>
          <label className="label-text">Nombre Completo *</label>
          <div className="relative">
            <input 
              type="text" 
              className="input-field pl-9" 
              placeholder="Ej. Juan Pérez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Teléfono */}
        <div>
          <label className="label-text">Número de Teléfono *</label>
          <div className="relative">
            <input 
              type="tel" 
              className="input-field pl-9" 
              placeholder="Ej. 987654321"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
            />
            <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Garantía Monto */}
        <div>
          <label className="label-text">Monto de Garantía (S/)</label>
          <div className="relative">
            <input 
              type="number" 
              className="input-field pl-9" 
              placeholder="Ej. 1200"
              value={garantiaMonto}
              onChange={(e) => setGarantiaMonto(e.target.value)}
              min="0"
            />
            <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Asignar Propiedad */}
        <div>
          <label className="label-text">Departamento Asignado *</label>
          <select 
            className="input-field"
            value={propiedadId}
            onChange={(e) => setPropiedadId(e.target.value)}
            required
          >
            <option value="">Seleccione Departamento...</option>
            {deptosDisponibles.map(p => (
              <option key={p.id} value={p.id}>
                Depto {p.identificador} (Alquiler: S/ {p.costo_base})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sección Cochera / Vehículo */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              checked={tieneVehiculo}
              onChange={(e) => setTieneVehiculo(e.target.checked)}
            />
            <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <Car className="h-4 w-4 text-slate-500" />
              ¿Tiene Vehículo / Ocupa Cochera?
            </span>
          </label>
        </div>

        {tieneVehiculo && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 page-enter">
            <div>
              <label className="label-text">Tipo de Vehículo</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Ej. Auto, Moto, Camioneta"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              />
            </div>
            <div>
              <label className="label-text">Placa del Vehículo</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Ej. ABC-123"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
              />
            </div>
            <div>
              <label className="label-text">Costo de Cochera (S/)</label>
              <input 
                type="number" 
                className="input-field" 
                placeholder="Ej. 50"
                value={montoAsociacion}
                onChange={(e) => setMontoAsociacion(e.target.value)}
                min="0"
              />
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full btn-primary text-sm font-bold py-2.5 shadow-md shadow-blue-500/10 flex items-center justify-center gap-2"
      >
        <Save className="h-4 w-4" />
        <span>{saving ? "Guardando..." : "Guardar Cambios Básicos"}</span>
      </button>
    </form>
  );
}
