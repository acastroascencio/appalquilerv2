import React, { useState, useEffect } from "react";
import { clienteSupabase } from "../config/supabase";
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
  BarChart3,
  HelpCircle,
  Droplet,
  Shield
} from "lucide-react";

export default function Inicio({ sesion }) {
  // Datos del admin
  const adminId = sesion?.user?.id;

  // Estados de carga de datos
  const [listaInquilinos, setListaInquilinos] = useState([]);
  const [listaLecturas, setListaLecturas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mesFiltro, setMesFiltro] = useState("Mayo 2026");

  // Obtener meses únicos de lecturas
  const mesesDisponibles = Array.from(new Set(listaLecturas.map(l => l.mes)));

  useEffect(() => {
    if (mesesDisponibles.length > 0 && !mesesDisponibles.includes(mesFiltro)) {
      setMesFiltro(mesesDisponibles[0]);
    }
  }, [listaLecturas]);

  // Estados de control
  const [errorGuardado, setErrorGuardado] = useState("");

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
      if (adminId.startsWith("demo-") || adminId === "admin-prueba-id") {
        let demoInqs = [
          { id: "inq-mario-1", nombre: "Juan Pérez García", celular: "946131777", depto_id: "prop-mario-1", moto_info: { placa: "ABC-123", monto_asociacion: 50 } },
          { id: "inq-mario-2", nombre: "María López Rodríguez", celular: "912345678", depto_id: "prop-mario-2", moto_info: { placa: "", monto_asociacion: 0 } },
          { id: "inq-mario-3", nombre: "Pedro Alcántara Vega", celular: "988888888", depto_id: "prop-mario-3", moto_info: { placa: "XYZ-789", monto_asociacion: 40 } }
        ];

        let demoLects = [
          { id: "lec-mario-1", inquilino_id: "inq-mario-1", mes: "Mayo 2026", luz: { anterior: 1020, actual: 1080, costo_unitario: 1.0 }, agua: { anterior: 110, actual: 118, costo_unitario: 4.0 }, seguridad: 15, pagado: false },
          { id: "lec-mario-2", inquilino_id: "inq-mario-2", mes: "Mayo 2026", luz: { anterior: 2040, actual: 2080, costo_unitario: 1.0 }, agua: { anterior: 350, actual: 362, costo_unitario: 4.0 }, seguridad: 15, pagado: true },
          { id: "lec-mario-3", inquilino_id: "inq-mario-3", mes: "Mayo 2026", luz: { anterior: 1500, actual: 1550, costo_unitario: 1.0 }, agua: { anterior: 100, actual: 105, costo_unitario: 4.0 }, seguridad: 15, pagado: false }
        ];

        // Cambiar datos si es otro administrador
        if (adminId === "demo-sofia") {
          demoInqs = [
            { id: "inq-sofia-1", nombre: "Carlos Fuentes Romero", celular: "999111222", depto_id: "prop-sofia-1", moto_info: { placa: "", monto_asociacion: 0 } },
            { id: "inq-sofia-2", nombre: "Ana Gómez Solís", celular: "999333444", depto_id: "prop-sofia-2", moto_info: { placa: "MNO-456", monto_asociacion: 30 } },
            { id: "inq-sofia-3", nombre: "Roberto Díaz Canseco", celular: "999555666", depto_id: "prop-sofia-3", moto_info: { placa: "", monto_asociacion: 0 } },
            { id: "inq-sofia-4", nombre: "Lucía Mendez Castro", celular: "999777888", depto_id: "prop-sofia-4", moto_info: { placa: "789-DEF", monto_asociacion: 45 } }
          ];

          demoLects = [
            { id: "lec-sofia-1", inquilino_id: "inq-sofia-1", mes: "Mayo 2026", luz: { anterior: 500, actual: 545, costo_unitario: 1.2 }, agua: { anterior: 80, actual: 85, costo_unitario: 4.5 }, seguridad: 20, pagado: true },
            { id: "lec-sofia-2", inquilino_id: "inq-sofia-2", mes: "Mayo 2026", luz: { anterior: 1200, actual: 1260, costo_unitario: 1.2 }, agua: { anterior: 210, actual: 219, costo_unitario: 4.5 }, seguridad: 20, pagado: false },
            { id: "lec-sofia-3", inquilino_id: "inq-sofia-3", mes: "Mayo 2026", luz: { anterior: 800, actual: 840, costo_unitario: 1.2 }, agua: { anterior: 120, actual: 124, costo_unitario: 4.5 }, seguridad: 20, pagado: true },
            { id: "lec-sofia-4", inquilino_id: "inq-sofia-4", mes: "Mayo 2026", luz: { anterior: 2300, actual: 2370, costo_unitario: 1.2 }, agua: { anterior: 310, actual: 316, costo_unitario: 4.5 }, seguridad: 20, pagado: false }
          ];
        } else if (adminId === "demo-carlos") {
          demoInqs = [
            { id: "inq-carlos-1", nombre: "Boutique Bella S.A.C.", celular: "987111111", depto_id: "prop-carlos-1", moto_info: { placa: "", monto_asociacion: 0 } },
            { id: "inq-carlos-2", nombre: "Farmacia FarmaVida", celular: "987222222", depto_id: "prop-carlos-2", moto_info: { placa: "F-4563", monto_asociacion: 60 } },
            { id: "inq-carlos-3", nombre: "Consultorio Dental Luz", celular: "987333333", depto_id: "prop-carlos-3", moto_info: { placa: "", monto_asociacion: 0 } }
          ];

          demoLects = [
            { id: "lec-carlos-1", inquilino_id: "inq-carlos-1", mes: "Mayo 2026", luz: { anterior: 3000, actual: 3200, costo_unitario: 1.5 }, agua: { anterior: 400, actual: 412, costo_unitario: 5.0 }, seguridad: 30, pagado: false },
            { id: "lec-carlos-2", inquilino_id: "inq-carlos-2", mes: "Mayo 2026", luz: { anterior: 4500, actual: 4750, costo_unitario: 1.5 }, agua: { anterior: 600, actual: 618, costo_unitario: 5.0 }, seguridad: 30, pagado: true },
            { id: "lec-carlos-3", inquilino_id: "inq-carlos-3", mes: "Mayo 2026", luz: { anterior: 1200, actual: 1280, costo_unitario: 1.5 }, agua: { anterior: 150, actual: 154, costo_unitario: 5.0 }, seguridad: 30, pagado: false }
          ];
        }

        setListaInquilinos(demoInqs);
        setListaLecturas(demoLects);
        setCargando(false);
        return;
      }

      // 1. Cargar Inquilinos del administrador
      const { data: inqs, error: errInqs } = await clienteSupabase
        .from("inquilinos")
        .select("id, nombre, celular, depto_id, moto_info, documentos")
        .eq("admin_id", adminId);
      if (errInqs) throw errInqs;
      setListaInquilinos(inqs || []);

      // 2. Cargar Lecturas Mensuales del administrador
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

  // --- CÁLCULOS DEL DASHBOARD DE GASTOS DE SERVICIOS ---
  const calcularGastosServicios = () => {
    let acumuladoLuz = 0;
    let acumuladoLuzKw = 0;
    let acumuladoAgua = 0;
    let acumuladoAguaM3 = 0;
    let acumuladoSeguridad = 0;

    const lecturasFiltradas = listaLecturas.filter(l => l.mes === mesFiltro);

    lecturasFiltradas.forEach((lec) => {
      // Luz
      const luzInfo = lec.luz || {};
      const consumo = Math.max(0, (Number(luzInfo.actual) || 0) - (Number(luzInfo.anterior) || 0));
      acumuladoLuzKw += consumo;
      acumuladoLuz += consumo * (Number(luzInfo.costo_unitario) || 1.0);

      // Agua
      const aguaInfo = lec.agua || {};
      const consAgua = Math.max(0, (Number(aguaInfo.actual) || 0) - (Number(aguaInfo.anterior) || 0));
      acumuladoAguaM3 += consAgua;
      acumuladoAgua += consAgua * (Number(aguaInfo.costo_unitario) || 4.0);

      // Seguridad
      acumuladoSeguridad += Number(lec.seguridad) || 0;
    });

    return {
      luz: acumuladoLuz,
      luzKw: acumuladoLuzKw,
      agua: acumuladoAgua,
      aguaM3: acumuladoAguaM3,
      seguridad: acumuladoSeguridad,
      total: acumuladoLuz + acumuladoAgua + acumuladoSeguridad
    };
  };

  // Helper para obtener información de inquilino y departamento
  const obtenerInquilinoInfo = (inqId) => {
    const inq = listaInquilinos.find(i => i.id === inqId);
    if (!inq) return { nombre: "Desconocido", depto: "N/A" };
    
    let deptoNombre = "N/A";
    if (adminId.startsWith("demo-") || adminId === "admin-prueba-id") {
      const demoDeptos = {
        "prop-mario-1": "Depto 2A", "prop-mario-2": "Depto 2B", "prop-mario-3": "Depto 3A",
        "prop-sofia-1": "Depto 101", "prop-sofia-2": "Depto 102", "prop-sofia-3": "Depto 201", "prop-sofia-4": "Depto 202",
        "prop-carlos-1": "Local A", "prop-carlos-2": "Local B", "prop-carlos-3": "Oficina C"
      };
      deptoNombre = demoDeptos[inq.depto_id] || "N/A";
    } else {
      deptoNombre = inq.depto_id || "N/A";
    }

    return {
      nombre: inq.nombre,
      depto: deptoNombre
    };
  };

  const gastos = calcularGastosServicios();



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



      {/* ================= 1. DASHBOARD DE GASTOS POR SERVICIO ================= */}
      <section className="tarjeta-premium bg-white border border-slate-200 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <h2 className="titulo-mediano flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" aria-hidden="true" />
            <span>Cobros y Gastos por Servicio</span>
          </h2>
          
          {/* Selector de Mes Dinámico */}
          <div className="flex items-center gap-2 select-none">
            <label htmlFor="mes-filtro" className="text-base font-black text-slate-700 whitespace-nowrap">Periodo:</label>
            <select
              id="mes-filtro"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-350 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={mesFiltro}
              onChange={(e) => setMesFiltro(e.target.value)}
            >
              {mesesDisponibles.length === 0 ? (
                <option value={periodoActual}>{periodoActual}</option>
              ) : (
                mesesDisponibles.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase block">Luz Eléctrica Total</span>
              <span className="text-2xl font-black text-blue-800 block mt-1">S/ {gastos.luz.toFixed(2)}</span>
            </div>
            <span className="text-xs font-extrabold text-blue-600 mt-2 block bg-blue-100/50 px-2 py-0.5 rounded w-max">
              {gastos.luzKw} kWh del servicio
            </span>
          </div>

          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase block">Agua Potable Total</span>
              <span className="text-2xl font-black text-cyan-800 block mt-1">S/ {gastos.agua.toFixed(2)}</span>
            </div>
            <span className="text-xs font-extrabold text-cyan-600 mt-2 block bg-cyan-100/50 px-2 py-0.5 rounded w-max">
              {gastos.aguaM3} m³ del servicio
            </span>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase block">Seguridad / Mant. Total</span>
              <span className="text-2xl font-black text-emerald-800 block mt-1">S/ {gastos.seguridad.toFixed(2)}</span>
            </div>
            <span className="text-xs font-extrabold text-emerald-600 mt-2 block bg-emerald-100/50 px-2 py-0.5 rounded w-max">
              Cuota fija de condominio
            </span>
          </div>
        </div>

        {/* Gráfico SVG de barras de alto contraste para accesibilidad */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-4">Gráfico Comparativo de Costos ({mesFiltro})</span>
          
          {gastos.total === 0 ? (
            <p className="text-sm font-bold text-slate-400 text-center italic py-4">No hay consumos registrados para graficar en este periodo</p>
          ) : (
            <div className="space-y-4">
              {/* Barra Luz */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Luz Eléctrica (S/)</span>
                  <span>{Math.round((gastos.luz / gastos.total) * 100)}%</span>
                </div>
                <div className="w-full h-7 bg-slate-200 rounded-md overflow-hidden flex items-center">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300 flex items-center pl-2 text-white text-[10px] font-black"
                    style={{ width: `${Math.max(8, (gastos.luz / gastos.total) * 100)}%` }}
                  >
                    S/ {gastos.luz.toFixed(0)} ({gastos.luzKw} kWh)
                  </div>
                </div>
              </div>

              {/* Barra Agua */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Agua Potable (S/)</span>
                  <span>{Math.round((gastos.agua / gastos.total) * 100)}%</span>
                </div>
                <div className="w-full h-7 bg-slate-200 rounded-md overflow-hidden flex items-center">
                  <div 
                    className="h-full bg-cyan-500 transition-all duration-300 flex items-center pl-2 text-white text-[10px] font-black"
                    style={{ width: `${Math.max(8, (gastos.agua / gastos.total) * 100)}%` }}
                  >
                    S/ {gastos.agua.toFixed(0)} ({gastos.aguaM3} m³)
                  </div>
                </div>
              </div>

              {/* Barra Seguridad */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Seguridad y Mantenimiento (S/)</span>
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

        {/* Desglose de Consumo por Cliente */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
            Consumo Detallado por Cliente ({mesFiltro})
          </span>
          
          {listaLecturas.filter(l => l.mes === mesFiltro).length === 0 ? (
            <p className="text-sm font-bold text-slate-400 text-center italic py-4">
              No hay consumos registrados para ningún cliente en este periodo.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listaLecturas.filter(l => l.mes === mesFiltro).map((lec) => {
                const inqInfo = obtenerInquilinoInfo(lec.inquilino_id);
                const luzInfo = lec.luz || {};
                const luzKwh = Math.max(0, (Number(luzInfo.actual) || 0) - (Number(luzInfo.anterior) || 0));
                const luzCosto = luzKwh * (Number(luzInfo.costo_unitario) || 1.0);

                const aguaInfo = lec.agua || {};
                const aguaM3 = Math.max(0, (Number(aguaInfo.actual) || 0) - (Number(aguaInfo.anterior) || 0));
                const aguaCosto = aguaM3 * (Number(aguaInfo.costo_unitario) || 4.0);

                const totalServicios = luzCosto + aguaCosto + (Number(lec.seguridad) || 0);

                return (
                  <div key={lec.id} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                      <div>
                        <span className="block text-base font-black text-slate-900 leading-tight">{inqInfo.nombre}</span>
                        <span className="inline-block mt-1 text-xs font-extrabold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {inqInfo.depto}
                        </span>
                      </div>
                      <span className={lec.pagado ? "insignia-verde" : "insignia-roja"}>
                        {lec.pagado ? "PAGADO" : "PENDIENTE"}
                      </span>
                    </div>

                    {/* Consumo Breakdown */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {/* Luz */}
                      <div className="bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
                        <div className="flex justify-center text-blue-600 mb-1" aria-hidden="true">
                          <Lightbulb className="h-4 w-4" />
                        </div>
                        <span className="block text-[10px] font-extrabold text-slate-400 uppercase">Luz</span>
                        <span className="block text-sm font-black text-blue-800">{luzKwh} kWh</span>
                        <span className="block text-[11px] font-bold text-slate-500">S/ {luzCosto.toFixed(2)}</span>
                      </div>

                      {/* Agua */}
                      <div className="bg-cyan-50/50 p-2 rounded-lg border border-cyan-100/50">
                        <div className="flex justify-center text-cyan-500 mb-1" aria-hidden="true">
                          <Droplet className="h-4 w-4" />
                        </div>
                        <span className="block text-[10px] font-extrabold text-slate-400 uppercase">Agua</span>
                        <span className="block text-sm font-black text-cyan-800">{aguaM3} m³</span>
                        <span className="block text-[11px] font-bold text-slate-500">S/ {aguaCosto.toFixed(2)}</span>
                      </div>

                      {/* Seguridad */}
                      <div className="bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50">
                        <div className="flex justify-center text-emerald-600 mb-1" aria-hidden="true">
                          <Shield className="h-4 w-4" />
                        </div>
                        <span className="block text-[10px] font-extrabold text-slate-400 uppercase">Seguridad</span>
                        <span className="block text-sm font-black text-emerald-800">Fijo</span>
                        <span className="block text-[11px] font-bold text-slate-500">S/ {(Number(lec.seguridad) || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Total Card */}
                    <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-sm">
                      <span className="font-extrabold text-slate-500">Total Servicios:</span>
                      <span className="font-black text-slate-800">S/ {totalServicios.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
