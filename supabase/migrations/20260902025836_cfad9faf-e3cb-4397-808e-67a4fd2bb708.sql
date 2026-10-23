CREATE TYPE public.app_role AS ENUM ('vendedor', 'gestor');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nombre TEXT NOT NULL DEFAULT '',
  telefono TEXT,
  zona TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_gestor()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'gestor');
$$;

CREATE POLICY "perfiles visibles para autenticados" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "cada quien crea su perfil" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "cada quien edita su perfil" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "ver roles propios" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_gestor());

CREATE TYPE public.registro_estado AS ENUM ('borrador', 'enviada', 'aprobada', 'rechazada');
CREATE TYPE public.activacion_estado AS ENUM ('sin_iniciar', 'en_proceso', 'activa');
CREATE TYPE public.etapa_pipeline AS ENUM ('prospecto', 'contactado', 'demo', 'negociacion', 'ganado', 'perdido');

CREATE TABLE public.cafeterias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_comercial TEXT NOT NULL,
  razon_social TEXT,
  rfc TEXT,
  direccion TEXT,
  ciudad TEXT,
  estado_geo TEXT,
  cp TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  contacto_nombre TEXT,
  contacto_telefono TEXT,
  contacto_email TEXT,
  horario TEXT,
  notas TEXT,
  registro_estado public.registro_estado NOT NULL DEFAULT 'borrador',
  activacion_estado public.activacion_estado NOT NULL DEFAULT 'sin_iniciar',
  motivo_rechazo TEXT,
  vendedor_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  aprobada_por UUID REFERENCES auth.users,
  aprobada_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cafeterias TO authenticated;
GRANT ALL ON public.cafeterias TO service_role;
ALTER TABLE public.cafeterias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cafeterias visibles" ON public.cafeterias
  FOR SELECT TO authenticated USING (vendedor_id = auth.uid() OR public.is_gestor());
CREATE POLICY "vendedor crea cafeteria" ON public.cafeterias
  FOR INSERT TO authenticated WITH CHECK (vendedor_id = auth.uid() OR public.is_gestor());
CREATE POLICY "editar cafeteria" ON public.cafeterias
  FOR UPDATE TO authenticated USING (vendedor_id = auth.uid() OR public.is_gestor())
  WITH CHECK (vendedor_id = auth.uid() OR public.is_gestor());
CREATE POLICY "borrar cafeteria" ON public.cafeterias
  FOR DELETE TO authenticated USING (vendedor_id = auth.uid() OR public.is_gestor());

CREATE TABLE public.prospectos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafeteria_id UUID REFERENCES public.cafeterias ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  contacto_nombre TEXT,
  contacto_telefono TEXT,
  etapa public.etapa_pipeline NOT NULL DEFAULT 'prospecto',
  proxima_accion TEXT,
  proxima_accion_fecha DATE,
  notas TEXT,
  vendedor_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prospectos TO authenticated;
GRANT ALL ON public.prospectos TO service_role;
ALTER TABLE public.prospectos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prospectos visibles" ON public.prospectos
  FOR SELECT TO authenticated USING (vendedor_id = auth.uid() OR public.is_gestor());
CREATE POLICY "crear prospecto" ON public.prospectos
  FOR INSERT TO authenticated WITH CHECK (vendedor_id = auth.uid() OR public.is_gestor());
CREATE POLICY "editar prospecto" ON public.prospectos
  FOR UPDATE TO authenticated USING (vendedor_id = auth.uid() OR public.is_gestor())
  WITH CHECK (vendedor_id = auth.uid() OR public.is_gestor());
CREATE POLICY "borrar prospecto" ON public.prospectos
  FOR DELETE TO authenticated USING (vendedor_id = auth.uid() OR public.is_gestor());

CREATE TABLE public.actividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospecto_id UUID NOT NULL REFERENCES public.prospectos ON DELETE CASCADE,
  tipo TEXT NOT NULL DEFAULT 'nota',
  detalle TEXT NOT NULL,
  autor_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.actividades TO authenticated;
GRANT ALL ON public.actividades TO service_role;
ALTER TABLE public.actividades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "actividades visibles" ON public.actividades
  FOR SELECT TO authenticated USING (
    public.is_gestor() OR EXISTS (
      SELECT 1 FROM public.prospectos p WHERE p.id = prospecto_id AND p.vendedor_id = auth.uid()
    )
  );
CREATE POLICY "crear actividad" ON public.actividades
  FOR INSERT TO authenticated WITH CHECK (
    autor_id = auth.uid() AND (
      public.is_gestor() OR EXISTS (
        SELECT 1 FROM public.prospectos p WHERE p.id = prospecto_id AND p.vendedor_id = auth.uid()
      )
    )
  );
CREATE POLICY "borrar actividad propia" ON public.actividades
  FOR DELETE TO authenticated USING (autor_id = auth.uid() OR public.is_gestor());

CREATE TABLE public.onboarding_pasos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafeteria_id UUID NOT NULL REFERENCES public.cafeterias ON DELETE CASCADE,
  clave TEXT NOT NULL,
  titulo TEXT NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0,
  completado BOOLEAN NOT NULL DEFAULT false,
  completado_at TIMESTAMPTZ,
  completado_por UUID REFERENCES auth.users,
  nota TEXT,
  evidencia_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (cafeteria_id, clave)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_pasos TO authenticated;
GRANT ALL ON public.onboarding_pasos TO service_role;
ALTER TABLE public.onboarding_pasos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pasos visibles" ON public.onboarding_pasos
  FOR SELECT TO authenticated USING (
    public.is_gestor() OR EXISTS (
      SELECT 1 FROM public.cafeterias c WHERE c.id = cafeteria_id AND c.vendedor_id = auth.uid()
    )
  );
CREATE POLICY "crear paso" ON public.onboarding_pasos
  FOR INSERT TO authenticated WITH CHECK (
    public.is_gestor() OR EXISTS (
      SELECT 1 FROM public.cafeterias c WHERE c.id = cafeteria_id AND c.vendedor_id = auth.uid()
    )
  );
CREATE POLICY "editar paso" ON public.onboarding_pasos
  FOR UPDATE TO authenticated USING (
    public.is_gestor() OR EXISTS (
      SELECT 1 FROM public.cafeterias c WHERE c.id = cafeteria_id AND c.vendedor_id = auth.uid()
    )
  ) WITH CHECK (
    public.is_gestor() OR EXISTS (
      SELECT 1 FROM public.cafeterias c WHERE c.id = cafeteria_id AND c.vendedor_id = auth.uid()
    )
  );
CREATE POLICY "borrar paso" ON public.onboarding_pasos
  FOR DELETE TO authenticated USING (public.is_gestor());

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_cafeterias_updated BEFORE UPDATE ON public.cafeterias
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_prospectos_updated BEFORE UPDATE ON public.prospectos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'nombre', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE WHEN COALESCE(NEW.raw_user_meta_data ->> 'rol', 'vendedor') = 'gestor'
      THEN 'gestor'::public.app_role ELSE 'vendedor'::public.app_role END
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.seed_onboarding()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.onboarding_pasos (cafeteria_id, clave, titulo, orden)
  VALUES
    (NEW.id, 'alta_aprobada', 'Alta aprobada', 1),
    (NEW.id, 'menu_cargado', 'Menú cargado', 2),
    (NEW.id, 'cobro_configurado', 'Medio de cobro configurado', 3),
    (NEW.id, 'capacitacion', 'Capacitación al personal', 4),
    (NEW.id, 'prueba_transaccion', 'Prueba de transacción', 5),
    (NEW.id, 'go_live', 'Go live', 6)
  ON CONFLICT (cafeteria_id, clave) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_seed_onboarding
  AFTER INSERT ON public.cafeterias
  FOR EACH ROW EXECUTE FUNCTION public.seed_onboarding();

CREATE POLICY "ver evidencias" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'evidencias');
CREATE POLICY "subir evidencias" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'evidencias' AND owner = auth.uid());
CREATE POLICY "borrar evidencias propias" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'evidencias' AND owner = auth.uid());