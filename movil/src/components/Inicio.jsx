import React, { useState, useEffect } from "react";
import { clienteSupabase } from "../config/supabase";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
  BarChart3,
  HelpCircle
} from "lucide-react";

export default function Inicio({ sesion }) {
  // Datos del admin
  const adminId = sesion?.user?.id;

  // Estados de carga de datos
  const [listaInquilinos, setListaInquilinos] = useState([]);
  const [listaLecturas, setListaLecturas] = useState([]);
  const [datosPerfil, setDatosPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Estados de cálculo y formulario
  const [inquilinoSeleccionado, setInquilinoSeleccionado] = useState("");
  const [lecturaActual, setLecturaActual] = useState("");
  const [lecturaAnterior, setLecturaAnterior] = useState(0);
  const [precioUnitarioLuz, setPrecioUnitarioLuz] = useState(1.0);
  const [precioUnitarioAgua, setPrecioUnitarioAgua] = useState(4.0);
  const [seguridadCuota, setSeguridadCuota] = useState(15.0);
  
  // Datos del inquilino seleccionado
  const [alquilerBase, setAlquilerBase] = useState(0);
  const [motoPlaca, setMotoPlaca] = useState("");
  const [motoCosto, setMotoCosto] = useState(0);
  const [tieneMoto, setTieneMoto] = useState(false);
  const [nombreDepto, setNombreDepto] = useState("");

  // Estados de control
  const [errorGuardado, setErrorGuardado] = useState("");
  const [exitoGuardado, setExitoGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Obtener mes actual formateado en español con date-fns
  const nombreMes = format(new Date(), "MMMM", { locale: es });
  const mesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
  const periodoActual = `${mesCapitalizado} ${format(new Date(), "yyyy")}`;

  // Cargar datos al iniciar y cuando cambie el admin
  const cargarDatos = async () => {
    if (!adminId) return;
    setCargando(true);
    setErrorGuardado("");
    try {
      // 1. Cargar Perfil del Propietario (Caja Fuerte)
      const { data: perfil, error: errPerfil } = await clienteSupabase
        .from("perfiles")
        .select("nombre_completo, datos_pago")
        .eq("id", adminId)
        .single();
      if (!errPerfil) setDatosPerfil(perfil);

      // 2. Cargar Inquilinos del administrador
      const { data: inqs, error: errInqs } = await clienteSupabase
        .from("inquilinos")
        .select("id, nombre, celular, depto_id, moto_info, documentos")
        .eq("admin_id", adminId);
      if (errInqs) throw errInqs;
      setListaInquilinos(inqs || []);

      // 3. Cargar Lecturas Mensuales del administrador
      const { data: lects, error: errLects } = await clienteSupabase
        .from("lecturas_mensuales")
        .select("id, inquilino_id, mes, luz, agua, seguridad, pagado")
        .eq("admin_id", adminId);
      if (errLects) throw errLects;
      setListaLecturas(lects || []);

    } catch (err) {
      console.error("Error al cargar datos de Supabase:", err);
      setErrorGuardado("⚠️ Hubo un problema al cargar la información. Revisa tu conexión a internet");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [adminId]);

  // Cargar detalles específicos del inquilino seleccionado
  useEffect(() => {
    if (!inquilinoSeleccionado) {
      setAlquilerBase(0);
      setLecturaAnterior(0);
      setMotoPlaca("");
      setMotoCosto(0);
      setTieneMoto(false);
      setNombreDepto("");
      return;
    }

    const inq = listaInquilinos.find(i => i.id === inquilinoSeleccionado);
    if (!inq) return;

    async function cargarDetalle() {
      try {
        // Cargar departamento asociado
        if (inq.depto_id) {
          const { data: depto, error: errDepto } = await clienteSupabase
            .from("departamentos")
            .select("identificador, precio_alquiler")
            .eq("id", inq.depto_id)
            .single();

          if (!errDepto && depto) {
            setAlquilerBase(Number(depto.precio_alquiler) || 0);
            setNombreDepto(depto.identificador);
          }
        }

        // Configurar info de moto / cochera
        const moto = inq.moto_info || {};
        setTieneMoto(!!moto.placa);
        setMotoPlaca(moto.placa || "");
        setMotoCosto(Number(moto.monto_asociacion) || 0);

        // Traer automáticamente la "Lectura Anterior"
        const lecturasInq = listaLecturas.filter(l => l.inquilino_id === inquilinoSeleccionado);
        if (lecturasInq.length > 0) {
          // Ordenar por ID o fecha para encontrar el más reciente
          const ultimaLuz = lecturasInq.find(l => l.luz?.actual !== undefined);
          if (ultimaLuz) {
            setLecturaAnterior(Number(ultimaLuz.luz.actual) || 0);
          } else {
            setLecturaAnterior(0);
          }
        } else {
          setLecturaAnterior(0);
        }

      } catch (err) {
        console.error("Error al cargar detalles del arrendatario:", err);
      }
    }
    cargarDetalle();
  }, [inquilinoSeleccionado, listaInquilinos, listaLecturas]);

  // Cálculos de consumo eléctrico
  const consumoLuz = Math.max(0, (Number(lecturaActual) || 0) - lecturaAnterior);
  const costoLuz = consumoLuz * precioUnitarioLuz;

  // Fórmula: (Actual - Anterior) * PrecioUnitario + AlquilerBase + Seguridad
  // El costo de cochera/moto NO se suma al total del propietario
  const totalCobrar = costoLuz + alquilerBase + seguridadCuota;

  // Validación de Lectura
  const lecturaActualInvalida = Number(lecturaActual) < lecturaAnterior;

  // Métodos de Guardado
  const guardarReciboConsumo = async (e) => {
    e.preventDefault();
    if (!inquilinoSeleccionado) {
      setErrorGuardado("Selecciona un inquilino de la lista.");
      return;
    }
    if (!lecturaActual) {
      setErrorGuardado("Ingresa la Lectura Actual de Luz.");
      return;
    }
    if (lecturaActualInvalida) {
      setErrorGuardado("La Lectura Actual no puede ser menor a la Lectura Anterior.");
      return;
    }

    setGuardando(true);
    setErrorGuardado("");
    setExitoGuardado(false);

    try {
      const payload = {
        admin_id: adminId,
        inquilino_id: inquilinoSeleccionado,
        mes: periodoActual,
        luz: {
          anterior: lecturaAnterior,
          actual: Number(lecturaActual),
          costo_unitario: precioUnitarioLuz
        },
        agua: {
          anterior: 0,
          actual: 0,
          costo_unitario: precioUnitarioAgua
        },
        seguridad: seguridadCuota,
        pagado: false
      };

      const { error } = await clienteSupabase
        .from("lecturas_mensuales")
        .insert([payload]);

      if (error) throw error;

      setExitoGuardado(true);
      setLecturaActual("");
      // Recargar lista de lecturas
      await cargarDatos();
    } catch (err) {
      console.error("Error al guardar lectura:", err);
      setErrorGuardado("⚠️ Hubo un problema al guardar. Revisa tu conexión a internet");
    } finally {
      setGuardando(false);
    }
  };

  // --- CÁLCULOS DEL DASHBOARD DE GASTOS DE SERVICIOS ---
  const calcularGastosServicios = () => {
    let acumuladoLuz = 0;
    let acumuladoAgua = 0;
    let acumuladoSeguridad = 0;

    listaLecturas.forEach((lec) => {
      // Luz
      const luzInfo = lec.luz || {};
      const consumo = Math.max(0, (Number(luzInfo.actual) || 0) - (Number(luzInfo.anterior) || 0));
      acumuladoLuz += consumo * (Number(luzInfo.costo_unitario) || 1.0);

      // Agua
      const aguaInfo = lec.agua || {};
      const consAgua = Math.max(0, (Number(aguaInfo.actual) || 0) - (Number(aguaInfo.anterior) || 0));
      acumuladoAgua += consAgua * (Number(aguaInfo.costo_unitario) || 4.0);

      // Seguridad
      acumuladoSeguridad += Number(lec.seguridad) || 0;
    });

    return {
      luz: acumuladoLuz,
      agua: acumuladoAgua,
      seguridad: acumuladoSeguridad,
      total: acumuladoLuz + acumuladoAgua + acumuladoSeguridad
    };
  };

  const gastos = calcularGastosServicios();

  // Enlace para WhatsApp
  const obtenerWhatsAppUrl = () => {
    if (!inquilinoSeleccionado) return "#";
    const inq = listaInquilinos.find(i => i.id === inquilinoSeleccionado);
    if (!inq) return "#";

    const numeroCelular = inq.celular.replace(/\D/g, "");
    const telefonoDestino = numeroCelular.startsWith("51") ? numeroCelular : `51${numeroCelular}`;

    const titular = datosPerfil?.nombre_completo || "Mario Andres Castro Ascencio";
    const yape = datosPerfil?.datos_pago?.yape || "987654321";
    const bcp = datosPerfil?.datos_pago?.bcp_cuenta || "191-98765432-0-12";
    const cci = datosPerfil?.datos_pago?.bcp_cci || "002-19198765432012-54";

    let texto = `*🏢 COMPROBANTE - PERIODO ${periodoActual.toUpperCase()}*\n\n`;
    texto += `Estimado(a) *${inq.nombre}*, se detalla el cobro mensual para *Depto ${nombreDepto || "N/A"}*:\n\n`;
    texto += `*Conceptos del Recibo:*\n`;
    texto += `• Alquiler Mensual: S/ ${alquilerBase.toFixed(2)}\n`;
    texto += `• Energía Eléctrica (Luz: ${lecturaActual || 0} - Anterior: ${lecturaAnterior} = ${consumoLuz} kWh): S/ ${costoLuz.toFixed(2)}\n`;
    texto += `• Seguridad y Vigilancia: S/ ${seguridadCuota.toFixed(2)}\n\n`;
    texto += `*💰 TOTAL A PAGAR: S/ ${totalCobrar.toFixed(2)}*\n\n`;

    if (tieneMoto && motoCosto > 0) {
      texto += `*⚠️ NOTA DE COCHERA (NO SUMADO AL TOTAL):*\n`;
      texto += `• El cobro por mantenimiento de cochera de la moto con placa *${motoPlaca}* es de S/ ${motoCosto.toFixed(2)}. Este concepto es informativo y debe ser cancelado directamente al encargado de la asociación.\n\n`;
    }

    texto += `------------------------------------------\n`;
    texto += `*💸 Métodos de Pago:*\n`;
    texto += `📱 *Yape/Plin:* ${yape} (${titular})\n`;
    texto += `🏦 *BCP:* ${bcp}\n`;
    texto += `   *CCI:* ${cci}\n\n`;
    texto += `_Muchas gracias por su puntualidad. Por favor envíe la captura del recibo._`;

    return `https://api.whatsapp.com/send?phone=${telefonoDestino}&text=${encodeURIComponent(texto)}`;
  };

  return (
    <div className="space-y-8 pb-[100px] transicion-pantalla">
      
      {/* Mensajes de error gigantes */}
      {errorGuardado && (
        <div 
          className="p-5 bg-red-100 border-l-4 border-red-600 text-red-950 font-bold rounded-r-lg flex items-start gap-3 shadow-md"
          role="alert"
        >
          <AlertCircle className="h-6 w-6 shrink-0 text-red-700" aria-hidden="true" />
          <div className="text-base font-extrabold leading-tight">
            {errorGuardado}
          </div>
        </div>
      )}

      {/* Mensaje de éxito */}
      {exitoGuardado && (
        <div 
          className="p-5 bg-green-100 border-l-4 border-green-600 text-green-950 font-bold rounded-r-lg flex flex-col gap-4 shadow-md"
          role="status"
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 shrink-0 text-green-700" aria-hidden="true" />
            <div>
              <span className="block font-black text-lg text-green-950 mb-1">Recibo Creado</span>
              <p className="text-base font-extrabold leading-tight">El consumo de luz mensual se guardó con éxito en la Caja Fuerte.</p>
            </div>
          </div>
          <a
            href={obtenerWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full boton-positivo-gigante flex items-center justify-center gap-2"
          >
            <MessageSquare className="h-6 w-6" aria-hidden="true" />
            <span>Enviar Recibo por WhatsApp</span>
          </a>
        </div>
      )}

      {/* ================= 1. DASHBOARD DE GASTOS POR SERVICIO ================= */}
      <section className="tarjeta-premium bg-white border border-slate-200 shadow-xl space-y-5">
        <h2 className="titulo-mediano flex items-center gap-2 border-b border-slate-100 pb-3">
          <BarChart3 className="h-6 w-6 text-blue-600" aria-hidden="true" />
          <span>Cobros y Gastos por Servicio</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Luz Eléctrica</span>
            <span className="text-2xl font-black text-blue-800 mt-2">S/ {gastos.luz.toFixed(2)}</span>
          </div>
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Agua Potable</span>
            <span className="text-2xl font-black text-cyan-800 mt-2">S/ {gastos.agua.toFixed(2)}</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Seguridad / Mant.</span>
            <span className="text-2xl font-black text-emerald-800 mt-2">S/ {gastos.seguridad.toFixed(2)}</span>
          </div>
        </div>

        {/* Gráfico SVG de barras de alto contraste para accesibilidad */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-4">Gráfico Comparativo de Servicios</span>
          
          {gastos.total === 0 ? (
            <p className="text-sm font-bold text-slate-400 text-center italic py-4">No hay lecturas registradas para graficar</p>
          ) : (
            <div className="space-y-4">
              {/* Barra Luz */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Luz Eléctrica</span>
                  <span>{Math.round((gastos.luz / gastos.total) * 100)}%</span>
                </div>
                <div className="w-full h-7 bg-slate-200 rounded-md overflow-hidden flex items-center">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300 flex items-center pl-2 text-white text-[10px] font-black"
                    style={{ width: `${Math.max(8, (gastos.luz / gastos.total) * 100)}%` }}
                  >
                    S/ {gastos.luz.toFixed(0)}
                  </div>
                </div>
              </div>

              {/* Barra Agua */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Agua Potable</span>
                  <span>{Math.round((gastos.agua / gastos.total) * 100)}%</span>
                </div>
                <div className="w-full h-7 bg-slate-200 rounded-md overflow-hidden flex items-center">
                  <div 
                    className="h-full bg-cyan-500 transition-all duration-300 flex items-center pl-2 text-white text-[10px] font-black"
                    style={{ width: `${Math.max(8, (gastos.agua / gastos.total) * 100)}%` }}
                  >
                    S/ {gastos.agua.toFixed(0)}
                  </div>
                </div>
              </div>

              {/* Barra Seguridad */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Seguridad y Mantenimiento</span>
                  <span>{Math.round((gastos.seguridad / gastos.total) * 100)}%</span>
                </div>
                <div className="w-full h-7 bg-slate-200 rounded-md overflow-hidden flex items-center">
                  <div 
                    className="h-full bg-emerald-600 transition-all duration-300 flex items-center pl-2 text-white text-[10px] font-black"
                    style={{ width: `${Math.max(8, (gastos.seguridad / gastos.total) * 100)}%` }}
                  >
                    S/ {gastos.seguridad.toFixed(0)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================= 2. CALCULADORA DE REGISTRO DE CONSUMO ================= */}
      <section className="tarjeta-premium bg-white border border-slate-200 shadow-xl space-y-6">
        <h2 className="titulo-mediano flex items-center gap-2 border-b border-slate-100 pb-3">
          <Calculator className="h-6 w-6 text-blue-600" aria-hidden="true" />
          <span>Registro de Consumo Eléctrico</span>
        </h2>

        <form onSubmit={guardarReciboConsumo} className="space-y-6">
          
          {/* Seleccionar Inquilino */}
          <div className="space-y-2">
            <label htmlFor="inquilino-select" className="etiqueta-gigante">
              Seleccionar Inquilino *
            </label>
            <div className="relative">
              <select
                id="inquilino-select"
                className="campo-entrada-gigante pl-11 pr-4 font-black"
                value={inquilinoSeleccionado}
                onChange={(e) => setInquilinoSeleccionado(e.target.value)}
                required
              >
                <option value="">Seleccione un inquilino...</option>
                {listaInquilinos.map(inq => (
                  <option key={inq.id} value={inq.id}>
                    {inq.nombre}
                  </option>
                ))}
              </select>
              <User className="absolute left-4 top-4.5 h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
          </div>

          {/* Información contextual del inquilino y nota de moto */}
          {inquilinoSeleccionado && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 page-enter text-sm font-bold text-slate-700">
              <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100">
                <span>Departamento:</span>
                <span className="font-black text-slate-900 text-base">Depto {nombreDepto || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100">
                <span>Costo Alquiler Base:</span>
                <span className="font-black text-slate-900 text-base">S/ {alquilerBase.toFixed(2)}</span>
              </div>

              {/* NOTA INFORMATIVA DE MOTO (COCHERA) - NO SUMADO AL TOTAL DEL ADMINISTRADOR */}
              {tieneMoto && motoCosto > 0 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-950 p-4 rounded-lg flex items-start gap-3 mt-2">
                  <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="text-xs font-semibold leading-relaxed">
                    <span className="block font-black text-sm text-amber-950 mb-1">Nota Informativa de Parqueo (Moto)</span>
                    <span>El inquilino posee un vehículo registrado con placa <strong>{motoPlaca}</strong>. El costo de parqueo de moto es de <strong>S/ {motoCosto.toFixed(2)}</strong>.</span>
                    <span className="block font-bold text-[10px] text-amber-900 mt-2 italic">* Este concepto es meramente informativo y NO está sumado en el recibo final del propietario.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Lecturas Luz */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="lect-ant" className="block text-sm font-bold text-slate-500">
                Lectura Anterior de Luz (kWh)
              </label>
              <div className="relative">
                <input
                  id="lect-ant"
                  type="number"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-[8px] font-bold text-slate-500 cursor-not-allowed focus:outline-none"
                  value={lecturaAnterior}
                  readOnly
                />
                <Lightbulb className="absolute left-4 top-4.5 h-5 w-5 text-slate-400" aria-hidden="true" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="lect-act" className="etiqueta-gigante">
                Lectura Actual de Luz (kWh) *
              </label>
              <div className="relative">
                <input
                  id="lect-act"
                  type="number"
                  className={twMerge(
                    "campo-entrada-gigante pl-11",
                    lecturaActualInvalida ? "border-red-500 focus:ring-red-100" : ""
                  )}
                  placeholder="0"
                  value={lecturaActual}
                  onChange={(e) => setLecturaActual(e.target.value)}
                  disabled={!inquilinoSeleccionado}
                  required
                  min="0"
                />
                <TrendingUp className="absolute left-4 top-4.5 h-5 w-5 text-slate-400" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* Ajuste de Tarifas y Seguridad */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label htmlFor="tarifa-luz" className="text-xs font-bold text-slate-400 uppercase">Tarifa Luz/kWh (S/)</label>
              <input
                id="tarifa-luz"
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-600 rounded font-bold text-sm"
                value={precioUnitarioLuz}
                onChange={(e) => setPrecioUnitarioLuz(Number(e.target.value) || 0)}
                disabled={!inquilinoSeleccionado}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="seguridad" className="text-xs font-bold text-slate-400 uppercase">Seguridad (S/)</label>
              <input
                id="seguridad"
                type="number"
                step="0.1"
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-600 rounded font-bold text-sm"
                value={seguridadCuota}
                onChange={(e) => setSeguridadCuota(Number(e.target.value) || 0)}
                disabled={!inquilinoSeleccionado}
              />
            </div>
          </div>

          {/* Panel Desglose Numérico */}
          <div className="bg-slate-900 rounded-xl p-5 text-white space-y-3 shadow-inner">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
              Desglose de Pago
            </h3>
            <div className="space-y-2 text-sm font-semibold text-slate-300">
              <div className="flex justify-between">
                <span>Alquiler de Depto:</span>
                <span>S/ {alquilerBase.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Consumo de Luz ({consumoLuz} kWh):</span>
                <span>S/ {costoLuz.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Vigilancia y Seguridad:</span>
                <span>S/ {seguridadCuota.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-slate-850 pt-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total a Cobrar</span>
                <span className="text-2xl font-black text-blue-400">S/ {totalCobrar.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Botón de envío Gigante (Submit es palabra prohibida) */}
          <button
            type="submit"
            disabled={guardando || !inquilinoSeleccionado || lecturaActualInvalida}
            className={twMerge(
              "w-full py-4.5 px-8 font-black text-lg tracking-wide rounded-2xl text-white transition-all duration-200 flex items-center justify-center gap-2.5 shadow-xl focus:ring-4 focus:ring-blue-500 focus:outline-none",
              guardando || !inquilinoSeleccionado || lecturaActualInvalida
                ? "bg-slate-300 cursor-not-allowed shadow-none"
                : "bg-blue-700 hover:bg-blue-800 shadow-blue-500/10"
            )}
            aria-label="Guardar Recibo de Consumo"
          >
            {guardando ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" aria-hidden="true"></div>
                <span>Guardando Recibo...</span>
              </>
            ) : (
              <>
                <DollarSign className="h-5 w-5" aria-hidden="true" />
                <span>Guardar Recibo</span>
              </>
            )}
          </button>

        </form>
      </section>
    </div>
  );
}
