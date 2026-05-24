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
  HelpCircle,
  Droplet
} from "lucide-react";
import { registrarLogSistema } from "../utils/logger";


export default function Consumo({ sesion }) {
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
  
  // Agua (Lectura solicitada)
  const [lecturaActualAgua, setLecturaActualAgua] = useState("");
  const [lecturaAnteriorAgua, setLecturaAnteriorAgua] = useState(0);

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

  const cargarDatos = async () => {
    if (!adminId) return;
    setCargando(true);
    setErrorGuardado("");
    try {
      if (adminId.startsWith("demo-") || adminId === "admin-prueba-id") {
        // Cuentas de demostración locales
        let demoPerfil = {
          nombre_completo: "Mario Andres Castro Ascencio (Demo)",
          datos_pago: {
            yape: "987654321",
            plin: "987654321",
            bcp_cuenta: "191-98765432-0-12",
            bcp_cci: "002-19198765432012-54",
            interbank_cuenta: "200-300456789",
            interbank_cci: "003-200300456789-11",
            tarifa_luz: 1.0,
            tarifa_agua: 4.0
          }
        };

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

        if (adminId === "demo-sofia") {
          demoPerfil = {
            nombre_completo: "Sofía Elena Rodríguez (Demo)",
            datos_pago: {
              yape: "955555555",
              plin: "955555555",
              bcp_cuenta: "193-45678901-0-34",
              bcp_cci: "002-19345678901034-88",
              interbank_cuenta: "210-987654321",
              interbank_cci: "003-210987654321-22",
              tarifa_luz: 1.2,
              tarifa_agua: 4.5
            }
          };

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
          demoPerfil = {
            nombre_completo: "Carlos Alberto Mendoza (Demo)",
            datos_pago: {
              yape: "966666666",
              plin: "966666666",
              bcp_cuenta: "194-88888888-0-99",
              bcp_cci: "002-19488888888099-11",
              interbank_cuenta: "220-444444444",
              interbank_cci: "003-220444444444-55",
              tarifa_luz: 1.5,
              tarifa_agua: 5.0
            }
          };

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

        setDatosPerfil(demoPerfil);
        setListaInquilinos(demoInqs);
        setListaLecturas(demoLects);
        
        // Ajustar tarifas estándar
        setPrecioUnitarioLuz(demoPerfil.datos_pago.tarifa_luz);
        setPrecioUnitarioAgua(demoPerfil.datos_pago.tarifa_agua);
        setCargando(false);
        return;
      }

      // Supabase real
      const { data: perfil } = await clienteSupabase
        .from("perfiles")
        .select("nombre_completo, datos_pago")
        .eq("id", adminId)
        .single();
      if (perfil) {
        setDatosPerfil(perfil);
        if (perfil.datos_pago?.tarifa_luz) setPrecioUnitarioLuz(perfil.datos_pago.tarifa_luz);
        if (perfil.datos_pago?.tarifa_agua) setPrecioUnitarioAgua(perfil.datos_pago.tarifa_agua);
      }

      const { data: inqs, error: errInqs } = await clienteSupabase
        .from("inquilinos")
        .select("id, nombre, celular, depto_id, moto_info, documentos")
        .eq("admin_id", adminId);
      if (errInqs) throw errInqs;
      setListaInquilinos(inqs || []);

      const { data: lects, error: errLects } = await clienteSupabase
        .from("lecturas_mensuales")
        .select("id, inquilino_id, mes, luz, agua, seguridad, pagado")
        .eq("admin_id", adminId);
      if (errLects) throw errLects;
      setListaLecturas(lects || []);

    } catch (err) {
      console.error("Error al cargar datos en Consumo:", err);
      setErrorGuardado("⚠️ Hubo un problema al cargar. Revisa tu conexión a internet");
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
      setLecturaAnteriorAgua(0);
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
        if (adminId.startsWith("demo-") || adminId === "admin-prueba-id") {
          let deptoNombre = "";
          let deptoPrecio = 0;
          if (adminId === "demo-sofia") {
            const demoDeptos = {
              "prop-sofia-1": { name: "Depto 101", price: 1000 },
              "prop-sofia-2": { name: "Depto 102", price: 850 },
              "prop-sofia-3": { name: "Depto 201", price: 1100 },
              "prop-sofia-4": { name: "Depto 202", price: 950 }
            };
            deptoNombre = demoDeptos[inq.depto_id]?.name || "";
            deptoPrecio = demoDeptos[inq.depto_id]?.price || 0;
          } else if (adminId === "demo-carlos") {
            const demoDeptos = {
              "prop-carlos-1": { name: "Local A", price: 2500 },
              "prop-carlos-2": { name: "Local B", price: 3000 },
              "prop-carlos-3": { name: "Oficina C", price: 1800 }
            };
            deptoNombre = demoDeptos[inq.depto_id]?.name || "";
            deptoPrecio = demoDeptos[inq.depto_id]?.price || 0;
          } else {
            const demoDeptos = {
              "prop-mario-1": { name: "Depto 2A", price: 1200 },
              "prop-mario-2": { name: "Depto 2B", price: 900 },
              "prop-mario-3": { name: "Depto 3A", price: 1300 }
            };
            deptoNombre = demoDeptos[inq.depto_id]?.name || "";
            deptoPrecio = demoDeptos[inq.depto_id]?.price || 0;
          }
          setAlquilerBase(deptoPrecio);
          setNombreDepto(deptoNombre);
        } else if (inq.depto_id) {
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

        // Cochera
        const moto = inq.moto_info || {};
        setTieneMoto(!!moto.placa);
        setMotoPlaca(moto.placa || "");
        setMotoCosto(Number(moto.monto_asociacion) || 0);

        // Lectura Anterior Luz y Agua
        const lecturasInq = listaLecturas.filter(l => l.inquilino_id === inquilinoSeleccionado);
        if (lecturasInq.length > 0) {
          const ultimaLuz = lecturasInq.find(l => l.luz?.actual !== undefined);
          if (ultimaLuz) setLecturaAnterior(Number(ultimaLuz.luz.actual) || 0);
          
          const ultimaAgua = lecturasInq.find(l => l.agua?.actual !== undefined);
          if (ultimaAgua) setLecturaAnteriorAgua(Number(ultimaAgua.agua.actual) || 0);
        } else {
          setLecturaAnterior(0);
          setLecturaAnteriorAgua(0);
        }

      } catch (err) {
        console.error("Error al cargar detalles en calculadora:", err);
      }
    }
    cargarDetalle();
  }, [inquilinoSeleccionado, listaInquilinos, listaLecturas]);

  // Cálculos matemáticos en tiempo real
  const consumoLuz = Math.max(0, (Number(lecturaActual) || 0) - lecturaAnterior);
  const costoLuz = consumoLuz * precioUnitarioLuz;

  const consumoAgua = Math.max(0, (Number(lecturaActualAgua) || 0) - lecturaAnteriorAgua);
  const costoAgua = consumoAgua * precioUnitarioAgua;

  const totalCobrar = costoLuz + costoAgua + alquilerBase + seguridadCuota;

  // Validaciones
  const lecturaActualInvalida = Number(lecturaActual) < lecturaAnterior;
  const lecturaAguaInvalida = Number(lecturaActualAgua) < lecturaAnteriorAgua;

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
      setErrorGuardado("La Lectura Actual de Luz no puede ser menor a la Lectura Anterior.");
      return;
    }
    if (lecturaActualAgua && lecturaAguaInvalida) {
      setErrorGuardado("La Lectura Actual de Agua no puede ser menor a la Lectura Anterior.");
      return;
    }

    setGuardando(true);
    setErrorGuardado("");
    setExitoGuardado(false);

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
        anterior: lecturaAnteriorAgua,
        actual: Number(lecturaActualAgua) || lecturaAnteriorAgua,
        costo_unitario: precioUnitarioAgua
      },
      seguridad: seguridadCuota,
      pagado: false
    };

    const inq = listaInquilinos.find(i => i.id === inquilinoSeleccionado);
    const nombreInq = inq ? inq.nombre : "Desconocido";

    if (adminId.startsWith("demo-") || adminId === "admin-prueba-id") {
      setTimeout(async () => {
        setListaLecturas(prev => [payload, ...prev]);
        setExitoGuardado(true);
        setLecturaActual("");
        setLecturaActualAgua("");
        setGuardando(false);
        await registrarLogSistema(adminId, {
          accion: "CREAR_CONSUMO",
          descripcion: `Se registró el consumo del periodo ${periodoActual} del inquilino "${nombreInq}" (Demo)`,
          detalles: { inquilino: nombreInq, periodo: periodoActual }
        });
      }, 600);
      return;
    }

    try {
      const { error } = await clienteSupabase
        .from("lecturas_mensuales")
        .insert([payload]);

      if (error) throw error;

      await registrarLogSistema(adminId, {
        accion: "CREAR_CONSUMO",
        descripcion: `Se registró el consumo del periodo ${periodoActual} del inquilino "${nombreInq}"`,
        detalles: { inquilino: nombreInq, periodo: periodoActual }
      });

      setExitoGuardado(true);
      setLecturaActual("");
      setLecturaActualAgua("");
      await cargarDatos();
    } catch (err) {
      console.error("Error al guardar consumo:", err);
      setErrorGuardado("⚠️ Hubo un problema al guardar. Revisa tu conexión a internet");
    } finally {
      setGuardando(false);
    }
  };

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
    
    if (Number(lecturaActualAgua) > 0) {
      texto += `• Agua Potable (Lectura: ${lecturaActualAgua} - Anterior: ${lecturaAnteriorAgua} = ${consumoAgua} m³): S/ ${costoAgua.toFixed(2)}\n`;
    }
    texto += `• Seguridad y Vigilancia: S/ ${seguridadCuota.toFixed(2)}\n\n`;
    texto += `*💰 TOTAL A PAGAR: S/ ${totalCobrar.toFixed(2)}*\n\n`;

    if (tieneMoto && motoCosto > 0) {
      texto += `*⚠️ NOTA DE COCHERA (NO SUMADO AL TOTAL):*\n`;
      texto += `• El cobro por mantenimiento de cochera de la moto con placa *${motoPlaca}* es de S/ ${motoCosto.toFixed(2)}. Este concepto es informativo y debe ser cancelado directamente al encargado de la asociación.\n\n`;
    }

    texto += `------------------------------------------\n`;
    texto += `*💸 Métodos de Pago:*\n`;
    texto += `📱 *Yape/Plin:* ${yape} (${titular})\n`;
    texto += `   *BCP:* ${bcp}\n`;
    texto += `   *CCI:* ${cci}\n\n`;
    texto += `_Muchas gracias por su puntualidad. Por favor envíe la captura del recibo._`;

    return `https://api.whatsapp.com/send?phone=${telefonoDestino}&text=${encodeURIComponent(texto)}`;
  };

  return (
    <div className="space-y-6 pb-[100px] transicion-pantalla">
      
      <div className="border-b border-slate-200 pb-4">
        <h2 className="titulo-grande">Registrar Consumo</h2>
        <p className="text-sm font-semibold text-slate-500">
          Registra lecturas de electricidad y agua del mes de {mesCapitalizado}
        </p>
      </div>

      {errorGuardado && (
        <div className="p-5 bg-red-100 border-l-4 border-red-600 text-red-950 font-bold rounded-r-lg flex items-start gap-3 shadow-md" role="alert">
          <AlertCircle className="h-6 w-6 shrink-0 text-red-700" aria-hidden="true" />
          <div className="text-base font-extrabold leading-tight">{errorGuardado}</div>
        </div>
      )}

      {exitoGuardado && (
        <div className="p-5 bg-green-100 border-l-4 border-green-600 text-green-950 font-bold rounded-r-lg flex flex-col gap-4 shadow-md" role="status">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 shrink-0 text-green-700" aria-hidden="true" />
            <div>
              <span className="block font-black text-lg text-green-950 mb-1">Recibo Creado</span>
              <p className="text-base font-extrabold leading-tight">El consumo mensual se guardó con éxito en la Caja Fuerte.</p>
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

      {cargando ? (
        <p className="text-center py-10 font-bold text-slate-400 animate-pulse text-lg">
          Consultando arrendatarios en Supabase...
        </p>
      ) : (
        <section className="tarjeta-premium bg-white border border-slate-200 shadow-xl space-y-6">
          <h2 className="titulo-mediano flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800">
            <Calculator className="h-6 w-6 text-blue-600" aria-hidden="true" />
            <span>Registro de Consumo Eléctrico y Agua</span>
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

            {/* Información Contextual */}
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

                {/* Nota informativa de parqueo */}
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

            {/* Lecturas Agua */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="lect-ant-agua" className="block text-sm font-bold text-slate-500">
                  Lectura Anterior de Agua (m³)
                </label>
                <div className="relative">
                  <input
                    id="lect-ant-agua"
                    type="number"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-[8px] font-bold text-slate-500 cursor-not-allowed focus:outline-none"
                    value={lecturaAnteriorAgua}
                    readOnly
                  />
                  <Droplet className="absolute left-4 top-4.5 h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="lect-act-agua" className="etiqueta-gigante">
                  Lectura Actual de Agua (m³)
                </label>
                <div className="relative">
                  <input
                    id="lect-act-agua"
                    type="number"
                    className={twMerge(
                      "campo-entrada-gigante pl-11",
                      lecturaAguaInvalida ? "border-red-500 focus:ring-red-100" : ""
                    )}
                    placeholder="Opcional"
                    value={lecturaActualAgua}
                    onChange={(e) => setLecturaActualAgua(e.target.value)}
                    disabled={!inquilinoSeleccionado}
                    min="0"
                  />
                  <TrendingUp className="absolute left-4 top-4.5 h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
              </div>
            </div>

            {/* Tarifas */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="space-y-1">
                <label htmlFor="tarifa-luz" className="text-xs font-bold text-slate-400 uppercase">Luz/kWh (S/)</label>
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
                <label htmlFor="tarifa-agua" className="text-xs font-bold text-slate-400 uppercase">Agua/m³ (S/)</label>
                <input
                  id="tarifa-agua"
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-600 rounded font-bold text-sm"
                  value={precioUnitarioAgua}
                  onChange={(e) => setPrecioUnitarioAgua(Number(e.target.value) || 0)}
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

            {/* Desglose de Pago */}
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
                  <span>Consumo de Agua ({consumoAgua} m³):</span>
                  <span>S/ {costoAgua.toFixed(2)}</span>
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

            {/* Guardar Recibo */}
            <button
              type="submit"
              disabled={guardando || !inquilinoSeleccionado || lecturaActualInvalida || lecturaAguaInvalida}
              className={twMerge(
                "w-full py-4.5 px-8 font-black text-lg tracking-wide rounded-2xl text-white transition-all duration-200 flex items-center justify-center gap-2.5 shadow-xl focus:ring-4 focus:ring-blue-500 focus:outline-none",
                guardando || !inquilinoSeleccionado || lecturaActualInvalida || lecturaAguaInvalida
                  ? "bg-slate-300 cursor-not-allowed shadow-none"
                  : "bg-blue-700 hover:bg-blue-800 shadow-blue-500/10"
              )}
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
      )}
    </div>
  );
}
