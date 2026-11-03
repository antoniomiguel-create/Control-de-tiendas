import { createFileRoute } from "@tanstack/react-router";
import { Calculator, CreditCard, Minus, Monitor, Plus, Repeat, Store } from "lucide-react";
import { useMemo, useState } from "react";

import { Card, SectionTitle, Shell } from "@/components/ui-kit";
import { inputClass } from "@/components/ui-kit";

export const Route = createFileRoute("/_authenticated/cotizador")({
  head: () => ({
    meta: [
      { title: "Cotizador — Control Tiendas · Kigo Pick" },
      {
        name: "description",
        content:
          "Calcula el costo de inscripción y la comisión o suscripción estimada para nuevas tiendas.",
      },
      { property: "og:title", content: "Cotizador — Control Tiendas · Kigo Pick" },
      {
        property: "og:description",
        content:
          "Cotiza el alta de tiendas: inscripción, comisión o suscripción mensual y proyección anual.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cotizador,
});

const mxn = (n: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(n);

const num = (s: string) => {
  const n = Number(s.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

type Modelo = "transaccional" | "saas" | "hardware";

/** Catálogo de ejemplo: renta semanal sugerida, editable en la cotización. */
const HARDWARE = [
  { id: "tablet", nombre: "Tablet punto de venta", precio: 350 },
  { id: "impresora", nombre: "Impresora de tickets", precio: 180 },
  { id: "cajon", nombre: "Cajón de dinero", precio: 120 },
  { id: "lector", nombre: "Lector de códigos QR", precio: 90 },
] as const;

type HardwareId = (typeof HARDWARE)[number]["id"];

function Cotizador() {
  const [modelo, setModelo] = useState<Modelo | null>(null);
  const [tiendas, setTiendas] = useState("1");
  const [costoInscripcion, setCostoInscripcion] = useState("2000");
  const [comisionPct, setComisionPct] = useState("15");
  const [ventasMes, setVentasMes] = useState("30000");
  const [cuotaMensual, setCuotaMensual] = useState("");
  const [rentaSemanal, setRentaSemanal] = useState("");
  const [hwCantidad, setHwCantidad] = useState<Record<HardwareId, number>>({
    tablet: 0,
    impresora: 0,
    cajon: 0,
    lector: 0,
  });
  const [hwPrecio, setHwPrecio] = useState<Record<HardwareId, string>>({
    tablet: "350",
    impresora: "180",
    cajon: "120",
    lector: "90",
  });

  const cambiarCantidad = (id: HardwareId, delta: number) =>
    setHwCantidad((prev) => ({ ...prev, [id]: Math.max(0, prev[id] + delta) }));

  const esSaas = modelo === "saas";
  const esHardware = modelo === "hardware";

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
    const ingresoMensual = esSaas
      ? suscripcionMensual + rentaMensual
      : comisionMensual + rentaMensual;
    const totalHardware = HARDWARE.reduce(
      (suma, h) => suma + hwCantidad[h.id] * num(hwPrecio[h.id]),
      0,
    );
    const piezasHardware = HARDWARE.reduce((suma, h) => suma + hwCantidad[h.id], 0);
    const primerMes = totalInscripcion + ingresoMensual;
    const anual = totalInscripcion + ingresoMensual * 12;
    return {
      t,
      totalInscripcion,
      comisionMensual,
      suscripcionMensual,
      rentaMensual,
      ingresoMensual,
      totalHardware,
      piezasHardware,
      primerMes,
      anual,
    };
  }, [
    tiendas,
    costoInscripcion,
    comisionPct,
    ventasMes,
    cuotaMensual,
    rentaSemanal,
    esSaas,
    hwCantidad,
    hwPrecio,
  ]);

  const opcionesModelo: {
    id: Modelo;
    titulo: string;
    desc: string;
    icono: typeof Repeat;
    etiquetas?: string[];
  }[] = [
    {
      id: "transaccional",
      titulo: "Transaccional",
      desc: "Kigo cobra una comisión sobre las ventas de la tienda",
      icono: Repeat,
      etiquetas: ["Preparatorias", "Universidades", "Corporativos", "Locales externos"],
    },
    {
      id: "saas",
      titulo: "SAAS",
      desc: "Kigo cobra una cuota semanal a la tienda y una comisión mínima",
      icono: CreditCard,
      etiquetas: ["Kinders", "Primarias", "Secundarias"],
    },
    {
      id: "hardware",
      titulo: "Hardware",
      desc: "Renta de equipo semanal a la tienda",
      icono: Monitor,
    },
  ];

  const nombreModelo = esHardware ? "Hardware" : esSaas ? "SAAS" : "Transaccional";

  return (
    <Shell title="Cotizador">
      <div className="mt-4 space-y-4">
        {modelo === null ? (
          <Card>
            <p className="text-[14px] font-bold tracking-[-0.02em]">¿Qué modelo quieres cotizar?</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Elige cómo gana Kigo Pick con las tiendas
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
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
                    <span className="text-[15px] font-extrabold tracking-[-0.02em]">
                      {op.titulo}
                    </span>
                    <span className="text-[12px] text-muted-foreground">{op.desc}</span>
                    {op.etiquetas && (
                      <span className="mt-1 flex flex-wrap gap-1.5">
                        {op.etiquetas.map((et) => (
                          <span
                            key={et}
                            className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
                          >
                            {et}
                          </span>
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        ) : (
          <>
            {esHardware ? (
              <Card>
                <p className="text-[13px] text-muted-foreground">Renta semanal de hardware</p>
                <p className="mt-1 text-[30px] font-extrabold tracking-[-0.04em] text-primary">
                  {mxn(r.totalHardware)}
                </p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Cada semana por {r.piezasHardware} {r.piezasHardware === 1 ? "equipo" : "equipos"}
                </p>
              </Card>
            ) : (
              <Card>
                <p className="text-[13px] text-muted-foreground">Ingreso estimado el primer mes</p>
                <p className="mt-1 text-[30px] font-extrabold tracking-[-0.04em] text-primary">
                  {mxn(r.primerMes)}
                </p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Inscripción + {esSaas ? "suscripción" : "comisión"} + renta del primer mes
                </p>
              </Card>
            )}

            <div className="flex items-center gap-2">
              <span className="text-[12px] text-muted-foreground">Modelo:</span>
              <button
                type="button"
                onClick={() => setModelo(null)}
                className="rounded-full border border-border bg-muted px-3 py-1 text-[12px] font-bold tracking-[-0.01em] hover:bg-primary/10"
              >
                {nombreModelo} · cambiar
              </button>
            </div>

            {!esHardware && (
              <>
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
              </>
            )}

            {esHardware && (
              <>
                <SectionTitle
                  action={
                    r.totalHardware > 0 ? (
                      <span className="text-sm font-bold text-primary">{mxn(r.totalHardware)}</span>
                    ) : undefined
                  }
                >
                  Hardware
                </SectionTitle>
                <Card className="divide-y divide-border p-0">
                  {HARDWARE.map((h) => {
                    const cantidad = hwCantidad[h.id];
                    return (
                      <div key={h.id} className="flex items-center gap-3 px-4 py-3.5">
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-bold tracking-[-0.02em]">{h.nombre}</p>
                          <label className="mt-1 flex items-center gap-1 text-[12px] text-muted-foreground">
                            <span>$</span>
                            <input
                              id={`hw-precio-${h.id}`}
                              aria-label={`Precio de ${h.nombre}`}
                              className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-[12px] font-semibold text-foreground"
                              inputMode="numeric"
                              value={hwPrecio[h.id]}
                              onChange={(e) =>
                                setHwPrecio((prev) => ({
                                  ...prev,
                                  [h.id]: e.target.value.replace(/\D/g, ""),
                                }))
                              }
                            />
                            <span>c/u por semana</span>
                          </label>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            aria-label={`Quitar ${h.nombre}`}
                            onClick={() => cambiarCantidad(h.id, -1)}
                            disabled={cantidad === 0}
                            className="grid h-9 w-9 place-items-center rounded-full bg-muted transition-transform active:scale-[0.95] disabled:opacity-40"
                          >
                            <Minus className="h-4 w-4" strokeWidth={2.5} />
                          </button>
                          <span className="w-6 text-center text-[15px] font-extrabold tabular-nums">
                            {cantidad}
                          </span>
                          <button
                            type="button"
                            aria-label={`Agregar ${h.nombre}`}
                            onClick={() => cambiarCantidad(h.id, 1)}
                            className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-[0.95]"
                          >
                            <Plus className="h-4 w-4" strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </Card>
                <p className="-mt-2 text-[11px] text-muted-foreground">
                  Rentas semanales de ejemplo. Puedes cambiarlas en cada equipo.
                </p>
              </>
            )}

            <SectionTitle>Resultado</SectionTitle>
            {esHardware ? (
              <div className="space-y-2 pb-8">
                {r.piezasHardware === 0 ? (
                  <Card>
                    <p className="text-[13px] text-muted-foreground">
                      Agrega equipos con el botón + para ver la cotización.
                    </p>
                  </Card>
                ) : (
                  HARDWARE.filter((h) => hwCantidad[h.id] > 0).map((h) => (
                    <Card key={h.id} className="flex items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-muted">
                        <Monitor className="h-5 w-5 text-muted-foreground" strokeWidth={2.4} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-bold tracking-[-0.02em]">{h.nombre}</p>
                        <p className="text-[12px] text-muted-foreground">
                          {hwCantidad[h.id]} × {mxn(num(hwPrecio[h.id]))}
                        </p>
                      </div>
                      <p className="text-[15px] font-extrabold tracking-[-0.03em]">
                        {mxn(hwCantidad[h.id] * num(hwPrecio[h.id]))}
                      </p>
                    </Card>
                  ))
                )}

                <Card className="border-primary/30 bg-primary/5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-bold tracking-[-0.02em]">Renta semanal</p>
                      <p className="text-[12px] text-muted-foreground">Cobro cada semana</p>
                    </div>
                    <p className="text-[20px] font-extrabold tracking-[-0.03em] text-primary">
                      {mxn(r.totalHardware)}
                    </p>
                  </div>
                </Card>
              </div>
            ) : (
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
                  <p className="text-[15px] font-extrabold tracking-[-0.03em]">
                    {mxn(r.totalInscripcion)}
                  </p>
                </Card>

                {esSaas ? (
                  <Card className="flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-muted">
                      <CreditCard className="h-5 w-5 text-muted-foreground" strokeWidth={2.4} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-bold tracking-[-0.02em]">
                        Suscripción mensual
                      </p>
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
                      <p className="text-[14px] font-bold tracking-[-0.02em]">
                        Proyección a 12 meses
                      </p>
                      <p className="text-[12px] text-muted-foreground">
                        Inscripción + 12 meses de ingresos
                      </p>
                    </div>
                    <p className="text-[20px] font-extrabold tracking-[-0.03em] text-primary">
                      {mxn(r.anual)}
                    </p>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </Shell>
  );
}
