import React, { useState, useEffect } from "react";
import { clienteSupabase } from "../config/supabase";
import { PlusCircle, Building, X, Upload, Trash2, Edit, AlertCircle } from "lucide-react";
import { registrarLogSistema } from "../utils/logger";


export default function Departamentos({ sesion }) {
  const adminId = sesion?.user?.id;

  const [listaDeptos, setListaDeptos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [deptoAEditar, setDeptoAEditar] = useState(null);

  // Campos Formulario
  const [identificador, setIdentificador] = useState("");
  const [precioAlquiler, setPrecioAlquiler] = useState("");
  const [habitaciones, setHabitaciones] = useState(1);
  const [banoPropio, setBanoPropio] = useState(true);
  const [tieneCocina, setTieneCocina] = useState(true);
  const [fotos, setFotos] = useState([]);

  // Estados de control
  const [errorAccion, setErrorAccion] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargarDepartamentos = async () => {
    if (!adminId) return;
    setCargando(true);
    setErrorAccion("");

    // Bypasear Supabase si es un ID de demostración
    if (adminId.startsWith("demo-") || adminId === "admin-prueba-id") {
      let deptos = [
        { id: "prop-mario-1", identificador: "Depto 2A", precio_alquiler: 1200, configuracion: { habitaciones: 2, bano_propio: true, tiene_cocina: true }, fotos: [] },
        { id: "prop-mario-2", identificador: "Depto 2B", precio_alquiler: 900, configuracion: { habitaciones: 1, bano_propio: true, tiene_cocina: true }, fotos: [] },
        { id: "prop-mario-3", identificador: "Depto 3A", precio_alquiler: 1300, configuracion: { habitaciones: 2, bano_propio: true, tiene_cocina: true }, fotos: [] }
      ];

      if (adminId === "demo-sofia") {
        deptos = [
          { id: "prop-sofia-1", identificador: "Depto 101", precio_alquiler: 1000, configuracion: { habitaciones: 2, bano_propio: true, tiene_cocina: true }, fotos: [] },
          { id: "prop-sofia-2", identificador: "Depto 102", precio_alquiler: 850, configuracion: { habitaciones: 1, bano_propio: true, tiene_cocina: false }, fotos: [] },
          { id: "prop-sofia-3", identificador: "Depto 201", precio_alquiler: 1100, configuracion: { habitaciones: 2, bano_propio: true, tiene_cocina: true }, fotos: [] },
          { id: "prop-sofia-4", identificador: "Depto 202", precio_alquiler: 950, configuracion: { habitaciones: 1, bano_propio: true, tiene_cocina: true }, fotos: [] }
        ];
      } else if (adminId === "demo-carlos") {
        deptos = [
          { id: "prop-carlos-1", identificador: "Local A", precio_alquiler: 2500, configuracion: { habitaciones: 1, bano_propio: true, tiene_cocina: false }, fotos: [] },
          { id: "prop-carlos-2", identificador: "Local B", precio_alquiler: 3000, configuracion: { habitaciones: 2, bano_propio: true, tiene_cocina: false }, fotos: [] },
          { id: "prop-carlos-3", identificador: "Oficina C", precio_alquiler: 1800, configuracion: { habitaciones: 1, bano_propio: true, tiene_cocina: false }, fotos: [] }
        ];
      }

      setListaDeptos(deptos);
      setCargando(false);
      return;
    }

    try {
      const { data, error } = await clienteSupabase
        .from("departamentos")
        .select("id, identificador, precio_alquiler, configuracion, fotos")
        .eq("admin_id", adminId);

      if (error) throw error;
      setListaDeptos(data || []);
    } catch (err) {
      console.error("Error al cargar departamentos:", err);
      setErrorAccion("⚠️ Hubo un problema al cargar. Revisa tu conexión a internet");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDepartamentos();
  }, [adminId]);

  // Manejar apertura de modal
  const abrirFormulario = (depto = null) => {
    if (depto) {
      setDeptoAEditar(depto);
      setIdentificador(depto.identificador);
      setPrecioAlquiler(depto.precio_alquiler);
      setHabitaciones(depto.configuracion?.habitaciones || 1);
      setBanoPropio(depto.configuracion?.bano_propio ?? true);
      setTieneCocina(depto.configuracion?.tiene_cocina ?? true);
      setFotos(depto.fotos || []);
    } else {
      setDeptoAEditar(null);
      setIdentificador("");
      setPrecioAlquiler("");
      setHabitaciones(1);
      setBanoPropio(true);
      setTieneCocina(true);
      setFotos([]);
    }
    setMostrarModal(true);
  };

  // Convertir fotos a Base64
  const manejarFotosUpload = (e) => {
    const archivos = Array.from(e.target.files);
    archivos.forEach((file) => {
      const lector = new FileReader();
      lector.onloadend = () => {
        setFotos((prev) => [...prev, lector.result]);
      };
      lector.readAsDataURL(file);
    });
  };

  const eliminarFoto = (idx) => {
    setFotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Acción de Guardar (Submit es palabra prohibida)
  const guardarDepto = async (e) => {
    e.preventDefault();
    if (!identificador || !precioAlquiler) {
      setErrorAccion("Por favor completa los campos marcados con asterisco.");
      return;
    }

    setGuardando(true);
    setErrorAccion("");

    // Bypasear Supabase si es un ID de demostración
    if (adminId.startsWith("demo-") || adminId === "admin-prueba-id") {
      const nuevoDepto = {
        id: deptoAEditar ? deptoAEditar.id : "prop-demo-" + Date.now(),
        identificador,
        precio_alquiler: Number(precioAlquiler),
        configuracion: {
          habitaciones: Number(habitaciones),
          bano_propio: banoPropio,
          tiene_cocina: tieneCocina
        },
        fotos
      };

      if (deptoAEditar) {
        setListaDeptos(prev => prev.map(d => d.id === deptoAEditar.id ? nuevoDepto : d));
      } else {
        setListaDeptos(prev => [...prev, nuevoDepto]);
      }

      await registrarLogSistema(adminId, {
        accion: deptoAEditar ? "MODIFICAR_DEPARTAMENTO" : "CREAR_DEPARTAMENTO",
        descripcion: deptoAEditar
          ? `Se actualizó el departamento "${identificador}" (Demo)`
          : `Se creó el departamento "${identificador}" (Demo)`,
        detalles: { id: nuevoDepto.id, identificador }
      });

      setMostrarModal(false);
      setGuardando(false);
      return;
    }

    try {
      const payload = {
        admin_id: adminId,
        identificador,
        precio_alquiler: Number(precioAlquiler),
        configuracion: {
          habitaciones: Number(habitaciones),
          bano_propio: banoPropio,
          tiene_cocina: tieneCocina
        },
        fotos
      };

      if (deptoAEditar) {
        // Actualizar existente
        const { error } = await clienteSupabase
          .from("departamentos")
          .update(payload)
          .eq("id", deptoAEditar.id);
        if (error) throw error;
        await registrarLogSistema(adminId, {
          accion: "MODIFICAR_DEPARTAMENTO",
          descripcion: `Se actualizó el departamento "${identificador}"`,
          detalles: { id: deptoAEditar.id, identificador }
        });
      } else {
        // Insertar nuevo
        const { error } = await clienteSupabase
          .from("departamentos")
          .insert([payload]);
        if (error) throw error;
        await registrarLogSistema(adminId, {
          accion: "CREAR_DEPARTAMENTO",
          descripcion: `Se creó el departamento "${identificador}"`,
          detalles: { identificador }
        });
      }

      setMostrarModal(false);
      await cargarDepartamentos();
    } catch (err) {
      console.error("Error al guardar departamento:", err);
      // Muestra el mensaje gigante requerido
      setErrorAccion("⚠️ Hubo un problema al guardar. Revisa tu conexión a internet");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarDepto = async (id, ident) => {
    if (window.confirm(`¿Confirmas que deseas eliminar el departamento "${ident}"?`)) {
      if (adminId.startsWith("demo-") || adminId === "admin-prueba-id") {
        setListaDeptos(prev => prev.filter(d => d.id !== id));
        await registrarLogSistema(adminId, {
          accion: "ELIMINAR_DEPARTAMENTO",
          descripcion: `Se eliminó el departamento "${ident}" (Demo)`,
          detalles: { id }
        });
        return;
      }

      try {
        const { error } = await clienteSupabase
          .from("departamentos")
          .delete()
          .eq("id", id);
        
        if (error) throw error;
        await registrarLogSistema(adminId, {
          accion: "ELIMINAR_DEPARTAMENTO",
          descripcion: `Se eliminó el departamento "${ident}"`,
          detalles: { id }
        });
        await cargarDepartamentos();
      } catch (err) {
        console.error("Error al eliminar departamento:", err);
        setErrorAccion("⚠️ Hubo un problema al eliminar. Revisa tu conexión a internet");
      }
    }
  };

  return (
    <div className="space-y-6 pb-[100px] transicion-pantalla">
      
      {/* Cabecera Responsiva */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="titulo-grande">Departamentos</h2>
          <p className="text-sm font-semibold text-slate-500">
            Total: {listaDeptos.length} inmuebles registrados
          </p>
        </div>

        <button
          onClick={() => abrirFormulario()}
          className="boton-accion-gigante text-sm px-4 h-12 flex items-center gap-1.5"
          aria-label="Añadir nuevo departamento"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Añadir</span>
        </button>
      </div>

      {/* Cartel de Error Gigante */}
      {errorAccion && (
        <div 
          className="p-5 bg-red-100 border-l-4 border-red-600 text-red-950 font-bold rounded-r-lg flex items-start gap-3 shadow-md"
          role="alert"
        >
          <AlertCircle className="h-6 w-6 shrink-0 text-red-700" aria-hidden="true" />
          <div className="text-base font-extrabold leading-tight">
            {errorAccion}
          </div>
        </div>
      )}

      {/* Grid de Departamentos */}
      {cargando ? (
        <p className="text-center py-10 font-bold text-slate-400 animate-pulse text-lg">
          Buscando inmuebles en Supabase...
        </p>
      ) : listaDeptos.length === 0 ? (
        <div className="tarjeta-premium text-center py-16 text-slate-400 font-bold text-base">
          🏢 No hay departamentos registrados. ¡Añade tu primer inmueble arriba!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {listaDeptos.map((prop) => {
            const tieneFotos = prop.fotos && prop.fotos.length > 0;
            return (
              <article 
                key={prop.id}
                className="tarjeta-premium flex flex-col justify-between overflow-hidden relative group border-2 border-slate-200/60"
              >
                {/* Visualizador de Foto o marcador vacío */}
                <div className="h-40 -mx-5 -mt-5 mb-4 bg-slate-900 flex items-center justify-center text-slate-400 relative">
                  {tieneFotos ? (
                    <img 
                      src={prop.fotos[0]} 
                      alt={`Departamento ${prop.identificador}`}
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="text-center">
                      <Building className="h-10 w-10 mx-auto text-slate-600 mb-2" />
                      <span className="text-xs font-black uppercase text-slate-500">Sin imágenes</span>
                    </div>
                  )}

                  {/* Identificador */}
                  <div className="absolute bottom-3 left-3 bg-slate-950/85 px-3 py-1.5 rounded-lg border border-slate-700">
                    <span className="text-white font-extrabold text-sm tracking-wide">
                      {prop.identificador}
                    </span>
                  </div>
                </div>

                {/* Detalles */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Costo Base</span>
                    <span className="text-2xl font-black text-slate-900">S/ {Number(prop.precio_alquiler).toFixed(2)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-y border-slate-100 py-3 text-xs font-black text-slate-500 text-center">
                    <div>{prop.configuracion?.habitaciones || 1} Hab.</div>
                    <div className="border-x border-slate-100">
                      {prop.configuracion?.bano_propio ? "Baño Prop." : "Compart."}
                    </div>
                    <div>{prop.configuracion?.tiene_cocina ? "Cocina" : "Sin Coc."}</div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 mt-5">
                  <button
                    onClick={() => abrirFormulario(prop)}
                    className="flex-1 py-3 text-sm font-black border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => eliminarDepto(prop.id, prop.identificador)}
                    className="px-3 py-3 border border-red-200 text-red-600 bg-white hover:bg-red-50 rounded-lg flex items-center justify-center"
                    title="Eliminar departamento"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* MODAL GIGANTE DE AGREGAR / EDITAR */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col my-8 page-enter text-lg font-bold">
            
            {/* Cabecera */}
            <div className="bg-slate-950 text-white p-5 flex items-center justify-between">
              <h3 className="font-black text-lg">
                {deptoAEditar ? "Editar Departamento" : "Añadir Departamento"}
              </h3>
              <button 
                onClick={() => setMostrarModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={guardarDepto} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              
              <div>
                <label htmlFor="ident-depto" className="etiqueta-gigante">Identificador *</label>
                <input 
                  id="ident-depto"
                  type="text"
                  className="campo-entrada-gigante"
                  placeholder="Ej: Depto 101, Local 2"
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="precio-depto" className="etiqueta-gigante">Precio Base Mensual (S/) *</label>
                <input 
                  id="precio-depto"
                  type="number"
                  className="campo-entrada-gigante"
                  placeholder="Ej: 1200"
                  value={precioAlquiler}
                  onChange={(e) => setPrecioAlquiler(e.target.value)}
                  required
                  min="0"
                />
              </div>

              {/* Características */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <span className="text-xs font-black uppercase text-slate-400 block">Distribución del Inmueble</span>
                
                <div>
                  <label htmlFor="habs-depto" className="text-sm font-bold text-slate-700 block mb-1">Habitaciones</label>
                  <input 
                    id="habs-depto"
                    type="number"
                    className="w-full px-3 py-2 border border-slate-350 rounded font-bold text-sm bg-white"
                    value={habitaciones}
                    onChange={(e) => setHabitaciones(Number(e.target.value) || 1)}
                    min="1"
                    max="10"
                  />
                </div>

                <div className="flex gap-4 pt-1 text-sm font-bold text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
                      checked={banoPropio}
                      onChange={(e) => setBanoPropio(e.target.checked)}
                    />
                    <span>¿Baño Propio?</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
                      checked={tieneCocina}
                      onChange={(e) => setTieneCocina(e.target.checked)}
                    />
                    <span>¿Tiene Cocina?</span>
                  </label>
                </div>
              </div>

              {/* Fotos */}
              <div>
                <span className="etiqueta-gigante">Fotos del Inmueble</span>
                <div className="mt-2 flex items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 cursor-pointer relative bg-slate-50/50 group transition-colors duration-150">
                  <input 
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    multiple
                    onChange={manejarFotosUpload}
                  />
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-1 group-hover:text-blue-500 transition-colors" />
                    <span className="text-sm font-black text-slate-600 block">Subir imágenes</span>
                  </div>
                </div>

                {/* Previsualización */}
                {fotos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {fotos.map((f, idx) => (
                      <div key={idx} className="h-16 rounded border border-slate-200 overflow-hidden relative group">
                        <img src={f} alt="Previsualización" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => eliminarFoto(idx)}
                          className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="flex-1 boton-secundario-gigante text-base"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 boton-positivo-gigante text-base font-black"
                >
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
