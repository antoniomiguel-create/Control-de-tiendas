import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ChevronRight,
  CircleDollarSign,
  Clock,
  DoorOpen,
  Package,
  ShoppingBag,
  Store,
} from "lucide-react";
import { useState } from "react";

import { Card, SectionTitle, Shell, StatusPill } from "@/components/ui-kit";
import { useDemo } from "@/lib/demo";
import { ESTADO_LABEL, ESTADO_TONE, estadoCafeteria } from "@/lib/kigo";

export const Route = createFileRoute("/_authenticated/atencion")({
  head: () => ({
    meta: [
      { title: "Monitoreo de tiendas — Control Tiendas · Kigo Pick" },
      { name: "description", content: "Operación al día a día de tus tiendas asignadas para darles soporte." },
      { property: "og:title", content: "Monitoreo de tiendas — Control Tiendas · Kigo Pick" },
      { property: "og:description", content: "Operación al día a día de tus tiendas asignadas para darles soporte." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Atencion,
});

/* ------------------------------------------------------- datos de operación -- */

type Incidente = {
  id: string;
  tienda: string;
  titulo: string;
  detalle: string;
  prioridad: "alta" | "media" | "baja";
  estado: "abierto" | "en_atencion" | "resuelto";
  hace: string;
};

type OperacionDia = {
  abierta: boolean;
  ventas_hoy: number;
  pedidos_hoy: number;
  pedidos_pendientes: number;
  ultima_actividad: string;
};

const OPERACION_DEMO: Record<string, OperacionDia> = {
  "c-1": {
    abierta: true,
    ventas_hoy: 3240,
    pedidos_hoy: 41,
    pedidos_pendientes: 3,
    ultima_actividad: "hace 4 min",
  },
  "c-2": {
    abierta: true,
    ventas_hoy: 1180,
    pedidos_hoy: 15,
    pedidos_pendientes: 1,
    ultima_actividad: "hace 12 min",
  },
  "c-3": {
    abierta: false,
    ventas_hoy: 0,
    pedidos_hoy: 0,
    pedidos_pendientes: 0,
    ultima_actividad: "ayer 18:20",
  },
};

const OPERACION_DEFAULT: OperacionDia = {
  abierta: false,
  ventas_hoy: 0,
  pedidos_hoy: 0,
  pedidos_pendientes: 0,
  ultima_actividad: "sin actividad",
};

const INCIDENTES_DEMO: Incidente[] = [
  {
    id: "i-1",
    tienda: "c-1",
    titulo: "Impresora de tickets no responde",
    detalle: "La tienda reporta que no imprime comprobantes desde esta mañana.",
    prioridad: "alta",
    estado: "abierto",
    hace: "hace 25 min",
  },
  {
    id: "i-2",
    tienda: "c-2",
    titulo: "Duda con corte de caja",
    detalle: "El encargado pide apoyo para cuadrar el corte de ayer.",
    prioridad: "media",
    estado: "en_atencion",
    hace: "hace 1 h",
  },
  {
    id: "i-3",
    tienda: "c-1",
    titulo: "Actualización de menú",
    detalle: "Solicitan agregar 3 productos nuevos al catálogo.",
    prioridad: "baja",
    estado: "resuelto",
    hace: "ayer",
  },
];

const PRIORIDAD_TONE: Record<Incidente["prioridad"], "danger" | "primary" | "neutral"> = {
  alta: "danger",
  media: "primary",
  baja: "neutral",
};

const PRIORIDAD_LABEL: Record<Incidente["prioridad"], string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

const INCIDENTE_ESTADO_LABEL: Record<Incidente["estado"], string> = {
  abierto: "Abierto",
  en_atencion: "En atención",
  resuelto: "Resuelto",
};

const INCIDENTE_ESTADO_TONE: Record<Incidente["estado"], "danger" | "primary" | "success"> = {
  abierto: "danger",
  en_atencion: "primary",
  resuelto: "success",
};

const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

/* ------------------------------------------------------------------ vista -- */

function Atencion() {
  const { cafeterias } = useDemo();
  const [incidentes, setIncidentes] = useState(INCIDENTES_DEMO);
  const [tab, setTab] = useState<"operacion" | "incidentes">("operacion");

  const operativas = cafeterias.filter((c) => estadoCafeteria(c) === "activa");
  const abiertas = operativas.filter((c) => (OPERACION_DEMO[c.id] ?? OPERACION_DEFAULT).abierta);
  const ventasHoy = operativas.reduce(
    (acc, c) => acc + (OPERACION_DEMO[c.id] ?? OPERACION_DEFAULT).ventas_hoy,
    0,
  );
  const pedidosHoy = operativas.reduce(
    (acc, c) => acc + (OPERACION_DEMO[c.id] ?? OPERACION_DEFAULT).pedidos_hoy,
    0,
  );

  const incidentesAbiertos = incidentes.filter((i) => i.estado !== "resuelto");
  const nombreTienda = (id: string) =>
    cafeterias.find((c) => c.id === id)?.nombre_comercial ?? "Tienda";

  const resolverIncidente = (id: string) =>
    setIncidentes((prev) =>
      prev.map((i) => (i.id === id ? { ...i, estado: "resuelto" } : i)),
    );

  return (
    <Shell title="Monitoreo de tiendas">
      {/* Resumen del día */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-[24px] font-extrabold tracking-[-0.04em] text-success">
            {abiertas.length}/{operativas.length}
          </p>
          <p className="text-[11px] text-muted-foreground">Abiertas hoy</p>
        </Card>
        <Card className="text-center">
          <p className="text-[24px] font-extrabold tracking-[-0.04em]">{pedidosHoy}</p>
          <p className="text-[11px] text-muted-foreground">Pedidos hoy</p>
        </Card>
        <Card className="text-center">
          <p className="text-[24px] font-extrabold tracking-[-0.04em] text-primary">
            {mxn.format(ventasHoy)}
          </p>
          <p className="text-[11px] text-muted-foreground">Ventas hoy</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mt-5 grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
        <button
          type="button"
          onClick={() => setTab("operacion")}
          className={`rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all ${
            tab === "operacion"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Operación de hoy
        </button>
        <button
          type="button"
          onClick={() => setTab("incidentes")}
          className={`rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all ${
            tab === "incidentes"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Incidentes{incidentesAbiertos.length > 0 && ` (${incidentesAbiertos.length})`}
        </button>
      </div>

      {tab === "operacion" && (
        <>
          <SectionTitle>Tiendas en operación</SectionTitle>
          <div className="space-y-2 pb-8">
            {operativas.map((c) => {
              const op = OPERACION_DEMO[c.id] ?? OPERACION_DEFAULT;
              const abiertos = incidentes.filter(
                (i) => i.tienda === c.id && i.estado !== "resuelto",
              ).length;
              return (
                <Link key={c.id} to="/cafeterias/$id" params={{ id: c.id }} className="block">
                  <Card className="transition-transform active:scale-[0.98]">
                    <div className="flex items-start gap-3">
                      <div
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${
                          op.abierta ? "bg-success/10" : "bg-muted"
                        }`}
                      >
                        {op.abierta ? (
                          <DoorOpen className="h-5 w-5 text-success" strokeWidth={2.4} />
                        ) : (
                          <Store className="h-5 w-5 text-muted-foreground" strokeWidth={2.4} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-[15px] font-bold tracking-[-0.02em]">
                            {c.nombre_comercial}
                          </p>
                          <StatusPill tone={op.abierta ? "success" : "neutral"}>
                            {op.abierta ? "Abierta" : "Cerrada"}
                          </StatusPill>
                        </div>
                        <p className="truncate text-[12px] text-muted-foreground">
                          {c.institucion || c.ciudad} · última actividad {op.ultima_actividad}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-semibold">
                          <span className="inline-flex items-center gap-1.5">
                            <CircleDollarSign className="h-4 w-4 text-primary" strokeWidth={2.4} />
                            {mxn.format(op.ventas_hoy)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" strokeWidth={2.4} />
                            {op.pedidos_hoy} pedidos
                          </span>
                          {op.pedidos_pendientes > 0 && (
                            <span className="inline-flex items-center gap-1.5 text-primary">
                              <Clock className="h-4 w-4" strokeWidth={2.4} />
                              {op.pedidos_pendientes} por entregar
                            </span>
                          )}
                          {abiertos > 0 && (
                            <span className="inline-flex items-center gap-1.5 text-destructive">
                              <AlertTriangle className="h-4 w-4" strokeWidth={2.4} />
                              {abiertos} incidente{abiertos > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="mt-2 h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={2.4} />
                    </div>
                  </Card>
                </Link>
              );
            })}

            {operativas.length === 0 && (
              <Card className="text-center">
                <p className="text-[15px] font-bold tracking-[-0.02em]">Aún no hay tiendas en operación</p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Cuando tus tiendas estén activas, aquí verás su operación del día.
                </p>
              </Card>
            )}
          </div>

          {cafeterias.some((c) => estadoCafeteria(c) !== "activa") && (
            <>
              <SectionTitle>Aún no operan</SectionTitle>
              <div className="space-y-2 pb-8">
                {cafeterias
                  .filter((c) => estadoCafeteria(c) !== "activa")
                  .map((c) => {
                    const est = estadoCafeteria(c);
                    return (
                      <Link key={c.id} to="/cafeterias/$id" params={{ id: c.id }} className="block">
                        <Card className="flex items-center gap-3 transition-transform active:scale-[0.98]">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-muted">
                            <Package className="h-5 w-5 text-muted-foreground" strokeWidth={2.4} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[15px] font-bold tracking-[-0.02em]">
                              {c.nombre_comercial}
                            </p>
                            <p className="truncate text-[12px] text-muted-foreground">
                              {c.institucion || c.ciudad}
                            </p>
                          </div>
                          <StatusPill tone={ESTADO_TONE[est]}>{ESTADO_LABEL[est]}</StatusPill>
                          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={2.4} />
                        </Card>
                      </Link>
                    );
                  })}
              </div>
            </>
          )}
        </>
      )}

      {tab === "incidentes" && (
        <>
          <SectionTitle>Incidentes y soporte</SectionTitle>
          <div className="space-y-2 pb-8">
            {incidentes.map((i) => (
              <Card key={i.id}>
                <div className="flex items-start gap-3">
                  <div
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${
                      i.estado === "resuelto" ? "bg-success/10" : "bg-destructive/10"
                    }`}
                  >
                    <AlertTriangle
                      className={`h-5 w-5 ${
                        i.estado === "resuelto" ? "text-success" : "text-destructive"
                      }`}
                      strokeWidth={2.4}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[15px] font-bold tracking-[-0.02em]">{i.titulo}</p>
                      <StatusPill tone={PRIORIDAD_TONE[i.prioridad]}>
                        {PRIORIDAD_LABEL[i.prioridad]}
                      </StatusPill>
                      <StatusPill tone={INCIDENTE_ESTADO_TONE[i.estado]}>
                        {INCIDENTE_ESTADO_LABEL[i.estado]}
                      </StatusPill>
                    </div>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      {nombreTienda(i.tienda)} · {i.hace}
                    </p>
                    <p className="mt-1 text-[13px] text-muted-foreground">{i.detalle}</p>
                    {i.estado !== "resuelto" && (
                      <button
                        type="button"
                        onClick={() => resolverIncidente(i.id)}
                        className="mt-2 rounded-full bg-primary px-4 py-1.5 text-[12px] font-bold text-primary-foreground transition-transform active:scale-[0.97]"
                      >
                        Marcar como resuelto
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {incidentes.length === 0 && (
              <Card className="text-center">
                <p className="text-[15px] font-bold tracking-[-0.02em]">Sin incidentes</p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Cuando una tienda reporte un problema aparecerá aquí.
                </p>
              </Card>
            )}
          </div>
        </>
      )}
    </Shell>
  );
}
