import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { twMerge } from "tailwind-merge";
import { 
  Calculator, 
  User, 
  Building, 
  DollarSign, 
  MessageSquare, 
  Lightbulb, 
  TrendingUp, 
  AlertCircle, 
  FileText,
  CheckCircle,
  HelpCircle
} from "lucide-react";

// Inicialización de Supabase con variables de entorno
const urlSupabase = import.meta.env.VITE_SUPABASE_URL || "";
const claveAnonimaSupabase = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const clienteSupabase = createClient(urlSupabase, claveAnonimaSupabase);

export default function RegistroConsumo() {
  // Estados para datos
  const [listaInquilinos, setListaInquilinos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [inquilinoSeleccionado, setInquilinoSeleccionado] = useState("");
  const [datosInquilino, setDatosInquilino] = useState(null);

  // Estados del formulario de consumo
  const [lecturaActual, setLecturaActual] = useState("");
  const [lecturaAnterior, setLecturaAnterior] = useState(0);
  const [precioUnitarioLuz, setPrecioUnitarioLuz] = useState(1.0);
  const [seguridadCuota, setSeguridadCuota] = useState(15.0);
  const [alquilerBase, setAlquilerBase] = useState(0);
  const [montoAsociacion, setMontoAsociacion] = useState(0);
  const [tieneVehiculo, setTieneVehiculo] = useState(false);
  const [tipoVehiculo, setTipoVehiculo] = useState("");
  const [placaVehiculo, setPlacaVehiculo] = useState("");

  // Estados de control
  const [errorValidacion, setErrorValidacion] = useState("");
  const [exitoGuardado, setExitoGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Cargar inquilinos activos al montar el componente
  useEffect(() => {
    async function obtenerInquilinos() {
      setCargando(true);
      try {
        const { data, error } = await clienteSupabase
          .from("Inquilinos")
          .select("id, nombre, telefono, propiedad_id, vehiculo");
        
        if (error) throw error;
        setListaInquilinos(data || []);
      } catch (err) {
        console.error("Error al cargar inquilinos:", err);
      } finally {
        setCargando(false);
      }
    }
    obtenerInquilinos();
  }, []);

  // Cargar datos adicionales y lectura anterior cuando se selecciona un inquilino
  useEffect(() => {
    if (!inquilinoSeleccionado) {
      setDatosInquilino(null);
      setAlquilerBase(0);
      setMontoAsociacion(0);
      setLecturaAnterior(0);
      setTieneVehiculo(false);
      return;
    }

    async function cargarDetallesInquilino() {
      try {
        // 1. Obtener detalles del inquilino seleccionado
        const inquilino = listaInquilinos.find(i => i.id === inquilinoSeleccionado);
        if (!inquilino) return;
        setDatosInquilino(inquilino);

        // Configurar datos del vehículo/asociación
        const vehiculo = inquilino.vehiculo || {};
        setTieneVehiculo(vehiculo.tiene_vehiculo || false);
        setTipoVehiculo(vehiculo.tipo || "");
        setPlacaVehiculo(vehiculo.placa || "");
        setMontoAsociacion(Number(vehiculo.monto_asociacion) || 0);

        // 2. Obtener datos de la propiedad para sacar el alquiler base
        if (inquilino.propiedad_id) {
          const { data: propiedad, error: errorProp } = await clienteSupabase
            .from("Propiedades")
            .select("costo_base, identificador")
            .eq("id", inquilino.propiedad_id)
            .single();

          if (!errorProp && propiedad) {
            setAlquilerBase(Number(propiedad.costo_base) || 0);
            setDatosInquilino(prev => ({ ...prev, identificadorPropiedad: propiedad.identificador }));
          }
        }

        // 3. Traer automáticamente la "Lectura Anterior" desde Supabase
        const { data: mensualidades, error: errorMens } = await clienteSupabase
          .from("Mensualidades")
          .select("servicios")
          .eq("inquilino_id", inquilinoSeleccionado)
          .order("id", { ascending: false });

        if (!errorMens && mensualidades && mensualidades.length > 0) {
          // Buscar en el historial la última lectura real registrada
          const ultimaFacturaConLuz = mensualidades.find(
            m => m.servicios?.luz?.lectura_actual !== undefined
          );
          if (ultimaFacturaConLuz) {
            setLecturaAnterior(Number(ultimaFacturaConLuz.servicios.luz.lectura_actual) || 0);
          } else {
            setLecturaAnterior(0);
          }
        } else {
          setLecturaAnterior(0);
        }

        // Cargar precios estándar desde configuración global si existen
        const { data: config, error: errorConfig } = await clienteSupabase
          .from("Configuracion")
          .select("tarifas")
          .limit(1)
          .single();

        if (!errorConfig && config?.tarifas) {
          setPrecioUnitarioLuz(Number(config.tarifas.luz) || 1.0);
        }

      } catch (err) {
        console.error("Error al cargar detalles del inquilino:", err);
      }
    }

    cargarDetallesInquilino();
  }, [inquilinoSeleccionado, listaInquilinos]);

  // Cálculos matemáticos en tiempo real
  const diferenciaConsumo = Math.max(0, (Number(lecturaActual) || 0) - lecturaAnterior);
  const subtotalLuz = diferenciaConsumo * precioUnitarioLuz;
  
  // Fórmula: (Actual - Anterior) * PrecioUnitario + AlquilerBase + Seguridad
  // IMPORTANTE: El monto de la "Asociación/Moto" debe aparecer como una nota informativa, pero NO sumarse al total del administrador.
  const totalAdministrador = subtotalLuz + alquilerBase + seguridadCuota;

  // Obtener el mes actual formateado en español simple usando date-fns
  const nombreMes = format(new Date(), "MMMM", { locale: es });
  const mesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
  const periodoActual = `${format(new Date(), "MM")}-${format(new Date(), "yyyy")}`;

  // Validaciones de accesibilidad (WCAG) y lógica de negocio
  const esLecturaInvalida = Number(lecturaActual) < lecturaAnterior;

  const registrarConsumoEnBaseDeDatos = async (e) => {
    e.preventDefault();
    if (!inquilinoSeleccionado) {
      setErrorValidacion("Debe seleccionar un inquilino antes de registrar.");
      return;
    }
    if (!lecturaActual) {
      setErrorValidacion("El campo de Lectura Actual de Luz es requerido.");
      return;
    }
    if (esLecturaInvalida) {
      setErrorValidacion("La Lectura Actual no puede ser menor a la Lectura Anterior.");
      return;
    }

    setGuardando(true);
    setErrorValidacion("");
    setExitoGuardado(false);

    try {
      const payload = {
        inquilino_id: inquilinoSeleccionado,
        mes_anio: periodoActual,
        estado: "Pendiente",
        servicios: {
          luz: {
            aplica: true,
            lectura_anterior: lecturaAnterior,
            lectura_actual: Number(lecturaActual),
            subtotal: subtotalLuz
          },
          agua: {
            aplica: false,
            lectura_anterior: 0,
            lectura_actual: 0,
            subtotal: 0
          },
          seguridad: {
            aplica: true,
            subtotal: seguridadCuota
          }
        },
        total_cobrado: totalAdministrador
      };

      const { error } = await clienteSupabase
        .from("Mensualidades")
        .insert([payload]);

      if (error) throw error;

      setExitoGuardado(true);
      setLecturaActual("");
    } catch (err) {
      console.error("Error al registrar cobro:", err);
      setErrorValidacion("Ocurrió un error al guardar en la base de datos.");
    } finally {
      setGuardando(false);
    }
  };

  // Generar link de WhatsApp con mensaje pre-armado y cuentas del administrador
  const generarWhatsAppEnlace = () => {
    if (!datosInquilino) return "#";

    const celularInquilino = datosInquilino.telefono.replace(/\D/g, "");
    const telefonoConCodigo = celularInquilino.startsWith("51") ? celularInquilino : `51${celularInquilino}`;

    // Obtener cuentas predefinidas del administrador
    const titular = "Mario Andres Castro Ascencio";
    const cuentaYape = "987654321";
    const cuentaBCP = "191-98765432-0-12";
    const cciBCP = "002-19198765432012-54";

    let textoMensaje = `*🏢 BOLETA DE SERVICIOS - DEPTO ${datosInquilino.identificadorPropiedad || "N/A"}*\n\n`;
    textoMensaje += `Estimado(a) *${datosInquilino.nombre}*, se ha registrado su consumo del mes de *${mesCapitalizado}*:\n\n`;
    
    textoMensaje += `*📋 Detalle del Recibo:*\n`;
    textoMensaje += `• Alquiler Base: S/ ${alquilerBase.toFixed(2)}\n`;
    textoMensaje += `• Consumo Luz (Lectura: ${lecturaActual || 0} - Anterior: ${lecturaAnterior} = ${diferenciaConsumo} kWh): S/ ${subtotalLuz.toFixed(2)}\n`;
    textoMensaje += `• Seguridad y Mantenimiento: S/ ${seguridadCuota.toFixed(2)}\n\n`;

    textoMensaje += `*💰 TOTAL A PAGAR: S/ ${totalAdministrador.toFixed(2)}*\n\n`;

    // Incluir nota informativa del vehículo/asociación si aplica (NO sumado al total)
    if (tieneVehiculo && montoAsociacion > 0) {
      textoMensaje += `*⚠️ NOTA INFORMATIVA DE COCHERA:*\n`;
      textoMensaje += `• Costo de parqueo de ${tipoVehiculo} (Placa: ${placaVehiculo}) es de S/ ${montoAsociacion.toFixed(2)}. Este concepto debe ser cancelado directamente a la asociación de cocheras.\n\n`;
    }

    textoMensaje += `------------------------------------------\n`;
    textoMensaje += `*💸 Métodos de Pago Propietario:*\n`;
    textoMensaje += `📱 *Yape:* ${cuentaYape} (${titular})\n`;
    textoMensaje += `🏦 *BCP:* ${cuentaBCP}\n`;
    textoMensaje += `   *CCI:* ${cciBCP}\n\n`;
    textoMensaje += `_Por favor envíe el voucher una vez realizado el abono._\n`;
    textoMensaje += `¡Muchas gracias! 🙏🏼`;

    const textoCodificado = encodeURIComponent(textoMensaje);
    return `https://api.whatsapp.com/send?phone=${telefonoConCodigo}&text=${textoCodificado}`;
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-900">
      <div className="max-w-3xl mx-auto">
        {/* Cabecera del Módulo */}
        <header className="mb-8 flex items-center gap-4 bg-slate-950 p-6 rounded-2xl shadow-xl text-white">
          <div className="bg-blue-600 p-4 rounded-xl text-white shadow-lg shadow-blue-500/20" aria-hidden="true">
            <Calculator className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Registro de Consumo</h1>
            <p className="text-sm font-semibold text-slate-400">
              AlquilerApp • Periodo de Facturación: <strong className="text-blue-400 font-bold">{mesCapitalizado}</strong>
            </p>
          </div>
        </header>

        {/* Notificaciones de Estado */}
        {errorValidacion && (
          <div 
            className="mb-6 p-4 bg-red-100 border-l-4 border-status-danger text-red-950 font-bold text-sm rounded-r-lg flex items-start gap-3 shadow-md"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="block font-black text-base mb-1">Error de Validación</span>
              <span>{errorValidacion}</span>
            </div>
          </div>
        )}

        {exitoGuardado && (
          <div 
            className="mb-6 p-5 bg-emerald-100 border-l-4 border-status-success text-emerald-950 font-bold text-sm rounded-r-lg flex items-start gap-3 shadow-md"
            role="status"
          >
            <CheckCircle className="h-6 w-6 shrink-0 text-emerald-600" aria-hidden="true" />
            <div className="flex-1">
              <span className="block font-black text-lg text-emerald-900 mb-1">¡Registro Exitoso!</span>
              <span className="block mb-4">El consumo ha sido registrado correctamente en la base de datos de Supabase.</span>
              
              {/* Botón de Enlace WhatsApp Gigante y Accesible */}
              <a
                href={generarWhatsAppEnlace()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-[#25d366] hover:bg-[#1da851] text-white font-extrabold text-base rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 focus:ring-4 focus:ring-emerald-500 focus:outline-none"
                aria-label={`Enviar comprobante del mes de ${mesCapitalizado} a ${datosInquilino?.nombre} por WhatsApp`}
              >
                <MessageSquare className="h-6 w-6" aria-hidden="true" />
                <span>Enviar Comprobante por WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* Tarjeta de Formulario Principal */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xl">
          <h2 className="text-xl font-extrabold text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-500" aria-hidden="true" />
            <span>Datos del Recibo Mensual</span>
          </h2>

          <form onSubmit={registrarConsumoEnBaseDeDatos} className="space-y-6">
            
            {/* 1. SELECCIONAR INQUILINO */}
            <div className="space-y-2">
              <label htmlFor="inquilino-select" className="block text-base font-black text-slate-700">
                Seleccionar Inquilino *
              </label>
              <div className="relative">
                <select
                  id="inquilino-select"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-4 focus:ring-blue-600 focus:border-blue-600 focus:bg-white focus:outline-none transition-all duration-200"
                  value={inquilinoSeleccionado}
                  onChange={(e) => setInquilinoSeleccionado(e.target.value)}
                  disabled={cargando}
                  required
                >
                  <option value="">Seleccione un arrendatario...</option>
                  {listaInquilinos.map(inq => (
                    <option key={inq.id} value={inq.id}>
                      {inq.nombre}
                    </option>
                  ))}
                </select>
                <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" aria-hidden="true" />
              </div>
              {cargando && <p className="text-xs font-semibold text-slate-400 animate-pulse">Buscando arrendatarios en Supabase...</p>}
            </div>

            {/* Ficha Resumen Informativa del Inquilino y Departamento */}
            {datosInquilino && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4 page-enter">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Building className="h-4 w-4" aria-hidden="true" />
                  <span>Resumen de Arrendamiento</span>
                </h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm font-bold text-slate-700">
                  <div className="bg-white p-3 rounded-lg border border-slate-200/50">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Departamento</span>
                    <span className="text-base text-slate-900 font-extrabold">Depto {datosInquilino.identificadorPropiedad || "Cargando..."}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200/50">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Alquiler Base</span>
                    <span className="text-base text-slate-900 font-extrabold">S/ {alquilerBase.toFixed(2)}</span>
                  </div>
                </div>

                {/* NOTA INFORMATIVA DE VEHÍCULO (ASOCIACIÓN / MOTO) */}
                {tieneVehiculo && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="text-xs text-amber-900 font-semibold leading-relaxed">
                      <span className="block font-black text-sm text-amber-950 mb-1">
                        Nota Informativa de Cochera ({tipoVehiculo})
                      </span>
                      <span>
                        El inquilino posee un vehículo registrado con placa <strong>{placaVehiculo}</strong>. 
                        El costo mensual de cochera es de <strong>S/ {montoAsociacion.toFixed(2)}</strong>.
                      </span>
                      <span className="block mt-2 font-bold text-[11px] text-amber-950 underline">
                        * IMPORTANTE: Este concepto se registra solo para información y no está sumado en el cobro del administrador.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. LECTURAS DE ELECTRICIDAD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Lectura Anterior (Cargada Automáticamente) */}
              <div className="space-y-2">
                <label htmlFor="lectura-anterior" className="block text-sm font-bold text-slate-500">
                  Lectura Anterior de Luz (kWh)
                </label>
                <div className="relative">
                  <input
                    id="lectura-anterior"
                    type="number"
                    className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500 cursor-not-allowed focus:outline-none"
                    value={lecturaAnterior}
                    readOnly
                  />
                  <Lightbulb className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Traída automáticamente desde historial</p>
              </div>

              {/* Lectura Actual (Solicitada al usuario) */}
              <div className="space-y-2">
                <label htmlFor="lectura-actual" className="block text-sm font-black text-slate-700">
                  Lectura Actual de Luz (kWh) *
                </label>
                <div className="relative">
                  <input
                    id="lectura-actual"
                    type="number"
                    className={twMerge(
                      "w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl font-extrabold text-slate-900 focus:ring-4 focus:outline-none transition-all duration-200",
                      esLecturaInvalida
                        ? "border-status-danger focus:ring-red-100 focus:border-status-danger"
                        : "border-slate-300 focus:ring-blue-600 focus:border-blue-600 focus:bg-white"
                    )}
                    placeholder="Ingrese lectura"
                    value={lecturaActual}
                    onChange={(e) => setLecturaActual(e.target.value)}
                    aria-invalid={esLecturaInvalida}
                    aria-describedby={esLecturaInvalida ? "error-lectura-actual" : undefined}
                    disabled={!inquilinoSeleccionado}
                    min="0"
                    required
                  />
                  <TrendingUp className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                {esLecturaInvalida && (
                  <p id="error-lectura-actual" className="text-xs font-bold text-status-danger">
                    La lectura actual no puede ser menor a {lecturaAnterior}
                  </p>
                )}
              </div>
            </div>

            {/* Ajustes de tarifas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label htmlFor="tarifa-luz" className="block text-xs font-bold text-slate-500">
                  Tarifa por kWh (S/)
                </label>
                <input
                  id="tarifa-luz"
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 font-bold bg-slate-50"
                  value={precioUnitarioLuz}
                  onChange={(e) => setPrecioUnitarioLuz(Number(e.target.value) || 0)}
                  disabled={!inquilinoSeleccionado}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="cuota-seguridad" className="block text-xs font-bold text-slate-500">
                  Cuota de Seguridad / Mantenimiento (S/)
                </label>
                <input
                  id="cuota-seguridad"
                  type="number"
                  step="0.1"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 font-bold bg-slate-50"
                  value={seguridadCuota}
                  onChange={(e) => setSeguridadCuota(Number(e.target.value) || 0)}
                  disabled={!inquilinoSeleccionado}
                />
              </div>
            </div>

            {/* PANEL DE CÁLCULO Y LIQUIDACIÓN FINAL */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-4 shadow-inner">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <FileText className="h-4 w-4" aria-hidden="true" />
                <span>Desglose de Facturación</span>
              </h3>

              <div className="space-y-2.5 text-sm font-semibold text-slate-300">
                <div className="flex justify-between">
                  <span>Renta Alquiler Base:</span>
                  <span className="font-extrabold text-white">S/ {alquilerBase.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Servicio de Luz ({diferenciaConsumo} kWh):</span>
                  <span className="font-extrabold text-white">S/ {subtotalLuz.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Seguridad y Mantenimiento:</span>
                  <span className="font-extrabold text-white">S/ {seguridadCuota.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-slate-850 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">Monto Total a Cobrar</span>
                  <span className="text-3xl font-black text-blue-400 tracking-tight">S/ {totalAdministrador.toFixed(2)}</span>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Cuentas Propietario</span>
                  <span className="text-xs font-bold text-slate-300 block">BCP / Yape / Plin</span>
                </div>
              </div>
            </div>

            {/* BOTÓN REGISTRAR GIGANTE Y ACCESIBLE */}
            <button
              type="submit"
              disabled={guardando || !inquilinoSeleccionado || esLecturaInvalida}
              className={twMerge(
                "w-full py-4.5 px-8 font-black text-lg tracking-wide rounded-2xl text-white transition-all duration-200 flex items-center justify-center gap-2.5 shadow-xl focus:ring-4 focus:ring-blue-500 focus:outline-none",
                guardando || !inquilinoSeleccionado || esLecturaInvalida
                  ? "bg-slate-300 cursor-not-allowed shadow-none"
                  : "bg-blue-700 hover:bg-blue-800 shadow-blue-500/10"
              )}
              aria-label="Registrar Consumo Eléctrico y Liquidar Mensualidad"
            >
              {guardando ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" aria-hidden="true"></div>
                  <span>Procesando Liquidación...</span>
                </>
              ) : (
                <>
                  <DollarSign className="h-6 w-6" aria-hidden="true" />
                  <span>Registrar y Emitir Liquidación</span>
                </>
              )}
            </button>

          </form>
        </section>
      </div>
    </main>
  );
}
