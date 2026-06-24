// Helpers de formato para mostrar pesos chilenos y fechas.

const clp = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

/** 12345 -> "$12.345" */
export function money(value) {
  if (value === null || value === undefined || value === '') return '—'
  return clp.format(Number(value))
}

/** 7.5 -> "7,5 h" (sin decimales si es entero) */
export function horas(value) {
  if (value === null || value === undefined) return '—'
  const n = Number(value)
  const txt = Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ',')
  return `${txt} h`
}

const dias = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const meses = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

/** "2026-05-12" -> { numero: "12", dia: "lun" } */
export function diaFecha(iso) {
  const [, , d] = iso.split('-')
  // Parseo manual para evitar corrimientos por zona horaria.
  const [y, m, day] = iso.split('-').map(Number)
  const fecha = new Date(y, m - 1, day)
  return { numero: d, dia: dias[fecha.getDay()] }
}

export function nombreMes(mes) {
  return meses[mes - 1] ?? ''
}

const mesesCortos = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

/**
 * "2026-06-24" -> "2026-06-22" (el lunes de esa semana).
 * Sirve para agrupar las jornadas por semana. Parseo manual para evitar
 * corrimientos por zona horaria.
 */
export function lunesDeSemana(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  const fecha = new Date(y, m - 1, d)
  const dow = (fecha.getDay() + 6) % 7 // 0 = lunes, 6 = domingo
  fecha.setDate(fecha.getDate() - dow)
  const yy = fecha.getFullYear()
  const mm = String(fecha.getMonth() + 1).padStart(2, '0')
  const dd = String(fecha.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

/**
 * Etiqueta del rango de una semana a partir del lunes iso:
 * "22 – 28 jun" (o "29 may – 4 jun" si cruza de mes).
 */
export function rangoSemana(lunesIso) {
  const [y, m, d] = lunesIso.split('-').map(Number)
  const ini = new Date(y, m - 1, d)
  const fin = new Date(y, m - 1, d + 6)
  const mi = mesesCortos[ini.getMonth()]
  const mf = mesesCortos[fin.getMonth()]
  if (ini.getMonth() === fin.getMonth()) {
    return `${ini.getDate()} – ${fin.getDate()} ${mf}`
  }
  return `${ini.getDate()} ${mi} – ${fin.getDate()} ${mf}`
}

/** "2026-05-12" -> "Mayo 12" (mes capitalizado + día) */
export function fechaCorta(iso) {
  if (!iso) return ''
  const [, m, d] = iso.split('-').map(Number)
  const mes = meses[m - 1] ?? ''
  return `${mes.charAt(0).toUpperCase()}${mes.slice(1)} ${String(d).padStart(2, '0')}`
}

/**
 * Estima la duración del día como lo hace el backend:
 * horas = salida - entrada; si supera 8 h se descuenta 1 h (colación).
 * Devuelve número (puede tener .5). Solo para previsualizar en el form.
 */
export function estimarHoras(entrada, salida) {
  if (!entrada || !salida) return 0
  const [h1, m1] = entrada.split(':').map(Number)
  const [h2, m2] = salida.split(':').map(Number)
  if ([h1, m1, h2, m2].some(Number.isNaN)) return 0
  let min = h2 * 60 + m2 - (h1 * 60 + m1)
  if (min < 0) min += 24 * 60
  let h = min / 60
  if (h > 8) h -= 1
  return Math.round(h * 100) / 100
}
