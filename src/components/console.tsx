import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  Calculator,
  Coffee,
  FileText,
  LayoutTemplate,
  LifeBuoy,
  LogOut,
  Plus,
  Presentation,
  Video,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { useDemo } from "@/lib/demo";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui-kit";

/* --------------------------------------------------------------- config -- */

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  soon?: boolean;
};

export type NavGroup = { titulo: string; items: NavItem[] };

export const NAV_VENDEDOR: NavGroup[] = [
  {
    titulo: "Operación",
    items: [
      { label: "Control de tiendas", to: "/cafeterias", icon: Coffee },
      { label: "Cotizador", to: "/cotizador", icon: Calculator },
    ],
  },
  {
    titulo: "Atención B2B",
    items: [{ label: "Monitoreo de tiendas", to: "/atencion", icon: LifeBuoy }],
  },
  {
    titulo: "Ingresos",
    items: [{ label: "Comisiones", to: "/comisiones", icon: Wallet }],
  },
  {
    titulo: "Recursos",
    items: [
      { label: "Biblioteca", to: "/recursos", icon: BookOpen },
    ],
  },
];

/* -------------------------------------------------------------- context -- */

const MenuCtx = createContext<{ open: () => void }>({ open: () => {} });
export const useConsoleMenu = () => useContext(MenuCtx);

/* --------------------------------------------------------------- layout -- */

export function ConsoleLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <MenuCtx.Provider value={{ open: () => setOpen(true) }}>
      <div className="min-h-screen bg-surface">
        {/* Sidebar fijo en escritorio */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border/70 bg-background lg:block">
          <NavContent />
        </aside>

        {/* Drawer móvil */}
        <div
          className={cn(
            "fixed inset-0 z-50 lg:hidden",
            open ? "pointer-events-auto" : "pointer-events-none",
          )}
          aria-hidden={!open}
        >
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className={cn(
              "absolute inset-0 bg-foreground/40 backdrop-blur-[2px] transition-opacity duration-300",
              open ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            className={cn(
              "absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col bg-background shadow-2xl transition-transform duration-300 ease-out",
              open ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <NavContent onClose={() => setOpen(false)} />
          </div>
        </div>

        <div className="lg:pl-72">{children}</div>
      </div>
    </MenuCtx.Provider>
  );
}

function NavContent({ onClose }: { onClose?: () => void }) {
  const { me } = useDemo();

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex items-center justify-between gap-3 px-5 pt-6 pb-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            Kigo Pick
          </p>
          <p className="truncate text-[19px] font-extrabold tracking-[-0.035em]">Control Tiendas</p>
        </div>
        {onClose && (
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-muted transition-transform duration-200 active:scale-[0.97]"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-6 px-3 pb-6">
        {NAV_VENDEDOR.map((grupo) => (
          <div key={grupo.titulo}>
            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {grupo.titulo}
            </p>
            <div className="space-y-1">
              {grupo.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/cafeterias" }}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-semibold text-foreground transition-transform duration-200 active:scale-[0.97] hover:bg-muted data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2.4} />
                  <span className="truncate">{item.label}</span>
                  {item.soon && (
                    <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      Pronto
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border/70 p-3">
        <Link
          to="/perfil"
          className="flex items-center gap-3 rounded-2xl px-2 py-2 transition-transform duration-200 active:scale-[0.97] hover:bg-muted"
        >
          <Avatar name={me.nombre} size={38} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-bold tracking-[-0.02em]">{me.nombre}</p>
            <p className="truncate text-[12px] text-muted-foreground">Vendedor</p>
          </div>
          <LogOut className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2.4} />
        </Link>
      </div>
    </div>
  );
}
