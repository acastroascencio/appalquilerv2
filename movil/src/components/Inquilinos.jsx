import React, { useState, useEffect } from "react";
import { clienteSupabase } from "../config/supabase";
import { 
  PlusCircle, Users, X, Phone, Building, Car, Trash2, Edit, 
  AlertCircle, FileText, Upload, Calendar, AlertTriangle, Download 
} from "lucide-react";

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
  
  // Historial de documentos cargados
  const [historialDocs, setHistorialDocs] = useState([]);

  // Estados de control de modales de confirmación y preview
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingUpload, setPendingUpload] = useState(null); // { file, tipo, input }
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null); // { nombre, url, fecha, tipo }

  // Estados de control
  const [errorAccion, setErrorAccion] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Requerimientos de formato y carga de documentos
  const ALLOWED_EXTENSIONS = ["docx", "doc", "pdf", "png", "jpg", "jpj", "jpeg"];

  const validarArchivo = (file) => {
    if (!file) return false;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      alert(`Formato de archivo no permitido.\nSolo se aceptan: .docx, .doc, .pdf, .png, .jpg, .jpj, .jpeg`);
      return false;
    }
    return true;
  };

  const procesarCarga = (file, tipo, inputElement) => {
    const lector = new FileReader();
    lector.onloadend = () => {
      const timestamp = new Date().toISOString();
      const newRecord = {
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        tipo: tipo,
        nombre: file.name,
        url: lector.result,
        fecha: timestamp
      };

      if (tipo === "dni") {
        setDniBase64(lector.result);
      } else {
        setContratoBase64(lector.result);
      }

      setHistorialDocs(prev => [...prev, newRecord]);
      alert(`Archivo ${tipo.toUpperCase()} cargado temporalmente. Se guardará al registrar/actualizar el inquilino.`);
      if (inputElement) inputElement.value = "";
    };
    lector.readAsDataURL(file);
  };

  const manejarSeleccionArchivo = (e, tipo) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validarArchivo(file)) {
      e.target.value = "";
      return;
    }

    const tieneExistente = tipo === "dni" ? !!dniBase64 : !!contratoBase64;
    if (tieneExistente) {
      setPendingUpload({ file, tipo, input: e.target });
      setShowConfirmModal(true);
    } else {
      procesarCarga(file, tipo, e.target);
    }
  };

  const handleConfirmUpload = () => {
    if (pendingUpload) {
      procesarCarga(pendingUpload.file, pendingUpload.tipo, pendingUpload.input);
    }
    setShowConfirmModal(false);
  };

  const handleCancelUpload = () => {
    if (pendingUpload && pendingUpload.input) {
      pendingUpload.input.value = "";
    }
    setPendingUpload(null);
    setShowConfirmModal(false);
  };

  const eliminarDelHistorial = (docId, tipo) => {
    if (window.confirm("¿Estás seguro de eliminar este documento del historial?")) {
      const nuevoHistorial = historialDocs.filter(d => d.id !== docId);
      setHistorialDocs(nuevoHistorial);

      let activoUrl = tipo === "dni" ? dniBase64 : contratoBase64;
      const deletedDoc = historialDocs.find(d => d.id === docId);

      if (deletedDoc && activoUrl === deletedDoc.url) {
        const restantes = nuevoHistorial.filter(d => d.tipo === tipo);
        if (restantes.length > 0) {
          activoUrl = restantes[restantes.length - 1].url;
        } else {
          activoUrl = "";
        }
      }

      if (tipo === "dni") {
        setDniBase64(activoUrl);
      } else {
        setContratoBase64(activoUrl);
      }
    }
  };

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
      setHistorialDocs(docs.historial || []);
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
      setHistorialDocs([]);
    }
    setMostrarModal(true);
  };

  // Lógica de carga delegada al manejador común unificado

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
        contrato_url: contratoBase64,
        historial: historialDocs
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

                  {/* Documentos Activos e Historial */}
                  <div className="space-y-2 pt-1.5 border-t border-slate-100">
                    {(inq.documentos?.dni_url || inq.documentos?.contrato_url) && (
                      <div className="flex flex-wrap gap-2">
                        {inq.documentos.dni_url && (
                          <a href={inq.documentos.dni_url} download={`DNI_${inq.nombre}.png`} className="text-xs font-black text-blue-600 underline flex items-center gap-1">
                            <FileText className="h-3 w-3" /> Ver DNI Activo
                          </a>
                        )}
                        {inq.documentos.contrato_url && (
                          <a href={inq.documentos.contrato_url} download={`Contrato_${inq.nombre}.png`} className="text-xs font-black text-blue-600 underline flex items-center gap-1">
                            <FileText className="h-3 w-3" /> Ver Contrato Activo
                          </a>
                        )}
                      </div>
                    )}
                    
                    {/* Botones rápidos del historial del Inquilino */}
                    {inq.documentos?.historial?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide block">Historial de Archivos ({inq.documentos.historial.length})</span>
                        <div className="flex flex-wrap gap-1">
                          {inq.documentos.historial.map(doc => (
                            <button
                              key={doc.id}
                              type="button"
                              onClick={() => {
                                setPreviewDoc(doc);
                                setShowPreviewModal(true);
                              }}
                              className="inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 transition-colors"
                              title={`Subido el ${new Date(doc.fecha).toLocaleString("es-ES")}`}
                            >
                              <FileText className="h-2.5 w-2.5 text-slate-400" />
                              <span className="max-w-[80px] truncate">{doc.nombre}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

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
                <span className="text-xs font-black uppercase text-slate-400 block">Adjuntar Documentos</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Cargar DNI</label>
                    <div className="relative border border-dashed border-slate-300 rounded-lg p-2.5 flex items-center justify-center bg-white hover:border-blue-500 cursor-pointer">
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".docx,.doc,.pdf,.png,.jpg,.jpj,.jpeg" onChange={(e) => manejarSeleccionArchivo(e, "dni")} />
                      <div className="text-center">
                        <Upload className="h-5 w-5 text-slate-400 mx-auto" />
                        <span className="text-[10px] font-extrabold text-slate-600 block mt-1">DNI</span>
                      </div>
                    </div>
                    {dniBase64 && <span className="text-[10px] text-green-600 font-bold block mt-1">✓ DNI Listo</span>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Cargar Contrato</label>
                    <div className="relative border border-dashed border-slate-300 rounded-lg p-2.5 flex items-center justify-center bg-white hover:border-blue-500 cursor-pointer">
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".docx,.doc,.pdf,.png,.jpg,.jpj,.jpeg" onChange={(e) => manejarSeleccionArchivo(e, "contrato")} />
                      <div className="text-center">
                        <Upload className="h-5 w-5 text-slate-400 mx-auto" />
                        <span className="text-[10px] font-extrabold text-slate-600 block mt-1">Contrato</span>
                      </div>
                    </div>
                    {contratoBase64 && <span className="text-[10px] text-green-600 font-bold block mt-1">✓ Contrato Listo</span>}
                  </div>
                </div>
              </div>

              {/* Historial en el Modal de Edición */}
              {historialDocs.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-black uppercase text-slate-400 block">Historial del Inquilino ({historialDocs.length})</span>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {historialDocs.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200 text-xs">
                        <div className="truncate flex-1 pr-2">
                          <span className="font-bold text-slate-800 block truncate">{doc.nombre}</span>
                          <span className="text-[9px] text-slate-400 block">{new Date(doc.fecha).toLocaleString("es-ES")}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${doc.tipo === "dni" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"}`}>{doc.tipo}</span>
                          <button type="button" onClick={() => { setPreviewDoc(doc); setShowPreviewModal(true); }} className="p-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200"><Eye className="h-3.5 w-3.5" /></button>
                          <button type="button" onClick={() => eliminarDelHistorial(doc.id, doc.tipo)} className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

      )}

      {/* 2. MODAL DE CONFIRMACIÓN DE CARGA */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 page-enter p-6 space-y-4 text-sm font-semibold">
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
                type="button"
                onClick={handleCancelUpload}
                className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmUpload}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors"
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-slate-100 page-enter flex flex-col font-bold">
            {/* Cabecera del modal */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    previewDoc.tipo === "dni" ? "bg-blue-500 text-white" : "bg-emerald-500 text-white"
                  }`}>
                    {previewDoc.tipo}
                  </span>
                  <h4 className="font-extrabold text-sm tracking-wide truncate max-w-[200px] sm:max-w-md">
                    {previewDoc.nombre}
                  </h4>
                </div>
                <p className="text-[10px] text-slate-400 font-bold mt-1">
                  Subido el: {new Date(previewDoc.fecha).toLocaleString("es-ES")}
                </p>
              </div>
              <button 
                type="button"
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
                <div className="text-center p-8 bg-white border border-slate-200 rounded-lg shadow-sm max-w-md space-y-4">
                  <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100 shadow-sm">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-800 text-sm">Documento PDF Listo</h5>
                    <p className="text-xs font-semibold text-slate-400 mt-2 leading-relaxed">
                      El archivo PDF se ha cargado correctamente y está listo para su visualización. Por motivos de compatibilidad de seguridad en tu navegador, haz clic abajo para abrir o descargar el documento de forma segura.
                    </p>
                  </div>
                  <a
                    href={previewDoc.url}
                    download={previewDoc.nombre}
                    className="inline-flex items-center gap-2 py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-all shadow-md shadow-blue-500/10 hover:shadow-lg text-center"
                  >
                    <Download className="h-4 w-4" />
                    <span>Ver / Descargar PDF</span>
                  </a>
                </div>
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
                    className="inline-flex items-center gap-2 py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-all shadow-md shadow-blue-500/10 hover:shadow-lg text-center"
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
                    className="inline-flex items-center gap-2 py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-all shadow-md shadow-blue-500/10 hover:shadow-lg text-center"
                  >
                    <Download className="h-4 w-4" />
                    <span>Descargar Archivo</span>
                  </a>
                </div>
              )}
            </div>

            {/* Pie del modal */}
            <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end font-bold">
              <button
                type="button"
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

    </div>
  );
}
