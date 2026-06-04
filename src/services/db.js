import { firebaseConfig, isFirebaseConfigured } from "../config/firebase";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, doc, getDocs, getDoc, 
  setDoc, addDoc
} from "firebase/firestore";

// Inicializa Firebase solo si está configurado
let firestore = null;

if (isFirebaseConfigured) {
  try {
    const firebaseApp = initializeApp(firebaseConfig);
    firestore = getFirestore(firebaseApp);
    console.log("Firebase inicializado correctamente.");
  } catch (error) {
    console.error("Error al inicializar Firebase:", error);
  }
}

// ===== SEED DATA PARA LOCAL STORAGE =====
const SEED_PROPIEDADES = [
  { id: "prop-1", identificador: "2A", estado: true, costo_base: 1200, caracteristicas: { habitaciones: 2, bano_propio: true, cocina: true }, fotos: [] },
  { id: "prop-2", identificador: "2B", estado: false, costo_base: 900, caracteristicas: { habitaciones: 1, bano_propio: true, cocina: true }, fotos: [] },
  { id: "prop-3", identificador: "3A", estado: true, costo_base: 1300, caracteristicas: { habitaciones: 2, bano_propio: true, cocina: true }, fotos: [] },
  { id: "prop-4", identificador: "3B", estado: false, costo_base: 850, caracteristicas: { habitaciones: 1, bano_propio: true, cocina: false }, fotos: [] }
];

const SEED_INQUILINOS = [
  { 
    id: "inq-1", 
    propiedad_id: "prop-1", 
    nombre: "Juan Pérez García", 
    telefono: "987654321", 
    garantia_monto: 1200, 
    documentos: { dni_url: "", contrato_url: "" },
    vehiculo: { tiene_vehiculo: true, tipo: "Auto", placa: "ABC-123", monto_asociacion: 50 }
  },
  { 
    id: "inq-3", 
    propiedad_id: "prop-3", 
    nombre: "María López Rodríguez", 
    telefono: "912345678", 
    garantia_monto: 1300, 
    documentos: { dni_url: "", contrato_url: "" },
    vehiculo: { tiene_vehiculo: false, tipo: "", placa: "", monto_asociacion: 0 }
  }
];

const SEED_MENSUALIDADES = [
  {
    id: "mens-1",
    inquilino_id: "inq-1",
    mes_anio: "05-2026",
    estado: "Pendiente",
    servicios: {
      luz: { aplica: true, lectura_anterior: 1020, lectura_actual: 1080, subtotal: 60 },
      agua: { aplica: true, lectura_anterior: 350, lectura_actual: 362, subtotal: 48 },
      seguridad: { aplica: true, subtotal: 15 }
    },
    total_cobrado: 1373, // 1200 (base) + 60 (luz) + 48 (agua) + 15 (segur) + 50 (auto)
    voucher_url: ""
  },
  {
    id: "mens-2",
    inquilino_id: "inq-3",
    mes_anio: "05-2026",
    estado: "Pagado",
    servicios: {
      luz: { aplica: true, lectura_anterior: 2040, lectura_actual: 2080, subtotal: 40 },
      agua: { aplica: true, lectura_anterior: 110, lectura_actual: 118, subtotal: 32 },
      seguridad: { aplica: true, subtotal: 15 }
    },
    total_cobrado: 1387, // 1300 (base) + 40 + 32 + 15
    voucher_url: ""
  }
];

const SEED_CONFIG = {
  titular: "Mario Andres Castro Ascencio",
  billeteras: { yape: "987654321", plin: "987654321" },
  bancos: { 
    bcp_cuenta: "191-98765432-0-12", 
    bcp_cci: "002-19198765432012-54", 
    interbank_cuenta: "200-300456789", 
    interbank_cci: "003-200300456789-11" 
  },
  tarifas: { luz: 1.0, agua: 4.0 }
};

const LOCAL_KEYS = {
  propiedades: "alquiler_propiedades",
  inquilinos: "alquiler_inquilinos",
  mensualidades: "alquiler_mensualidades",
  config: "alquiler_config",
  logs: "alquiler_logs",
  history: "alquiler_change_history",
  backupMeta: "alquiler_backup_meta"
};

const COLLECTION_MAP = {
  propiedades: "Propiedades",
  inquilinos: "Inquilinos",
  mensualidades: "Mensualidades"
};

const nowIso = () => new Date().toISOString();

const createId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const readLocal = (key, fallback = []) =>
  JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));

const writeLocal = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const visibleOnly = (records) => records.filter((record) => !record.is_deleted);

const withSaveMetadata = (record, existing = null) => {
  const timestamp = nowIso();
  return {
    ...record,
    created_at: existing?.created_at || record.created_at || timestamp,
    updated_at: timestamp,
    is_deleted: record.is_deleted ?? existing?.is_deleted ?? false
  };
};

const appendLocalHistory = (entry) => {
  const history = readLocal(LOCAL_KEYS.history);
  const fullEntry = {
    id: createId("hist"),
    changed_at: nowIso(),
    changed_by: entry.changed_by || "web-admin",
    ...entry
  };
  history.unshift(fullEntry);
  writeLocal(LOCAL_KEYS.history, history.slice(0, 500));
  return fullEntry;
};

// Helper para inicializar LocalStorage
const initLocalStorage = () => {
  if (!localStorage.getItem("alquiler_propiedades")) {
    localStorage.setItem("alquiler_propiedades", JSON.stringify(SEED_PROPIEDADES));
  }
  if (!localStorage.getItem("alquiler_inquilinos")) {
    localStorage.setItem("alquiler_inquilinos", JSON.stringify(SEED_INQUILINOS));
  }
  if (!localStorage.getItem("alquiler_mensualidades")) {
    localStorage.setItem("alquiler_mensualidades", JSON.stringify(SEED_MENSUALIDADES));
  }
  if (!localStorage.getItem("alquiler_config")) {
    localStorage.setItem("alquiler_config", JSON.stringify(SEED_CONFIG));
  }
};

if (typeof window !== "undefined") {
  initLocalStorage();
}

// ===== IMPLEMENTACIÓN DE MÉTODOS DB HÍBRIDOS =====
export const db = {
  // PROPIEDADES
  async getPropiedades() {
    if (isFirebaseConfigured) {
      const snap = await getDocs(collection(firestore, "Propiedades"));
      return visibleOnly(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } else {
      return visibleOnly(readLocal(LOCAL_KEYS.propiedades));
    }
  },

  async savePropiedad(prop) {
    if (isFirebaseConfigured) {
      const existing = prop.id ? (await getDoc(doc(firestore, "Propiedades", prop.id))).data() : null;
      const payload = withSaveMetadata(prop, existing);
      if (prop.id) {
        await setDoc(doc(firestore, "Propiedades", prop.id), payload);
        return payload;
      } else {
        const ref = await addDoc(collection(firestore, "Propiedades"), payload);
        return { id: ref.id, ...payload };
      }
    } else {
      const props = readLocal(LOCAL_KEYS.propiedades);
      const existing = prop.id ? props.find(p => p.id === prop.id) : null;
      const payload = withSaveMetadata(prop, existing);
      if (prop.id) {
        const idx = props.findIndex(p => p.id === prop.id);
        if (idx !== -1) props[idx] = payload;
      } else {
        payload.id = "prop-" + Date.now();
        props.push(payload);
      }
      writeLocal(LOCAL_KEYS.propiedades, props);
      appendLocalHistory({
        action_type: existing ? "UPDATE" : "CREATE",
        module: "propiedades",
        record_id: payload.id,
        old_data: existing || null,
        new_data: payload
      });
      return payload;
    }
  },

  async deletePropiedad(id) {
    if (isFirebaseConfigured) {
      const ref = doc(firestore, "Propiedades", id);
      const current = (await getDoc(ref)).data();
      await setDoc(ref, {
        ...(current || {}),
        is_deleted: true,
        deleted_at: nowIso(),
        deleted_by: "web-admin",
        delete_reason: "Eliminado desde la interfaz"
      });
    } else {
      const props = readLocal(LOCAL_KEYS.propiedades);
      const idx = props.findIndex(p => p.id === id);
      if (idx !== -1) {
        const oldRecord = props[idx];
        props[idx] = {
          ...oldRecord,
          is_deleted: true,
          deleted_at: nowIso(),
          deleted_by: "web-admin",
          delete_reason: "Eliminado desde la interfaz"
        };
        writeLocal(LOCAL_KEYS.propiedades, props);
        appendLocalHistory({
          action_type: "DELETE",
          module: "propiedades",
          record_id: id,
          old_data: oldRecord,
          new_data: props[idx]
        });
      }
    }
  },

  // INQUILINOS
  async getInquilinos() {
    if (isFirebaseConfigured) {
      const snap = await getDocs(collection(firestore, "Inquilinos"));
      return visibleOnly(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } else {
      return visibleOnly(readLocal(LOCAL_KEYS.inquilinos));
    }
  },

  async saveInquilino(inq) {
    if (isFirebaseConfigured) {
      const existing = inq.id ? (await getDoc(doc(firestore, "Inquilinos", inq.id))).data() : null;
      const payload = withSaveMetadata(inq, existing);
      if (inq.id) {
        await setDoc(doc(firestore, "Inquilinos", inq.id), payload);
        return payload;
      } else {
        const ref = await addDoc(collection(firestore, "Inquilinos"), payload);
        return { id: ref.id, ...payload };
      }
    } else {
      const inqs = readLocal(LOCAL_KEYS.inquilinos);
      const existing = inq.id ? inqs.find(i => i.id === inq.id) : null;
      const payload = withSaveMetadata(inq, existing);
      if (inq.id) {
        const idx = inqs.findIndex(i => i.id === inq.id);
        if (idx !== -1) inqs[idx] = payload;
      } else {
        payload.id = "inq-" + Date.now();
        inqs.push(payload);
      }
      writeLocal(LOCAL_KEYS.inquilinos, inqs);
      appendLocalHistory({
        action_type: existing ? "UPDATE" : "CREATE",
        module: "inquilinos",
        record_id: payload.id,
        old_data: existing || null,
        new_data: payload
      });
      return payload;
    }
  },

  async deleteInquilino(id) {
    if (isFirebaseConfigured) {
      const ref = doc(firestore, "Inquilinos", id);
      const current = (await getDoc(ref)).data();
      await setDoc(ref, {
        ...(current || {}),
        is_deleted: true,
        deleted_at: nowIso(),
        deleted_by: "web-admin",
        delete_reason: "Eliminado desde la interfaz"
      });
    } else {
      const inqs = readLocal(LOCAL_KEYS.inquilinos);
      const idx = inqs.findIndex(i => i.id === id);
      if (idx !== -1) {
        const oldRecord = inqs[idx];
        inqs[idx] = {
          ...oldRecord,
          is_deleted: true,
          deleted_at: nowIso(),
          deleted_by: "web-admin",
          delete_reason: "Eliminado desde la interfaz"
        };
        writeLocal(LOCAL_KEYS.inquilinos, inqs);
        appendLocalHistory({
          action_type: "DELETE",
          module: "inquilinos",
          record_id: id,
          old_data: oldRecord,
          new_data: inqs[idx]
        });
      }
    }
  },

  // MENSUALIDADES
  async getMensualidades() {
    if (isFirebaseConfigured) {
      const snap = await getDocs(collection(firestore, "Mensualidades"));
      return visibleOnly(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } else {
      return visibleOnly(readLocal(LOCAL_KEYS.mensualidades));
    }
  },

  async saveMensualidad(mens) {
    if (isFirebaseConfigured) {
      const existing = mens.id ? (await getDoc(doc(firestore, "Mensualidades", mens.id))).data() : null;
      const payload = withSaveMetadata({
        ...mens,
        total_cobrado: Number(mens.total_cobrado) || 0
      }, existing);
      if (mens.id) {
        await setDoc(doc(firestore, "Mensualidades", mens.id), payload);
        return payload;
      } else {
        const ref = await addDoc(collection(firestore, "Mensualidades"), payload);
        return { id: ref.id, ...payload };
      }
    } else {
      const menses = readLocal(LOCAL_KEYS.mensualidades);
      const existing = mens.id ? menses.find(m => m.id === mens.id) : null;
      const payload = withSaveMetadata({
        ...mens,
        total_cobrado: Number(mens.total_cobrado) || 0
      }, existing);
      if (mens.id) {
        const idx = menses.findIndex(m => m.id === mens.id);
        if (idx !== -1) menses[idx] = payload;
      } else {
        payload.id = "mens-" + Date.now();
        menses.push(payload);
      }
      writeLocal(LOCAL_KEYS.mensualidades, menses);
      appendLocalHistory({
        action_type: existing ? "UPDATE" : "CREATE",
        module: "mensualidades",
        record_id: payload.id,
        old_data: existing || null,
        new_data: payload
      });
      return payload;
    }
  },

  async deleteMensualidad(id) {
    if (isFirebaseConfigured) {
      const ref = doc(firestore, "Mensualidades", id);
      const current = (await getDoc(ref)).data();
      await setDoc(ref, {
        ...(current || {}),
        is_deleted: true,
        deleted_at: nowIso(),
        deleted_by: "web-admin",
        delete_reason: "Eliminado desde la interfaz"
      });
    } else {
      const menses = readLocal(LOCAL_KEYS.mensualidades);
      const idx = menses.findIndex(m => m.id === id);
      if (idx !== -1) {
        const oldRecord = menses[idx];
        menses[idx] = {
          ...oldRecord,
          is_deleted: true,
          deleted_at: nowIso(),
          deleted_by: "web-admin",
          delete_reason: "Eliminado desde la interfaz"
        };
        writeLocal(LOCAL_KEYS.mensualidades, menses);
        appendLocalHistory({
          action_type: "DELETE",
          module: "mensualidades",
          record_id: id,
          old_data: oldRecord,
          new_data: menses[idx]
        });
      }
    }
  },

  // CONFIGURACIÓN (DOCUMENTO ÚNICO admin_settings)
  async getConfig() {
    if (isFirebaseConfigured) {
      const docRef = doc(firestore, "Configuracion", "admin_settings");
      const d = await getDoc(docRef);
      if (d.exists()) {
        return d.data();
      } else {
        // Inicializa con semilla en firestore
        await setDoc(docRef, SEED_CONFIG);
        return SEED_CONFIG;
      }
    } else {
      return JSON.parse(localStorage.getItem("alquiler_config") || JSON.stringify(SEED_CONFIG));
    }
  },

  async saveConfig(config) {
    const payload = {
      ...config,
      updated_at: nowIso()
    };
    if (isFirebaseConfigured) {
      const docRef = doc(firestore, "Configuracion", "admin_settings");
      await setDoc(docRef, payload);
      return payload;
    } else {
      const oldData = readLocal(LOCAL_KEYS.config, SEED_CONFIG);
      writeLocal(LOCAL_KEYS.config, payload);
      appendLocalHistory({
        action_type: "UPDATE",
        module: "configuracion",
        record_id: "admin_settings",
        old_data: oldData,
        new_data: payload
      });
      return payload;
    }
  },

  async getDeletedRecords() {
    const buildRecord = (module, record) => ({ module, ...record });

    if (isFirebaseConfigured) {
      const [propsSnap, inqsSnap, mensSnap] = await Promise.all([
        getDocs(collection(firestore, "Propiedades")),
        getDocs(collection(firestore, "Inquilinos")),
        getDocs(collection(firestore, "Mensualidades"))
      ]);
      return [
        ...propsSnap.docs.map(d => buildRecord("propiedades", { id: d.id, ...d.data() })),
        ...inqsSnap.docs.map(d => buildRecord("inquilinos", { id: d.id, ...d.data() })),
        ...mensSnap.docs.map(d => buildRecord("mensualidades", { id: d.id, ...d.data() }))
      ].filter(record => record.is_deleted);
    }

    return [
      ...readLocal(LOCAL_KEYS.propiedades).map(record => buildRecord("propiedades", record)),
      ...readLocal(LOCAL_KEYS.inquilinos).map(record => buildRecord("inquilinos", record)),
      ...readLocal(LOCAL_KEYS.mensualidades).map(record => buildRecord("mensualidades", record))
    ].filter(record => record.is_deleted);
  },

  async restoreRecord(module, id) {
    if (!COLLECTION_MAP[module]) {
      throw new Error("Modulo no valido para restauracion.");
    }

    if (isFirebaseConfigured) {
      const ref = doc(firestore, COLLECTION_MAP[module], id);
      const current = (await getDoc(ref)).data();
      const restored = {
        ...(current || {}),
        is_deleted: false,
        restored_at: nowIso(),
        updated_at: nowIso()
      };
      await setDoc(ref, restored);
      return { id, ...restored };
    }

    const key = LOCAL_KEYS[module];
    const records = readLocal(key);
    const idx = records.findIndex(record => record.id === id);
    if (idx === -1) throw new Error("Registro no encontrado.");

    const oldRecord = records[idx];
    records[idx] = {
      ...oldRecord,
      is_deleted: false,
      restored_at: nowIso(),
      updated_at: nowIso()
    };
    writeLocal(key, records);
    appendLocalHistory({
      action_type: "RESTORE",
      module,
      record_id: id,
      old_data: oldRecord,
      new_data: records[idx]
    });
    return records[idx];
  },

  async getChangeHistory() {
    if (isFirebaseConfigured) {
      const snap = await getDocs(collection(firestore, "HistorialCambios"));
      return snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.changed_at || b.fecha || 0) - new Date(a.changed_at || a.fecha || 0));
    }

    return readLocal(LOCAL_KEYS.history);
  },

  async getBackupMeta() {
    if (isFirebaseConfigured) {
      return null;
    }

    return readLocal(LOCAL_KEYS.backupMeta, null);
  },

  async createBackup({ generatedBy = "web-admin" } = {}) {
    const timestamp = nowIso();
    const data = {
      propiedades: isFirebaseConfigured
        ? (await getDocs(collection(firestore, "Propiedades"))).docs.map(d => ({ id: d.id, ...d.data() }))
        : readLocal(LOCAL_KEYS.propiedades),
      inquilinos: isFirebaseConfigured
        ? (await getDocs(collection(firestore, "Inquilinos"))).docs.map(d => ({ id: d.id, ...d.data() }))
        : readLocal(LOCAL_KEYS.inquilinos),
      mensualidades: isFirebaseConfigured
        ? (await getDocs(collection(firestore, "Mensualidades"))).docs.map(d => ({ id: d.id, ...d.data() }))
        : readLocal(LOCAL_KEYS.mensualidades),
      config: await this.getConfig(),
      logs: isFirebaseConfigured ? [] : readLocal(LOCAL_KEYS.logs),
      change_history: await this.getChangeHistory()
    };

    const recordCount =
      data.propiedades.length +
      data.inquilinos.length +
      data.mensualidades.length +
      (data.logs?.length || 0) +
      (data.change_history?.length || 0) +
      1;

    const backup = {
      app: "AlquilerApp",
      type: "full_backup",
      version: 1,
      generated_at: timestamp,
      generated_by: generatedBy,
      record_count: recordCount,
      data
    };

    const meta = {
      last_backup_at: timestamp,
      generated_by: generatedBy,
      record_count: recordCount,
      version: backup.version
    };

    if (!isFirebaseConfigured) {
      writeLocal(LOCAL_KEYS.backupMeta, meta);
      appendLocalHistory({
        action_type: "BACKUP_EXPORT",
        module: "seguridad",
        record_id: "backup",
        old_data: null,
        new_data: meta
      });
    }

    await this.registrarLog({
      admin_id: generatedBy,
      accion: "EXPORTAR_BACKUP",
      descripcion: `Se genero un backup con ${recordCount} registros.`,
      detalles: meta
    });

    return backup;
  },

  validateBackupPayload(payload) {
    if (!payload || payload.app !== "AlquilerApp" || payload.type !== "full_backup") {
      throw new Error("El archivo no corresponde a un backup valido de AlquilerApp.");
    }
    if (!payload.data || !Array.isArray(payload.data.propiedades) || !Array.isArray(payload.data.inquilinos) || !Array.isArray(payload.data.mensualidades)) {
      throw new Error("El backup esta incompleto o corrupto.");
    }
    if (Number(payload.version || 0) > 1) {
      throw new Error("El backup pertenece a una version futura no compatible.");
    }
    return true;
  },

  async importBackup(payload, { importedBy = "web-admin" } = {}) {
    this.validateBackupPayload(payload);

    await this.createBackup({ generatedBy: importedBy });

    const importedAt = nowIso();
    const mergeRecords = (current, incoming, module) => {
      const byId = new Map(current.map(record => [record.id, record]));
      incoming.forEach((record) => {
        const existing = byId.get(record.id);
        const nextRecord = withSaveMetadata(
          {
            ...existing,
            ...record,
            imported_at: importedAt
          },
          existing
        );
        byId.set(nextRecord.id, nextRecord);
        appendLocalHistory({
          action_type: existing ? "IMPORT_UPDATE" : "IMPORT_CREATE",
          module,
          record_id: nextRecord.id,
          old_data: existing || null,
          new_data: nextRecord,
          changed_by: importedBy
        });
      });
      return Array.from(byId.values());
    };

    if (isFirebaseConfigured) {
      const collections = [
        ["Propiedades", payload.data.propiedades],
        ["Inquilinos", payload.data.inquilinos],
        ["Mensualidades", payload.data.mensualidades]
      ];
      for (const [collectionName, records] of collections) {
        for (const record of records) {
          await setDoc(doc(firestore, collectionName, record.id), {
            ...record,
            imported_at: importedAt,
            updated_at: importedAt
          });
        }
      }
      if (payload.data.config) {
        await this.saveConfig(payload.data.config);
      }
    } else {
      writeLocal(
        LOCAL_KEYS.propiedades,
        mergeRecords(readLocal(LOCAL_KEYS.propiedades), payload.data.propiedades, "propiedades")
      );
      writeLocal(
        LOCAL_KEYS.inquilinos,
        mergeRecords(readLocal(LOCAL_KEYS.inquilinos), payload.data.inquilinos, "inquilinos")
      );
      writeLocal(
        LOCAL_KEYS.mensualidades,
        mergeRecords(readLocal(LOCAL_KEYS.mensualidades), payload.data.mensualidades, "mensualidades")
      );
      if (payload.data.config) {
        await this.saveConfig({
          ...payload.data.config,
          imported_at: importedAt
        });
      }
    }

    await this.registrarLog({
      admin_id: importedBy,
      accion: "IMPORTAR_BACKUP",
      descripcion: "Se importo informacion desde un backup validado.",
      detalles: {
        generated_at: payload.generated_at,
        generated_by: payload.generated_by,
        imported_at: importedAt,
        record_count: payload.record_count
      }
    });

    return {
      imported_at: importedAt,
      record_count: payload.record_count || 0
    };
  },

  // LOGS DE SISTEMA / BITÁCORA
  async registrarLog(log) {
    const adminId = log.admin_id || "web-admin";
    const logData = {
      admin_id: adminId,
      accion: log.accion || "ACCION",
      descripcion: log.descripcion || "",
      detalles: log.detalles || {},
      tipo: log.tipo || "INFO",
      fecha: new Date().toISOString()
    };
    
    if (isFirebaseConfigured) {
      try {
        await addDoc(collection(firestore, "LogsSistema"), logData);
      } catch (error) {
        console.error("Error al guardar log en Firebase:", error);
      }
    } else {
      try {
        const logs = JSON.parse(localStorage.getItem("alquiler_logs") || "[]");
        logData.id = "log-" + Date.now() + "-" + Math.random().toString(36).slice(2, 11);
        logs.push(logData);
        localStorage.setItem("alquiler_logs", JSON.stringify(logs));
      } catch (error) {
        console.error("Error al guardar log en LocalStorage:", error);
      }
    }
    return logData;
  }
};

