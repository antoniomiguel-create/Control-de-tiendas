import { createFileRoute, Link } from "@tanstack/react-router";
import { Coffee, Flag, Plus } from "lucide-react";
import { useState } from "react";

import {
  Card,
  EmptyState,
  FloatingBar,
  Pill,
  PrimaryCTA,
  Shell,
  StatusPill,
} from "@/components/ui-kit";
import { useDemo } from "@/lib/demo";
import { banderasFaltantes, estadoCafeteria, ESTADO_LABEL, ESTADO_TONE } from "@/lib/kigo";

export const Route = createFileRoute("/_authenticated/cafeterias/")({
  head: () => ({
    meta: [
      { title: "Cafeterías — Control Tiendas · Kigo Pick" },
      {
        name: "description",
        content: "Listado de cafeterías registradas, su estado de revisión y de activación.",
      },
      { property: "og:title", content: "Cafeterías — Control Tiendas · Kigo Pick" },
      { property: "og:description", content: "Altas y activaciones de cafeterías Kigo Pick." },
    ],
  }),
  component: Cafeterias,
});

const FILTROS = [
  { key: "todas", label: "Todas" },
  { key: "revision", label: "En revisión" },
  { key: "aprobada", label: "Aprobadas" },
  { key: "activa", label: "Activas" },
] as const;

function Cafeterias() {
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]["key"]>("todas");
  const { cafeterias } = useDemo();

  const lista = cafeterias.filter((c) => {
    if (filtro === "todas") return true;
    return estadoCafeteria(c) === filtro;
  });

  return (
    <Shell title="Cafeterías">
      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {FILTROS.map((f) => (
          <Pill key={f.key} selected={filtro === f.key} onClick={() => setFiltro(f.key)}>
            {f.label}
          </Pill>
        ))}
      </div>

      <div className="mt-5 space-y-2">
        {lista.length === 0 ? (
          <EmptyState
            icon={Coffee}
            title="Aún no hay cafeterías aquí"
            hint="Da de alta una cafetería en menos de 2 minutos desde la calle."
          />
        ) : (
          lista.map((c) => {
            const faltantes = banderasFaltantes(c);
            return (
              <Link key={c.id} to="/cafeterias/$id" params={{ id: c.id }} className="block">
                <Card>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-bold tracking-[-0.02em]">
                        {c.nombre_comercial}
                      </p>
                    </div>
                    <StatusPill tone={ESTADO_TONE[estadoCafeteria(c)]}>
                      {ESTADO_LABEL[estadoCafeteria(c)]}
                    </StatusPill>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {faltantes.length > 0 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold tracking-[-0.01em] text-muted-foreground uppercase">
                        <Flag className="h-3 w-3" strokeWidth={2.5} />
                        Faltan {faltantes.length}:{" "}
                        {faltantes
                          .slice(0, 2)
                          .map((f) => f.label)
                          .join(", ")}
                        {faltantes.length > 2 ? "…" : ""}
                      </span>
                    ) : (
                      <StatusPill tone="success">Perfil completo</StatusPill>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })
        )}
      </div>

      <FloatingBar>
        <Link to="/cafeterias/nueva" className="block">
          <PrimaryCTA>
            <span className="inline-flex items-center justify-center gap-2">
              <Plus className="h-5 w-5" strokeWidth={2.5} /> Registrar tienda
            </span>
          </PrimaryCTA>
        </Link>
      </FloatingBar>
    </Shell>
  );
}
