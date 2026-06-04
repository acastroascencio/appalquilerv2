import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Save, Shield, CreditCard, DollarSign } from "lucide-react";
import ConfirmDialog from "../components/ui/ConfirmDialog";

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
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [pendingConfig, setPendingConfig] = useState(null);

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

  const buildPayload = () => ({
    titular: titular.trim(),
    billeteras: { yape: yape.trim(), plin: plin.trim() },
    bancos: {
      bcp_cuenta: bcpCuenta.trim(),
      bcp_cci: bcpCci.trim().toUpperCase(),
      interbank_cuenta: interbankCuenta.trim(),
      interbank_cci: interbankCci.trim().toUpperCase()
    },
    tarifas: {
      luz: Number(luzTarifa) || 0,
      agua: Number(aguaTarifa) || 0
    }
  });

  const validatePayload = (payload) => {
    if (!payload.titular) {
      return "El nombre del titular es obligatorio.";
    }

    if (payload.tarifas.luz < 0 || payload.tarifas.agua < 0) {
      return "Las tarifas no pueden ser negativas.";
    }

    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    const payload = buildPayload();
    const validationError = validatePayload(payload);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setPendingConfig(payload);
  };

  const confirmSaveConfig = async () => {
    if (!pendingConfig) return;

    setSaving(true);
    setFormError("");
    setFormSuccess("");

    try {
      await saveConfig(pendingConfig);
      setPendingConfig(null);
      setFormSuccess("Configuracion guardada correctamente.");
    } catch (error) {
      console.error("Error al guardar configuracion:", error);
      setFormError("No se pudo guardar la configuracion. Verifica tu conexion o intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="app-alert-error" role="alert">
          <span>{formError}</span>
        </div>
      )}
      {formSuccess && (
        <div className="app-alert-success" role="status" aria-live="polite">
          <span>{formSuccess}</span>
        </div>
      )}

      <div className="card-container space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
          <Shield className="h-5 w-5 text-blue-500" aria-hidden="true" />
          <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">
            Datos del Propietario / Titular
          </h4>
        </div>
        <div>
          <label className="label-text" htmlFor="config-titular">
            Nombre del Titular de Cobro *
          </label>
          <input
            id="config-titular"
            type="text"
            className="input-field"
            placeholder="Ej. Mario Andres Castro Ascencio"
            value={titular}
            onChange={(e) => setTitular(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="card-container space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
          <CreditCard className="h-5 w-5 text-blue-500" aria-hidden="true" />
          <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">
            Cuentas Bancarias y Billeteras Digitales
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-text" htmlFor="config-yape">Numero de Yape (Celular)</label>
            <input
              id="config-yape"
              type="text"
              className="input-field"
              placeholder="Ej. 987654321"
              value={yape}
              onChange={(e) => setYape(e.target.value)}
            />
          </div>
          <div>
            <label className="label-text" htmlFor="config-plin">Numero de Plin (Celular)</label>
            <input
              id="config-plin"
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
            <label className="label-text" htmlFor="config-bcp">Cuenta BCP</label>
            <input
              id="config-bcp"
              type="text"
              className="input-field"
              placeholder="Ej. 191-98765432-0-12"
              value={bcpCuenta}
              onChange={(e) => setBcpCuenta(e.target.value)}
            />
          </div>
          <div>
            <label className="label-text" htmlFor="config-bcp-cci">CCI BCP (Interbancario)</label>
            <input
              id="config-bcp-cci"
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
            <label className="label-text" htmlFor="config-interbank">Cuenta Interbank</label>
            <input
              id="config-interbank"
              type="text"
              className="input-field"
              placeholder="Ej. 200-300456789"
              value={interbankCuenta}
              onChange={(e) => setInterbankCuenta(e.target.value)}
            />
          </div>
          <div>
            <label className="label-text" htmlFor="config-interbank-cci">CCI Interbank (Interbancario)</label>
            <input
              id="config-interbank-cci"
              type="text"
              className="input-field"
              placeholder="Ej. 003-200300456789-11"
              value={interbankCci}
              onChange={(e) => setInterbankCci(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card-container space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
          <DollarSign className="h-5 w-5 text-blue-500" aria-hidden="true" />
          <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">
            Tarifas Estandar de Servicios
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-text" htmlFor="config-luz">Tarifa Energia Electrica (S/ por kWh)</label>
            <input
              id="config-luz"
              type="number"
              step="0.01"
              min="0"
              className="input-field"
              placeholder="Ej. 1.0"
              value={luzTarifa}
              onChange={(e) => setLuzTarifa(e.target.value)}
            />
          </div>
          <div>
            <label className="label-text" htmlFor="config-agua">Tarifa Agua Potable (S/ por m3)</label>
            <input
              id="config-agua"
              type="number"
              step="0.01"
              min="0"
              className="input-field"
              placeholder="Ej. 4.0"
              value={aguaTarifa}
              onChange={(e) => setAguaTarifa(e.target.value)}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full btn-primary text-sm font-bold shadow-md shadow-blue-500/10"
      >
        <Save className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span>{saving ? "Guardando configuracion..." : "Guardar Toda la Configuracion"}</span>
      </button>

      <ConfirmDialog
        open={Boolean(pendingConfig)}
        title="Guardar configuracion"
        message="Se actualizaran las cuentas de cobro, tarifas y datos del propietario. El cambio quedara registrado en el historial."
        confirmLabel={saving ? "Guardando..." : "Guardar configuracion"}
        cancelLabel="Cancelar"
        onConfirm={confirmSaveConfig}
        onCancel={() => {
          if (!saving) setPendingConfig(null);
        }}
      />
    </form>
  );
}
