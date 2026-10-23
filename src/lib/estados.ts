export const ESTADOS: { value: number; label: string }[] = [
  { value: 1, label: "Aguascalientes" },
  { value: 2, label: "Baja California" },
  { value: 3, label: "Baja California Sur" },
  { value: 4, label: "Campeche" },
  { value: 5, label: "Chiapas" },
  { value: 6, label: "Chihuahua" },
  { value: 7, label: "Ciudad de México" },
  { value: 8, label: "Coahuila" },
  { value: 9, label: "Colima" },
  { value: 10, label: "Durango" },
  { value: 11, label: "Estado de México" },
  { value: 12, label: "Guanajuato" },
  { value: 13, label: "Guerrero" },
  { value: 14, label: "Hidalgo" },
  { value: 15, label: "Jalisco" },
  { value: 16, label: "Michoacán" },
  { value: 17, label: "Morelos" },
  { value: 18, label: "Nayarit" },
  { value: 19, label: "Nuevo León" },
  { value: 20, label: "Oaxaca" },
  { value: 21, label: "Puebla" },
  { value: 22, label: "Querétaro" },
  { value: 23, label: "Quintana Roo" },
  { value: 24, label: "San Luis Potosí" },
  { value: 25, label: "Sinaloa" },
  { value: 26, label: "Sonora" },
  { value: 27, label: "Tabasco" },
  { value: 28, label: "Tamaulipas" },
  { value: 29, label: "Tlaxcala" },
  { value: 30, label: "Veracruz" },
  { value: 31, label: "Yucatán" },
  { value: 32, label: "Zacatecas" },
];


export const REGIMENES_FISCALES: { value: string; label: string }[] = [
  { value: "601", label: "601 · General de Ley Personas Morales" },
  { value: "603", label: "603 · Personas Morales con Fines no Lucrativos" },
  { value: "605", label: "605 · Sueldos y Salarios e Ingresos Asimilados a Salarios" },
  { value: "606", label: "606 · Arrendamiento" },
  { value: "608", label: "608 · Demás ingresos" },
  { value: "609", label: "609 · Consolidación" },
  { value: "610", label: "610 · Residentes en el Extranjero sin Establecimiento Permanente" },
  { value: "611", label: "611 · Ingresos por Dividendos (socios y accionistas)" },
  { value: "612", label: "612 · Personas Físicas con Actividades Empresariales y Profesionales" },
  { value: "614", label: "614 · Ingresos por intereses" },
  { value: "615", label: "615 · Régimen de los ingresos por obtención de premios" },
  { value: "616", label: "616 · Sin obligaciones fiscales" },
  { value: "620", label: "620 · Sociedades Cooperativas de Producción" },
  { value: "621", label: "621 · Incorporación Fiscal" },
  { value: "622", label: "622 · Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras" },
  { value: "623", label: "623 · Opcional para grupos de sociedades" },
  { value: "624", label: "624 · Coordinados" },
  { value: "625", label: "625 · Régimen de las Coordinadas" },
  { value: "626", label: "626 · Régimen Simplificado de Confianza" },
];

export const TIPOS_INSTITUCION: { value: string; label: string }[] = [
  { value: "colegio", label: "Colegio" },
  { value: "preparatoria", label: "Preparatoria" },
  { value: "universidad", label: "Universidad" },
  { value: "corporativo", label: "Corporativo" },
  { value: "centro_comercial", label: "Centro Comercial" },
];

export const DIAS: { value: number; label: string; corto: string }[] = [
  { value: 1, label: "Lunes", corto: "Lun" },
  { value: 2, label: "Martes", corto: "Mar" },
  { value: 3, label: "Miércoles", corto: "Mié" },
  { value: 4, label: "Jueves", corto: "Jue" },
  { value: 5, label: "Viernes", corto: "Vie" },
  { value: 6, label: "Sábado", corto: "Sáb" },
  { value: 7, label: "Domingo", corto: "Dom" },
];

/** Acepta "0800" o "8:00" y normaliza a "08:00". Devuelve null si es inválido. */
export function normalizaHora(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  const soloDigitos = v.replace(/\D/g, "");
  if (/^\d{4}$/.test(soloDigitos) && !v.includes(":")) {
    const h = Number(soloDigitos.slice(0, 2));
    const m = Number(soloDigitos.slice(2));
    if (h > 23 || m > 59) return null;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  const match = /^(\d{1,2}):(\d{2})$/.exec(v);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
