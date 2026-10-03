const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Demo "today" so the KFC dataset stays meaningful. */
export const TODAY = new Date(2026, 9, 3);

export function parseDate(s: string): Date {
  const [d = "1", m = "Jan", y = "2026"] = (s.split(" ")[0] ?? "").split("-");
  return new Date(Number(y), MONTHS.indexOf(m), Number(d));
}

export function daysUntil(s: string): number {
  return Math.round((parseDate(s).getTime() - TODAY.getTime()) / 86400000);
}
