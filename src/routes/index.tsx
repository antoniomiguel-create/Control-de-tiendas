import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Control Tiendas · Kigo Pick — Operación de cafeterías" },
      {
        name: "description",
        content:
          "App móvil para vendedores Kigo Pick: registro de cafeterías, banderas del perfil y activación.",
      },
      { property: "og:title", content: "Control Tiendas · Kigo Pick — Operación de cafeterías" },
      {
        property: "og:description",
        content: "Registra, vende y activa cafeterías desde el celular.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/cafeterias" });
  },
  component: () => null,
});
