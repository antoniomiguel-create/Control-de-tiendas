export type RegistroEstado = "revision" | "aprobada";

export type ActivacionEstado = "sin_iniciar" | "en_proceso" | "activa";

export type EstadoCafeteria = "revision" | "aprobada" | "activa";

export const ESTADO_LABEL: Record<EstadoCafeteria, string> = {
  revision: "En revisión",
  aprobada: "Aprobada",
  activa: "Activa",
};

export const ESTADO_TONE: Record<EstadoCafeteria, "neutral" | "primary" | "success"> = {
  revision: "neutral",
  aprobada: "primary",
  activa: "success",
};

export function estadoCafeteria(c: {
  registro_estado: RegistroEstado;
  activacion_estado: ActivacionEstado;
}): EstadoCafeteria {
  if (c.registro_estado === "aprobada" && c.activacion_estado === "activa") return "activa";
  return c.registro_estado;
}

/* ------------------------------------------- Banderas de perfil completo -- */

export type CafeteriaLike = {
  nombre_comercial: string;
  contacto_nombre: string;
  contacto_telefono: string;
  contacto_email: string;
  usuario_admin: string;
  password_admin: string;
  ciudad: string;
  tipo_institucion: string[];
  horario: string;
  dias: number[];
  horas: Record<number, { apertura: string; cierre: string }>;
  razon_social: string;
  rfc: string;
  codigo_postal_fiscal: string;
  regimen_fiscal: string;
  direccion_fiscal: string;
  constancia_situacion_fiscal: string | null;
  no_requiere_factura: boolean;
  usuario_tienda: string;
  password_tienda: string;
  logo: string | null;
  correo_pagos: string;
  titular_cuenta: string;
  email_titular: string;
  clabe: string;
  telefono_contacto: string;
  ventas_mensuales_promedio: string;
  costo_inscripcion: string;
  trato: string;
};

export type Bandera = {
  key: string;
  label: string;
  cumplida: (c: CafeteriaLike) => boolean;
};

export const BANDERAS: Bandera[] = [
  {
    key: "cuenta_admin",
    label: "Cuenta del dueño o administrador",
    cumplida: (c) =>
      c.contacto_nombre.trim().length > 1 &&
      c.contacto_telefono.trim().length >= 8 &&
      c.contacto_email.includes("@") &&
      c.usuario_admin.trim().length >= 4 &&
      c.password_admin.length > 0,
  },
  {
    key: "cuenta_tienda",
    label: "Cuenta de la tienda",
    cumplida: (c) => c.usuario_tienda.trim().length >= 4 && c.password_tienda.length > 0,
  },
  {
    key: "logo",
    label: "Logo de la tienda",
    cumplida: (c) => Boolean(c.logo),
  },
  {
    key: "horario",
    label: "Horario de la tienda",
    cumplida: (c) =>
      c.dias.length > 0 &&
      c.dias.every((d) => {
        const h = c.horas[d];
        return Boolean(h && h.apertura.trim() && h.cierre.trim());
      }),
  },
  {
    key: "pagos",
    label: "Información para pagos",
    cumplida: (c) => c.correo_pagos.includes("@") && /^\d{18}$/.test(c.clabe.trim()),
  },
  {
    key: "facturacion",
    label: "Información para facturación",
    cumplida: (c) =>
      c.no_requiere_factura ||
      (c.razon_social.trim().length > 2 && c.rfc.trim().length >= 12),
  },
];

export function banderasFaltantes(c: CafeteriaLike) {
  return BANDERAS.filter((b) => !b.cumplida(c));
}

export function perfilCompletoPct(c: CafeteriaLike) {
  const faltantes = banderasFaltantes(c).length;
  return Math.round(((BANDERAS.length - faltantes) / BANDERAS.length) * 100);
}

export function formatFecha(value?: string | null) {
  if (!value) return "Sin fecha";
  const date = new Date(value.length <= 10 ? `${value}T12:00:00` : value);
  return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short" }).format(date);
}

export function formatFechaHora(value?: string | null) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
