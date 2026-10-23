import { createFileRoute } from "@tanstack/react-router";
import {
  FileText,
  LayoutTemplate,
  Presentation,
  Search,
  Video,
  FileDown,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Card, SectionTitle, Shell } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/recursos")({
  head: () => ({
    meta: [
      { title: "Recursos — Control Tiendas · Kigo Pick" },
      {
        name: "description",
        content: "Biblioteca de recursos para vendedores Kigo Pick.",
      },
      { property: "og:title", content: "Recursos — Control Tiendas · Kigo Pick" },
      {
        property: "og:description",
        content: "Presentaciones, brochures, videos y más para cerrar más tiendas.",
      },
    ],
  }),
  component: Recursos,
});

type Categoria = "Todas" | "Presentaciones" | "Brochures" | "Videos" | "Documentos" | "Plantillas";

type Recurso = {
  id: string;
  titulo: string;
  categoria: Exclude<Categoria, "Todas">;
  descripcion: string;
  tipo: "PDF" | "Video" | "PPTX" | "DOCX" | "Enlace";
  url: string;
};

const RECURSOS: Recurso[] = [
  {
    id: "p-1",
    titulo: "Pitch Kigo Pick 2026",
    categoria: "Presentaciones",
    descripcion: "Presentación principal para prospectos nuevos.",
    tipo: "PPTX",
    url: "#",
  },
  {
    id: "p-2",
    titulo: "Modelo de ingresos para dueños",
    categoria: "Presentaciones",
    descripcion: "Diapositivas del trato y comisiones.",
    tipo: "PPTX",
    url: "#",
  },
  {
    id: "b-1",
    titulo: "Brochure corporativo",
    categoria: "Brochures",
    descripcion: "Hoja de venta con beneficios principales.",
    tipo: "PDF",
    url: "#",
  },
  {
    id: "b-2",
    titulo: "Brochure para universidades",
    categoria: "Brochures",
    descripcion: "Enfocado en campus y centros estudiantiles.",
    tipo: "PDF",
    url: "#",
  },
  {
    id: "v-1",
    titulo: "Demo del sistema",
    categoria: "Videos",
    descripcion: "Recorrido visual del punto de venta Kigo Pick.",
    tipo: "Video",
    url: "#",
  },
  {
    id: "v-2",
    titulo: "Tutorial de activación",
    categoria: "Videos",
    descripcion: "Pasos para activar una tienda desde cero.",
    tipo: "Video",
    url: "#",
  },
  {
    id: "d-1",
    titulo: "Contrato de adhesión",
    categoria: "Documentos",
    descripcion: "Documento legal para nuevos comercios.",
    tipo: "DOCX",
    url: "#",
  },
  {
    id: "d-2",
    titulo: "Checklist de instalación",
    categoria: "Documentos",
    descripcion: "Lista de verificación antes de activar.",
    tipo: "PDF",
    url: "#",
  },
  {
    id: "t-1",
    titulo: "Plantilla de correo de bienvenida",
    categoria: "Plantillas",
    descripcion: "Mensaje editable para nuevos dueños.",
    tipo: "DOCX",
    url: "#",
  },
  {
    id: "t-2",
    titulo: "Plantilla de cotización",
    categoria: "Plantillas",
    descripcion: "Formato con costo de inscripción y trato.",
    tipo: "DOCX",
    url: "#",
  },
];

const CATEGORIAS: { label: Categoria; icon: typeof Presentation }[] = [
  { label: "Todas", icon: Search },
  { label: "Presentaciones", icon: Presentation },
  { label: "Brochures", icon: FileText },
  { label: "Videos", icon: Video },
  { label: "Documentos", icon: FileDown },
  { label: "Plantillas", icon: LayoutTemplate },
];

const ICONO_CATEGORIA: Record<Exclude<Categoria, "Todas">, typeof Presentation> = {
  Presentaciones: Presentation,
  Brochures: FileText,
  Videos: Video,
  Documentos: FileDown,
  Plantillas: LayoutTemplate,
};

const TONE_TIPO: Record<Recurso["tipo"], string> = {
  PDF: "bg-red-100 text-red-700",
  Video: "bg-purple-100 text-purple-700",
  PPTX: "bg-orange-100 text-orange-700",
  DOCX: "bg-blue-100 text-blue-700",
  Enlace: "bg-gray-100 text-gray-700",
};

function Recursos() {
  const [categoria, setCategoria] = useState<Categoria>("Todas");
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(() => {
    return RECURSOS.filter((r) => {
      const coincideCategoria = categoria === "Todas" || r.categoria === categoria;
      const termino = busqueda.trim().toLowerCase();
      const coincideBusqueda =
        !termino ||
        r.titulo.toLowerCase().includes(termino) ||
        r.descripcion.toLowerCase().includes(termino);
      return coincideCategoria && coincideBusqueda;
    });
  }, [categoria, busqueda]);

  return (
    <Shell title="Recursos">
      <p className="mt-4 text-[15px] text-muted-foreground">
        Herramientas de venta y operación siempre a la mano.
      </p>

      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={2.4} />
        <input
          type="search"
          placeholder="Buscar recurso..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="h-12 w-full rounded-2xl border border-border bg-background pl-10 pr-4 text-[15px] font-medium text-foreground outline-none ring-primary transition-all focus:border-primary focus:ring-2"
        />
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIAS.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => setCategoria(c.label)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold tracking-[-0.015em] transition-all duration-200 active:scale-[0.97]",
              categoria === c.label
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            <c.icon className="h-4 w-4" strokeWidth={2.4} />
            {c.label}
          </button>
        ))}
      </div>

      <SectionTitle>
        {categoria === "Todas" ? "Todos los recursos" : categoria}
      </SectionTitle>

      <div className="space-y-3 pb-8">
        {filtrados.length === 0 && (
          <Card className="grid place-items-center gap-2 py-10 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" strokeWidth={2.4} />
            </div>
            <p className="text-[15px] font-bold tracking-[-0.02em]">No se encontraron recursos</p>
            <p className="max-w-[260px] text-[13px] text-muted-foreground">
              Prueba con otra palabra o cambia de categoría.
            </p>
          </Card>
        )}

        {filtrados.map((r) => {
          const Icono = ICONO_CATEGORIA[r.categoria];
          return (
            <Card key={r.id} className="flex items-start gap-4 p-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-muted">
                <Icono className="h-6 w-6 text-foreground" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-[15px] font-bold tracking-[-0.02em]">{r.titulo}</p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      TONE_TIPO[r.tipo],
                    )}
                  >
                    {r.tipo}
                  </span>
                </div>
                <p className="mt-0.5 text-[13px] text-muted-foreground">{r.descripcion}</p>
                <a
                  href={r.url}
                  className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-primary"
                >
                  Abrir recurso
                </a>
              </div>
            </Card>
          );
        })}
      </div>
    </Shell>
  );
}
