/**
 * Construye el enlace de WhatsApp con el mensaje de cobro detallado y formateado.
 * 
 * @param {Object} data Datos para armar el mensaje
 * @param {Object} data.inquilino Objeto inquilino
 * @param {Object} data.propiedad Objeto propiedad
 * @param {Object} data.mensualidad Objeto mensualidad
 * @param {Object} data.config Configuración del administrador (cuentas bancarias, titular)
 * @returns {string} URL de WhatsApp pre-llenada
 */
export const buildWhatsAppLink = ({ inquilino, propiedad, mensualidad, config }) => {
  if (!inquilino || !propiedad || !mensualidad || !config) return "";

  const telefonoLimpio = inquilino.telefono.replace(/\D/g, "");
  // Agregar código de país predeterminado (Perú: 51) si no tiene
  const phone = telefonoLimpio.startsWith("51") ? telefonoLimpio : `51${telefonoLimpio}`;

  const depto = propiedad.identificador;
  const nombre = inquilino.nombre;
  const mesAnio = mensualidad.mes_anio;
  const total = Number(mensualidad.total_cobrado).toFixed(2);
  
  const baseRent = Number(propiedad.costo_base).toFixed(2);
  const luz = mensualidad.servicios.luz;
  const agua = mensualidad.servicios.agua;
  const seguridad = mensualidad.servicios.seguridad;
  const vehiculo = inquilino.vehiculo;

  let txt = `*🏢 BOLETA DE ALQUILER - DEPTO ${depto}*\n\n`;
  txt += `Estimado(a) *${nombre}*, le saludamos cordialmente. Se ha generado la liquidación para el periodo *${mesAnio}*:\n\n`;
  
  txt += `*📋 Detalle del Recibo:*\n`;
  txt += `• Alquiler Base: S/ ${baseRent}\n`;

  if (luz?.aplica) {
    const consumoLuz = luz.lectura_actual - luz.lectura_anterior;
    txt += `• Luz (Lecturas: ${luz.lectura_actual} - ${luz.lectura_anterior} = ${consumoLuz} kWh): S/ ${Number(luz.subtotal).toFixed(2)}\n`;
  }
  
  if (agua?.aplica) {
    const consumoAgua = agua.lectura_actual - agua.lectura_anterior;
    txt += `• Agua (Lecturas: ${agua.lectura_actual} - ${agua.lectura_anterior} = ${consumoAgua} m³): S/ ${Number(agua.subtotal).toFixed(2)}\n`;
  }
  
  if (seguridad?.aplica) {
    txt += `• Seguridad / Vigilancia: S/ ${Number(seguridad.subtotal).toFixed(2)}\n`;
  }

  if (vehiculo?.tiene_vehiculo && Number(vehiculo.monto_asociacion) > 0) {
    txt += `• Cochera / Mantenimiento Vehículo (${vehiculo.tipo}): S/ ${Number(vehiculo.monto_asociacion).toFixed(2)}\n`;
  }

  txt += `\n*💰 TOTAL A PAGAR: S/ ${total}*\n\n`;
  txt += `------------------------------------------\n`;
  txt += `*💸 Medios de Pago Disponibles:*\n\n`;

  if (config.billeteras?.yape) {
    txt += `📱 *Yape / Plin:* ${config.billeteras.yape} (${config.titular})\n`;
  }
  
  if (config.bancos?.bcp_cuenta) {
    txt += `🏦 *BCP:* ${config.bancos.bcp_cuenta}\n`;
    if (config.bancos.bcp_cci) {
      txt += `   *CCI BCP:* ${config.bancos.bcp_cci}\n`;
    }
  }

  if (config.bancos?.interbank_cuenta) {
    txt += `🏦 *Interbank:* ${config.bancos.interbank_cuenta}\n`;
    if (config.bancos.interbank_cci) {
      txt += `   *CCI Interbank:* ${config.bancos.interbank_cci}\n`;
    }
  }

  txt += `\n_Agradecemos realizar el depósito y enviar el comprobante/captura por este chat._\n`;
  txt += `¡Muchas gracias! 🙏🏼`;

  const encodedText = encodeURIComponent(txt);
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
};
