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
