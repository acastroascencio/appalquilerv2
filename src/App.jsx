import { useEffect, useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Departamentos from "./pages/Departamentos";
import Inquilinos from "./pages/Inquilinos";
import RegistroConsumo from "./pages/RegistroConsumo";
import Configuracion from "./pages/Configuracion";
import Login from "./pages/Login";

function AppContent({ sesionActiva, cerrarSesion, theme, resolvedTheme, onToggleTheme }) {
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
    <AppLayout
      sesionActiva={sesionActiva}
      onSignOut={cerrarSesion}
      theme={theme}
      resolvedTheme={resolvedTheme}
      onToggleTheme={onToggleTheme}
    >
      {renderActivePage()}
    </AppLayout>
  );
}

export default function App() {
  const [sesionActiva, setSesionActiva] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [themePreference, setThemePreference] = useState(() => {
    const storedTheme = localStorage.getItem("alquiler_web_theme");
    if (["light", "dark", "system"].includes(storedTheme)) return storedTheme;
    return "system";
  });
  const [systemTheme, setSystemTheme] = useState(() =>
    window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  const resolvedTheme = themePreference === "system" ? systemTheme : themePreference;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.dataset.theme = resolvedTheme;
    root.dataset.themePreference = themePreference;
    localStorage.setItem("alquiler_web_theme", themePreference);
  }, [resolvedTheme, themePreference]);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mediaQuery) return undefined;

    const handleSystemThemeChange = (event) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  const toggleTheme = () => {
    setThemePreference((currentTheme) => {
      if (currentTheme === "system") return "light";
      if (currentTheme === "light") return "dark";
      return "system";
    });
  };

  useEffect(() => {
    const storedSession = localStorage.getItem("alquiler_web_session");
    if (storedSession) {
      try {
        setSesionActiva(JSON.parse(storedSession));
      } catch {
        localStorage.removeItem("alquiler_web_session");
      }
    }
    setCargandoSesion(false);
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("alquiler_web_session");
    setSesionActiva(null);
  };

  if (cargandoSesion) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-900 text-white">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          <div className="absolute h-6 w-6 rounded-full bg-slate-900"></div>
        </div>
        <div className="text-center">
          <p className="text-sm font-extrabold uppercase tracking-widest text-slate-400">AlquilerApp</p>
          <span className="text-xs font-medium text-slate-500">Validando sesión local...</span>
        </div>
      </div>
    );
  }

  if (!sesionActiva) {
    return (
      <Login
        setSesionActiva={setSesionActiva}
        theme={themePreference}
        resolvedTheme={resolvedTheme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <AppProvider>
      <AppContent
        sesionActiva={sesionActiva}
        cerrarSesion={cerrarSesion}
        theme={themePreference}
        resolvedTheme={resolvedTheme}
        onToggleTheme={toggleTheme}
      />
    </AppProvider>
  );
}
