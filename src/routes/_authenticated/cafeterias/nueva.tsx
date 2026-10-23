import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AtSign,
  Banknote,
  Building2,
  Check,
  ChevronDown,
  Clock,
  Copy,
  CreditCard,
  FileText,
  ImagePlus,
  Mail,
  Phone,
  Plus,
  Store,
  Trash2,
  User,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import {
  Field,
  FloatingBar,
  inputClass,
  PasswordInput,
  PrimaryCTA,
  SectionTitle,
  Shell,
  Tip,
} from "@/components/ui-kit";
import { demo } from "@/lib/demo";
import {
  DIAS,
  ESTADOS,
  normalizaHora,
  REGIMENES_FISCALES,
  TIPOS_INSTITUCION,
} from "@/lib/estados";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/cafeterias/nueva")({
  head: () => ({
    meta: [
      { title: "Registro de tienda — Control Tiendas · Kigo Pick" },
      {
        name: "description",
        content:
          "Alta guiada de cafeterías: datos del administrador, tiendas, horarios de operación y datos de pago.",
      },
      { property: "og:title", content: "Registro de tienda — Control Tiendas · Kigo Pick" },
      {
        property: "og:description",
        content: "Registra hasta 10 tiendas con horarios y datos de pago en dos pasos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RegistroTienda,
});

/* -------------------------------------------------------------- esquemas -- */

const adminSchema = z
  .object({
    nombre: z.string().trim().min(2, "El nombre es requerido").max(150, "Máximo 150 caracteres"),
    telefono: z
      .string()
      .trim()
      .min(10, "El teléfono debe tener al menos 10 dígitos")
      .max(15, "Máximo 15 dígitos"),
    email: z.string().trim().email("Ingresa un correo válido").max(255),
    usuario: z.string().trim().min(4, "El usuario debe tener al menos 4 caracteres").max(50, "Máximo 50 caracteres"),
    password: z.string().max(100, "Máximo 100 caracteres"),
    password2: z.string(),
  })
  .refine((v) => v.password === v.password2, {
    message: "Las contraseñas no coinciden",
    path: ["password2"],
  });

/** Opcional: solo valida si el campo tiene contenido. */
const opcional = <T extends z.ZodTypeAny>(schema: T) =>
  z.union([z.literal(""), schema]);

const tiendaSchema = z
  .object({
    nombre: z.string().trim().min(2, "El nombre es requerido").max(100, "Máximo 100 caracteres"),
    estado: z.string().min(1, "Selecciona una ciudad"),
    institucion: z.string().trim().min(1, "La institución es requerida").max(200, "Máximo 200 caracteres"),
    tipo_institucion: z.array(z.string()).min(1, "Selecciona al menos un tipo de institución"),
    sistema_operativo: z.string().min(1, "Selecciona un sistema operativo"),
    referencia: z.string().trim().max(200, "Máximo 200 caracteres"),
    ventas_mensuales_promedio: z
      .string()
      .trim()
      .min(1, "Ingresa las ventas mensuales promedio")
      .max(15, "Máximo 15 dígitos"),
    usuario: opcional(
      z
        .string()
        .trim()
        .min(4, "El usuario debe tener al menos 4 caracteres")
        .max(50, "Máximo 50 caracteres"),
    ),
    password: opcional(z.string()),
    password2: z.string(),
    razon_social: opcional(z.string().trim().max(200, "Máximo 200 caracteres")),
    rfc: opcional(
      z
        .string()
        .trim()
        .regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i, "Ingresa un RFC válido (12 o 13 caracteres)"),
    ),
    codigo_postal_fiscal: opcional(z.string().trim().max(10, "Máximo 10 caracteres")),
    regimen_fiscal: z.string(),
    direccion_fiscal: opcional(z.string().trim().max(300, "Máximo 300 caracteres")),
    constancia_situacion_fiscal: z.string().nullable(),
    email_pagos: opcional(z.string().trim().email("Ingresa un correo válido").max(255)),
    titular_cuenta: opcional(z.string().trim().max(150, "Máximo 150 caracteres")),
    email_titular: opcional(z.string().trim().email("Ingresa un correo válido").max(255)),
    clabe: opcional(z.string().trim().regex(/^\d{18}$/, "La CLABE debe tener exactamente 18 dígitos")),
    telefono_contacto: opcional(z.string().trim().max(15, "Máximo 15 dígitos")),
  })
  .refine((v) => v.password === v.password2, {
    message: "Las contraseñas no coinciden",
    path: ["password2"],
  });


/* ----------------------------------------------------------------- tipos -- */

type TiendaForm = {
  nombre: string;
  logo: string | null;
  estado: string;
  institucion: string;
  tipo_institucion: string[];
  sistema_operativo: string;
  referencia: string;
  usuario: string;
  password: string;
  password2: string;
  razon_social: string;
  rfc: string;
  codigo_postal_fiscal: string;
  regimen_fiscal: string;
  direccion_fiscal: string;
  constancia_situacion_fiscal: string | null;
  no_requiere_factura: boolean;
  email_pagos: string;
  titular_cuenta: string;
  email_titular: string;
  clabe: string;
  telefono_contacto: string;
  ventas_mensuales_promedio: string;
  dias: number[];
  horas: Record<number, { apertura: string; cierre: string }>;
  entregas: { id: string; nombre: string; hora: string; anticipacion: string }[];
};

function tiendaVacia(): TiendaForm {
  return {
    nombre: "",
    logo: null,
    estado: "",
    institucion: "",
    tipo_institucion: [],
    sistema_operativo: "",
    referencia: "",
    usuario: "",
    password: "",
    password2: "",
    razon_social: "",
    rfc: "",
    codigo_postal_fiscal: "",
    regimen_fiscal: "",
    direccion_fiscal: "",
    constancia_situacion_fiscal: null,
    no_requiere_factura: false,
    email_pagos: "",
    titular_cuenta: "",
    email_titular: "",
    clabe: "",
    telefono_contacto: "",
    ventas_mensuales_promedio: "",
    dias: [1, 2, 3, 4, 5],
    horas: {},
    entregas: [],
  };
}

/* ------------------------------------------------------------ auxiliares -- */

function Err({ children }: { children?: string | undefined }) {
  if (!children) return null;
  return <p className="mt-1.5 text-[12px] font-semibold text-destructive">{children}</p>;
}

/** inputClass con borde rojo cuando hay error. */
function cxErr(base: string, error?: string) {
  return cn(base, error && "border-destructive focus:border-destructive");
}

function Req() {
  return <span className="ml-0.5 text-destructive">*</span>;
}

function SinFacturaToggle({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
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

function Bloque({
  icon: Icon,
  titulo,
  children,
  defaultOpen = true,
}: {
  icon: typeof Store;
  titulo: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-3xl border border-border bg-card shadow-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 p-4 text-left active:scale-[0.98]"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <span className="flex-1 text-[15px] font-extrabold">{titulo}</span>
        <ChevronDown className={cn("h-5 w-5 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="space-y-4 border-t border-border p-4">{children}</div>}
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

/* -------------------------------------------------------------- pantalla -- */

function RegistroTienda() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState<1 | 2>(1);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [admin, setAdmin] = useState({
    nombre: "",
    telefono: "",
    email: "",
    usuario: "",
    password: "",
    password2: "",
  });
  const [tiendas, setTiendas] = useState<TiendaForm[]>([tiendaVacia()]);
  const [costoInscripcion, setCostoInscripcion] = useState("2000");
  const [trato, setTrato] = useState("");
  const [activa, setActiva] = useState(0);

  const cantidad = tiendas.length;

  function limpiarErrores(prefix: string) {
    setErrores((prev) => {
      const keys = Object.keys(prev).filter((k) => k.startsWith(prefix));
      if (!keys.length) return prev;
      const next = { ...prev };
      keys.forEach((k) => delete next[k]);
      return next;
    });
  }

  function setAdminCampo(key: keyof typeof admin, value: string) {
    limpiarErrores(`admin.${key}`);
    setAdmin((prev) => ({ ...prev, [key]: value }));
  }

  function setTienda(i: number, patch: Partial<TiendaForm>) {
    limpiarErrores(`t${i}.`);
    setTiendas((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }

  function cambiarCantidad(n: number) {
    setTiendas((prev) => {
      if (n <= prev.length) return prev.slice(0, n);
      return [...prev, ...Array.from({ length: n - prev.length }, tiendaVacia)];
    });
    setActiva((a) => Math.min(a, n - 1));
  }

  function copiarDesdePrimera(i: number) {
    const origen = tiendas[0];
    if (!origen || i === 0) return;
    const { nombre, logo, referencia, ventas_mensuales_promedio, ...resto } = origen;
    setTienda(i, resto);
    toast.success(`Datos de la tienda 1 copiados a la tienda ${i + 1}`);
  }

  function validarPaso1() {
    const errs: Record<string, string> = {};
    const a = adminSchema.safeParse(admin);
    if (!a.success) {
      for (const issue of a.error.issues) errs[`admin.${issue.path[0]}`] = issue.message;
    }
    if (!costoInscripcion.trim()) {
      errs["costo_inscripcion"] = "Ingresa el costo de inscripción";
    } else if (!/^\d+$/.test(costoInscripcion.trim())) {
      errs["costo_inscripcion"] = "Solo números";
    }
    if (!trato.trim()) {
      errs["trato"] = "Ingresa el trato comercial";
    } else if (trato.trim().length > 500) {
      errs["trato"] = "Máximo 500 caracteres";
    }
    tiendas.forEach((t, i) => {
      const r = tiendaSchema.safeParse(t);
      if (!r.success) {
        for (const issue of r.error.issues) errs[`t${i}.${issue.path[0]}`] = issue.message;
      }
    });
    setErrores(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Revisa los campos marcados");
      return false;
    }
    return true;
  }

  function validarPaso2() {
    const errs: Record<string, string> = {};
    tiendas.forEach((t, i) => {
      for (const d of t.dias) {
        const h = t.horas[d] ?? { apertura: "", cierre: "" };
        for (const campo of ["apertura", "cierre"] as const) {
          const raw = h[campo];
          if (raw.trim() && !normalizaHora(raw)) errs[`t${i}.h${d}.${campo}`] = "Formato: HH:MM";
        }
      }

      t.entregas.forEach((e, j) => {
        if (e.nombre.trim() && !normalizaHora(e.hora)) errs[`t${i}.e${j}.hora`] = "Formato: HH:MM";
      });
    });
    setErrores(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Revisa los horarios marcados");
      return false;
    }
    return true;
  }

  function guardar() {
    if (!validarPaso2()) return;
    let primerId = "";
    tiendas.forEach((t) => {
      const dias = DIAS.filter((d) => t.dias.includes(d.value));
      const primera = t.horas[dias[0]?.value ?? 1];
      const horario = dias.length
        ? `${dias.map((d) => d.corto).join(", ")} · ${normalizaHora(primera?.apertura ?? "") ?? ""} - ${
            normalizaHora(primera?.cierre ?? "") ?? ""
          }`
        : "";
      const id = demo.crearCafeteria({
        nombre_comercial: t.nombre.trim(),
        contacto_nombre: admin.nombre.trim(),
        contacto_telefono: admin.telefono.trim(),
        contacto_email: admin.email.trim(),
        usuario_admin: admin.usuario.trim(),
        password_admin: admin.password,
        ciudad: ESTADOS.find((e) => String(e.value) === t.estado)?.label ?? "",
        institucion: t.institucion.trim(),
        tipo_institucion: t.tipo_institucion,
        sistema_operativo: t.sistema_operativo,
        referencia: t.referencia.trim(),
        horario,
        dias: t.dias,
        horas: t.horas,
        razon_social: t.razon_social.trim(),
        rfc: t.rfc.trim().toUpperCase(),
        codigo_postal_fiscal: t.codigo_postal_fiscal.trim(),
        regimen_fiscal: t.regimen_fiscal,
        direccion_fiscal: t.direccion_fiscal.trim(),
        constancia_situacion_fiscal: t.constancia_situacion_fiscal,
        no_requiere_factura: t.no_requiere_factura,
        usuario_tienda: t.usuario.trim(),
        password_tienda: t.password,
        logo: t.logo,
        correo_pagos: t.email_pagos.trim(),
        titular_cuenta: t.titular_cuenta.trim(),
        email_titular: t.email_titular.trim(),
        clabe: t.clabe.trim(),
        telefono_contacto: t.telefono_contacto.trim(),
        ventas_mensuales_promedio: t.ventas_mensuales_promedio.trim(),
        costo_inscripcion: costoInscripcion.trim(),
        trato: trato.trim(),
        notas: "",
        registro_estado: "revision",
      });
      if (!primerId) primerId = id;
    });
    
    toast.success(cantidad > 1 ? `${cantidad} tiendas registradas` : "Tienda registrada");
    navigate({ to: "/cafeterias/$id", params: { id: primerId } });
  }

  return (
    <Shell title="Registro de tienda" back>
      <div className="mt-4 flex items-center gap-2">
        {([1, 2] as const).map((n) => (
          <div key={n} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold",
                paso >= n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {paso > n ? <Check className="h-4 w-4" strokeWidth={3} /> : n}
            </span>
            <span className={cn("text-[13px] font-bold", paso < n && "text-muted-foreground")}>
              {n === 1 ? "Registro" : "Ajustes"}
            </span>
          </div>
        ))}
      </div>

      {paso === 1 ? (
        <Paso1
          admin={admin}
          setAdminCampo={setAdminCampo}
          tiendas={tiendas}
          setTienda={setTienda}
          cambiarCantidad={cambiarCantidad}
          copiarDesdePrimera={copiarDesdePrimera}
          costoInscripcion={costoInscripcion}
          setCostoInscripcion={(v) => {
            setCostoInscripcion(v);
            setErrores((prev) => {
              if (!prev["costo_inscripcion"]) return prev;
              const next = { ...prev };
              delete next["costo_inscripcion"];
              return next;
            });
          }}
          trato={trato}
          setTrato={setTrato}
          setErrores={setErrores}
          errores={errores}
        />
      ) : (
        <Paso2
          tiendas={tiendas}
          setTienda={setTienda}
          activa={activa}
          setActiva={setActiva}
          errores={errores}
        />
      )}

      <FloatingBar>
        {paso === 1 ? (
          <PrimaryCTA
            onClick={() => {
              if (validarPaso1()) {
                setErrores({});
                setPaso(2);
                window.scrollTo({ top: 0 });
              }
            }}
          >
            Continuar a ajustes
          </PrimaryCTA>
        ) : (
          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
            <button
              onClick={() => setPaso(1)}
              className="h-14 rounded-2xl border border-border bg-card px-5 text-sm font-bold active:scale-[0.97]"
            >
              Atrás
            </button>
            <PrimaryCTA onClick={guardar}>Guardar cambios</PrimaryCTA>
          </div>
        )}
      </FloatingBar>
    </Shell>
  );
}

/* ------------------------------------------------------------------ paso 1 */

function Paso1({
  admin,
  setAdminCampo,
  tiendas,
  setTienda,
  cambiarCantidad,
  copiarDesdePrimera,
  costoInscripcion,
  setCostoInscripcion,
  trato,
  setTrato,
  setErrores,
  errores,
}: {
  admin: { nombre: string; telefono: string; email: string; usuario: string; password: string; password2: string };
  setAdminCampo: (k: "nombre" | "telefono" | "email" | "usuario" | "password" | "password2", v: string) => void;
  tiendas: TiendaForm[];
  setTienda: (i: number, patch: Partial<TiendaForm>) => void;
  cambiarCantidad: (n: number) => void;
  copiarDesdePrimera: (i: number) => void;
  costoInscripcion: string;
  setCostoInscripcion: (v: string) => void;
  trato: string;
  setTrato: (v: string) => void;
  setErrores: (v: React.SetStateAction<Record<string, string>>) => void;
  errores: Record<string, string>;
}) {
  return (
    <>
      <div className="mt-4">
        <Tip>Primero la cuenta del administrador; después los datos de cada tienda.</Tip>
      </div>

      <SectionTitle>Datos del administrador</SectionTitle>
      <div className="space-y-4">
        <Field label={<>Nombre completo <Req /></>}>
          <div className="relative">
            <User className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              className={cxErr(cn(inputClass, "pl-12"), errores["admin.nombre"])}
              value={admin.nombre}
              maxLength={150}
              onChange={(e) => setAdminCampo("nombre", e.target.value)}
              placeholder="Juan Pérez García"
            />
          </div>
          <Err>{errores["admin.nombre"]}</Err>
        </Field>
        <Field label={<>Teléfono <Req /></>}>
          <div className="relative">
            <Phone className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              className={cxErr(cn(inputClass, "pl-12"), errores["admin.telefono"])}
              type="tel"
              inputMode="tel"
              value={admin.telefono}
              maxLength={15}
              onChange={(e) => setAdminCampo("telefono", e.target.value)}
              placeholder="55 1234 5678"
            />
          </div>
          <Err>{errores["admin.telefono"]}</Err>
        </Field>
        <Field label={<>Correo electrónico <Req /></>}>
          <div className="relative">
            <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              className={cxErr(cn(inputClass, "pl-12"), errores["admin.email"])}
              type="email"
              value={admin.email}
              maxLength={255}
              onChange={(e) => setAdminCampo("email", e.target.value)}
              placeholder="tu@email.com"
            />
          </div>
          <Err>{errores["admin.email"]}</Err>
        </Field>
        <Field label={<>Usuario <Req /></>}>
          <div className="relative">
            <AtSign className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              className={cxErr(cn(inputClass, "pl-12"), errores["admin.usuario"])}
              value={admin.usuario}
              maxLength={50}
              onChange={(e) => setAdminCampo("usuario", e.target.value)}
              placeholder="usuario_admin"
            />
          </div>
          <Err>{errores["admin.usuario"]}</Err>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={<>Contraseña <Req /></>}>
            <PasswordInput
              className={cxErr(inputClass, errores["admin.password"])}
              value={admin.password}
              maxLength={100}
              onChange={(v) => setAdminCampo("password", v)}
              placeholder="••••••••"
            />
            <Err>{errores["admin.password"]}</Err>
          </Field>
          <Field label={<>Confirmar contraseña <Req /></>}>
            <PasswordInput
              className={cxErr(inputClass, errores["admin.password2"])}
              value={admin.password2}
              maxLength={100}
              onChange={(v) => setAdminCampo("password2", v)}
              placeholder="••••••••"
              etiqueta="la confirmación de contraseña"
            />
            <Err>{errores["admin.password2"]}</Err>
          </Field>
        </div>
        <Field label="¿Cuántas tiendas quieres registrar?">
          <select
            className={inputClass}
            value={tiendas.length}
            onChange={(e) => cambiarCantidad(Number(e.target.value))}
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </Field>
        <Field label={<>Costo de inscripción <Req /></>}>
          <div className="relative">
            <Banknote className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              className={cxErr(cn(inputClass, "pl-12"), errores["costo_inscripcion"])}
              inputMode="numeric"
              value={costoInscripcion}
              maxLength={15}
              onChange={(e) => setCostoInscripcion(e.target.value.replace(/\D/g, ""))}
              placeholder="Ej: 2000"
            />
          </div>
          <Err>{errores["costo_inscripcion"]}</Err>
          <p className="mt-1.5 text-[12px] text-muted-foreground">
            Monto de inscripción por tienda (normalmente $2,000 MXN)
          </p>
        </Field>
        <Field label={<>Trato <Req /></>}>
          <textarea
            className={cxErr(
              cn(inputClass, "min-h-[84px] resize-none py-3"),
              errores["trato"],
            )}
            value={trato}
            maxLength={500}
            onChange={(e) => {
              setTrato(e.target.value);
              if (errores["trato"]) {
                setErrores((prev) => {
                  const next = { ...prev };
                  delete next["trato"];
                  return next;
                });
              }
            }}
            placeholder="Ej: comisión 15%, Renta semanal $1,500"
          />
          <Err>{errores["trato"]}</Err>
          <p className="mt-1.5 text-[12px] text-muted-foreground">
            Describe el acuerdo comercial con esta tienda
          </p>
        </Field>
      </div>

      <SectionTitle>Tiendas</SectionTitle>
      <p className="-mt-1 mb-3 rounded-2xl bg-muted/60 px-4 py-3 text-[13px] text-muted-foreground">
        Completa los datos de cada tienda. Puedes copiar los datos de facturación, pagos, horario y
        configuración de la primera tienda en las demás para agilizar el registro.
      </p>
      <div className="space-y-4">

        {tiendas.map((t, i) => (
          <Bloque
            key={i}
            icon={Store}
            titulo={t.nombre.trim() || `Tienda ${i + 1}`}
            defaultOpen={i === 0}
          >
            {i > 0 && (
              <button
                type="button"
                onClick={() => copiarDesdePrimera(i)}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-2.5 text-[13px] font-bold text-primary active:scale-[0.98]"
              >
                <Copy className="h-4 w-4" strokeWidth={2.5} />
                Copiar datos de la tienda 1
              </button>
            )}
            <SubSection title="Información Tienda" />

            <Field label={<>Nombre de la cafetería <Req /></>}>
              <input
                className={cxErr(inputClass, errores[`t${i}.nombre`])}
                value={t.nombre}
                maxLength={100}
                onChange={(e) => setTienda(i, { nombre: e.target.value })}
                placeholder="Café Central"
              />
              <Err>{errores[`t${i}.nombre`]}</Err>
            </Field>

            <LogoPicker value={t.logo} onChange={(logo) => setTienda(i, { logo })} />

            <Field label={<>Ventas mensuales promedio actuales <Req /></>}>
              <div className="relative">
                <Banknote className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  className={cxErr(cn(inputClass, "pl-12"), errores[`t${i}.ventas_mensuales_promedio`])}
                  inputMode="numeric"
                  value={t.ventas_mensuales_promedio}
                  maxLength={15}
                  onChange={(e) =>
                    setTienda(i, { ventas_mensuales_promedio: e.target.value.replace(/\D/g, "") })
                  }
                  placeholder="Ej: 35000"
                />
              </div>
              <Err>{errores[`t${i}.ventas_mensuales_promedio`]}</Err>
              <p className="mt-1.5 text-[12px] text-muted-foreground">
                Monto aproximado que vende la tienda al mes
              </p>
            </Field>

            <Field label={<>Ciudad / Estado <Req /></>}>
              <select
                className={cxErr(inputClass, errores[`t${i}.estado`])}
                value={t.estado}
                onChange={(e) => setTienda(i, { estado: e.target.value })}
              >
                <option value="">Selecciona una ciudad</option>
                {ESTADOS.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
              <Err>{errores[`t${i}.estado`]}</Err>
            </Field>

            <Field label={<>¿A qué institución pertenece? <Req /></>}>
              <div className="relative">
                <Building2 className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  className={cxErr(cn(inputClass, "pl-12"), errores[`t${i}.institucion`])}
                  value={t.institucion}
                  maxLength={200}
                  onChange={(e) => setTienda(i, { institucion: e.target.value })}
                  placeholder="Ej: Universidad Anáhuac"
                />
              </div>
              <Err>{errores[`t${i}.institucion`]}</Err>
            </Field>

            <Field label="Referencia (opcional)">
              <input
                className={inputClass}
                value={t.referencia}
                maxLength={200}
                onChange={(e) => setTienda(i, { referencia: e.target.value })}
                placeholder="Ej: Edificio Central, Planta Baja"
              />
              <Err>{errores[`t${i}.referencia`]}</Err>
            </Field>

            <Field label={<>Tipo de institución <Req /></>}>
              <div className="flex flex-wrap gap-2">
                {TIPOS_INSTITUCION.map((opt) => {
                  const selected = t.tipo_institucion.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setTienda(i, {
                          tipo_institucion: selected
                            ? t.tipo_institucion.filter((v) => v !== opt.value)
                            : [...t.tipo_institucion, opt.value],
                        })
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
              <Err>{errores[`t${i}.tipo_institucion`]}</Err>
            </Field>

            <Field label={<>Sistema operativo <Req /></>}>
              <select
                className={cxErr(inputClass, errores[`t${i}.sistema_operativo`])}
                value={t.sistema_operativo}
                onChange={(e) => setTienda(i, { sistema_operativo: e.target.value })}
              >
                <option value="">Selecciona un sistema</option>
                <option value="windows">Windows</option>
                <option value="android">Android</option>
              </select>
              <Err>{errores[`t${i}.sistema_operativo`]}</Err>
            </Field>

            <Field label="Usuario de la tienda (opcional)">
              <input
                className={cxErr(inputClass, errores[`t${i}.usuario`])}
                value={t.usuario}
                maxLength={50}
                onChange={(e) => setTienda(i, { usuario: e.target.value })}
                placeholder="usuario_tienda"
              />
              <Err>{errores[`t${i}.usuario`]}</Err>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Contraseña (opcional)">
                <PasswordInput
                  className={cxErr(inputClass, errores[`t${i}.password`])}
                  value={t.password}
                  onChange={(v) => setTienda(i, { password: v })}
                  placeholder="••••••••"
                />
                <Err>{errores[`t${i}.password`]}</Err>
              </Field>
              <Field label="Confirmar contraseña">
                <PasswordInput
                  className={cxErr(inputClass, errores[`t${i}.password2`])}
                  value={t.password2}
                  onChange={(v) => setTienda(i, { password2: v })}
                  placeholder="••••••••"
                  etiqueta="la confirmación de contraseña"
                />
                <Err>{errores[`t${i}.password2`]}</Err>
              </Field>
            </div>

            <SubSection title="Pagos" />

            <Field label="Titular de la Cuenta (opcional)">
              <input
                className={cxErr(inputClass, errores[`t${i}.titular_cuenta`])}
                value={t.titular_cuenta}
                maxLength={150}
                onChange={(e) => setTienda(i, { titular_cuenta: e.target.value })}
                placeholder="Nombre del titular de la cuenta"
              />
              <Err>{errores[`t${i}.titular_cuenta`]}</Err>
            </Field>

            <Field label="Email del Titular (opcional)">
              <input
                className={cxErr(inputClass, errores[`t${i}.email_titular`])}
                type="email"
                value={t.email_titular}
                maxLength={255}
                onChange={(e) => setTienda(i, { email_titular: e.target.value })}
                placeholder="titular@email.com"
              />
              <Err>{errores[`t${i}.email_titular`]}</Err>
            </Field>

            <Field label="CLABE Interbancaria (opcional)">
              <div className="relative">
                <CreditCard className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  className={cxErr(cn(inputClass, "pl-12 tracking-[0.08em]"), errores[`t${i}.clabe`])}
                  inputMode="numeric"
                  value={t.clabe}
                  maxLength={18}
                  onChange={(e) => setTienda(i, { clabe: e.target.value.replace(/\D/g, "") })}
                  placeholder="18 dígitos"
                />
              </div>
              <p className="mt-1.5 text-[12px] text-muted-foreground">
                Para recibir pagos de tus ventas
              </p>
              <Err>{errores[`t${i}.clabe`]}</Err>
            </Field>

            <Field label="Teléfono de Contacto (opcional)">
              <div className="relative">
                <Phone className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  className={cxErr(cn(inputClass, "pl-12"), errores[`t${i}.telefono_contacto`])}
                  type="tel"
                  inputMode="tel"
                  value={t.telefono_contacto}
                  maxLength={15}
                  onChange={(e) => setTienda(i, { telefono_contacto: e.target.value })}
                  placeholder="55 1234 5678"
                />
              </div>
              <Err>{errores[`t${i}.telefono_contacto`]}</Err>
            </Field>

            <SubSection title="Facturación" />

            <SinFacturaToggle
              checked={t.no_requiere_factura}
              onToggle={() => setTienda(i, { no_requiere_factura: !t.no_requiere_factura })}
            />

            {!t.no_requiere_factura && (
            <>

            <Field label="Nombre o razón social (opcional)">
              <input
                className={cxErr(inputClass, errores[`t${i}.razon_social`])}
                value={t.razon_social}
                maxLength={200}
                onChange={(e) => setTienda(i, { razon_social: e.target.value })}
                placeholder="Ej: Café Central SA de CV"
              />
              <Err>{errores[`t${i}.razon_social`]}</Err>
            </Field>

            <Field label="RFC (opcional)">
              <input
                className={cxErr(cn(inputClass, "uppercase tracking-[0.08em]"), errores[`t${i}.rfc`])}
                value={t.rfc}
                maxLength={13}
                onChange={(e) => setTienda(i, { rfc: e.target.value.toUpperCase() })}
                placeholder="XAXX010101000"
              />
              <Err>{errores[`t${i}.rfc`]}</Err>
            </Field>

            <Field label="Código Postal Fiscal (opcional)">
              <input
                className={cxErr(inputClass, errores[`t${i}.codigo_postal_fiscal`])}
                inputMode="numeric"
                value={t.codigo_postal_fiscal}
                maxLength={10}
                onChange={(e) => setTienda(i, { codigo_postal_fiscal: e.target.value.replace(/\D/g, "") })}
                placeholder="Ej: 01000"
              />
              <Err>{errores[`t${i}.codigo_postal_fiscal`]}</Err>
            </Field>

            <Field label="Régimen Fiscal (opcional)">
              <select
                className={inputClass}
                value={t.regimen_fiscal}
                onChange={(e) => setTienda(i, { regimen_fiscal: e.target.value })}
              >
                <option value="">Selecciona un régimen fiscal</option>
                {REGIMENES_FISCALES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <Err>{errores[`t${i}.regimen_fiscal`]}</Err>
            </Field>

            <Field label="Dirección Fiscal">
              <textarea
                className={cn(inputClass, "min-h-[84px] resize-none py-3")}
                value={t.direccion_fiscal}
                maxLength={300}
                onChange={(e) => setTienda(i, { direccion_fiscal: e.target.value })}
                placeholder="Calle, número, colonia, ciudad, estado"
              />
              <Err>{errores[`t${i}.direccion_fiscal`]}</Err>
            </Field>

            <Field label="Correo de pagos (opcional)">
              <input
                className={cxErr(inputClass, errores[`t${i}.email_pagos`])}
                type="email"
                value={t.email_pagos}
                maxLength={255}
                onChange={(e) => setTienda(i, { email_pagos: e.target.value })}
                placeholder="pagos@tucafe.com"
              />
              <Err>{errores[`t${i}.email_pagos`]}</Err>
            </Field>


            <FilePicker
              label="Constancia de Situación Fiscal (opcional)"
              hint="PDF o imagen"
              value={t.constancia_situacion_fiscal}
              onChange={(constancia_situacion_fiscal) => setTienda(i, { constancia_situacion_fiscal })}
            />
            </>
            )}
          </Bloque>
        ))}
      </div>
    </>
  );
}

function LogoPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Field label="Logo (opcional)">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/40 p-3 text-left active:scale-[0.98]"
      >
        {value ? (
          <img src={value} alt="Logo de la tienda" className="h-14 w-14 rounded-xl object-cover" />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-card text-primary">
            <ImagePlus className="h-6 w-6" strokeWidth={2.5} />
          </span>
        )}
        <span className="flex-1">
          <span className="block text-[14px] font-bold">
            {value ? "Cambiar logo" : "Haz clic para subir"}
          </span>
          <span className="block text-[12px] text-muted-foreground">
            Logo cuadrado, peso ligero
          </span>
        </span>
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
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

/* ------------------------------------------------------------------ paso 2 */

function Paso2({
  tiendas,
  setTienda,
  activa,
  setActiva,
  errores,
}: {
  tiendas: TiendaForm[];
  setTienda: (i: number, patch: Partial<TiendaForm>) => void;
  activa: number;
  setActiva: (i: number) => void;
  errores: Record<string, string>;
}) {
  const i = Math.min(activa, tiendas.length - 1);
  const t = tiendas[i]!;
  const diasActivos = useMemo(() => DIAS.filter((d) => t.dias.includes(d.value)), [t.dias]);

  function toggleDia(value: number) {
    setTienda(i, {
      dias: t.dias.includes(value) ? t.dias.filter((d) => d !== value) : [...t.dias, value].sort(),
    });
  }

  function setHora(dia: number, campo: "apertura" | "cierre", valor: string) {
    setTienda(i, { horas: { ...t.horas, [dia]: { ...(t.horas[dia] ?? { apertura: "", cierre: "" }), [campo]: valor } } });
  }

  return (
    <>
      <div className="mt-4">
        <Tip>Define los días y horarios en que la tienda puede recibir pedidos.</Tip>
      </div>

      {tiendas.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {tiendas.map((tt, idx) => (
            <button
              key={idx}
              onClick={() => setActiva(idx)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-[13px] font-bold active:scale-[0.97]",
                idx === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {tt.nombre.trim() || `Tienda ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      <SectionTitle>Días que opera la tienda</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {DIAS.map((d) => {
          const on = t.dias.includes(d.value);
          return (
            <button
              key={d.value}
              type="button"
              onClick={() => toggleDia(d.value)}
              className={cn(
                "rounded-full px-4 py-2 text-[13px] font-bold transition-all active:scale-[0.95]",
                on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {d.corto}
            </button>
          );
        })}
      </div>
      <Err>{errores[`t${i}.dias`]}</Err>

      <SectionTitle>Horario de operación</SectionTitle>
      <div className="space-y-3">
        {diasActivos.length === 0 && (
          <p className="text-[13px] text-muted-foreground">Selecciona al menos un día.</p>
        )}
        {diasActivos.map((d) => {
          const h = t.horas[d.value] ?? { apertura: "", cierre: "" };
          return (
            <div key={d.value} className="rounded-2xl border border-border bg-card p-3 shadow-card">
              <div className="mb-2 flex items-center gap-2 text-[14px] font-extrabold">
                <Clock className="h-4 w-4 text-primary" strokeWidth={2.5} />
                {d.label}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    className={cxErr(cn(inputClass, "h-12 text-center font-bold"), errores[`t${i}.h${d.value}.apertura`])}
                    value={h.apertura}
                    maxLength={5}
                    onChange={(e) => setHora(d.value, "apertura", e.target.value)}
                    onBlur={(e) => {
                      const n = normalizaHora(e.target.value);
                      if (n) setHora(d.value, "apertura", n);
                    }}
                    placeholder="08:00"
                  />
                  <Err>{errores[`t${i}.h${d.value}.apertura`]}</Err>
                </div>
                <div>
                  <input
                    className={cxErr(cn(inputClass, "h-12 text-center font-bold"), errores[`t${i}.h${d.value}.cierre`])}
                    value={h.cierre}
                    maxLength={5}
                    onChange={(e) => setHora(d.value, "cierre", e.target.value)}
                    onBlur={(e) => {
                      const n = normalizaHora(e.target.value);
                      if (n) setHora(d.value, "cierre", n);
                    }}
                    placeholder="20:00"
                  />
                  <Err>{errores[`t${i}.h${d.value}.cierre`]}</Err>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <SectionTitle>Secciones adicionales</SectionTitle>
      <div className="space-y-4">
        <Bloque icon={Clock} titulo="Horarios de entrega" defaultOpen={false}>
          <p className="text-[13px] text-muted-foreground">
            La anticipación es el tiempo previo a la entrega en que todavía se puede pedir. Ej:
            entrega 10:00 con 10 min → piden hasta 9:50.
          </p>
          {t.entregas.map((e, j) => (
            <div key={e.id} className="rounded-2xl border border-border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[13px] font-bold text-muted-foreground">Entrega {j + 1}</span>
                <button
                  type="button"
                  onClick={() =>
                    setTienda(i, { entregas: t.entregas.filter((x) => x.id !== e.id) })
                  }
                  className="text-destructive active:scale-[0.9]"
                  aria-label="Eliminar horario de entrega"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  className={inputClass}
                  value={e.nombre}
                  maxLength={60}
                  onChange={(ev) =>
                    setTienda(i, {
                      entregas: t.entregas.map((x) =>
                        x.id === e.id ? { ...x, nombre: ev.target.value } : x,
                      ),
                    })
                  }
                  placeholder="Ej: Recreo"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      className={cxErr(inputClass, errores[`t${i}.e${j}.hora`])}
                      value={e.hora}
                      maxLength={5}
                      onChange={(ev) =>
                        setTienda(i, {
                          entregas: t.entregas.map((x) =>
                            x.id === e.id ? { ...x, hora: ev.target.value } : x,
                          ),
                        })
                      }
                      placeholder="10:00"
                    />
                    <Err>{errores[`t${i}.e${j}.hora`]}</Err>
                  </div>
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={e.anticipacion}
                    maxLength={3}
                    onChange={(ev) =>
                      setTienda(i, {
                        entregas: t.entregas.map((x) =>
                          x.id === e.id
                            ? { ...x, anticipacion: ev.target.value.replace(/\D/g, "") }
                            : x,
                        ),
                      })
                    }
                    placeholder="Anticipación (min)"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setTienda(i, {
                entregas: [
                  ...t.entregas,
                  { id: `e-${Date.now()}`, nombre: "", hora: "", anticipacion: "" },
                ],
              })
            }
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-[14px] font-bold active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" strokeWidth={3} />
            Agregar horario de entrega
          </button>
        </Bloque>
      </div>
    </>
  );
}
