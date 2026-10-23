import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Store } from "lucide-react";
import { useState } from "react";

import { Card, SectionTitle, Shell, StatusPill } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/comisiones")({
  head: () => ({
    meta: [
      { title: "Comisiones — Control Tiendas · Kigo Pick" },
      { name: "description", content: "Comisiones por las tiendas asignadas al vendedor." },
      { property: "og:title", content: "Comisiones — Control Tiendas · Kigo Pick" },
      { property: "og:description", content: "Bono de activación y comisión mensual por tienda asignada." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Comisiones,
});

type Mes = { mes: string; ventas: number; bono: number };
type Asignada = {
  id: string;
  nombre: string;
  institucion: string;
  pct: number;
  mes_fin: string; // último mes en que recibirá comisión
  meses: Mes[];
};

// Tiendas asignadas al vendedor (demo). Comisión = bono de activación + % de ventas mensuales,
// pagadera hasta el último mes indicado en mes_fin (12 meses desde la activación).
const ASIGNADAS: Asignada[] = [
  {
    id: "a-1",
    nombre: "Café Aurora",
    institucion: "Universidad Anáhuac",
    pct: 3,
    mes_fin: "Jun 2027",
    meses: [
      { mes: "Sep 2026", ventas: 48200, bono: 0 },
      { mes: "Ago 2026", ventas: 45100, bono: 0 },
      { mes: "Jul 2026", ventas: 39800, bono: 1500 },
    ],
  },
  {
    id: "a-2",
    nombre: "Snack Point Tec",
    institucion: "Tec de Monterrey CCM",
    pct: 3,
    mes_fin: "Jul 2027",
    meses: [
      { mes: "Sep 2026", ventas: 31500, bono: 0 },
      { mes: "Ago 2026", ventas: 27900, bono: 1500 },
    ],
  },
  {
    id: "a-3",
    nombre: "La Barra Corporativa",
    institucion: "Torre Reforma",
    pct: 2.5,
    mes_fin: "Ago 2027",
    meses: [{ mes: "Sep 2026", ventas: 18400, bono: 1500 }],
  },
];

const mxn = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);

const comisionMes = (m: Mes, pct: number) => m.bono + (m.ventas * pct) / 100;
const totalTienda = (t: Asignada) => t.meses.reduce((s, m) => s + comisionMes(m, t.pct), 0);

function Comisiones() {
  const [abierta, setAbierta] = useState<string | null>(ASIGNADAS[0]?.id ?? null);
  const total = ASIGNADAS.reduce((s, t) => s + totalTienda(t), 0);
  const esteMes = ASIGNADAS.reduce((s, t) => s + (t.meses[0] ? comisionMes(t.meses[0], t.pct) : 0), 0);

  return (
    <Shell title="Comisiones">
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Card>
          <p className="text-[13px] text-muted-foreground">Total acumulado</p>
          <p className="mt-1 text-[24px] font-extrabold tracking-[-0.04em] text-success">{mxn(total)}</p>
        </Card>
        <Card>
          <p className="text-[13px] text-muted-foreground">Este mes</p>
          <p className="mt-1 text-[24px] font-extrabold tracking-[-0.04em] text-primary">{mxn(esteMes)}</p>
        </Card>
      </div>

      <SectionTitle>Tiendas asignadas ({ASIGNADAS.length})</SectionTitle>
      <div className="space-y-2 pb-8">
        {ASIGNADAS.map((t) => {
          const open = abierta === t.id;
          return (
            <Card key={t.id} className="p-0">
              <button
                type="button"
                onClick={() => setAbierta(open ? null : t.id)}
                className="flex w-full items-center gap-3 p-4 text-left transition-transform active:scale-[0.99]"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-muted">
                  <Store className="h-5 w-5 text-muted-foreground" strokeWidth={2.4} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold tracking-[-0.02em]">{t.nombre}</p>
                  <p className="truncate text-[12px] text-muted-foreground">
                    {t.institucion} · {t.pct}% mensual · hasta {t.mes_fin}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[15px] font-extrabold tracking-[-0.03em]">{mxn(totalTienda(t))}</p>
                  <p className="text-[11px] text-muted-foreground">acumulado</p>
                </div>
                <ChevronDown
                  className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
                  strokeWidth={2.5}
                />
              </button>
              {open && (
                <div className="border-t border-border/70 px-4 py-3">
                  <div className="flex items-center justify-between gap-2 pb-2">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      Historial por mes
                    </p>
                    <StatusPill tone="neutral">Último mes: {t.mes_fin}</StatusPill>
                  </div>
                  <div className="divide-y divide-border/70">
                    {t.meses.map((m) => (
                      <div key={m.mes} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="text-[14px] font-semibold">{m.mes}</p>
                          <p className="text-[12px] text-muted-foreground">
                            Ventas {mxn(m.ventas)} × {t.pct}% = {mxn((m.ventas * t.pct) / 100)}
                          </p>
                          {m.bono > 0 && (
                            <div className="mt-1">
                              <StatusPill tone="primary">Bono activación {mxn(m.bono)}</StatusPill>
                            </div>
                          )}
                        </div>
                        <p className="shrink-0 text-[15px] font-bold">{mxn(comisionMes(m, t.pct))}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </Shell>
  );
}
