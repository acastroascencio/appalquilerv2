import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Save, Shield, CreditCard, DollarSign } from "lucide-react";

export default function CuentasBancariasForm() {
  const { config, saveConfig } = useApp();

  const [titular, setTitular] = useState("");
  const [yape, setYape] = useState("");
  const [plin, setPlin] = useState("");
  const [bcpCuenta, setBcpCuenta] = useState("");
  const [bcpCci, setBcpCci] = useState("");
  const [interbankCuenta, setInterbankCuenta] = useState("");
  const [interbankCci, setInterbankCci] = useState("");
  const [luzTarifa, setLuzTarifa] = useState("");
  const [aguaTarifa, setAguaTarifa] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setTitular(config.titular || "");
      setYape(config.billeteras?.yape || "");
      setPlin(config.billeteras?.plin || "");
      setBcpCuenta(config.bancos?.bcp_cuenta || "");
      setBcpCci(config.bancos?.bcp_cci || "");
      setInterbankCuenta(config.bancos?.interbank_cuenta || "");
      setInterbankCci(config.bancos?.interbank_cci || "");
      setLuzTarifa(config.tarifas?.luz || 1.0);
      setAguaTarifa(config.tarifas?.agua || 4.0);
    }
  }, [config]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titular) {
      alert("El nombre del titular es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        titular,
        billeteras: { yape, plin },
        bancos: {
          bcp_cuenta: bcpCuenta,
          bcp_cci: bcpCci.toUpperCase(),
          interbank_cuenta: interbankCuenta,
          interbank_cci: interbankCci.toUpperCase()
        },
        tarifas: {
          luz: Number(luzTarifa) || 0,
          agua: Number(aguaTarifa) || 0
        }
      };

      await saveConfig(payload);
      alert("Configuración de cobros guardada correctamente.");
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      alert("Ocurrió un error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. DATOS TITULAR */}
      <div className="card-container space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
          <Shield className="h-5 w-5 text-blue-500" />
          <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">Datos del Propietario / Titular</h4>
        </div>
        <div>
          <label className="label-text">Nombre del Titular de Cobro *</label>
          <input
            type="text"
            className="input-field"
            placeholder="Ej. Mario Andres Castro Ascencio"
            value={titular}
            onChange={(e) => setTitular(e.target.value)}
            required
          />
        </div>
      </div>

      {/* 2. CUENTAS Y BILLETERAS */}
      <div className="card-container space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
          <CreditCard className="h-5 w-5 text-blue-500" />
          <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">Cuentas Bancarias y Billeteras Digitales</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Número de Yape (Celular)</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ej. 987654321"
              value={yape}
              onChange={(e) => setYape(e.target.value)}
            />
          </div>
          <div>
            <label className="label-text">Número de Plin (Celular)</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ej. 987654321"
              value={plin}
              onChange={(e) => setPlin(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="label-text">Cuenta BCP</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ej. 191-98765432-0-12"
              value={bcpCuenta}
              onChange={(e) => setBcpCuenta(e.target.value)}
            />
          </div>
          <div>
            <label className="label-text">CCI BCP (Interbancario)</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ej. 002-19198765432012-54"
              value={bcpCci}
              onChange={(e) => setBcpCci(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="label-text">Cuenta Interbank</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ej. 200-300456789"
              value={interbankCuenta}
              onChange={(e) => setInterbankCuenta(e.target.value)}
            />
          </div>
          <div>
            <label className="label-text">CCI Interbank (Interbancario)</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ej. 003-200300456789-11"
              value={interbankCci}
              onChange={(e) => setInterbankCci(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 3. TARIFAS ESTÁNDAR */}
      <div className="card-container space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
          <DollarSign className="h-5 w-5 text-blue-500" />
          <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">Tarifas Estándar de Servicios</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Tarifa Energía Eléctrica (S/ por kWh)</label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              placeholder="Ej. 1.0"
              value={luzTarifa}
              onChange={(e) => setLuzTarifa(e.target.value)}
            />
          </div>
          <div>
            <label className="label-text">Tarifa Agua Potable (S/ por m³)</label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              placeholder="Ej. 4.0"
              value={aguaTarifa}
              onChange={(e) => setAguaTarifa(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* BOTÓN GUARDAR */}
      <button
        type="submit"
        disabled={saving}
        className="w-full btn-primary text-sm font-bold py-3 shadow-md shadow-blue-500/10 flex items-center justify-center gap-2"
      >
        <Save className="h-5 w-5" />
        <span>{saving ? "Guardando Configuración..." : "Guardar Toda la Configuración"}</span>
      </button>
    </form>
  );
}
