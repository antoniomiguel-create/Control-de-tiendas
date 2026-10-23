import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import {
  AtSign,
  Banknote,
  Building2,
  Check,
  Clock,
  CreditCard,
  FileText,
  Flag,
  ImagePlus,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  Card,
  Field,
  FloatingBar,
  inputClass,
  PasswordInput,
  PrimaryCTA,
  Shell,
} from "@/components/ui-kit";
import { demo, useDemo, type Cafeteria } from "@/lib/demo";
import { DIAS, ESTADOS, normalizaHora, REGIMENES_FISCALES, TIPOS_INSTITUCION } from "@/lib/estados";
import { BANDERAS, type CafeteriaLike } from "@/lib/kigo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/cafeterias/$id_/editar")({
  head: () => ({
    meta: [
      { title: "Editar tienda — Control Tiendas · Kigo Pick" },
      { name: "description", content: "Completa la información de la tienda sección por sección." },
      { property: "og:title", content: "Editar tienda — Control Tiendas · Kigo Pick" },
      { property: "og:description", content: "Completa la información de la tienda." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { bandera?: string | undefined } => ({
    bandera: typeof search["bandera"] === "string" ? search["bandera"] : undefined,
  }),
  component: EditarCafeteria,
});

/* ------------------------------------------------------------ auxiliares -- */

function Err({ children }: { children?: string | undefined }) {
  if (!children) return null;
  return <p className="mt-1.5 text-[12px] font-semibold text-destructive">{children}</p>;
}

function cxErr(base: string, error?: string) {
  return cn(base, error && "border-destructive focus:border-destructive");
}

function Req() {
  return <span className="ml-0.5 text-destructive">*</span>;
}

function SinFacturaToggle({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-muted/40 p-3 text-left active:scale-[0.98]"
    >
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
        )}
      >
        {checked && <Check className="h-4 w-4" strokeWidth={3} />}
      </span>
      <span className="flex-1 text-[14px] font-bold">El cliente no requiere factura</span>
    </button>
  );
}

function TituloSeccion({
  titulo,
  completa,
  bandera,
}: {
  titulo: string;
  completa: boolean;
  bandera: string;
}) {
  return (
    <div
      id={`bandera-${bandera}`}
      className="mb-4 flex scroll-mt-32 items-center gap-3 rounded-2xl transition-shadow duration-500"
    >
      <span
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-full",
          completa ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
        )}
      >
        {completa ? (
          <Check className="h-4 w-4" strokeWidth={3} />
        ) : (
          <Flag className="h-3.5 w-3.5" strokeWidth={2.5} />
        )}
      </span>
      <h3 className="text-[16px] font-bold tracking-[-0.02em]">{titulo}</h3>
    </div>
  );
}

function SubSection({ title }: { title: string }) {
  return (
    <div className="pt-2">
      <div className="border-t border-border/60 pt-4">
        <h4 className="text-[13px] font-extrabold tracking-[-0.02em] text-muted-foreground uppercase">
          {title}
        </h4>
      </div>
    </div>
  );
}

function FilePicker({
  value,
  onChange,
  label,
  hint,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  label: string;
  hint?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Field label={label}>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/40 p-3 text-left active:scale-[0.98]"
      >
        {value ? (
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-success/10 text-success">
            <FileText className="h-7 w-7" strokeWidth={2} />
          </span>
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-card text-primary">
            <ImagePlus className="h-6 w-6" strokeWidth={2.5} />
          </span>
        )}
        <span className="flex-1">
          <span className="block text-[14px] font-bold">
            {value ? "Cambiar archivo" : "Haz clic para subir"}
          </span>
          {hint && <span className="block text-[12px] text-muted-foreground">{hint}</span>}
        </span>
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => onChange(String(reader.result));
          reader.readAsDataURL(file);
        }}
      />
    </Field>
  );
}

/* ---------------------------------------------------------------- estado -- */

type Forma = {
  // cuenta del administrador
  admin_nombre: string;
  admin_telefono: string;
  admin_email: string;
  admin_usuario: string;
  admin_password: string;
  admin_password2: string;
  // datos de la tienda
  nombre: string;
  estado: string;
  institucion: string;
  tipo_institucion: string[];
  sistema_operativo: string;
  referencia: string;
  // cuenta de la tienda
  usuario: string;
  password: string;
  password2: string;
  // logo
  logo: string | null;
  // ventas
  ventas_mensuales_promedio: string;
  // costo
  costo_inscripcion: string;
  // trato
  trato: string;
  // horario
  dias: number[];
  horas: Record<number, { apertura: string; cierre: string }>;
  // facturación
  razon_social: string;
  rfc: string;
  codigo_postal_fiscal: string;
  regimen_fiscal: string;
  direccion_fiscal: string;
  constancia_situacion_fiscal: string | null;
  no_requiere_factura: boolean;
  correo_pagos: string;
  // pagos
  titular_cuenta: string;
  email_titular: string;
  clabe: string;
  telefono_contacto: string;
};

function formaDe(c: Cafeteria): Forma {
  return {
    admin_nombre: c.contacto_nombre,
    admin_telefono: c.contacto_telefono,
    admin_email: c.contacto_email,
    admin_usuario: c.usuario_admin,
    admin_password: c.password_admin,
    admin_password2: c.password_admin,
    nombre: c.nombre_comercial,
    estado: String(ESTADOS.find((e) => e.label === c.ciudad)?.value ?? ""),
    institucion: c.institucion,
    tipo_institucion: c.tipo_institucion,
    sistema_operativo: c.sistema_operativo,
    referencia: c.referencia,
    usuario: c.usuario_tienda,
    password: c.password_tienda,
    password2: c.password_tienda,
    logo: c.logo,
    ventas_mensuales_promedio: c.ventas_mensuales_promedio,
    costo_inscripcion: c.costo_inscripcion,
    trato: c.trato,
    dias: c.dias,
    horas: c.horas,
    razon_social: c.razon_social,
    rfc: c.rfc,
    codigo_postal_fiscal: c.codigo_postal_fiscal,
    regimen_fiscal: c.regimen_fiscal,
    direccion_fiscal: c.direccion_fiscal,
    constancia_situacion_fiscal: c.constancia_situacion_fiscal,
    no_requiere_factura: c.no_requiere_factura,
    correo_pagos: c.correo_pagos,
    titular_cuenta: c.titular_cuenta,
    email_titular: c.email_titular,
    clabe: c.clabe,
    telefono_contacto: c.telefono_contacto,
  };
}

/** Vista tipo CafeteriaLike para evaluar las banderas en vivo. */
function comoCafeteria(f: Forma): CafeteriaLike {
  return {
    nombre_comercial: f.nombre,
    contacto_nombre: f.admin_nombre,
    contacto_telefono: f.admin_telefono,
    contacto_email: f.admin_email,
    usuario_admin: f.admin_usuario,
    password_admin: f.admin_password,
    ciudad: ESTADOS.find((e) => String(e.value) === f.estado)?.label ?? "",
    tipo_institucion: f.tipo_institucion,
    horario: "",
    dias: f.dias,
    horas: f.horas,
    razon_social: f.razon_social,
    rfc: f.rfc,
    codigo_postal_fiscal: f.codigo_postal_fiscal,
    regimen_fiscal: f.regimen_fiscal,
    direccion_fiscal: f.direccion_fiscal,
    constancia_situacion_fiscal: f.constancia_situacion_fiscal,
    no_requiere_factura: f.no_requiere_factura,
    usuario_tienda: f.usuario,
    password_tienda: f.password,
    logo: f.logo,
    correo_pagos: f.correo_pagos,
    titular_cuenta: f.titular_cuenta,
    email_titular: f.email_titular,
    clabe: f.clabe,
    telefono_contacto: f.telefono_contacto,
    ventas_mensuales_promedio: f.ventas_mensuales_promedio,
    costo_inscripcion: f.costo_inscripcion,
    trato: f.trato,
  };
}

/* -------------------------------------------------------------- pantalla -- */

function EditarCafeteria() {
  const { id } = useParams({ from: "/_authenticated/cafeterias/$id_/editar" });
  const { bandera } = Route.useSearch();

  // Al llegar desde una bandera, baja hasta su sección y la resalta un momento.
  // Espera un instante para que el router termine de colocar la página arriba.
  useEffect(() => {
    if (!bandera) return;
    const resalte = ["ring-2", "ring-primary", "ring-offset-4", "ring-offset-card"];
    let el: HTMLElement | null = null;
    const bajar = setTimeout(() => {
      el = document.getElementById(`bandera-${bandera}`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add(...resalte);
    }, 150);
    const quitar = setTimeout(() => el?.classList.remove(...resalte), 2000);
    return () => {
      clearTimeout(bajar);
      clearTimeout(quitar);
      el?.classList.remove(...resalte);
    };
  }, [bandera]);
  const navigate = useNavigate();
  const { cafeterias } = useDemo();
  const logoRef = useRef<HTMLInputElement>(null);

  const cafeteria = cafeterias.find((c) => c.id === id);
  const [forma, setForma] = useState<Forma | null>(cafeteria ? formaDe(cafeteria) : null);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const diasActivos = useMemo(
    () => DIAS.filter((d) => (forma?.dias ?? []).includes(d.value)),
    [forma?.dias],
  );

  if (!cafeteria || !forma) {
    return (
      <Shell title="Editar tienda" back>
        <p className="pt-8 text-sm text-muted-foreground">No encontramos esta cafetería.</p>
      </Shell>
    );
  }

  const comoC = comoCafeteria(forma);
  const okPor = (key: string) => BANDERAS.find((b) => b.key === key)?.cumplida(comoC) ?? false;

  function campo<K extends keyof Forma>(key: K, valor: Forma[K]) {
    setErrores((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setForma((f) => (f ? { ...f, [key]: valor } : f));
  }

  function toggleDia(value: number) {
    if (!forma) return;
    campo(
      "dias",
      forma.dias.includes(value)
        ? forma.dias.filter((d) => d !== value)
        : [...forma.dias, value].sort(),
    );
  }

  function setHora(dia: number, campoHora: "apertura" | "cierre", valor: string) {
    if (!forma) return;
    campo("horas", {
      ...forma.horas,
      [dia]: { ...(forma.horas[dia] ?? { apertura: "", cierre: "" }), [campoHora]: valor },
    });
  }

  function subirLogo(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => campo("logo", String(reader.result));
    reader.readAsDataURL(file);
  }

  function guardar() {
    if (!forma || !cafeteria) return;
    const errs: Record<string, string> = {};

    if (forma.admin_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forma.admin_email.trim()))
      errs["admin_email"] = "Ingresa un correo válido";
    if (forma.admin_usuario.trim() && forma.admin_usuario.trim().length < 4)
      errs["admin_usuario"] = "El usuario debe tener al menos 4 caracteres";
    if (forma.admin_password !== forma.admin_password2)
      errs["admin_password2"] = "Las contraseñas no coinciden";
    if (forma.usuario.trim() && forma.usuario.trim().length < 4)
      errs["usuario"] = "El usuario debe tener al menos 4 caracteres";
    if (forma.password !== forma.password2) errs["password2"] = "Las contraseñas no coinciden";
    if (forma.correo_pagos.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forma.correo_pagos.trim()))
      errs["correo_pagos"] = "Ingresa un correo válido";
    if (
      forma.email_titular.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forma.email_titular.trim())
    )
      errs["email_titular"] = "Ingresa un correo válido";
    if (forma.clabe.trim() && !/^\d{18}$/.test(forma.clabe.trim()))
      errs["clabe"] = "La CLABE debe tener exactamente 18 dígitos";
    if (forma.rfc.trim() && !/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i.test(forma.rfc.trim()))
      errs["rfc"] = "Ingresa un RFC válido (12 o 13 caracteres)";
    if (!forma.ventas_mensuales_promedio.trim())
      errs["ventas_mensuales_promedio"] = "Ingresa las ventas mensuales promedio";
    if (!forma.costo_inscripcion.trim()) {
      errs["costo_inscripcion"] = "Ingresa el costo de inscripción";
    } else if (!/^\d+$/.test(forma.costo_inscripcion.trim())) {
      errs["costo_inscripcion"] = "Solo números";
    }
    if (!forma.trato.trim()) {
      errs["trato"] = "Ingresa el trato comercial";
    } else if (forma.trato.trim().length > 500) {
      errs["trato"] = "Máximo 500 caracteres";
    }
    if (forma.tipo_institucion.length === 0) {
      errs["tipo_institucion"] = "Selecciona al menos un tipo de institución";
    }
    for (const d of forma.dias) {
      const h = forma.horas[d] ?? { apertura: "", cierre: "" };
      for (const c of ["apertura", "cierre"] as const) {
        if (h[c].trim() && !normalizaHora(h[c])) errs[`h${d}.${c}`] = "Formato: HH:MM";
      }
    }

    setErrores(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Revisa los campos marcados");
      return;
    }

    const diasOrdenados = DIAS.filter((d) => forma.dias.includes(d.value));
    const primera = forma.horas[diasOrdenados[0]?.value ?? 1];
    const horario = diasOrdenados.length
      ? `${diasOrdenados.map((d) => d.corto).join(", ")} · ${
          normalizaHora(primera?.apertura ?? "") ?? ""
        } - ${normalizaHora(primera?.cierre ?? "") ?? ""}`
      : "";

    demo.actualizarCafeteria(id, {
      nombre_comercial: forma.nombre.trim() || cafeteria.nombre_comercial,
      contacto_nombre: forma.admin_nombre.trim(),
      contacto_telefono: forma.admin_telefono.trim(),
      contacto_email: forma.admin_email.trim(),
      usuario_admin: forma.admin_usuario.trim(),
      password_admin: forma.admin_password,
      ciudad: ESTADOS.find((e) => String(e.value) === forma.estado)?.label ?? cafeteria.ciudad,
      institucion: forma.institucion.trim(),
      tipo_institucion: forma.tipo_institucion,
      sistema_operativo: forma.sistema_operativo,
      referencia: forma.referencia.trim(),
      horario,
      dias: forma.dias,
      horas: forma.horas,
      razon_social: forma.razon_social.trim(),
      rfc: forma.rfc.trim().toUpperCase(),
      codigo_postal_fiscal: forma.codigo_postal_fiscal.trim(),
      regimen_fiscal: forma.regimen_fiscal,
      direccion_fiscal: forma.direccion_fiscal.trim(),
      constancia_situacion_fiscal: forma.constancia_situacion_fiscal,
      no_requiere_factura: forma.no_requiere_factura,
      usuario_tienda: forma.usuario.trim(),
      password_tienda: forma.password,
      logo: forma.logo,
      correo_pagos: forma.correo_pagos.trim(),
      titular_cuenta: forma.titular_cuenta.trim(),
      email_titular: forma.email_titular.trim(),
      clabe: forma.clabe.trim(),
      telefono_contacto: forma.telefono_contacto.trim(),
      ventas_mensuales_promedio: forma.ventas_mensuales_promedio.trim(),
      costo_inscripcion: forma.costo_inscripcion.trim(),
      trato: forma.trato.trim(),
    });
    toast.success("Información guardada");
    navigate({ to: "/cafeterias/$id", params: { id } });
  }

  return (
    <Shell title="Editar información" back>
      <p className="mt-4 text-[13px] text-muted-foreground">
        Es la misma información del registro. La palomita aparece en cuanto la sección tiene todo lo
        necesario.
      </p>

      <div className="mt-4 space-y-4">
        {/* ------------------------------------- cuenta del administrador -- */}
        <Card>
          <TituloSeccion
            bandera="cuenta_admin"
            titulo="Cuenta del dueño o administrador"
            completa={okPor("cuenta_admin")}
          />
          <div className="space-y-4">
            <Field label="Nombre completo">
              <div className="relative">
                <User className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  className={cn(inputClass, "pl-12")}
                  value={forma.admin_nombre}
                  maxLength={150}
                  onChange={(e) => campo("admin_nombre", e.target.value)}
                  placeholder="Juan Pérez García"
                />
              </div>
            </Field>
            <Field label="Teléfono">
              <div className="relative">
                <Phone className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  className={cn(inputClass, "pl-12")}
                  type="tel"
                  inputMode="tel"
                  value={forma.admin_telefono}
                  maxLength={15}
                  onChange={(e) => campo("admin_telefono", e.target.value)}
                  placeholder="55 1234 5678"
                />
              </div>
            </Field>
            <Field label="Correo electrónico">
              <div className="relative">
                <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  className={cxErr(cn(inputClass, "pl-12"), errores["admin_email"])}
                  type="email"
                  value={forma.admin_email}
                  maxLength={255}
                  onChange={(e) => campo("admin_email", e.target.value)}
                  placeholder="tu@email.com"
                />
              </div>
              <Err>{errores["admin_email"]}</Err>
            </Field>
            <Field label="Usuario">
              <div className="relative">
                <AtSign className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  className={cxErr(cn(inputClass, "pl-12"), errores["admin_usuario"])}
                  value={forma.admin_usuario}
                  maxLength={50}
                  onChange={(e) => campo("admin_usuario", e.target.value)}
                  placeholder="usuario_admin"
                />
              </div>
              <Err>{errores["admin_usuario"]}</Err>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Contraseña">
                <PasswordInput
                  className={inputClass}
                  value={forma.admin_password}
                  maxLength={100}
                  onChange={(v) => campo("admin_password", v)}
                  placeholder="••••••••"
                />
              </Field>
              <Field label="Confirmar contraseña">
                <PasswordInput
                  className={cxErr(inputClass, errores["admin_password2"])}
                  value={forma.admin_password2}
                  maxLength={100}
                  onChange={(v) => campo("admin_password2", v)}
                  placeholder="••••••••"
                  etiqueta="la confirmación de contraseña"
                />
                <Err>{errores["admin_password2"]}</Err>
              </Field>
            </div>
          </div>
        </Card>

        {/* ------------------------------------------------ costo de inscripción -- */}
        <Card>
          <h3 className="mb-4 text-[16px] font-bold tracking-[-0.02em]">Costo de inscripción</h3>
          <Field
            label={
              <>
                Monto de inscripción <Req />
              </>
            }
          >
            <div className="relative">
              <Banknote className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                className={cxErr(cn(inputClass, "pl-12"), errores["costo_inscripcion"])}
                inputMode="numeric"
                value={forma.costo_inscripcion}
                maxLength={15}
                onChange={(e) => campo("costo_inscripcion", e.target.value.replace(/\D/g, ""))}
                placeholder="Ej: 2000"
              />
            </div>
            <Err>{errores["costo_inscripcion"]}</Err>
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              Monto de inscripción por tienda (normalmente $2,000 MXN)
            </p>
          </Field>
          <div className="mt-4">
            <Field
              label={
                <>
                  Trato <Req />
                </>
              }
            >
              <textarea
                className={cxErr(cn(inputClass, "min-h-[84px] resize-none py-3"), errores["trato"])}
                value={forma.trato}
                maxLength={500}
                onChange={(e) => campo("trato", e.target.value)}
                placeholder="Ej: comisión 15%, Renta semanal $1,500"
              />
              <Err>{errores["trato"]}</Err>
              <p className="mt-1.5 text-[12px] text-muted-foreground">
                Describe el acuerdo comercial con esta tienda
              </p>
            </Field>
          </div>
        </Card>

        {/* -------------------------------------------- datos de la tienda -- */}
        <Card>
          <div className="mb-4">
            <h3 className="text-[16px] font-bold tracking-[-0.02em]">Información Tienda</h3>
          </div>
          <div className="space-y-4">
            <Field label="Nombre de la cafetería">
              <input
                className={inputClass}
                value={forma.nombre}
                maxLength={100}
                onChange={(e) => campo("nombre", e.target.value)}
                placeholder="Café Central"
              />
            </Field>

            <TituloSeccion bandera="logo" titulo="Logo de la tienda" completa={okPor("logo")} />
            <input
              ref={logoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => subirLogo(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => logoRef.current?.click()}
              className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/40 p-3 text-left active:scale-[0.98]"
            >
              {forma.logo ? (
                <img
                  src={forma.logo}
                  alt="Logo de la tienda"
                  className="h-14 w-14 rounded-xl object-cover"
                />
              ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-card text-primary">
                  <ImagePlus className="h-6 w-6" strokeWidth={2.5} />
                </span>
              )}
              <span className="flex-1">
                <span className="block text-[14px] font-bold">
                  {forma.logo ? "Cambiar logo" : "Haz clic para subir"}
                </span>
                <span className="block text-[12px] text-muted-foreground">
                  Logo cuadrado, peso ligero
                </span>
              </span>
            </button>

            <Field
              label={
                <>
                  Ventas mensuales promedio actuales <Req />
                </>
              }
            >
              <div className="relative">
                <Banknote className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  className={cxErr(cn(inputClass, "pl-12"), errores["ventas_mensuales_promedio"])}
                  inputMode="numeric"
                  value={forma.ventas_mensuales_promedio}
                  maxLength={15}
                  onChange={(e) =>
                    campo("ventas_mensuales_promedio", e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Ej: 35000"
                />
              </div>
              <Err>{errores["ventas_mensuales_promedio"]}</Err>
              <p className="mt-1.5 text-[12px] text-muted-foreground">
                Monto aproximado que vende la tienda al mes
              </p>
            </Field>

            <Field label="Ciudad / Estado">
              <select
                className={inputClass}
                value={forma.estado}
                onChange={(e) => campo("estado", e.target.value)}
              >
                <option value="">Selecciona una ciudad</option>
                {ESTADOS.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="¿A qué institución pertenece?">
              <div className="relative">
                <Building2 className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  className={cn(inputClass, "pl-12")}
                  value={forma.institucion}
                  maxLength={200}
                  onChange={(e) => campo("institucion", e.target.value)}
                  placeholder="Ej: Universidad Anáhuac"
                />
              </div>
            </Field>

            <Field label="Referencia (opcional)">
              <input
                className={inputClass}
                value={forma.referencia}
                maxLength={200}
                onChange={(e) => campo("referencia", e.target.value)}
                placeholder="Ej: Edificio Central, Planta Baja"
              />
            </Field>

            <Field
              label={
                <>
                  Tipo de institución <Req />
                </>
              }
            >
              <div className="flex flex-wrap gap-2">
                {TIPOS_INSTITUCION.map((opt) => {
                  const selected = forma.tipo_institucion.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        campo(
                          "tipo_institucion",
                          selected
                            ? forma.tipo_institucion.filter((v) => v !== opt.value)
                            : [...forma.tipo_institucion, opt.value],
                        )
                      }
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-bold transition-all active:scale-[0.97]",
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <Err>{errores["tipo_institucion"]}</Err>
            </Field>

            <Field label="Sistema operativo">
              <select
                className={inputClass}
                value={forma.sistema_operativo}
                onChange={(e) => campo("sistema_operativo", e.target.value)}
              >
                <option value="">Selecciona un sistema</option>
                <option value="windows">Windows</option>
                <option value="android">Android</option>
              </select>
            </Field>

            <SubSection title="Cuenta de la tienda" />
            <TituloSeccion
              bandera="cuenta_tienda"
              titulo="Cuenta de la tienda"
              completa={okPor("cuenta_tienda")}
            />
            <Field label="Usuario de la tienda">
              <input
                className={cxErr(inputClass, errores["usuario"])}
                value={forma.usuario}
                maxLength={50}
                onChange={(e) => campo("usuario", e.target.value)}
                placeholder="usuario_tienda"
              />
              <Err>{errores["usuario"]}</Err>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Contraseña de la tienda">
                <PasswordInput
                  className={inputClass}
                  value={forma.password}
                  onChange={(v) => campo("password", v)}
                  placeholder="••••••••"
                />
              </Field>
              <Field label="Confirmar contraseña">
                <PasswordInput
                  className={cxErr(inputClass, errores["password2"])}
                  value={forma.password2}
                  onChange={(v) => campo("password2", v)}
                  placeholder="••••••••"
                  etiqueta="la confirmación de contraseña"
                />
                <Err>{errores["password2"]}</Err>
              </Field>
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <h3 className="text-[16px] font-bold tracking-[-0.02em]">Horario</h3>
          </div>
          <div className="space-y-4">
            <TituloSeccion
              bandera="horario"
              titulo="Horario de la tienda"
              completa={okPor("horario")}
            />
            <div>
              <p className="mb-2 text-[13px] font-extrabold tracking-[-0.02em] text-muted-foreground uppercase">
                Días que opera la tienda
              </p>
              <div className="flex flex-wrap gap-2">
                {DIAS.map((d) => {
                  const on = forma.dias.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleDia(d.value)}
                      className={cn(
                        "rounded-full px-4 py-2 text-[13px] font-bold transition-all active:scale-[0.95]",
                        on
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {d.corto}
                    </button>
                  );
                })}
              </div>
              <Err>{errores["dias"]}</Err>
            </div>

            <div className="space-y-3">
              {diasActivos.length === 0 && (
                <p className="text-[13px] text-muted-foreground">Selecciona al menos un día.</p>
              )}
              {diasActivos.map((d) => {
                const h = forma.horas[d.value] ?? { apertura: "", cierre: "" };
                return (
                  <div
                    key={d.value}
                    className="rounded-2xl border border-border bg-card p-3 shadow-card"
                  >
                    <div className="mb-2 flex items-center gap-2 text-[14px] font-extrabold">
                      <Clock className="h-4 w-4 text-primary" strokeWidth={2.5} />
                      {d.label}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          className={cxErr(
                            cn(inputClass, "h-12 text-center font-bold"),
                            errores[`h${d.value}.apertura`],
                          )}
                          value={h.apertura}
                          maxLength={5}
                          onChange={(e) => setHora(d.value, "apertura", e.target.value)}
                          onBlur={(e) => {
                            const n = normalizaHora(e.target.value);
                            if (n) setHora(d.value, "apertura", n);
                          }}
                          placeholder="08:00"
                        />
                        <Err>{errores[`h${d.value}.apertura`]}</Err>
                      </div>
                      <div>
                        <input
                          className={cxErr(
                            cn(inputClass, "h-12 text-center font-bold"),
                            errores[`h${d.value}.cierre`],
                          )}
                          value={h.cierre}
                          maxLength={5}
                          onChange={(e) => setHora(d.value, "cierre", e.target.value)}
                          onBlur={(e) => {
                            const n = normalizaHora(e.target.value);
                            if (n) setHora(d.value, "cierre", n);
                          }}
                          placeholder="20:00"
                        />
                        <Err>{errores[`h${d.value}.cierre`]}</Err>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <h3 className="text-[16px] font-bold tracking-[-0.02em]">Pagos</h3>
          </div>
          <div className="space-y-4">
            <TituloSeccion
              bandera="pagos"
              titulo="Información para pagos"
              completa={okPor("pagos")}
            />
            <Field label="Titular de la Cuenta (opcional)">
              <input
                className={cxErr(inputClass, errores["titular_cuenta"])}
                value={forma.titular_cuenta}
                maxLength={150}
                onChange={(e) => campo("titular_cuenta", e.target.value)}
                placeholder="Nombre del titular de la cuenta"
              />
              <Err>{errores["titular_cuenta"]}</Err>
            </Field>
            <Field label="Email del Titular (opcional)">
              <input
                className={cxErr(inputClass, errores["email_titular"])}
                type="email"
                value={forma.email_titular}
                maxLength={255}
                onChange={(e) => campo("email_titular", e.target.value)}
                placeholder="titular@email.com"
              />
              <Err>{errores["email_titular"]}</Err>
            </Field>
            <Field label="CLABE Interbancaria (opcional)" hint="Para recibir pagos de tus ventas">
              <div className="relative">
                <CreditCard className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  className={cxErr(cn(inputClass, "pl-12 tracking-[0.08em]"), errores["clabe"])}
                  inputMode="numeric"
                  maxLength={18}
                  value={forma.clabe}
                  onChange={(e) => campo("clabe", e.target.value.replace(/\D/g, ""))}
                  placeholder="18 dígitos"
                />
              </div>
              <Err>{errores["clabe"]}</Err>
            </Field>
            <Field label="Teléfono de Contacto (opcional)">
              <div className="relative">
                <Phone className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  className={cxErr(cn(inputClass, "pl-12"), errores["telefono_contacto"])}
                  type="tel"
                  inputMode="tel"
                  value={forma.telefono_contacto}
                  maxLength={15}
                  onChange={(e) => campo("telefono_contacto", e.target.value)}
                  placeholder="55 1234 5678"
                />
              </div>
              <Err>{errores["telefono_contacto"]}</Err>
            </Field>
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <h3 className="text-[16px] font-bold tracking-[-0.02em]">Facturación</h3>
          </div>
          <div className="space-y-4">
            <TituloSeccion
              bandera="facturacion"
              titulo="Información para facturación"
              completa={okPor("facturacion")}
            />

            <SinFacturaToggle
              checked={forma.no_requiere_factura}
              onToggle={() => campo("no_requiere_factura", !forma.no_requiere_factura)}
            />

            {!forma.no_requiere_factura && (
              <>
                <Field label="Nombre o razón social (opcional)">
                  <input
                    className={inputClass}
                    value={forma.razon_social}
                    maxLength={200}
                    onChange={(e) => campo("razon_social", e.target.value)}
                    placeholder="Ej: Café Central SA de CV"
                  />
                </Field>
                <Field label="RFC (opcional)">
                  <input
                    className={cxErr(cn(inputClass, "uppercase tracking-[0.08em]"), errores["rfc"])}
                    value={forma.rfc}
                    maxLength={13}
                    onChange={(e) => campo("rfc", e.target.value.toUpperCase())}
                    placeholder="XAXX010101000"
                  />
                  <Err>{errores["rfc"]}</Err>
                </Field>
                <Field label="Código Postal Fiscal (opcional)">
                  <input
                    className={cxErr(inputClass, errores["codigo_postal_fiscal"])}
                    inputMode="numeric"
                    value={forma.codigo_postal_fiscal}
                    maxLength={10}
                    onChange={(e) =>
                      campo("codigo_postal_fiscal", e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Ej: 01000"
                  />
                  <Err>{errores["codigo_postal_fiscal"]}</Err>
                </Field>
                <Field label="Régimen Fiscal (opcional)">
                  <select
                    className={inputClass}
                    value={forma.regimen_fiscal}
                    onChange={(e) => campo("regimen_fiscal", e.target.value)}
                  >
                    <option value="">Selecciona un régimen fiscal</option>
                    {REGIMENES_FISCALES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <Err>{errores["regimen_fiscal"]}</Err>
                </Field>
                <Field label="Dirección Fiscal">
                  <textarea
                    className={cn(inputClass, "min-h-[84px] resize-none py-3")}
                    value={forma.direccion_fiscal}
                    maxLength={300}
                    onChange={(e) => campo("direccion_fiscal", e.target.value)}
                    placeholder="Calle, número, colonia, ciudad, estado"
                  />
                  <Err>{errores["direccion_fiscal"]}</Err>
                </Field>
                <Field label="Correo de pagos (opcional)">
                  <input
                    className={cxErr(inputClass, errores["correo_pagos"])}
                    type="email"
                    value={forma.correo_pagos}
                    maxLength={255}
                    onChange={(e) => campo("correo_pagos", e.target.value)}
                    placeholder="pagos@tucafe.com"
                  />
                  <Err>{errores["correo_pagos"]}</Err>
                </Field>
                <FilePicker
                  label="Constancia de Situación Fiscal (opcional)"
                  hint="PDF o imagen"
                  value={forma.constancia_situacion_fiscal}
                  onChange={(constancia_situacion_fiscal) =>
                    campo("constancia_situacion_fiscal", constancia_situacion_fiscal)
                  }
                />
              </>
            )}
          </div>
        </Card>
      </div>

      <FloatingBar>
        <PrimaryCTA onClick={guardar}>Guardar cambios</PrimaryCTA>
      </FloatingBar>
    </Shell>
  );
}
