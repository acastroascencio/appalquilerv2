import { clienteSupabase } from "../config/supabase";

export async function registrarLogSistema(adminId, { accion, descripcion, detalles = {}, tipo = "INFO" }) {
  const logData = {
    admin_id: adminId || "demo-usuario",
    accion,
    descripcion,
    detalles,
    tipo,
    fecha: new Date().toISOString()
  };

  if (!adminId || adminId.startsWith("demo-") || adminId === "admin-prueba-id") {
    try {
      const storageKey = `demo_logs_sistema_${adminId || 'anonimo'}`;
      const logs = JSON.parse(localStorage.getItem(storageKey) || "[]");
      logData.id = `log-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      logs.push(logData);
      localStorage.setItem(storageKey, JSON.stringify(logs));
      console.log("Log registrado localmente (Demo):", logData);
    } catch (e) {
      console.error("Error al guardar log de demostración:", e);
    }
  } else {
    try {
      const { error } = await clienteSupabase
        .from("logs_sistema")
        .insert([logData]);
      if (error) throw error;
      console.log("Log registrado en Supabase:", logData);
    } catch (e) {
      console.error("Error al guardar log en Supabase:", e);
    }
  }
}
