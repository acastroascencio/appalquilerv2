import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Departamentos from "./pages/Departamentos";
import Inquilinos from "./pages/Inquilinos";
import RegistroConsumo from "./pages/RegistroConsumo";
import Configuracion from "./pages/Configuracion";

function AppContent() {
  const { activePage, loading } = useApp();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white flex-col gap-4">
        {/* Spinner animado Premium */}
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <div className="absolute h-6 w-6 bg-slate-900 rounded-full"></div>
        </div>
        <div className="text-center">
          <p className="text-sm font-extrabold tracking-widest text-slate-400 uppercase">AlquilerApp</p>
          <span className="text-xs text-slate-500 font-medium">Iniciando base de datos unificada...</span>
        </div>
      </div>
    );
  }

  const renderActivePage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "departamentos":
        return <Departamentos />;
      case "inquilinos":
        return <Inquilinos />;
      case "consumo":
        return <RegistroConsumo />;
      case "configuracion":
        return <Configuracion />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppLayout>
      {renderActivePage()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
