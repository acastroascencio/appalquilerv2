import { Monitor, Moon, Sun } from "lucide-react";

const THEME_LABELS = {
  light: "Claro",
  dark: "Oscuro",
  system: "Sistema",
};

export default function ThemeToggle({ theme, resolvedTheme, onToggle, label = true }) {
  const preference = theme || "system";
  const activeTheme = resolvedTheme || (preference === "dark" ? "dark" : "light");
  const Icon = preference === "system" ? Monitor : activeTheme === "dark" ? Sun : Moon;
  const nextLabel = preference === "system" ? "modo claro" : preference === "light" ? "modo oscuro" : "tema del sistema";

  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-extrabold shadow-sm transition-colors hover:brightness-95"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border-strong)",
        color: "var(--text-primary)",
      }}
      aria-label={`Cambiar a ${nextLabel}`}
      title={`Tema: ${THEME_LABELS[preference]}`}
    >
      <Icon
        className={`h-5 w-5 shrink-0 ${activeTheme === "dark" ? "text-amber-300" : "text-blue-700"}`}
        aria-hidden="true"
      />
      {label && <span className="hidden sm:inline">{THEME_LABELS[preference]}</span>}
    </button>
  );
}
