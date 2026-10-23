import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar, Card, Field, inputClass, PrimaryCTA, SectionTitle, Shell } from "@/components/ui-kit";
import { demo, useDemo } from "@/lib/demo";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Mi perfil — Control Tiendas · Kigo Pick" },
      {
        name: "description",
        content: "Datos del vendedor y zona asignada dentro de Control Tiendas.",
      },
      { property: "og:title", content: "Mi perfil — Control Tiendas · Kigo Pick" },
      { property: "og:description", content: "Administra tus datos en la Control Tiendas de Kigo Pick." },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  const { me } = useDemo();
  const [form, setForm] = useState<{ nombre?: string; telefono?: string; zona?: string }>({});

  return (
    <Shell title="Mi perfil" back>
      <Card className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
        <Avatar name={me.nombre} size={56} />
        <div className="min-w-0">
          <p className="truncate text-[17px] font-bold tracking-[-0.025em]">{me.nombre}</p>
          <p className="truncate text-sm text-muted-foreground">{me.email}</p>
        </div>
      </Card>

      <SectionTitle>Datos</SectionTitle>
      <div className="space-y-4">
        <Field label="Nombre">
          <input
            className={inputClass}
            defaultValue={me.nombre}
            maxLength={80}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
        </Field>
        <Field label="Teléfono">
          <input
            className={inputClass}
            defaultValue={me.telefono}
            maxLength={20}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            placeholder="55 1234 5678"
          />
        </Field>
        <Field label="Zona">
          <input
            className={inputClass}
            defaultValue={me.zona}
            maxLength={80}
            onChange={(e) => setForm({ ...form, zona: e.target.value })}
            placeholder="CDMX Centro"
          />
        </Field>
        <PrimaryCTA
          onClick={() => {
            demo.actualizarPerfil(form);
            toast.success("Perfil actualizado");
          }}
        >
          Guardar cambios
        </PrimaryCTA>
      </div>
    </Shell>
  );
}
