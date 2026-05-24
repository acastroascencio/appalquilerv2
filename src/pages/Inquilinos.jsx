import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import InquilinoDetail from "./InquilinoDetail";
import { Users, PlusCircle, Eye, Trash2, Phone, Building, Car } from "lucide-react";

export default function Inquilinos() {
  const { 
    inquilinos, 
    propiedades, 
    selectedInquilinoId, 
    setSelectedInquilinoId,
    saveInquilino,
    deleteInquilino 
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [garantiaMonto, setGarantiaMonto] = useState("");
  const [propiedadId, setPropiedadId] = useState("");
  const [tieneVehiculo, setTieneVehiculo] = useState(false);
  const [vehiculoTipo, setVehiculoTipo] = useState("");
  const [vehiculoPlaca, setVehiculoPlaca] = useState("");
  const [cocheraMonto, setCocheraMonto] = useState("");
  
  const [saving, setSaving] = useState(false);

  // Redirigir a Ficha Detallada si hay selección
  if (selectedInquilinoId) {
    return <InquilinoDetail />;
  }

  // Filtrar departamentos libres
  const deptosLibres = propiedades.filter(p => !p.estado);

  const handleAddInquilino = async (e) => {
    e.preventDefault();
    if (!nombre || !telefono || !propiedadId) {
      alert("Por favor llene los campos obligatorios.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nombre,
        telefono,
        garantia_monto: Number(garantiaMonto) || 0,
        propiedad_id: propiedadId,
        documentos: { dni_url: "", contrato_url: "" },
        vehiculo: {
          tiene_vehiculo: tieneVehiculo,
          tipo: tieneVehiculo ? vehiculoTipo : "",
          placa: tieneVehiculo ? vehiculoPlaca.toUpperCase() : "",
          monto_asociacion: tieneVehiculo ? (Number(cocheraMonto) || 0) : 0
        }
      };

      await saveInquilino(payload);
      
      // Limpiar formulario y cerrar
      setNombre("");
      setTelefono("");
      setGarantiaMonto("");
      setPropiedadId("");
      setTieneVehiculo(false);
      setVehiculoTipo("");
      setVehiculoPlaca("");
      setCocheraMonto("");
      setShowAddModal(false);
      alert("Inquilino registrado con éxito.");
    } catch (error) {
      console.error("Error al añadir inquilino:", error);
      alert("Ocurrió un error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Confirmas que deseas retirar al inquilino "${nombre}"? El departamento asignado se liberará.`)) {
      await deleteInquilino(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera y botón de acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Inquilinos</h3>
            <p className="text-xs font-semibold text-slate-400">Total: {inquilinos.length} arrendatario(s) activos</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-sm font-semibold py-2.5 px-4 shadow-md shadow-blue-500/10 flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>Registrar Inquilino</span>
        </button>
      </div>

      {/* Tabla/Listado de Inquilinos */}
      {inquilinos.length === 0 ? (
        <div className="card-container py-16 text-center text-slate-400 font-semibold text-sm">
          👥 No hay inquilinos registrados. ¡Comienza agregando uno arriba!
        </div>
      ) : (
        <div className="card-container overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Inquilino</th>
                  <th className="pb-3">Contacto</th>
                  <th className="pb-3">Asignación</th>
                  <th className="pb-3">Cochera / Vehículo</th>
                  <th className="pb-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {inquilinos.map((inq) => {
                  const prop = propiedades.find(p => p.id === inq.propiedad_id);
                  
                  return (
                    <tr key={inq.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                      <td className="py-4">
                        <div className="font-bold text-slate-900">{inq.nombre}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                          Garantía: S/ {Number(inq.garantia_monto).toFixed(2)}
                        </div>
                      </td>
                      <td className="py-4 font-semibold text-slate-600">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          {inq.telefono}
                        </span>
                      </td>
                      <td className="py-4 font-bold text-slate-700">
                        {prop ? (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">
                            <Building className="h-3.5 w-3.5 text-slate-400" />
                            Depto {prop.identificador}
                          </span>
                        ) : (
                          <span className="text-xs text-red-500 font-semibold italic">Sin asignar</span>
                        )}
                      </td>
                      <td className="py-4 text-xs font-semibold text-slate-500">
                        {inq.vehiculo?.tiene_vehiculo ? (
                          <span className="flex items-center gap-1 text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-full w-fit">
                            <Car className="h-3.5 w-3.5" />
                            {inq.vehiculo.tipo} ({inq.vehiculo.placa}) • S/ {Number(inq.vehiculo.monto_asociacion).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No aplica</span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedInquilinoId(inq.id)}
                            className="px-3 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors duration-150 flex items-center gap-1 shadow-sm"
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                            <span>Ver Ficha</span>
                          </button>
                          
                          <button
                            onClick={() => handleDelete(inq.id, inq.nombre)}
                            className="p-2 rounded border border-red-200 text-status-danger bg-white hover:bg-red-50 transition-colors"
                            title="Eliminar inquilino"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR NUEVO INQUILINO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col my-8 page-enter">
            {/* Cabecera */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h4 className="font-extrabold text-base tracking-wide">Registrar Nuevo Arrendatario</h4>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Plus className="h-5 w-5 rotate-45" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleAddInquilino} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="label-text">Nombre Completo *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ej. Juan Pérez García"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Teléfono Movil *</label>
                  <input 
                    type="tel" 
                    className="input-field" 
                    placeholder="Ej. 987654321"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label-text">Monto de Garantía (S/)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="Ej. 1000"
                    value={garantiaMonto}
                    onChange={(e) => setGarantiaMonto(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="label-text">Asignar Departamento *</label>
                <select 
                  className="input-field"
                  value={propiedadId}
                  onChange={(e) => setPropiedadId(e.target.value)}
                  required
                >
                  <option value="">Seleccione un depto disponible...</option>
                  {deptosLibres.map(p => (
                    <option key={p.id} value={p.id}>
                      Depto {p.identificador} (Alquiler Base: S/ {p.costo_base})
                    </option>
                  ))}
                </select>
                {deptosLibres.length === 0 && (
                  <span className="text-[10px] text-status-danger font-bold block mt-1">
                    ⚠️ No hay departamentos libres. Debe añadir o liberar uno primero.
                  </span>
                )}
              </div>

              {/* Cochera Checkbox */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    checked={tieneVehiculo}
                    onChange={(e) => setTieneVehiculo(e.target.checked)}
                  />
                  <span className="text-sm font-bold text-slate-700">¿Asociar Cochera / Vehículo?</span>
                </label>

                {tieneVehiculo && (
                  <div className="grid grid-cols-3 gap-2 pt-1 page-enter">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">Tipo</label>
                      <input 
                        type="text" 
                        className="input-field py-1 text-xs" 
                        placeholder="Auto"
                        value={vehiculoTipo}
                        onChange={(e) => setVehiculoTipo(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">Placa</label>
                      <input 
                        type="text" 
                        className="input-field py-1 text-xs" 
                        placeholder="ABC-123"
                        value={vehiculoPlaca}
                        onChange={(e) => setVehiculoPlaca(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">Monto (S/)</label>
                      <input 
                        type="number" 
                        className="input-field py-1 text-xs" 
                        placeholder="50"
                        value={cocheraMonto}
                        onChange={(e) => setCocheraMonto(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 btn-secondary text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || deptosLibres.length === 0}
                  className="flex-1 btn-primary text-xs font-bold"
                >
                  {saving ? "Guardando..." : "Registrar Inquilino"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Icono Plus auxiliar
function Plus(props) {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
