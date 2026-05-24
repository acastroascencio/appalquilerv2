import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { buildWhatsAppLink } from "../utils/WhatsAppLinkBuilder";
import { jsPDF } from "jspdf";
import { 
  Calculator, 
  Plus, 
  Trash2, 
  MessageSquare, 
  FileText, 
  Save, 
  Check, 
  AlertCircle 
} from "lucide-react";

export default function ServiciosCalculadora({ inquilino }) {
  const { 
    propiedades, 
    mensualidades, 
    config, 
    saveMensualidad, 
    deleteMensualidad 
  } = useApp();

  const prop = propiedades.find(p => p.id === inquilino?.propiedad_id);

  // Filtrar cobros mensuales asociados a este inquilino
  const inqMensualidades = mensualidades
    .filter(m => m.inquilino_id === inquilino?.id)
    .sort((a, b) => {
      // Ordenar por periodo descendente (mes-año)
      const [mesA, anioA] = a.mes_anio.split("-").map(Number);
      const [mesB, anioB] = b.mes_anio.split("-").map(Number);
      return (anioB * 12 + mesB) - (anioA * 12 + mesA);
    });

  // Estado para mensualidad seleccionada para edición/creación
  const [selectedMens, setSelectedMens] = useState(null);
  const [isNew, setIsNew] = useState(false);

  // Campos del formulario de servicios
  const [mesAnio, setMesAnio] = useState("");
  const [estado, setEstado] = useState("Pendiente");
  
  // Luz
  const [luzAplica, setLuzAplica] = useState(true);
  const [luzLectAnt, setLuzLectAnt] = useState("");
  const [luzLectAct, setLuzLectAct] = useState("");
  const [luzSubtotal, setLuzSubtotal] = useState(0);

  // Agua
  const [aguaAplica, setAguaAplica] = useState(true);
  const [aguaLectAnt, setAguaLectAnt] = useState("");
  const [aguaLectAct, setAguaLectAct] = useState("");
  const [aguaSubtotal, setAguaSubtotal] = useState(0);

  // Seguridad
  const [seguridadAplica, setSeguridadAplica] = useState(true);
  const [seguridadSubtotal, setSeguridadSubtotal] = useState(15);

  const [saving, setSaving] = useState(false);

  // Obtener tarifas de configuración
  const tarifaLuz = config?.tarifas?.luz || 1.0;
  const tarifaAgua = config?.tarifas?.agua || 4.0;

  // Cargar lecturas anteriores recomendadas de la mensualidad más reciente
  const getLecturasRecomendadas = () => {
    if (inqMensualidades.length > 0) {
      const ultima = inqMensualidades[0];
      return {
        luz: ultima.servicios?.luz?.lectura_actual || 0,
        agua: ultima.servicios?.agua?.lectura_actual || 0
      };
    }
    return { luz: 0, agua: 0 };
  };

  // Efecto para abrir el formulario cuando se selecciona un cobro existente
  useEffect(() => {
    if (selectedMens) {
      setIsNew(false);
      setMesAnio(selectedMens.mes_anio);
      setEstado(selectedMens.estado);
      
      const luz = selectedMens.servicios?.luz;
      setLuzAplica(luz?.aplica ?? true);
      setLuzLectAnt(luz?.lectura_anterior ?? "");
      setLuzLectAct(luz?.lectura_actual ?? "");
      setLuzSubtotal(luz?.subtotal ?? 0);

      const agua = selectedMens.servicios?.agua;
      setAguaAplica(agua?.aplica ?? true);
      setAguaLectAnt(agua?.lectura_anterior ?? "");
      setAguaLectAct(agua?.lectura_actual ?? "");
      setAguaSubtotal(agua?.subtotal ?? 0);

      const seg = selectedMens.servicios?.seguridad;
      setSeguridadAplica(seg?.aplica ?? true);
      setSeguridadSubtotal(seg?.subtotal ?? 15);
    } else {
      // Limpiar formulario para nuevo periodo
      setIsNew(true);
      const hoy = new Date();
      const mesStr = String(hoy.getMonth() + 1).padStart(2, "0");
      const anioStr = hoy.getFullYear();
      setMesAnio(`${mesStr}-${anioStr}`);
      setEstado("Pendiente");

      const recomendadas = getLecturasRecomendadas();
      setLuzAplica(true);
      setLuzLectAnt(recomendadas.luz);
      setLuzLectAct("");
      setLuzSubtotal(0);

      setAguaAplica(true);
      setAguaLectAnt(recomendadas.agua);
      setAguaLectAct("");
      setAguaSubtotal(0);

      setSeguridadAplica(true);
      setSeguridadSubtotal(15);
    }
  }, [selectedMens, inquilino]);

  // Recalcular subtotales matemáticamente en tiempo real
  useEffect(() => {
    if (luzAplica) {
      const consumo = Math.max(0, (Number(luzLectAct) || 0) - (Number(luzLectAnt) || 0));
      setLuzSubtotal(consumo * tarifaLuz);
    } else {
      setLuzSubtotal(0);
    }
  }, [luzLectAct, luzLectAnt, luzAplica, tarifaLuz]);

  useEffect(() => {
    if (aguaAplica) {
      const consumo = Math.max(0, (Number(aguaLectAct) || 0) - (Number(aguaLectAnt) || 0));
      setAguaSubtotal(consumo * tarifaAgua);
    } else {
      setAguaSubtotal(0);
    }
  }, [aguaLectAct, aguaLectAnt, aguaAplica, tarifaAgua]);

  const subtotalSeguridad = seguridadAplica ? Number(seguridadSubtotal) || 0 : 0;
  const montoCochera = inquilino?.vehiculo?.tiene_vehiculo ? Number(inquilino.vehiculo.monto_asociacion) || 0 : 0;
  const rentaBase = prop ? Number(prop.costo_base) || 0 : 0;

  const totalCalculado = rentaBase + luzSubtotal + aguaSubtotal + subtotalSeguridad + montoCochera;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!mesAnio) {
      alert("Ingrese el periodo de cobro (Mes-Año)");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: selectedMens?.id || null,
        inquilino_id: inquilino.id,
        mes_anio: mesAnio,
        estado: estado,
        servicios: {
          luz: {
            aplica: luzAplica,
            lectura_anterior: Number(luzLectAnt) || 0,
            lectura_actual: Number(luzLectAct) || 0,
            subtotal: luzSubtotal
          },
          agua: {
            aplica: aguaAplica,
            lectura_anterior: Number(aguaLectAnt) || 0,
            lectura_actual: Number(aguaLectAct) || 0,
            subtotal: aguaSubtotal
          },
          seguridad: {
            aplica: seguridadAplica,
            subtotal: subtotalSeguridad
          }
        },
        total_cobrado: totalCalculado
      };

      const saved = await saveMensualidad(payload);
      setSelectedMens(saved);
      alert("Periodo de facturación guardado correctamente.");
    } catch (error) {
      console.error("Error al guardar mensualidad:", error);
      alert("Ocurrió un error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePeriod = async (id) => {
    if (window.confirm("¿Está seguro de que desea eliminar este periodo de cobro?")) {
      await deleteMensualidad(id);
      setSelectedMens(null);
    }
  };

  // ================= GENERACIÓN DE PDF A5 (jspdf) =================
  const handleExportPDF = (mens) => {
    if (!mens) return;
    
    // Crear documento A5 (148 x 210 mm)
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a5"
    });

    const titular = config?.titular || "Mario Andres Castro Ascencio";
    const depto = prop?.identificador || "N/A";
    
    // Configuración estética
    doc.setFillColor(30, 41, 59); // Slate 800
    doc.rect(0, 0, 148, 25, "F");

    // Header
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("COMPROBANTE DE ALQUILER Y SERVICIOS", 10, 10);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    doc.text(`Propietario: ${titular}`, 10, 17);
    doc.text(`Periodo: ${mens.mes_anio}`, 110, 17);

    // Datos del inquilino
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("DETALLES DEL ARRENDATARIO", 10, 36);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Nombre: ${inquilino.nombre}`, 10, 42);
    doc.text(`Departamento: Depto ${depto}`, 10, 47);
    doc.text(`Teléfono: ${inquilino.telefono}`, 80, 42);
    doc.text(`Fecha Emisión: ${new Date().toLocaleDateString("es-PE")}`, 80, 47);

    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.line(10, 52, 138, 52);

    // Conceptos
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text("CONCEPTOS DE PAGO", 10, 59);

    // Cabeceras de tabla
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Descripción", 10, 66);
    doc.text("Lecturas / Detalles", 65, 66);
    doc.text("Importe (S/)", 120, 66);
    doc.line(10, 68, 138, 68);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    let y = 74;

    // Alquiler Base
    doc.text("Alquiler Mensual Base", 10, y);
    doc.text("-", 65, y);
    doc.text(rentaBase.toFixed(2), 120, y);
    y += 7;

    // Luz
    const luz = mens.servicios?.luz;
    if (luz?.aplica) {
      doc.text("Consumo de Energía Eléctrica (Luz)", 10, y);
      doc.text(`${luz.lectura_anterior} - ${luz.lectura_actual} (${luz.lectura_actual - luz.lectura_anterior} kWh)`, 65, y);
      doc.text(Number(luz.subtotal).toFixed(2), 120, y);
      y += 7;
    }

    // Agua
    const agua = mens.servicios?.agua;
    if (agua?.aplica) {
      doc.text("Consumo de Agua Potable", 10, y);
      doc.text(`${agua.lectura_anterior} - ${agua.lectura_actual} (${agua.lectura_actual - agua.lectura_anterior} m³)`, 65, y);
      doc.text(Number(agua.subtotal).toFixed(2), 120, y);
      y += 7;
    }

    // Seguridad
    const seg = mens.servicios?.seguridad;
    if (seg?.aplica) {
      doc.text("Mantenimiento y Vigilancia", 10, y);
      doc.text("Cuota Fija", 65, y);
      doc.text(Number(seg.subtotal).toFixed(2), 120, y);
      y += 7;
    }

    // Cochera
    if (inquilino.vehiculo?.tiene_vehiculo && Number(inquilino.vehiculo.monto_asociacion) > 0) {
      doc.text(`Cochera (${inquilino.vehiculo.tipo})`, 10, y);
      doc.text(`Placa: ${inquilino.vehiculo.placa || "N/A"}`, 65, y);
      doc.text(montoCochera.toFixed(2), 120, y);
      y += 7;
    }

    doc.line(10, y - 2, 138, y - 2);

    // Total a pagar
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text("TOTAL A CANCELAR:", 10, y + 4);
    doc.text(`S/ ${Number(mens.total_cobrado).toFixed(2)}`, 115, y + 4);
    y += 12;

    // Métodos de pago
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.rect(10, y, 128, 32, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(10, y, 128, 32, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("INSTRUCCIONES DE DEPÓSITO / TRANSFERENCIA:", 13, y + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    
    let payY = y + 10;
    if (config.billeteras?.yape) {
      doc.text(`• Yape o Plin al celular: ${config.billeteras.yape} (${titular})`, 13, payY);
      payY += 4.5;
    }
    if (config.bancos?.bcp_cuenta) {
      doc.text(`• BCP Cuenta: ${config.bancos.bcp_cuenta}  |  CCI: ${config.bancos.bcp_cci || "-"}`, 13, payY);
      payY += 4.5;
    }
    if (config.bancos?.interbank_cuenta) {
      doc.text(`• Interbank Cuenta: ${config.bancos.interbank_cuenta}  |  CCI: ${config.bancos.interbank_cci || "-"}`, 13, payY);
    }

    // Pie de boleta
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Este documento es un comprobante de liquidación mensual de alquiler y servicios asociados.", 15, 202);

    // Descargar
    doc.save(`Recibo_Depto${depto}_${mens.mes_anio}.pdf`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* PANEL IZQUIERDO: HISTORIAL DE PERIODOS */}
      <div className="card-container lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
          <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">Recibos Emitidos</h4>
          <button
            onClick={() => setSelectedMens(null)}
            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 font-bold text-xs"
            title="Nuevo recibo"
          >
            <Plus className="h-4 w-4" />
            <span>Emitir</span>
          </button>
        </div>

        {inqMensualidades.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs italic font-medium">
            No se han registrado cobros para este inquilino todavía.
          </div>
        ) : (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {inqMensualidades.map((mens) => (
              <div
                key={mens.id}
                onClick={() => setSelectedMens(mens)}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                  selectedMens?.id === mens.id
                    ? "bg-blue-50 border-blue-200 shadow-sm"
                    : "bg-white border-slate-100 hover:bg-slate-50"
                }`}
              >
                <div>
                  <span className="font-bold text-slate-800 text-sm block">Periodo {mens.mes_anio}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Total: S/ {Number(mens.total_cobrado).toFixed(2)}</span>
                </div>
                <div>
                  {mens.estado === "Pagado" ? (
                    <span className="badge-success text-[10px] py-0.5 px-2">Pagado</span>
                  ) : (
                    <span className="badge-danger text-[10px] py-0.5 px-2 animate-pulse">Pendiente</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PANEL DERECHO: DETALLE / CALCULADORA */}
      <div className="card-container lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
          <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">
            {isNew ? "Emitir Nuevo Recibo de Alquiler" : `Detalle de Liquidación: Periodo ${mesAnio}`}
          </h4>
          {!isNew && (
            <button
              onClick={() => handleDeletePeriod(selectedMens.id)}
              className="p-1 text-red-500 hover:bg-red-50 rounded"
              title="Eliminar este periodo"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {!prop ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm">Sin Departamento Asignado</span>
              <span className="text-xs">Este inquilino no tiene un departamento asignado actualmente. Debe asignarle uno en "Datos Básicos" antes de emitir recibos.</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            {/* Cabecera del Recibo: Periodo y Estado */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200/60 p-4 rounded-lg">
              <div>
                <label className="label-text">Periodo Facturación *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej. 05-2026"
                  value={mesAnio}
                  onChange={(e) => setMesAnio(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label-text">Estado del Pago</label>
                <select
                  className="input-field animate-none"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                >
                  <option value="Pendiente">Pendiente de Pago</option>
                  <option value="Pagado">Pagado / Cancelado</option>
                </select>
              </div>
            </div>

            {/* Renta Base & Cochera estáticos */}
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4 text-xs font-semibold text-slate-500">
              <div>
                <span>Costo Alquiler Base:</span>
                <span className="block text-slate-800 text-sm font-extrabold mt-1">S/ {rentaBase.toFixed(2)}</span>
              </div>
              <div>
                <span>Costo Cochera (Asociación):</span>
                <span className="block text-slate-800 text-sm font-extrabold mt-1">
                  S/ {montoCochera.toFixed(2)} {inquilino?.vehiculo?.tiene_vehiculo ? `(${inquilino.vehiculo.tipo})` : ""}
                </span>
              </div>
            </div>

            {/* CALCULADORA DE LUZ */}
            <div className="bg-slate-50/50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    checked={luzAplica}
                    onChange={(e) => setLuzAplica(e.target.checked)}
                  />
                  <span className="text-sm font-bold text-slate-700">Consumo de Energía Eléctrica (Luz)</span>
                </label>
                <span className="text-xs font-bold text-slate-400">Tarifa: S/ {tarifaLuz.toFixed(2)} / kWh</span>
              </div>

              {luzAplica && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1 page-enter">
                  <div>
                    <label className="label-text">Lectura Anterior</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="0"
                      value={luzLectAnt}
                      onChange={(e) => setLuzLectAnt(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label-text">Lectura Actual</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="0"
                      value={luzLectAct}
                      onChange={(e) => setLuzLectAct(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1 self-end bg-blue-50/60 p-2.5 rounded border border-blue-100 flex flex-col justify-center">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Subtotal Luz</span>
                    <span className="text-base font-extrabold text-blue-700">S/ {luzSubtotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* CALCULADORA DE AGUA */}
            <div className="bg-slate-50/50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    checked={aguaAplica}
                    onChange={(e) => setAguaAplica(e.target.checked)}
                  />
                  <span className="text-sm font-bold text-slate-700">Consumo de Agua Potable</span>
                </label>
                <span className="text-xs font-bold text-slate-400">Tarifa: S/ {tarifaAgua.toFixed(2)} / m³</span>
              </div>

              {aguaAplica && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1 page-enter">
                  <div>
                    <label className="label-text">Lectura Anterior</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="0"
                      value={aguaLectAnt}
                      onChange={(e) => setAguaLectAnt(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label-text">Lectura Actual</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="0"
                      value={aguaLectAct}
                      onChange={(e) => setAguaLectAct(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1 self-end bg-blue-50/60 p-2.5 rounded border border-blue-100 flex flex-col justify-center">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Subtotal Agua</span>
                    <span className="text-base font-extrabold text-blue-700">S/ {aguaSubtotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* MANTENIMIENTO Y SEGURIDAD */}
            <div className="bg-slate-50/50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  checked={seguridadAplica}
                  onChange={(e) => setSeguridadAplica(e.target.checked)}
                />
                <span className="text-sm font-bold text-slate-700">Servicio de Seguridad / Vigilancia</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Costo fijo:</span>
                <input
                  type="number"
                  className="w-20 text-center rounded-md border-slate-300 text-slate-800 text-sm font-bold py-1 bg-white focus:ring-blue-500 focus:border-blue-500"
                  value={seguridadSubtotal}
                  onChange={(e) => setSeguridadSubtotal(e.target.value)}
                  disabled={!seguridadAplica}
                  min="0"
                />
              </div>
            </div>

            {/* TOTAL FINAL Y ACCIONES */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monto Total Liquidado</span>
                <span className="block text-3xl font-black text-slate-900 leading-tight">
                  S/ {totalCalculado.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 sm:flex-initial btn-primary py-2.5 px-4 font-bold text-sm"
                >
                  <Save className="h-4 w-4" />
                  <span>Guardar</span>
                </button>

                {!isNew && (
                  <>
                    {/* Imprimir PDF */}
                    <button
                      type="button"
                      onClick={() => handleExportPDF(selectedMens)}
                      className="p-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                      title="Descargar Comprobante PDF A5"
                    >
                      <FileText className="h-4 w-4" />
                    </button>

                    {/* Enviar Cobro WhatsApp */}
                    <a
                      href={buildWhatsAppLink({
                        inquilino,
                        propiedad: prop,
                        mensualidad: selectedMens,
                        config
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-[#25d366] hover:bg-[#1da851] text-white transition-colors flex items-center justify-center"
                      title="Enviar Cobro por WhatsApp"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
