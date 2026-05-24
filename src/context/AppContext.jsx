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
    const isEdit = !!prop.id;
    const saved = await db.savePropiedad(prop);
    
    await db.registrarLog({
      admin_id: config?.titular,
      accion: isEdit ? "MODIFICAR_DEPARTAMENTO" : "CREAR_DEPARTAMENTO",
      descripcion: isEdit 
        ? `Se actualizó el departamento "${prop.identificador}"`
        : `Se creó el departamento "${prop.identificador}"`,
      detalles: { id: saved.id, identificador: prop.identificador }
    });

    await refreshAll();
    return saved;
  };

  const deletePropiedad = async (id) => {
    const prop = propiedades.find(p => p.id === id);
    const ident = prop ? prop.identificador : id;
    
    await db.deletePropiedad(id);
    
    await db.registrarLog({
      admin_id: config?.titular,
      accion: "ELIMINAR_DEPARTAMENTO",
      descripcion: `Se eliminó el departamento "${ident}"`,
      detalles: { id }
    });

    await refreshAll();
  };

  // INQUILINOS ACTIONS
  const saveInquilino = async (inq) => {
    const existing = inq.id ? inquilinos.find(i => i.id === inq.id) : null;
    const saved = await db.saveInquilino(inq);
    
    // Si se asigna una propiedad, actualizamos su estado a ocupado (true)
    if (inq.propiedad_id) {
      const prop = propiedades.find(p => p.id === inq.propiedad_id);
      if (prop && !prop.estado) {
        await db.savePropiedad({ ...prop, estado: true });
      }
    }

    // Registrar log con lógica específica
    let accion = "CREAR_INQUILINO";
    let desc = `Se registró al inquilino "${inq.nombre}"`;
    
    if (existing) {
      const oldHist = existing.documentos?.historial || [];
      const newHist = inq.documentos?.historial || [];
      if (newHist.length > oldHist.length) {
        const added = newHist.find(nd => !oldHist.some(od => od.id === nd.id));
        accion = "SUBIR_DOCUMENTO";
        desc = `Se subió el documento ${added ? added.tipo.toUpperCase() : "documento"} ("${added ? added.nombre : ''}") para el inquilino "${inq.nombre}"`;
      } else if (newHist.length < oldHist.length) {
        const removed = oldHist.find(od => !newHist.some(nd => nd.id === od.id));
        accion = "ELIMINAR_DOCUMENTO";
        desc = `Se eliminó el documento ${removed ? removed.tipo.toUpperCase() : "documento"} ("${removed ? removed.nombre : ''}") del historial del inquilino "${inq.nombre}"`;
      } else if ((existing.documentos?.dni_url && !inq.documentos?.dni_url) || (existing.documentos?.contrato_url && !inq.documentos?.contrato_url)) {
        const docTipo = !inq.documentos?.dni_url ? "DNI" : "Contrato";
        accion = "ELIMINAR_DOCUMENTO";
        desc = `Se eliminó el documento activo de ${docTipo} del inquilino "${inq.nombre}"`;
      } else {
        accion = "MODIFICAR_INQUILINO";
        desc = `Se modificaron los datos del inquilino "${inq.nombre}"`;
      }
    }

    await db.registrarLog({
      admin_id: config?.titular,
      accion,
      descripcion: desc,
      detalles: { id: saved.id, nombre: inq.nombre }
    });
    
    await refreshAll();
    return saved;
  };

  const deleteInquilino = async (id) => {
    // Si eliminamos al inquilino, liberamos la propiedad asociada
    const inq = inquilinos.find(i => i.id === id);
    const nombreInq = inq ? inq.nombre : id;

    if (inq && inq.propiedad_id) {
      const prop = propiedades.find(p => p.id === inq.propiedad_id);
      if (prop) {
        await db.savePropiedad({ ...prop, estado: false });
      }
    }

    await db.deleteInquilino(id);

    await db.registrarLog({
      admin_id: config?.titular,
      accion: "ELIMINAR_INQUILINO",
      descripcion: `Se retiró/eliminó al inquilino "${nombreInq}"`,
      detalles: { id }
    });

    await refreshAll();
  };

  // MENSUALIDADES ACTIONS
  const saveMensualidad = async (mens) => {
    const existing = mens.id ? mensualidades.find(m => m.id === mens.id) : null;
    const saved = await db.saveMensualidad(mens);
    
    const inqId = mens.inquilino_id || (existing ? existing.inquilino_id : null);
    const inq = inquilinos.find(i => i.id === inqId);
    const nombreInq = inq ? inq.nombre : "Desconocido";
    const periodo = mens.mes_anio || (existing ? existing.mes_anio : "");

    let accion = existing ? "MODIFICAR_CONSUMO" : "CREAR_CONSUMO";
    let desc = existing 
      ? `Se modificó el consumo del periodo ${periodo} del inquilino "${nombreInq}"`
      : `Se registró el consumo del periodo ${periodo} del inquilino "${nombreInq}"`;

    if (existing && existing.estado !== mens.estado) {
      desc = `Se marcó como ${mens.estado.toUpperCase()} el periodo ${periodo} del inquilino "${nombreInq}"`;
    }

    await db.registrarLog({
      admin_id: config?.titular,
      accion,
      descripcion: desc,
      detalles: { id: saved.id, inquilino: nombreInq, periodo }
    });

    await refreshAll();
    return saved;
  };

  const deleteMensualidad = async (id) => {
    const mens = mensualidades.find(m => m.id === id);
    const inq = mens ? inquilinos.find(i => i.id === mens.inquilino_id) : null;
    const nombreInq = inq ? inq.nombre : "Desconocido";
    const periodo = mens ? mens.mes_anio : "";

    await db.deleteMensualidad(id);

    await db.registrarLog({
      admin_id: config?.titular,
      accion: "ELIMINAR_CONSUMO",
      descripcion: `Se eliminó el registro de consumo del periodo ${periodo} del inquilino "${nombreInq}"`,
      detalles: { id }
    });

    await refreshAll();
  };

  // CONFIG ACTIONS
  const saveConfig = async (newCfg) => {
    const saved = await db.saveConfig(newCfg);
    setConfig(saved);

    await db.registrarLog({
      admin_id: saved.titular,
      accion: "GUARDAR_CONFIGURACION",
      descripcion: `Se actualizaron las tarifas y cuentas bancarias del propietario "${saved.titular}"`
    });

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
