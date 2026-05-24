-- SCHEMA DE SUPABASE PARA ALQUILERAPP MÓVIL
-- Copia y pega este script en el menú "SQL Editor" de tu panel de Supabase (https://supabase.com)

-- 1. TABLA PERFILES (Caja Fuerte / Ajustes de Cobro)
CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  datos_pago JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Perfiles
DROP POLICY IF EXISTS "Los usuarios ven su propio perfil" ON public.perfiles;
CREATE POLICY "Los usuarios ven su propio perfil" ON public.perfiles
  FOR ALL USING (auth.uid() = id);


-- 2. TABLA DEPARTAMENTOS
CREATE TABLE IF NOT EXISTS public.departamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  identificador TEXT NOT NULL,
  precio_alquiler NUMERIC NOT NULL,
  configuracion JSONB DEFAULT '{}'::JSONB,
  fotos TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.departamentos ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Departamentos
DROP POLICY IF EXISTS "Los administradores gestionan sus departamentos" ON public.departamentos;
CREATE POLICY "Los administradores gestionan sus departamentos" ON public.departamentos
  FOR ALL USING (auth.uid() = admin_id);


-- 3. TABLA INQUILINOS
CREATE TABLE IF NOT EXISTS public.inquilinos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  celular TEXT NOT NULL,
  depto_id UUID REFERENCES public.departamentos ON DELETE SET NULL,
  moto_info JSONB DEFAULT '{}'::JSONB,
  documentos JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.inquilinos ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Inquilinos
DROP POLICY IF EXISTS "Los administradores gestionan sus inquilinos" ON public.inquilinos;
CREATE POLICY "Los administradores gestionan sus inquilinos" ON public.inquilinos
  FOR ALL USING (auth.uid() = admin_id);


-- 4. TABLA LECTURAS MENSUALES (Consumos de Luz, Agua y Seguridad)
CREATE TABLE IF NOT EXISTS public.lecturas_mensuales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  inquilino_id UUID REFERENCES public.inquilinos ON DELETE CASCADE NOT NULL,
  mes TEXT NOT NULL,
  luz JSONB DEFAULT '{}'::JSONB,
  agua JSONB DEFAULT '{}'::JSONB,
  seguridad NUMERIC DEFAULT 0 NOT NULL,
  pagado BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.lecturas_mensuales ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Lecturas Mensuales
DROP POLICY IF EXISTS "Los administradores gestionan sus lecturas" ON public.lecturas_mensuales;
CREATE POLICY "Los administradores gestionan sus lecturas" ON public.lecturas_mensuales
  FOR ALL USING (auth.uid() = admin_id);
