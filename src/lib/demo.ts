import { useSyncExternalStore } from "react";


import type { ActivacionEstado, RegistroEstado } from "@/lib/kigo";

export type Perfil = {
  id: string;
  email: string;
  nombre: string;
  telefono: string;
  zona: string;
};

export type Cafeteria = {
  id: string;
  nombre_comercial: string;
  contacto_nombre: string;
  contacto_telefono: string;
  contacto_email: string;
  usuario_admin: string;
  password_admin: string;
  ciudad: string;
  institucion: string;
  tipo_institucion: string[];
  sistema_operativo: string;
  referencia: string;
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
  notas: string;
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
  registro_estado: RegistroEstado;
  activacion_estado: ActivacionEstado;
  created_at: string;
};

export type Paso = {
  id: string;
  cafeteria_id: string;
  orden: number;
  titulo: string;
  completado: boolean;
  requiere_evidencia: boolean;
  evidencias: string[];
};

export const PASOS_BASE = [
  "Instalación del sistema",
  "Capacitación del personal",
  "Instalación del material físico",
];

export const PASO_CON_EVIDENCIA = "Instalación del material físico";

function iso(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString();
}

function pasosDe(cafeteriaId: string, completados: number): Paso[] {
  return PASOS_BASE.map((titulo, i) => ({
    id: `${cafeteriaId}-p${i + 1}`,
    cafeteria_id: cafeteriaId,
    orden: i + 1,
    titulo,
    completado: i < completados,
    requiere_evidencia: titulo === PASO_CON_EVIDENCIA,
    evidencias: [],
  }));
}


type Estado = {
  me: Perfil;
  cafeterias: Cafeteria[];
  pasos: Paso[];
};

const cafeteriaBase = {
  contacto_email: "",
  usuario_admin: "",
  password_admin: "",
  institucion: "",
  tipo_institucion: [] as string[],
  sistema_operativo: "",
  referencia: "",
  horario: "",
  dias: [] as number[],
  horas: {} as Record<number, { apertura: string; cierre: string }>,
  razon_social: "",
  rfc: "",
  codigo_postal_fiscal: "",
  regimen_fiscal: "",
  direccion_fiscal: "",
  constancia_situacion_fiscal: null as string | null,
  no_requiere_factura: false,
  notas: "",
  usuario_tienda: "",
  password_tienda: "",
  logo: null as string | null,
  correo_pagos: "",
  titular_cuenta: "",
  email_titular: "",
  clabe: "",
  telefono_contacto: "",
  ventas_mensuales_promedio: "",
  costo_inscripcion: "2000",
  trato: "",
};

let estado: Estado = {
  me: {
    id: "u-1",
    email: "ana.torres@kigo.mx",
    nombre: "Ana Torres",
    telefono: "55 1234 5678",
    zona: "CDMX Centro",
  },
  cafeterias: [
    {
      ...cafeteriaBase,
      id: "c-1",
      nombre_comercial: "Café Aurora",
      contacto_nombre: "Luis Márquez",
      contacto_telefono: "55 8811 2233",
      contacto_email: "luis@cafeaurora.mx",
      usuario_admin: "luis_marquez",
      password_admin: "aurora2024",
      ciudad: "Ciudad de México",
      institucion: "Universidad Anáhuac",
      tipo_institucion: ["universidad"],
      sistema_operativo: "android",
      horario: "Lun, Mar, Mié, Jue, Vie · 08:00 - 18:00",
      dias: [1, 2, 3, 4, 5],
      horas: Object.fromEntries(
        [1, 2, 3, 4, 5].map((d) => [d, { apertura: "08:00", cierre: "18:00" }]),
      ),
      usuario_tienda: "cafe_aurora",
      password_tienda: "tienda2024",
      razon_social: "Café Aurora SA de CV",
      rfc: "CAU190201AB3",
      correo_pagos: "pagos@cafeaurora.mx",
      clabe: "012180001234567890",
      ventas_mensuales_promedio: "45000",
      costo_inscripcion: "2000",
      registro_estado: "aprobada",
      activacion_estado: "activa",
      created_at: iso(-18),
    },
    {
      ...cafeteriaBase,
      id: "c-2",
      nombre_comercial: "Tostado Roma",
      contacto_nombre: "Sofía Ledezma",
      contacto_telefono: "55 4477 9090",
      contacto_email: "sofia@tostadoroma.mx",
      ciudad: "Ciudad de México",
      institucion: "Plaza Comercial Roma",
      tipo_institucion: ["centro_comercial"],
      horario: "Lun a Dom · 09:00 - 20:00",
      usuario_tienda: "tostado_roma",
      registro_estado: "aprobada",
      activacion_estado: "en_proceso",
      created_at: iso(-9),
    },
    {
      ...cafeteriaBase,
      id: "c-3",
      nombre_comercial: "Grano Sur",
      contacto_nombre: "Diego Paredes",
      contacto_telefono: "55 2200 4411",
      ciudad: "Jalisco",
      institucion: "Colegio Patria Sur",
      tipo_institucion: ["colegio"],
      registro_estado: "revision",
      activacion_estado: "sin_iniciar",
      created_at: iso(-2),
    },
  ],
  pasos: [...pasosDe("c-1", 3), ...pasosDe("c-2", 1), ...pasosDe("c-3", 0)],
};

const listeners = new Set<() => void>();

function emitir(next: Estado) {
  estado = next;
  listeners.forEach((l) => l());
}

export function useDemo() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => estado,
    () => estado,
  );
}

export const demo = {
  get: () => estado,
  actualizarPerfil(patch: Partial<Perfil>) {
    emitir({ ...estado, me: { ...estado.me, ...patch } });
  },
  crearCafeteria(input: Omit<Cafeteria, "id" | "created_at" | "activacion_estado">) {
    const id = `c-${Date.now()}`;
    const nueva: Cafeteria = {
      ...input,
      id,
      activacion_estado: "sin_iniciar",
      created_at: new Date().toISOString(),
    };
    emitir({
      ...estado,
      cafeterias: [nueva, ...estado.cafeterias],
      pasos: [...estado.pasos, ...pasosDe(id, 0)],
    });
    return id;
  },
  actualizarCafeteria(id: string, patch: Partial<Cafeteria>) {
    emitir({
      ...estado,
      cafeterias: estado.cafeterias.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  },
  togglePaso(pasoId: string) {
    const actual = estado.pasos.find((p) => p.id === pasoId);
    if (!actual) return false;
    if (!actual.completado && actual.requiere_evidencia && actual.evidencias.length === 0) {
      return false;
    }
    const pasos = estado.pasos.map((p) =>
      p.id === pasoId ? { ...p, completado: !p.completado } : p,
    );
    aplicarPasos(pasos, actual.cafeteria_id);
    return true;
  },
  agregarEvidencias(pasoId: string, imagenes: string[]) {
    const paso = estado.pasos.find((p) => p.id === pasoId);
    if (!paso) return;
    const pasos = estado.pasos.map((p) =>
      p.id === pasoId ? { ...p, evidencias: [...p.evidencias, ...imagenes] } : p,
    );
    aplicarPasos(pasos, paso.cafeteria_id);
  },
  quitarEvidencia(pasoId: string, index: number) {
    const paso = estado.pasos.find((p) => p.id === pasoId);
    if (!paso) return;
    const pasos = estado.pasos.map((p) => {
      if (p.id !== pasoId) return p;
      const evidencias = p.evidencias.filter((_, i) => i !== index);
      return {
        ...p,
        evidencias,
        completado: p.requiere_evidencia && evidencias.length === 0 ? false : p.completado,
      };
    });
    aplicarPasos(pasos, paso.cafeteria_id);
  },
};

function aplicarPasos(pasos: Paso[], cafeteriaId: string) {
  const delCafe = pasos.filter((p) => p.cafeteria_id === cafeteriaId);
  const hechos = delCafe.filter((p) => p.completado).length;
  const activacion: ActivacionEstado =
    hechos === delCafe.length ? "activa" : hechos === 0 ? "sin_iniciar" : "en_proceso";
  emitir({
    ...estado,
    pasos,
    cafeterias: estado.cafeterias.map((c) =>
      c.id === cafeteriaId ? { ...c, activacion_estado: activacion } : c,
    ),
  });
}

