import { createClient } from "@supabase/supabase-js";

// Configuración de Supabase con variables de entorno de Vite
const urlSupabase = import.meta.env.VITE_SUPABASE_URL || "";
const claveAnonimaSupabase = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const clienteSupabase = createClient(urlSupabase, claveAnonimaSupabase);
