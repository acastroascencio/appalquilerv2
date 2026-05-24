import { firebaseConfig, isFirebaseConfigured } from "../config/firebase";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, doc, getDocs, getDoc, 
  setDoc, addDoc, updateDoc, deleteDoc, query, where 
} from "firebase/firestore";

// Inicializa Firebase solo si está configurado
let firebaseApp = null;
let firestore = null;

if (isFirebaseConfigured) {
  try {
    firebaseApp = initializeApp(firebaseConfig);
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
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } else {
      return JSON.parse(localStorage.getItem("alquiler_propiedades") || "[]");
    }
  },

  async savePropiedad(prop) {
    if (isFirebaseConfigured) {
      if (prop.id) {
        await setDoc(doc(firestore, "Propiedades", prop.id), prop);
        return prop;
      } else {
        const ref = await addDoc(collection(firestore, "Propiedades"), prop);
        return { id: ref.id, ...prop };
      }
    } else {
      const props = JSON.parse(localStorage.getItem("alquiler_propiedades") || "[]");
      if (prop.id) {
        const idx = props.findIndex(p => p.id === prop.id);
        if (idx !== -1) props[idx] = prop;
      } else {
        prop.id = "prop-" + Date.now();
        props.push(prop);
      }
      localStorage.setItem("alquiler_propiedades", JSON.stringify(props));
      return prop;
    }
  },

  async deletePropiedad(id) {
    if (isFirebaseConfigured) {
      await deleteDoc(doc(firestore, "Propiedades", id));
    } else {
      let props = JSON.parse(localStorage.getItem("alquiler_propiedades") || "[]");
      props = props.filter(p => p.id !== id);
      localStorage.setItem("alquiler_propiedades", JSON.stringify(props));
    }
  },

  // INQUILINOS
  async getInquilinos() {
    if (isFirebaseConfigured) {
      const snap = await getDocs(collection(firestore, "Inquilinos"));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } else {
      return JSON.parse(localStorage.getItem("alquiler_inquilinos") || "[]");
    }
  },

  async saveInquilino(inq) {
    if (isFirebaseConfigured) {
      if (inq.id) {
        await setDoc(doc(firestore, "Inquilinos", inq.id), inq);
        return inq;
      } else {
        const ref = await addDoc(collection(firestore, "Inquilinos"), inq);
        return { id: ref.id, ...inq };
      }
    } else {
      const inqs = JSON.parse(localStorage.getItem("alquiler_inquilinos") || "[]");
      if (inq.id) {
        const idx = inqs.findIndex(i => i.id === inq.id);
        if (idx !== -1) inqs[idx] = inq;
      } else {
        inq.id = "inq-" + Date.now();
        inqs.push(inq);
      }
      localStorage.setItem("alquiler_inquilinos", JSON.stringify(inqs));
      return inq;
    }
  },

  async deleteInquilino(id) {
    if (isFirebaseConfigured) {
      await deleteDoc(doc(firestore, "Inquilinos", id));
    } else {
      let inqs = JSON.parse(localStorage.getItem("alquiler_inquilinos") || "[]");
      inqs = inqs.filter(i => i.id !== id);
      localStorage.setItem("alquiler_inquilinos", JSON.stringify(inqs));
    }
  },

  // MENSUALIDADES
  async getMensualidades() {
    if (isFirebaseConfigured) {
      const snap = await getDocs(collection(firestore, "Mensualidades"));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } else {
      return JSON.parse(localStorage.getItem("alquiler_mensualidades") || "[]");
    }
  },

  async saveMensualidad(mens) {
    if (isFirebaseConfigured) {
      if (mens.id) {
        await setDoc(doc(firestore, "Mensualidades", mens.id), mens);
        return mens;
      } else {
        const ref = await addDoc(collection(firestore, "Mensualidades"), {
          ...mens,
          total_cobrado: Number(mens.total_cobrado) || 0
        });
        return { id: ref.id, ...mens };
      }
    } else {
      const menses = JSON.parse(localStorage.getItem("alquiler_mensualidades") || "[]");
      if (mens.id) {
        const idx = menses.findIndex(m => m.id === mens.id);
        if (idx !== -1) menses[idx] = { ...mens, total_cobrado: Number(mens.total_cobrado) || 0 };
      } else {
        mens.id = "mens-" + Date.now();
        menses.push({ ...mens, total_cobrado: Number(mens.total_cobrado) || 0 });
      }
      localStorage.setItem("alquiler_mensualidades", JSON.stringify(menses));
      return mens;
    }
  },

  async deleteMensualidad(id) {
    if (isFirebaseConfigured) {
      await deleteDoc(doc(firestore, "Mensualidades", id));
    } else {
      let menses = JSON.parse(localStorage.getItem("alquiler_mensualidades") || "[]");
      menses = menses.filter(m => m.id !== id);
      localStorage.setItem("alquiler_mensualidades", JSON.stringify(menses));
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
    if (isFirebaseConfigured) {
      const docRef = doc(firestore, "Configuracion", "admin_settings");
      await setDoc(docRef, config);
      return config;
    } else {
      localStorage.setItem("alquiler_config", JSON.stringify(config));
      return config;
    }
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

