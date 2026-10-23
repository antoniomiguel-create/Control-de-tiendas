import { createFileRoute } from "@tanstack/react-router";
import { Calculator, CreditCard, Repeat, Store } from "lucide-react";
import { useMemo, useState } from "react";

import { Card, SectionTitle, Shell } from "@/components/ui-kit";
import { inputClass } from "@/components/ui-kit";

export const Route = createFileRoute("/_authenticated/cotizador")({
  head: () => ({
    meta: [
      { title: "Cotizador — Control Tiendas · Kigo Pick" },
      {
        name: "description",
        content: "Calcula el costo de inscripción y la comisión o suscripción estimada para nuevas tiendas.",
      },
      { property: "og:title", content: "Cotizador — Control Tiendas · Kigo Pick" },
      {
        property: "og:description",
        content: "Cotiza el alta de tiendas: inscripción, comisión o suscripción mensual y proyección anual.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cotizador,
});

const mxn = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);

const num = (s: string) => {
  const n = Number(s.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

type Modelo = "transaccional" | "saas";

function Cotizador() {
  const [modelo, setModelo] = useState<Modelo | null>(null);
  const [tiendas, setTiendas] = useState("1");
  const [costoInscripcion, setCostoInscripcion] = useState("2000");
  const [comisionPct, setComisionPct] = useState("15");
  const [ventasMes, setVentasMes] = useState("30000");
  const [cuotaMensual, setCuotaMensual] = useState("");
  const [rentaSemanal, setRentaSemanal] = useState("");

  const esSaas = modelo === "saas";

  const r = useMemo(() => {
    const t = Math.max(0, Math.floor(num(tiendas)));
    const insc = num(costoInscripcion);
    const pct = num(comisionPct);
    const ventas = num(ventasMes);
    const cuota = num(cuotaMensual);
    const renta = num(rentaSemanal) * 4;
    const totalInscripcion = t * insc;
    const comisionMensual = t * ((ventas * pct) / 100);
    const suscripcionMensual = t * cuota;
    const rentaMensual = t * renta;
    const ingresoMensual = esSaas ? suscripcionMensual + rentaMensual : comisionMensual + rentaMensual;
    const primerMes = totalInscripcion + ingresoMensual;
    const anual = totalInscripcion + ingresoMensual * 12;
    return { t, totalInscripcion, comisionMensual, suscripcionMensual, rentaMensual, ingresoMensual, primerMes, anual };
  }, [tiendas, costoInscripcion, comisionPct, ventasMes, cuotaMensual, rentaSemanal, esSaas]);

  const opcionesModelo: { id: Modelo; titulo: string; desc: string; icono: typeof Repeat }[] = [
    {
      id: "transaccional",
      titulo: "Transaccional",
      desc: "Ganas una comisión sobre las ventas de cada tienda",
      icono: Repeat,
    },
    {
      id: "saas",
      titulo: "SAAS",
      desc: "Ganas una cuota mensual fija por cada tienda",
      icono: CreditCard,
    },
  ];

  return (
    <Shell title="Cotizador">
      <div className="mt-4 space-y-4">
        {modelo === null ? (
          <Card>
            <p className="text-[14px] font-bold tracking-[-0.02em]">¿Qué modelo quieres cotizar?</p>
            <p className="mt-1 text-[12px] text-muted-foreground">Elige cómo gana Kigo Pick con las tiendas</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {opcionesModelo.map((op) => {
                const Icono = op.icono;
                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setModelo(op.id)}
                    className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-background p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-muted">
                      <Icono className="h-5 w-5 text-primary" strokeWidth={2.4} />
                    </span>
                    <span className="text-[15px] font-extrabold tracking-[-0.02em]">{op.titulo}</span>
                    <span className="text-[12px] text-muted-foreground">{op.desc}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        ) : (
          <>
            <Card>
              <p className="text-[13px] text-muted-foreground">Ingreso estimado el primer mes</p>
              <p className="mt-1 text-[30px] font-extrabold tracking-[-0.04em] text-primary">
                {mxn(r.primerMes)}
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Inscripción + {esSaas ? "suscripción" : "comisión"} + renta del primer mes
              </p>
            </Card>

            <div className="flex items-center gap-2">
              <span className="text-[12px] text-muted-foreground">Modelo:</span>
              <button
                type="button"
                onClick={() => setModelo(null)}
                className="rounded-full border border-border bg-muted px-3 py-1 text-[12px] font-bold tracking-[-0.01em] hover:bg-primary/10"
              >
                {esSaas ? "SAAS" : "Transaccional"} · cambiar
              </button>
            </div>

            <SectionTitle>Datos de la cotización</SectionTitle>
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-bold tracking-[-0.01em]">
                  ¿Cuántas tiendas?
                </span>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  value={tiendas}
                  onChange={(e) => setTiendas(e.target.value)}
                  placeholder="1"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[13px] font-bold tracking-[-0.01em]">
                  Costo de inscripción por tienda
                </span>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  value={costoInscripcion}
                  onChange={(e) => setCostoInscripcion(e.target.value)}
                  placeholder="2000"
                />
                <span className="mt-1 block text-[11px] text-muted-foreground">
                  Normalmente cobramos {mxn(2000)} por tienda
                </span>
              </label>

              {esSaas ? (
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-bold tracking-[-0.01em]">
                    Cuota mensual fija por tienda
                  </span>
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={cuotaMensual}
                    onChange={(e) => setCuotaMensual(e.target.value)}
                    placeholder="1000"
                  />
                </label>
              ) : (
                <>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] font-bold tracking-[-0.01em]">
                      Comisión sobre ventas (%)
                    </span>
                    <input
                      className={inputClass}
                      inputMode="decimal"
                      value={comisionPct}
                      onChange={(e) => setComisionPct(e.target.value)}
                      placeholder="15"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-[13px] font-bold tracking-[-0.01em]">
                      Ventas mensuales promedio por tienda
                    </span>
                    <input
                      className={inputClass}
                      inputMode="numeric"
                      value={ventasMes}
                      onChange={(e) => setVentasMes(e.target.value)}
                      placeholder="30000"
                    />
                  </label>
                </>
              )}

              <label className="block">
                <span className="mb-1.5 block text-[13px] font-bold tracking-[-0.01em]">
                  Renta semanal de la tienda (opcional)
                </span>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  value={rentaSemanal}
                  onChange={(e) => setRentaSemanal(e.target.value)}
                  placeholder="1500"
                />
                <span className="mt-1 block text-[11px] text-muted-foreground">
                  Ej. Renta semanal {mxn(1500)}
                </span>
              </label>
            </div>

            <SectionTitle>Resultado</SectionTitle>
            <div className="space-y-2 pb-8">
              <Card className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-muted">
                  <Store className="h-5 w-5 text-muted-foreground" strokeWidth={2.4} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold tracking-[-0.02em]">
                    Inscripción ({r.t} {r.t === 1 ? "tienda" : "tiendas"})
                  </p>
                  <p className="text-[12px] text-muted-foreground">Pago único al dar de alta</p>
                </div>
                <p className="text-[15px] font-extrabold tracking-[-0.03em]">{mxn(r.totalInscripcion)}</p>
              </Card>

              {esSaas ? (
                <Card className="flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-muted">
                    <CreditCard className="h-5 w-5 text-muted-foreground" strokeWidth={2.4} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold tracking-[-0.02em]">Suscripción mensual</p>
                    <p className="text-[12px] text-muted-foreground">
                      {mxn(num(cuotaMensual))} fijo por tienda
                    </p>
                  </div>
                  <p className="text-[15px] font-extrabold tracking-[-0.03em] text-success">
                    {mxn(r.suscripcionMensual)}
                  </p>
                </Card>
              ) : (
                <Card className="flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-muted">
                    <Calculator className="h-5 w-5 text-muted-foreground" strokeWidth={2.4} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold tracking-[-0.02em]">Comisión mensual</p>
                    <p className="text-[12px] text-muted-foreground">
                      {comisionPct || 0}% de {mxn(num(ventasMes))} por tienda
                    </p>
                  </div>
                  <p className="text-[15px] font-extrabold tracking-[-0.03em] text-success">
                    {mxn(r.comisionMensual)}
                  </p>
                </Card>
              )}

              {r.rentaMensual > 0 && (
                <Card className="flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-muted">
                    <Calculator className="h-5 w-5 text-muted-foreground" strokeWidth={2.4} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold tracking-[-0.02em]">Renta mensual</p>
                    <p className="text-[12px] text-muted-foreground">Semanal × 4, por tienda</p>
                  </div>
                  <p className="text-[15px] font-extrabold tracking-[-0.03em] text-success">
                    {mxn(r.rentaMensual)}
                  </p>
                </Card>
              )}

              <Card className="border-primary/30 bg-primary/5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-bold tracking-[-0.02em]">Proyección a 12 meses</p>
                    <p className="text-[12px] text-muted-foreground">Inscripción + 12 meses de ingresos</p>
                  </div>
                  <p className="text-[20px] font-extrabold tracking-[-0.03em] text-primary">
                    {mxn(r.anual)}
                  </p>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}
