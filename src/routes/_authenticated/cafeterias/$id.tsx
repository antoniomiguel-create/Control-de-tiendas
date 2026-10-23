import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import type { ChangeEvent } from "react";
import { Camera, Check, ChevronRight, Flag, ImagePlus, Phone, X } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  FloatingBar,
  ProgressBar,
  SectionTitle,
  Shell,
  StatusPill,
} from "@/components/ui-kit";
import { cn } from "@/lib/utils";
import { demo, useDemo, type Paso } from "@/lib/demo";

import {
  BANDERAS,
  banderasFaltantes,
  estadoCafeteria,
  ESTADO_LABEL,
  ESTADO_TONE,
  perfilCompletoPct,
} from "@/lib/kigo";

export const Route = createFileRoute("/_authenticated/cafeterias/$id")({
  head: () => ({
    meta: [
      { title: "Cafetería — Control Tiendas · Kigo Pick" },
      {
        name: "description",
        content: "Ficha de la cafetería: completa las banderas y sigue la activación.",
      },
      { property: "og:title", content: "Cafetería — Control Tiendas · Kigo Pick" },
      { property: "og:description", content: "Activa la cafetería paso a paso." },
    ],
  }),
  component: CafeteriaDetalle,
});

function CafeteriaDetalle() {
  const { id } = useParams({ from: "/_authenticated/cafeterias/$id" });
  const { cafeterias, pasos } = useDemo();

  const cafeteria = cafeterias.find((c) => c.id === id);
  const lista = pasos.filter((p) => p.cafeteria_id === id).sort((a, b) => a.orden - b.orden);

  if (!cafeteria) {
    return (
      <Shell title="Cafetería" back>
        <p className="pt-8 text-sm text-muted-foreground">No encontramos esta cafetería.</p>
      </Shell>
    );
  }

  const total = lista.length;
  const hechos = lista.filter((p) => p.completado).length;
  const faltantes = banderasFaltantes(cafeteria);
  const pct = perfilCompletoPct(cafeteria);
  const okPor = (key: string) => !faltantes.some((f) => f.key === key);

  return (
    <Shell title={cafeteria.nombre_comercial} back>
      <Card className="mt-4">
        <div className="flex items-center gap-4">
          {cafeteria.logo ? (
            <img
              src={cafeteria.logo}
              alt={`Logo de ${cafeteria.nombre_comercial}`}
              className="h-14 w-14 rounded-2xl object-cover"
            />
          ) : (
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <ImagePlus className="h-6 w-6" strokeWidth={2} />
            </span>
          )}
          <div className="flex flex-wrap gap-2">
            <StatusPill tone={ESTADO_TONE[estadoCafeteria(cafeteria)]}>
              {ESTADO_LABEL[estadoCafeteria(cafeteria)]}
            </StatusPill>
          </div>
        </div>
        {cafeteria.contacto_telefono && (
          <div className="mt-4">
            <a
              href={`tel:${cafeteria.contacto_telefono}`}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-muted px-4 text-sm font-bold active:scale-[0.97]"
            >
              <Phone className="h-4 w-4" strokeWidth={2.5} /> Llamar
            </a>
          </div>
        )}
      </Card>

      <SectionTitle
        action={<span className="text-sm font-bold text-primary">{pct}% completo</span>}
      >
        Perfil de la tienda
      </SectionTitle>
      <Card>
        <ProgressBar value={pct} />
        {faltantes.length > 0 ? (
          <p className="mt-3 text-[13px] text-muted-foreground">
            {`Faltan ${faltantes.length} ${faltantes.length === 1 ? "bandera" : "banderas"}. Toca una para completarla.`}
          </p>
        ) : (
          <p className="mt-3 text-[13px] font-semibold text-success">
            Perfil completo, la tienda tiene toda la información.
          </p>
        )}
      </Card>

      <Card className="mt-3 divide-y divide-border overflow-hidden p-0">
        {BANDERAS.map((b) => {
          const completa = okPor(b.key);
          return (
            <Link
              key={b.key}
              to="/cafeterias/$id/editar"
              params={{ id }}
              search={{ bandera: b.key }}
              className="flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-muted/60"
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
              <span
                className={cn(
                  "min-w-0 flex-1 text-[15px] font-bold tracking-[-0.02em]",
                  !completa && "text-muted-foreground",
                )}
              >
                {b.label}
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </Link>
          );
        })}
      </Card>

      <SectionTitle>Activación</SectionTitle>
      <Card>
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-bold tracking-[-0.02em]">
            {hechos} de {total} pasos
          </p>
          <span className="text-sm font-bold text-primary">
            {total ? Math.round((hechos / total) * 100) : 0}%
          </span>
        </div>
        <div className="mt-3">
          <ProgressBar value={total ? (hechos / total) * 100 : 0} />
        </div>
        <p className="mt-3 text-[13px] text-muted-foreground">
          {cafeteria.registro_estado === "revision"
            ? "La cafetería está en revisión. Cuando quede aprobada podrás completar los tres pasos de activación."
            : "Completa los tres pasos para que la cafetería quede activa."}
        </p>
      </Card>

      <div className="mt-3 space-y-2">
        {lista.map((paso) => (
          <PasoCard
            key={paso.id}
            paso={paso}
            bloqueadoPorRevision={cafeteria.registro_estado === "revision"}
          />
        ))}
      </div>

      <FloatingBar>
        <Link to="/cafeterias/$id/editar" params={{ id }} className="block">
          <span className="gradient-primary flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-bold text-primary-foreground shadow-soft transition-transform duration-200 active:scale-[0.97]">
            Editar información
          </span>
        </Link>
      </FloatingBar>
    </Shell>
  );
}

function PasoCard({ paso, bloqueadoPorRevision }: { paso: Paso; bloqueadoPorRevision: boolean }) {
  const bloqueado = paso.requiere_evidencia && paso.evidencias.length === 0;

  function onFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    Promise.all(
      files.map(
        (f) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(f);
          }),
      ),
    )
      .then((urls) => {
        demo.agregarEvidencias(paso.id, urls);
        toast.success("Evidencia agregada");
      })
      .catch(() => toast.error("No pudimos leer la imagen"));
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <button
        type="button"
        onClick={() => {
          if (bloqueadoPorRevision) {
            toast.error("Primero debe estar aprobada la cafetería");
            return;
          }
          const ok = demo.togglePaso(paso.id);
          if (!ok) toast.error("Sube al menos una foto de evidencia");
        }}
        className="w-full text-left transition-transform duration-200 active:scale-[0.97]"
      >
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          <span
            className={cn(
              "grid h-7 w-7 place-items-center rounded-full border-2",
              paso.completado
                ? "border-success bg-success text-success-foreground"
                : "border-border",
            )}
          >
            {paso.completado && <Check className="h-4 w-4" strokeWidth={3} />}
          </span>
          <span
            className={cn(
              "text-[15px] font-semibold tracking-[-0.01em]",
              paso.completado && "text-muted-foreground line-through",
            )}
          >
            {paso.titulo}
          </span>
        </div>
      </button>

      {paso.requiere_evidencia && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-[13px] font-bold tracking-[-0.01em]">
            Evidencia fotográfica <span className="text-destructive">*</span>
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {bloqueado
              ? "Sube al menos una foto para poder marcar este paso como completado."
              : `${paso.evidencias.length} ${paso.evidencias.length === 1 ? "foto subida" : "fotos subidas"}.`}
          </p>

          {paso.evidencias.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {paso.evidencias.map((src, i) => (
                <div key={i} className="relative">
                  <img
                    src={src}
                    alt={`Evidencia ${i + 1} de instalación del material`}
                    className="h-24 w-full rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => demo.quitarEvidencia(paso.id, i)}
                    aria-label={`Quitar evidencia ${i + 1}`}
                    className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-card/90 text-muted-foreground shadow-soft active:scale-[0.9]"
                  >
                    <X className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="mt-3 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-[15px] font-bold text-muted-foreground active:scale-[0.97]">
            <Camera className="h-5 w-5" strokeWidth={2} />
            Subir foto
            <input
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={onFiles}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}
