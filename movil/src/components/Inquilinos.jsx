import React, { useState, useEffect } from "react";
import { clienteSupabase } from "../config/supabase";
import { PlusCircle, Users, X, Phone, Building, Car, Trash2, Edit, AlertCircle, FileText, Upload } from "lucide-react";

export default function Inquilinos({ sesion }) {
  const adminId = sesion?.user?.id;

  const [listaInquilinos, setListaInquilinos] = useState([]);
  const [listaDeptos, setListaDeptos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [inqAEditar, setInqAEditar] = useState(null);

  // Campos Formulario
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [garantiaMonto, setGarantiaMonto] = useState("");
  const [deptoId, setDeptoId] = useState("");
  const [tieneVehiculo, setTieneVehiculo] = useState(false);
  const [vehiculoTipo, setVehiculoTipo] = useState("");
  const [vehiculoPlaca, setVehiculoPlaca] = useState("");
  const [cocheraMonto, setCocheraMonto] = useState("");
  
  // Documentos en Base64
  const [dniBase64, setDniBase64] = useState("");
  const [contratoBase64, setContratoBase64] = useState("");

  // Estados de control
  const [errorAccion, setErrorAccion] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargarDatos = async () => {
    if (!adminId) return;
    setCargando(true);
    setErrorAccion("");
    try {
      if (adminId.startsWith("demo-") || adminId === "admin-prueba-id") {
        // Cuentas de demostración locales
        let demoInqs = [
          { id: "inq-mario-1", nombre: "Juan Pérez García", celular: "946131777", depto_id: "prop-mario-1", garantia_monto: 1200, moto_info: { placa: "ABC-123", monto_asociacion: 50 }, documentos: { dni_url: "", contrato_url: "" } },
          { id: "inq-mario-2", nombre: "María López Rodríguez", celular: "912345678", depto_id: "prop-mario-2", garantia_monto: 900, moto_info: { placa: "", monto_asociacion: 0 }, documentos: { dni_url: "", contrato_url: "" } },
          { id: "inq-mario-3", nombre: "Pedro Alcántara Vega", celular: "988888888", depto_id: "prop-mario-3", garantia_monto: 1300, moto_info: { placa: "XYZ-789", monto_asociacion: 40 }, documentos: { dni_url: "", contrato_url: "" } }
        ];

        let demoDeptos = [
          { id: "prop-mario-1", identificador: "Depto 2A", precio_alquiler: 1200 },
          { id: "prop-mario-2", identificador: "Depto 2B", precio_alquiler: 900 },
          { id: "prop-mario-3", identificador: "Depto 3A", precio_alquiler: 1300 }
        ];

        if (adminId === "demo-sofia") {
          demoInqs = [
            { id: "inq-sofia-1", nombre: "Carlos Fuentes Romero", celular: "999111222", depto_id: "prop-sofia-1", garantia_monto: 1000, moto_info: { placa: "", monto_asociacion: 0 }, documentos: { dni_url: "", contrato_url: "" } },
            { id: "inq-sofia-2", nombre: "Ana Gómez Solís", celular: "999333444", depto_id: "prop-sofia-2", garantia_monto: 850, moto_info: { placa: "MNO-456", monto_asociacion: 30 }, documentos: { dni_url: "", contrato_url: "" } },
            { id: "inq-sofia-3", nombre: "Roberto Díaz Canseco", celular: "999555666", depto_id: "prop-sofia-3", garantia_monto: 1100, moto_info: { placa: "", monto_asociacion: 0 }, documentos: { dni_url: "", contrato_url: "" } },
            { id: "inq-sofia-4", nombre: "Lucía Mendez Castro", celular: "999777888", depto_id: "prop-sofia-4", garantia_monto: 950, moto_info: { placa: "789-DEF", monto_asociacion: 45 }, documentos: { dni_url: "", contrato_url: "" } }
          ];

          demoDeptos = [
            { id: "prop-sofia-1", identificador: "Depto 101", precio_alquiler: 1000 },
            { id: "prop-sofia-2", identificador: "Depto 102", precio_alquiler: 850 },
            { id: "prop-sofia-3", identificador: "Depto 201", precio_alquiler: 1100 },
            { id: "prop-sofia-4", identificador: "Depto 202", precio_alquiler: 950 }
          ];
        } else if (adminId === "demo-carlos") {
          demoInqs = [
            { id: "inq-carlos-1", nombre: "Boutique Bella S.A.C.", celular: "987111111", depto_id: "prop-carlos-1", garantia_monto: 2500, moto_info: { placa: "", monto_asociacion: 0 }, documentos: { dni_url: "", contrato_url: "" } },
            { id: "inq-carlos-2", nombre: "Farmacia FarmaVida", celular: "987222222", depto_id: "prop-carlos-2", garantia_monto: 3000, moto_info: { placa: "F-4563", monto_asociacion: 60 }, documentos: { dni_url: "", contrato_url: "" } },
            { id: "inq-carlos-3", nombre: "Consultorio Dental Luz", celular: "987333333", depto_id: "prop-carlos-3", garantia_monto: 1800, moto_info: { placa: "", monto_asociacion: 0 }, documentos: { dni_url: "", contrato_url: "" } }
          ];

          demoDeptos = [
            { id: "prop-carlos-1", identificador: "Local A", precio_alquiler: 2500 },
            { id: "prop-carlos-2", identificador: "Local B", precio_alquiler: 3000 },
            { id: "prop-carlos-3", identificador: "Oficina C", precio_alquiler: 1800 }
          ];
        }

        setListaInquilinos(demoInqs);
        setListaDeptos(demoDeptos);
        setCargando(false);
        return;
      }

      // Supabase real
      const { data: inqs, error: errInqs } = await clienteSupabase
        .from("inquilinos")
        .select("id, nombre, celular, depto_id, garantia_monto, moto_info, documentos")
        .eq("admin_id", adminId);
      if (errInqs) throw errInqs;
      setListaInquilinos(inqs || []);

      const { data: deptos, error: errDeptos } = await clienteSupabase
        .from("departamentos")
        .select("id, identificador, precio_alquiler")
        .eq("admin_id", adminId);
      if (errDeptos) throw errDeptos;
      setListaDeptos(deptos || []);

    } catch (err) {
      console.error("Error al cargar inquilinos:", err);
      setErrorAccion("⚠️ Hubo un problema al cargar. Revisa tu conexión a internet");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [adminId]);

  const abrirFormulario = (inq = null) => {
    if (inq) {
      setInqAEditar(inq);
      setNombre(inq.nombre);
      setCelular(inq.celular);
      setGarantiaMonto(inq.garantia_monto || "");
      setDeptoId(inq.depto_id || "");
      
      const moto = inq.moto_info || {};
      setTieneVehiculo(!!moto.placa);
      setVehiculoTipo(moto.tipo || "");
      setVehiculoPlaca(moto.placa || "");
      setCocheraMonto(moto.monto_asociacion || "");

      const docs = inq.documentos || {};
      setDniBase64(docs.dni_url || "");
      setContratoBase64(docs.contrato_url || "");
    } else {
      setInqAEditar(null);
      setNombre("");
      setCelular("");
      setGarantiaMonto("");
      setDeptoId("");
      setTieneVehiculo(false);
      setVehiculoTipo("");
      setVehiculoPlaca("");
      setCocheraMonto("");
      setDniBase64("");
      setContratoBase64("");
    }
    setMostrarModal(true);
  };

  const manejarDniUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const lector = new FileReader();
      lector.onloadend = () => setDniBase64(lector.result);
      lector.readAsDataURL(file);
    }
  };

  const manejarContratoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const lector = new FileReader();
      lector.onloadend = () => setContratoBase64(lector.result);
      lector.readAsDataURL(file);
    }
  };

  const guardarInquilino = async (e) => {
    e.preventDefault();
    if (!nombre || !celular || !deptoId) {
      setErrorAccion("Por favor completa los campos marcados con asterisco.");
      return;
    }

    setGuardando(true);
    setErrorAccion("");

    const payload = {
      admin_id: adminId,
      nombre,
      celular,
      garantia_monto: Number(garantiaMonto) || 0,
      depto_id: deptoId,
      moto_info: {
        tipo: tieneVehiculo ? vehiculoTipo : "",
        placa: tieneVehiculo ? vehiculoPlaca.toUpperCase() : "",
        monto_asociacion: tieneVehiculo ? Number(cocheraMonto) : 0
      },
      documentos: {
        dni_url: dniBase64,
        contrato_url: contratoBase64
      }
    };

    if (adminId.startsWith("demo-") || adminId === "admin-prueba-id") {
      const nuevoInq = {
        id: inqAEditar ? inqAEditar.id : "inq-demo-" + Date.now(),
        ...payload
      };

      if (inqAEditar) {
        setListaInquilinos(prev => prev.map(i => i.id === inqAEditar.id ? nuevoInq : i));
      } else {
        setListaInquilinos(prev => [...prev, nuevoInq]);
      }

      setMostrarModal(false);
      setGuardando(false);
      return;
    }

    try {
      if (inqAEditar) {
        const { error } = await clienteSupabase
          .from("inquilinos")
          .update(payload)
          .eq("id", inqAEditar.id);
        if (error) throw error;
      } else {
        const { error } = await clienteSupabase
          .from("inquilinos")
          .insert([payload]);
        if (error) throw error;
      }

      setMostrarModal(false);
      await cargarDatos();
    } catch (err) {
      console.error("Error al guardar inquilino:", err);
      setErrorAccion("⚠️ Hubo un problema al guardar. Revisa tu conexión a internet");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarInquilino = async (id, nombreInq) => {
    if (window.confirm(`¿Confirmas que deseas retirar al inquilino "${nombreInq}"?`)) {
      if (adminId.startsWith("demo-") || adminId === "admin-prueba-id") {
        setListaInquilinos(prev => prev.filter(i => i.id !== id));
        return;
      }

      try {
        const { error } = await clienteSupabase
          .from("inquilinos")
          .delete()
          .eq("id", id);
        if (error) throw error;
        await cargarDatos();
      } catch (err) {
        console.error("Error al eliminar inquilino:", err);
        setErrorAccion("⚠️ Hubo un problema al eliminar. Revisa tu conexión a internet");
      }
    }
  };

  const obtenerNombreDepto = (depId) => {
    const dep = listaDeptos.find(d => d.id === depId);
    return dep ? dep.identificador : "N/A";
  };

  return (
    <div className="space-y-6 pb-[100px] transicion-pantalla">
      
      {/* Cabecera Responsiva */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="titulo-grande">Inquilinos</h2>
          <p className="text-sm font-semibold text-slate-500">
            Total: {listaInquilinos.length} inquilinos activos
          </p>
        </div>

        <button
          onClick={() => abrirFormulario()}
          className="boton-accion-gigante text-sm px-4 h-12 flex items-center gap-1.5"
          aria-label="Registrar inquilino"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Registrar</span>
        </button>
      </div>

      {errorAccion && (
        <div className="p-5 bg-red-100 border-l-4 border-red-600 text-red-950 font-bold rounded-r-lg flex items-start gap-3 shadow-md" role="alert">
          <AlertCircle className="h-6 w-6 shrink-0 text-red-700" aria-hidden="true" />
          <div className="text-base font-extrabold leading-tight">{errorAccion}</div>
        </div>
      )}

      {cargando ? (
        <p className="text-center py-10 font-bold text-slate-400 animate-pulse text-lg">
          Buscando inquilinos en Supabase...
        </p>
      ) : listaInquilinos.length === 0 ? (
        <div className="tarjeta-premium text-center py-16 text-slate-400 font-bold text-base">
          👥 No hay inquilinos registrados. ¡Añade tu primer inquilino arriba!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {listaInquilinos.map((inq) => {
            const deptoNombre = obtenerNombreDepto(inq.depto_id);
            const poseeCochera = inq.moto_info?.placa;

            return (
              <article key={inq.id} className="tarjeta-premium flex flex-col justify-between border border-slate-200/60 p-5 relative">
                <div className="space-y-4">
                  
                  {/* Nombre y Depto */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                    <div>
                      <h3 className="text-[20px] font-black text-slate-900 leading-tight">{inq.nombre}</h3>
                      <span className="inline-flex items-center gap-1 mt-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded text-xs font-black">
                        <Building className="h-3.5 w-3.5" />
                        Depto: {deptoNombre}
                      </span>
                    </div>
                  </div>

                  {/* Detalles de contacto y garantía */}
                  <div className="space-y-2 text-sm font-semibold text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>Celular: <strong>{inq.celular}</strong></span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-400 font-black uppercase pt-1 border-t border-slate-100">
                      <span>Garantía entregada:</span>
                      <span className="text-slate-900 font-black text-sm">S/ {Number(inq.garantia_monto).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Info Cochera */}
                  {poseeCochera && (
                    <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-3 flex items-start gap-2.5 text-xs text-amber-900">
                      <Car className="h-4 w-4 mt-0.5 text-amber-700" />
                      <div>
                        <span className="block font-black text-[13px] text-amber-950">Cochera Asociada</span>
                        <span>{inq.moto_info.tipo} ({inq.moto_info.placa}) • S/ {Number(inq.moto_info.monto_asociacion).toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* Documentos */}
                  {(inq.documentos?.dni_url || inq.documentos?.contrato_url) && (
                    <div className="flex gap-2 pt-1">
                      {inq.documentos.dni_url && (
                        <a href={inq.documentos.dni_url} download={`DNI_${inq.nombre}.png`} className="text-xs font-black text-blue-600 underline flex items-center gap-1">
                          <FileText className="h-3 w-3" /> Ver DNI
                        </a>
                      )}
                      {inq.documentos.contrato_url && (
                        <a href={inq.documentos.contrato_url} download={`Contrato_${inq.nombre}.png`} className="text-xs font-black text-blue-600 underline flex items-center gap-1 ml-2">
                          <FileText className="h-3 w-3" /> Ver Contrato
                        </a>
                      )}
                    </div>
                  )}

                </div>

                {/* Acciones */}
                <div className="flex gap-2 mt-5">
                  <button
                    onClick={() => abrirFormulario(inq)}
                    className="flex-1 py-3 text-sm font-black border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => eliminarInquilino(inq.id, inq.nombre)}
                    className="px-3 py-3 border border-red-200 text-red-600 bg-white hover:bg-red-50 rounded-lg flex items-center justify-center"
                    title="Eliminar inquilino"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* MODAL GIGANTE DE REGISTRO / EDICIÓN */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col my-8 page-enter text-lg font-bold">
            
            {/* Cabecera */}
            <div className="bg-slate-950 text-white p-5 flex items-center justify-between">
              <h3 className="font-black text-lg">
                {inqAEditar ? "Editar Inquilino" : "Registrar Inquilino"}
              </h3>
              <button 
                onClick={() => setMostrarModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={guardarInquilino} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              
              <div>
                <label htmlFor="nombre-inq" className="etiqueta-gigante">Nombre Completo *</label>
                <input 
                  id="nombre-inq"
                  type="text"
                  className="campo-entrada-gigante"
                  placeholder="Ej. Juan Pérez García"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cel-inq" className="etiqueta-gigante">Teléfono Celular *</label>
                  <input 
                    id="cel-inq"
                    type="tel"
                    className="campo-entrada-gigante"
                    placeholder="987654321"
                    value={celular}
                    onChange={(e) => setCelular(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="garantia-inq" className="etiqueta-gigante">Garantía (S/)</label>
                  <input 
                    id="garantia-inq"
                    type="number"
                    className="campo-entrada-gigante"
                    placeholder="Ej: 1000"
                    value={garantiaMonto}
                    onChange={(e) => setGarantiaMonto(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="depto-inq" className="etiqueta-gigante">Asignar Departamento *</label>
                <select 
                  id="depto-inq"
                  className="campo-entrada-gigante"
                  value={deptoId}
                  onChange={(e) => setDeptoId(e.target.value)}
                  required
                >
                  <option value="">Seleccione departamento...</option>
                  {listaDeptos.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.identificador} (Base: S/ {d.precio_alquiler})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cochera */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
                    checked={tieneVehiculo}
                    onChange={(e) => setTieneVehiculo(e.target.checked)}
                  />
                  <span className="text-base font-black text-slate-700">¿Asociar Cochera / Vehículo?</span>
                </label>

                {tieneVehiculo && (
                  <div className="grid grid-cols-3 gap-2 pt-1 page-enter text-xs">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">Tipo</label>
                      <input 
                        type="text" 
                        className="w-full px-2 py-1.5 border border-slate-300 rounded font-bold bg-white"
                        placeholder="Moto"
                        value={vehiculoTipo}
                        onChange={(e) => setVehiculoTipo(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">Placa</label>
                      <input 
                        type="text" 
                        className="w-full px-2 py-1.5 border border-slate-300 rounded font-bold bg-white"
                        placeholder="ABC-123"
                        value={vehiculoPlaca}
                        onChange={(e) => setVehiculoPlaca(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">Monto (S/)</label>
                      <input 
                        type="number" 
                        className="w-full px-2 py-1.5 border border-slate-300 rounded font-bold bg-white"
                        placeholder="50"
                        value={cocheraMonto}
                        onChange={(e) => setCocheraMonto(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Documentos */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <span className="text-xs font-black uppercase text-slate-400 block">Adjuntar Documentos (DNI / Contrato)</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Cargar DNI</label>
                    <div className="relative border border-dashed border-slate-300 rounded-lg p-2.5 flex items-center justify-center bg-white hover:border-blue-500 cursor-pointer">
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={manejarDniUpload} />
                      <div className="text-center">
                        <Upload className="h-5 w-5 text-slate-400 mx-auto" />
                        <span className="text-[10px] font-extrabold text-slate-600 block mt-1">DNI</span>
                      </div>
                    </div>
                    {dniBase64 && <span className="text-[10px] text-green-600 font-bold block mt-1">✓ DNI Cargado</span>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Cargar Contrato</label>
                    <div className="relative border border-dashed border-slate-300 rounded-lg p-2.5 flex items-center justify-center bg-white hover:border-blue-500 cursor-pointer">
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={manejarContratoUpload} />
                      <div className="text-center">
                        <Upload className="h-5 w-5 text-slate-400 mx-auto" />
                        <span className="text-[10px] font-extrabold text-slate-600 block mt-1">Contrato</span>
                      </div>
                    </div>
                    {contratoBase64 && <span className="text-[10px] text-green-600 font-bold block mt-1">✓ Contrato Cargado</span>}
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="flex-1/2 boton-secundario-gigante text-base"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 boton-positivo-gigante text-base font-black"
                >
                  {guardando ? "Registrando..." : "Registrar"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
