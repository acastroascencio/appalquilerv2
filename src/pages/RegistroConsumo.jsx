import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertCircle,
  Building,
  Calculator,
  CheckCircle,
  DollarSign,
  FileText,
  Lightbulb,
  MessageSquare,
  TrendingUp,
  User,
} from "lucide-react";
import { useApp } from "../context/AppContext";

const getPeriodScore = (period = "") => {
  const [month, year] = period.split("-").map(Number);
  return (year || 0) * 12 + (month || 0);
};

export default function RegistroConsumo() {
  const {
    inquilinos,
    propiedades,
    mensualidades,
    config,
    saveMensualidad,
    loading,
  } = useApp();

  const [inquilinoSeleccionado, setInquilinoSeleccionado] = useState("");
  const [lecturaActual, setLecturaActual] = useState("");
  const [precioUnitarioLuz, setPrecioUnitarioLuz] = useState(1.0);
  const [seguridadCuota, setSeguridadCuota] = useState(15.0);
  const [errorValidacion, setErrorValidacion] = useState("");
  const [exitoGuardado, setExitoGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const nombreMes = format(new Date(), "MMMM", { locale: es });
  const mesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
  const periodoActual = `${format(new Date(), "MM")}-${format(new Date(), "yyyy")}`;

  const listaInquilinos = useMemo(() => {
    return inquilinos
      .map((inquilino) => {
        const propiedad = propiedades.find((prop) => prop.id === inquilino.propiedad_id);
        return {
          ...inquilino,
          propiedad,
          estadoConsumo: inquilino.estado_cuenta || "Activo",
        };
      })
      .filter((inquilino) => !inquilino.is_deleted && inquilino.propiedad_id)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }, [inquilinos, propiedades]);

  const datosInquilino = useMemo(() => {
    return listaInquilinos.find((inquilino) => inquilino.id === inquilinoSeleccionado) || null;
  }, [inquilinoSeleccionado, listaInquilinos]);

  const alquilerBase = Number(datosInquilino?.propiedad?.costo_base) || 0;
  const vehiculo = datosInquilino?.vehiculo || {};
  const tieneVehiculo = Boolean(vehiculo.tiene_vehiculo);
  const montoAsociacion = Number(vehiculo.monto_asociacion) || 0;

  const lecturaAnterior = useMemo(() => {
    if (!inquilinoSeleccionado) {
      return 0;
    }

    const historial = mensualidades
      .filter((mensualidad) => mensualidad.inquilino_id === inquilinoSeleccionado)
      .sort((a, b) => getPeriodScore(b.mes_anio) - getPeriodScore(a.mes_anio));

    const ultimaFacturaConLuz = historial.find(
      (mensualidad) => mensualidad.servicios?.luz?.lectura_actual !== undefined
    );

    return Number(ultimaFacturaConLuz?.servicios?.luz?.lectura_actual) || 0;
  }, [inquilinoSeleccionado, mensualidades]);

  const handleSelectInquilino = (value) => {
    setInquilinoSeleccionado(value);
    setLecturaActual("");
    setErrorValidacion("");
    setExitoGuardado(false);
    setPrecioUnitarioLuz(Number(config?.tarifas?.luz) || 1.0);
  };

  const diferenciaConsumo = Math.max(0, (Number(lecturaActual) || 0) - lecturaAnterior);
  const subtotalLuz = diferenciaConsumo * precioUnitarioLuz;
  const totalAdministrador = subtotalLuz + alquilerBase + seguridadCuota;
  const esLecturaInvalida = lecturaActual !== "" && Number(lecturaActual) < lecturaAnterior;

  const registrarConsumo = async (event) => {
    event.preventDefault();
    setErrorValidacion("");
    setExitoGuardado(false);

    if (!inquilinoSeleccionado) {
      setErrorValidacion("Debe seleccionar un inquilino antes de registrar el consumo.");
      return;
    }

    if (lecturaActual === "") {
      setErrorValidacion("Ingrese la lectura actual de luz.");
      return;
    }

    if (esLecturaInvalida) {
      setErrorValidacion("La lectura actual debe ser mayor o igual a la lectura anterior.");
      return;
    }

    if (precioUnitarioLuz <= 0) {
      setErrorValidacion("La tarifa por kWh debe ser mayor a cero.");
      return;
    }

    if (seguridadCuota < 0) {
      setErrorValidacion("La cuota de seguridad no puede ser negativa.");
      return;
    }

    setGuardando(true);

    try {
      await saveMensualidad({
        inquilino_id: inquilinoSeleccionado,
        mes_anio: periodoActual,
        estado: "Pendiente",
        servicios: {
          luz: {
            aplica: true,
            lectura_anterior: lecturaAnterior,
            lectura_actual: Number(lecturaActual),
            subtotal: subtotalLuz,
          },
          agua: {
            aplica: false,
            lectura_anterior: 0,
            lectura_actual: 0,
            subtotal: 0,
          },
          seguridad: {
            aplica: true,
            subtotal: seguridadCuota,
          },
        },
        total_cobrado: totalAdministrador,
      });

      setExitoGuardado(true);
      setLecturaActual("");
    } catch (error) {
      console.error("Error al registrar consumo:", error);
      setErrorValidacion("No se pudo registrar el consumo. Verifica la conexion e intenta nuevamente.");
    } finally {
      setGuardando(false);
    }
  };

  const generarWhatsAppEnlace = () => {
    if (!datosInquilino) return "#";

    const celularInquilino = String(datosInquilino.telefono || "").replace(/\D/g, "");
    const telefonoConCodigo = celularInquilino.startsWith("51")
      ? celularInquilino
      : `51${celularInquilino}`;
    const titular = config?.titular || "Mario Andres Castro Ascencio";
    const cuentaYape = config?.billeteras?.yape || "987654321";
    const cuentaBCP = config?.bancos?.bcp_cuenta || "191-98765432-0-12";
    const cciBCP = config?.bancos?.bcp_cci || "002-19198765432012-54";
    const depto = datosInquilino.propiedad?.identificador || "N/A";

    let textoMensaje = `*BOLETA DE SERVICIOS - DEPTO ${depto}*\n\n`;
    textoMensaje += `Estimado(a) *${datosInquilino.nombre}*, se registro su consumo del mes de *${mesCapitalizado}*:\n\n`;
    textoMensaje += `Alquiler Base: S/ ${alquilerBase.toFixed(2)}\n`;
    textoMensaje += `Consumo Luz (${diferenciaConsumo} kWh): S/ ${subtotalLuz.toFixed(2)}\n`;
    textoMensaje += `Seguridad y Mantenimiento: S/ ${seguridadCuota.toFixed(2)}\n\n`;
    textoMensaje += `*TOTAL A PAGAR: S/ ${totalAdministrador.toFixed(2)}*\n\n`;

    if (tieneVehiculo && montoAsociacion > 0) {
      textoMensaje += `Nota de cochera: ${vehiculo.tipo || "Vehiculo"} ${vehiculo.placa || ""}, S/ ${montoAsociacion.toFixed(2)}. Este concepto se paga directo a la asociacion.\n\n`;
    }

    textoMensaje += `Metodos de pago:\n`;
    textoMensaje += `Yape: ${cuentaYape} (${titular})\n`;
    textoMensaje += `BCP: ${cuentaBCP}\n`;
    textoMensaje += `CCI: ${cciBCP}\n\n`;
    textoMensaje += `Por favor envie el voucher una vez realizado el abono. Gracias.`;

    return `https://api.whatsapp.com/send?phone=${telefonoConCodigo}&text=${encodeURIComponent(textoMensaje)}`;
  };

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-4xl">
        <header className="app-surface mb-6 flex flex-col gap-4 rounded-2xl border p-5 shadow-sm sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white shadow-lg shadow-blue-900/10" aria-hidden="true">
            <Calculator className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl" style={{ color: "var(--text-primary)" }}>
              Registro de consumo
            </h1>
            <p className="mt-1 text-base font-semibold" style={{ color: "var(--text-secondary)" }}>
              Periodo de facturacion: <strong style={{ color: "var(--primary)" }}>{mesCapitalizado}</strong>
            </p>
          </div>
        </header>

        {errorValidacion && (
          <div className="app-alert-error mb-6" role="alert">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <span className="mb-1 block text-base font-black">Error de validacion</span>
              <span>{errorValidacion}</span>
            </div>
          </div>
        )}

        {exitoGuardado && (
          <div className="app-alert-success mb-6" role="status">
            <CheckCircle className="h-6 w-6 shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <span className="mb-1 block text-lg font-black">Registro exitoso</span>
              <span className="mb-4 block">El consumo mensual fue guardado correctamente.</span>
              <a
                href={generarWhatsAppEnlace()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full sm:w-auto"
                aria-label={`Enviar comprobante de ${mesCapitalizado} a ${datosInquilino?.nombre} por WhatsApp`}
              >
                <MessageSquare className="h-6 w-6" aria-hidden="true" />
                <span>Enviar comprobante por WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        <section className="card-container p-5 sm:p-8">
          <h2 className="mb-6 flex items-center gap-2.5 border-b pb-4 text-xl font-black leading-tight" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>
              <Lightbulb className="h-6 w-6" aria-hidden="true" />
            </span>
            <span>Datos del recibo mensual</span>
          </h2>

          <form onSubmit={registrarConsumo} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="inquilino-select" className="label-text">
                Seleccionar inquilino *
              </label>
              <div className="relative">
                <select
                  id="inquilino-select"
                  className="input-field pl-11 pr-4 font-bold"
                  value={inquilinoSeleccionado}
                  onChange={(event) => handleSelectInquilino(event.target.value)}
                  disabled={loading}
                  required
                >
                  <option value="">
                    {loading ? "Cargando inquilinos..." : "Seleccione un inquilino..."}
                  </option>
                  {listaInquilinos.map((inquilino) => (
                    <option key={inquilino.id} value={inquilino.id}>
                      {inquilino.nombre} - Depto {inquilino.propiedad?.identificador || "sin asignar"} - {inquilino.telefono} - {inquilino.estadoConsumo}
                    </option>
                  ))}
                </select>
                <User className="field-icon" aria-hidden="true" />
              </div>
              {loading && (
                <p className="helper-text animate-pulse">Cargando inquilinos...</p>
              )}
              {!loading && listaInquilinos.length === 0 && (
                <p className="field-error">No hay inquilinos registrados. Agrega un inquilino para continuar.</p>
              )}
            </div>

            {datosInquilino && (
              <div className="tenant-panel page-enter space-y-4">
                <h3 className="flex items-center gap-2 text-base font-black uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                  <Building className="h-5 w-5" aria-hidden="true" />
                  <span>Resumen de arrendamiento</span>
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border p-3" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                    <span className="block text-[15px] font-bold" style={{ color: "var(--text-secondary)" }}>Departamento</span>
                    <span className="text-lg font-black" style={{ color: "var(--text-primary)" }}>
                      Depto {datosInquilino.propiedad?.identificador || "Sin asignar"}
                    </span>
                  </div>
                  <div className="rounded-lg border p-3" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                    <span className="block text-[15px] font-bold" style={{ color: "var(--text-secondary)" }}>Alquiler base</span>
                    <span className="text-lg font-black" style={{ color: "var(--text-primary)" }}>
                      S/ {alquilerBase.toFixed(2)}
                    </span>
                  </div>
                </div>

                {tieneVehiculo && (
                  <div className="app-alert-warning">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                    <div className="text-base font-semibold leading-relaxed">
                      <span className="mb-1 block font-black">
                        Nota informativa de cochera ({vehiculo.tipo || "Vehiculo"})
                      </span>
                      <span>
                        Placa {vehiculo.placa || "sin placa"}. Costo mensual: S/ {montoAsociacion.toFixed(2)}. No se suma al cobro del administrador.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="lectura-anterior" className="label-text">
                  Lectura anterior de luz (kWh)
                </label>
                <div className="relative">
                  <input
                    id="lectura-anterior"
                    type="number"
                    className="input-field cursor-not-allowed pl-11 pr-4"
                    value={lecturaAnterior}
                    readOnly
                  />
                  <Lightbulb className="field-icon" aria-hidden="true" />
                </div>
                <p className="helper-text">Tomada del ultimo historial registrado.</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="lectura-actual" className="label-text">
                  Lectura actual de luz (kWh) *
                </label>
                <div className="relative">
                  <input
                    id="lectura-actual"
                    type="number"
                    className="input-field pl-11 pr-4 font-extrabold"
                    placeholder="Ingrese lectura"
                    value={lecturaActual}
                    onChange={(event) => setLecturaActual(event.target.value)}
                    aria-invalid={esLecturaInvalida}
                    disabled={!inquilinoSeleccionado}
                    min="0"
                    required
                  />
                  <TrendingUp className="field-icon" aria-hidden="true" />
                </div>
                {esLecturaInvalida && (
                  <p className="field-error">La lectura actual no puede ser menor a {lecturaAnterior}.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="tarifa-luz" className="label-text">
                  Tarifa por kWh (S/)
                </label>
                <input
                  id="tarifa-luz"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="input-field"
                  value={precioUnitarioLuz}
                  onChange={(event) => setPrecioUnitarioLuz(Number(event.target.value) || 0)}
                  disabled={!inquilinoSeleccionado}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="cuota-seguridad" className="label-text">
                  Cuota de seguridad / mantenimiento (S/)
                </label>
                <input
                  id="cuota-seguridad"
                  type="number"
                  step="0.1"
                  min="0"
                  className="input-field"
                  value={seguridadCuota}
                  onChange={(event) => setSeguridadCuota(Number(event.target.value) || 0)}
                  disabled={!inquilinoSeleccionado}
                />
              </div>
            </div>

            <div className="rounded-2xl p-6 text-white shadow-inner" style={{ background: "#0f172a" }}>
              <h3 className="mb-4 flex items-center gap-2 border-b border-slate-700 pb-3 text-base font-black uppercase tracking-wide text-slate-300">
                <FileText className="h-5 w-5" aria-hidden="true" />
                <span>Desglose de facturacion</span>
              </h3>

              <div className="space-y-3 text-base font-semibold text-slate-300">
                <div className="flex justify-between gap-4">
                  <span>Renta alquiler base</span>
                  <span className="font-black text-white">S/ {alquilerBase.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Servicio de luz ({diferenciaConsumo} kWh)</span>
                  <span className="font-black text-white">S/ {subtotalLuz.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Seguridad y mantenimiento</span>
                  <span className="font-black text-white">S/ {seguridadCuota.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-700 pt-4">
                <div>
                  <span className="block text-sm font-extrabold uppercase tracking-widest text-slate-400">Monto total</span>
                  <span className="text-3xl font-black tracking-tight text-blue-300">S/ {totalAdministrador.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={guardando || !inquilinoSeleccionado || esLecturaInvalida || listaInquilinos.length === 0}
              className="btn-primary w-full min-h-14 rounded-2xl text-lg"
              aria-label="Registrar consumo y liquidar mensualidad"
            >
              {guardando ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-white" aria-hidden="true" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <DollarSign className="h-6 w-6 shrink-0" aria-hidden="true" />
                  <span>Registrar consumo</span>
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
