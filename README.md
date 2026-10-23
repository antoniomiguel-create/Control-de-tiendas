# Control Tiendas — Kigo Pick

Consola **mobile-first** para vendedores y gestores de Kigo Pick: registro de tiendas,
seguimiento de banderas, estatus, capacitación, instalación y activación masiva de cafeterías.

> Prototipo de diseño: no hay backend ni autenticación. Todos los datos viven en memoria
> (`src/lib/demo.ts`) y se reinician al recargar la página.

## Requisitos

- Node.js 20 o superior (o Bun)
- npm (viene con Node)

## Instalar y ejecutar

```sh
cd kigo-pick-consola
npm install
npm run dev
```

Abre la URL que aparece en la terminal (por defecto `http://localhost:8080`).

Sin dependencias de terceros para el diseño: usa Tailwind CSS v4, lucide-react y zod,
todos declarados en `package.json`.

## Estructura

```text
src/
  components/
    console.tsx      Menú lateral (sidebar en escritorio, drawer en teléfono)
    ui-kit.tsx       Piezas compartidas: Shell, Card, Field, FloatingBar, PasswordInput...
  lib/
    demo.ts          Datos de ejemplo y estado en memoria
    estados.ts       Catálogos (días, horas, instituciones) y validación
    kigo.ts          Estatus de tienda e indicadores de completitud
  routes/
    index.tsx                        Redirige a /cafeterias
    _authenticated/
      cafeterias/index.tsx           Control de tiendas
      cafeterias/nueva.tsx           Registrar tienda (wizard de 2 pasos)
      cafeterias/$id.tsx             Detalle de una tienda
      cafeterias/$id_.editar.tsx     Corregir información (mismo formato que el alta)
      cotizador.tsx                  Cotizador Transaccional / SAAS
      atencion.tsx                   Monitoreo operativo para KAMs
      comisiones.tsx                 Comisiones por tienda
      recursos.tsx                   Biblioteca de material
      perfil.tsx                     Mi perfil
  styles.css         Tokens de diseño (colores HSL, tipografía Figtree)
```

## Reglas del diseño

- Un solo formato de formulario para alta y edición: mismo orden y mismos campos.
- Orden de secciones: datos del administrador → costo de inscripción y trato →
  Información Tienda → Horario → Pagos → Facturación (al final).
- El cheque **"El cliente no requiere factura"** oculta toda la sección de facturación.
- Estatus: **En revisión → Aprobada → Activa**. Para activar se requieren
  instalación del sistema, capacitación del personal e instalación del material físico
  (esta última exige evidencia fotográfica).
- Sin GPS, sin dirección física, sin autenticación social.

## Notas

- `.env` contiene solo claves **publicables** del proyecto; no hay secretos.
- `src/routeTree.gen.ts` se genera solo; no se edita a mano.
- Las contraseñas son libres (sin mínimo de caracteres) y tienen ojito para verlas.

## Vista previa (un solo archivo)

```sh
npm run preview:build
```

Genera `preview/dist/app.html`, la app completa en un solo HTML (sin servidor ni backend).
`preview/index.html` la muestra dentro de un marco de teléfono.
