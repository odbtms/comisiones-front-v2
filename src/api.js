// Cliente de la API de comisiones (backend Spring Boot).
// Siempre rutas relativas a /api: en dev las redirige Vite, en prod nginx.
const BASE = '/api/jornadas'

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (res.status === 204) return null // DELETE

  let body = null
  const text = await res.text()
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }

  if (!res.ok) {
    const msg =
      (body && (body.message || body.error)) ||
      `Error ${res.status}: ${res.statusText}`
    throw new Error(msg)
  }
  return body
}

/** Resumen de un mes: jornadas + totales. */
export function getResumen(anio, mes) {
  return request(`${BASE}/resumen?anio=${anio}&mes=${mes}`)
}

/** Crea una jornada. Devuelve la jornada con sus valores calculados. */
export function crearJornada(data) {
  return request(BASE, { method: 'POST', body: JSON.stringify(data) })
}

/** Actualiza una jornada existente. */
export function actualizarJornada(id, data) {
  return request(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

/** Elimina una jornada. */
export function eliminarJornada(id) {
  return request(`${BASE}/${id}`, { method: 'DELETE' })
}
