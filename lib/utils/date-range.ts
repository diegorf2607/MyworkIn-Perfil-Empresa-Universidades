import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek } from "date-fns"

export type PeriodoPreset = "hoy" | "esta_semana" | "ultimos_7" | "ultimos_30" | "rango_personalizado"

export interface DateRange {
  from: Date
  to: Date
}

export function getDateRangeFromPreset(preset: PeriodoPreset, customRange?: { from?: Date; to?: Date }): DateRange {
  const now = new Date()

  switch (preset) {
    case "hoy":
      return { from: startOfDay(now), to: endOfDay(now) }
    case "esta_semana":
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) }
    case "ultimos_7":
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) }
    case "ultimos_30":
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) }
    case "rango_personalizado":
      if (customRange?.from && customRange?.to) {
        return { from: startOfDay(customRange.from), to: endOfDay(customRange.to) }
      }
      // Fallback to last 7 days if custom range is incomplete
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) }
    default:
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) }
  }
}

export function getPreviousPeriodRange(range: DateRange): DateRange {
  const durationMs = range.to.getTime() - range.from.getTime()
  return {
    from: new Date(range.from.getTime() - durationMs - 86400000), // -1 day to not overlap
    to: new Date(range.from.getTime() - 86400000),
  }
}
