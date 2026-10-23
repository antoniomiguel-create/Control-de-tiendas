import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, Menu, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

import { useConsoleMenu } from "@/components/console";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------- Shell -- */

export function Shell({
  title,
  back,
  action,
  children,
  className,
}: {
  title?: string;
  back?: boolean;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const { open } = useConsoleMenu();

  return (
    <div className={cn("min-h-screen bg-surface pb-32", className)}>
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto grid h-16 max-w-lg grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-4">
          {back ? (
            <button
              type="button"
              aria-label="Regresar"
              onClick={() => router.history.back()}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-muted text-foreground transition-transform duration-200 active:scale-[0.97]"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
            </button>
          ) : (
            <button
              type="button"
              aria-label="Abrir menú"
              onClick={open}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-muted text-foreground transition-transform duration-200 active:scale-[0.97] lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={2.5} />
            </button>
          )}
          <h1 className="truncate text-center text-[17px] font-bold tracking-[-0.03em]">
            {title}
          </h1>
          <div className="flex h-11 min-w-11 items-center justify-end">{action}</div>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4">{children}</main>
    </div>
  );
}


/* --------------------------------------------------------- SectionTitle -- */

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mt-7 mb-3 flex items-end justify-between gap-3">
      <h2 className="text-[22px] font-extrabold tracking-[-0.035em]">{children}</h2>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------ BigChoice -- */

export function BigChoice({
  icon: Icon,
  title,
  hint,
  to,
  params,
  onClick,
  selected,
  badge,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  to?: string;
  params?: Record<string, string>;
  onClick?: () => void;
  selected?: boolean;
  badge?: ReactNode;
}) {
  const inner = (
    <div
      className={cn(
        "flex w-full items-center gap-4 rounded-[1.5rem] border-2 bg-card p-4 text-left shadow-card transition-all duration-200 active:scale-[0.97]",
        selected ? "border-primary shadow-soft" : "border-border",
      )}
    >
      <div
        className={cn(
          "grid h-14 w-14 shrink-0 place-items-center rounded-2xl",
          selected ? "bg-primary/10 text-primary" : "bg-muted text-foreground",
        )}
      >
        <Icon className="h-6 w-6" strokeWidth={selected ? 2.5 : 2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold tracking-[-0.02em]">{title}</p>
        {hint && <p className="mt-0.5 truncate text-sm text-muted-foreground">{hint}</p>}
      </div>
      {badge}
    </div>
  );

  if (to) {
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Link to={to as any} params={params as any} className="block">
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className="block w-full">
      {inner}
    </button>
  );
}

/* ----------------------------------------------------------------- Pill -- */

export function Pill({
  children,
  selected,
  onClick,
}: {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-5 py-2.5 text-sm font-bold tracking-[-0.015em] transition-all duration-200 active:scale-[0.97]",
        selected
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------- FloatingBar -- */

export function FloatingBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-surface via-surface to-transparent pt-8 lg:left-72">
      <div className="safe-bottom mx-auto max-w-lg px-4">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------ PrimaryCTA -- */

export function PrimaryCTA({
  children,
  onClick,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="gradient-primary h-14 w-full rounded-2xl text-[15px] font-bold text-primary-foreground shadow-soft transition-all duration-200 active:scale-[0.97] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ Tip -- */

export function Tip({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl bg-muted px-4 py-3 text-[13px] text-muted-foreground">{children}</p>
  );
}

/* ----------------------------------------------------------- EmptyState -- */

export function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="h-7 w-7" strokeWidth={2} />
      </div>
      <p className="mt-4 text-[15px] font-bold tracking-[-0.02em]">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-sm text-muted-foreground">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ----------------------------------------------------------- StatusPill -- */

type Tone = "neutral" | "primary" | "success" | "danger";

export function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[-0.01em] uppercase",
        tone === "primary" && "bg-primary/10 text-primary",
        tone === "success" && "bg-success/15 text-success",
        tone === "danger" && "bg-destructive/10 text-destructive",
        tone === "neutral" && "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

/* --------------------------------------------------------------- Avatar -- */

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      style={{ height: size, width: size }}
      className="grid shrink-0 place-items-center rounded-full bg-primary/12 text-sm font-bold text-primary"
    >
      {initials || "?"}
    </span>
  );
}

/* ----------------------------------------------------------------- Card -- */

export function Card({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-border bg-card p-4 shadow-card",
        onClick && "cursor-pointer transition-transform duration-200 active:scale-[0.97]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ----------------------------------------------------------------- Field -- */

export function Field({
  label,
  children,
  hint,
}: {
  label: ReactNode;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[13px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "h-12 w-full rounded-2xl border border-input bg-background px-4 text-[15px] outline-none transition-colors duration-200 placeholder:text-muted-foreground focus:border-primary";

/* ---------------------------------------------------------- PasswordInput -- */

export function PasswordInput({
  className,
  value,
  onChange,
  placeholder,
  maxLength,
  etiqueta = "la contraseña",
}: {
  className?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  etiqueta?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        className={cn(className, "pr-12")}
        type={visible ? "text" : "password"}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="new-password"
      />
      <button
        type="button"
        aria-label={visible ? `Ocultar ${etiqueta}` : `Mostrar ${etiqueta}`}
        aria-pressed={visible}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setVisible((v) => !v)}
        className="absolute top-1/2 right-1 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl text-muted-foreground transition-colors duration-200 hover:text-foreground active:scale-[0.94]"
      >
        {visible ? (
          <EyeOff className="h-5 w-5" strokeWidth={2.2} />
        ) : (
          <Eye className="h-5 w-5" strokeWidth={2.2} />
        )}
      </button>
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="gradient-primary h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

