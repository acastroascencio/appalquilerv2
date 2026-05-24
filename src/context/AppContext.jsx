import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../services/db";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [propiedades, setPropiedades] = useState([]);
  const [inquilinos, setInquilinos] = useState([]);
  const [mensualidades, setMensualidades] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Enrutamiento simplificado por estado
  const [activePage, setActivePage] = useState("dashboard"); // dashboard, departamentos, inquilinos, configuracion
  const [selectedInquilinoId, setSelectedInquilinoId] = useState(null);

  const refreshAll = async () => {
    setLoading(true);
    try {
      const [props, inqs, menses, cfg] = await Promise.all([
        db.getPropiedades(),
        db.getInquilinos(),
        db.getMensualidades(),
        db.getConfig()
      ]);
      setPropiedades(props);
      setInquilinos(inqs);
      setMensualidades(menses);
      setConfig(cfg);
    } catch (error) {
      console.error("Error al cargar datos desde la base de datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // PROPIEDADES ACTIONS
  const savePropiedad = async (prop) => {
    const saved = await db.savePropiedad(prop);
    await refreshAll();
    return saved;
  };

  const deletePropiedad = async (id) => {
    await db.deletePropiedad(id);
    await refreshAll();
  };

  // INQUILINOS ACTIONS
  const saveInquilino = async (inq) => {
    const saved = await db.saveInquilino(inq);
    
    // Si se asigna una propiedad, actualizamos su estado a ocupado (true)
    if (inq.propiedad_id) {
      const prop = propiedades.find(p => p.id === inq.propiedad_id);
      if (prop && !prop.estado) {
        await db.savePropiedad({ ...prop, estado: true });
      }
    }
    
    await refreshAll();
    return saved;
  };

  const deleteInquilino = async (id) => {
    // Si eliminamos al inquilino, liberamos la propiedad asociada
    const inq = inquilinos.find(i => i.id === id);
    if (inq && inq.propiedad_id) {
      const prop = propiedades.find(p => p.id === inq.propiedad_id);
      if (prop) {
        await db.savePropiedad({ ...prop, estado: false });
      }
    }

    await db.deleteInquilino(id);
    await refreshAll();
  };

  // MENSUALIDADES ACTIONS
  const saveMensualidad = async (mens) => {
    const saved = await db.saveMensualidad(mens);
    await refreshAll();
    return saved;
  };

  const deleteMensualidad = async (id) => {
    await db.deleteMensualidad(id);
    await refreshAll();
  };

  // CONFIG ACTIONS
  const saveConfig = async (newCfg) => {
    const saved = await db.saveConfig(newCfg);
    setConfig(saved);
    return saved;
  };

  return (
    <AppContext.Provider
      value={{
        propiedades,
        inquilinos,
        mensualidades,
        config,
        loading,
        activePage,
        setActivePage,
        selectedInquilinoId,
        setSelectedInquilinoId,
        refreshAll,
        savePropiedad,
        deletePropiedad,
        saveInquilino,
        deleteInquilino,
        saveMensualidad,
        deleteMensualidad,
        saveConfig
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp debe ser usado dentro de AppProvider");
  }
  return context;
};
