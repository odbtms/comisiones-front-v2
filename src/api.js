// Cliente de la API de comisiones (backend Spring Boot).
// Siempre rutas relativas a /api: en dev las redirige Vite, en prod nginx.
import { getToken, cerrarSesion } from './auth.js'

const API = '/api'
const JORNADAS = `${API}/jornadas`

async function request(url, options = {}) {
  const token = getToken()
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })

  // Token vencido/invalido en una llamada autenticada -> volver al login.
  if (res.status === 401 && token) {
    cerrarSesion()
  }

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
      (body && (body.detail || body.message || body.error)) ||
      `Error ${res.status}: ${res.statusText}`
    throw new Error(msg)
  }
  return body
}

// ---------- Auth ----------

/** Inicia sesión. Devuelve { token, email, nombre }. */
export function login(email, password) {
  return request(`${API}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

/** Crea una cuenta nueva. Devuelve { token, email, nombre }. */
export function register(email, password, nombre) {
  return request(`${API}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ email, password, nombre }),
  })
}

// ---------- Jornadas ----------

/** Resumen de un mes: jornadas + totales. */
export function getResumen(anio, mes) {
  return request(`${JORNADAS}/resumen?anio=${anio}&mes=${mes}`)
}

/** Crea una jornada. Devuelve la jornada con sus valores calculados. */
export function crearJornada(data) {
  return request(JORNADAS, { method: 'POST', body: JSON.stringify(data) })
}

/** Actualiza una jornada existente. */
export function actualizarJornada(id, data) {
  return request(`${JORNADAS}/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

/** Elimina una jornada. */
export function eliminarJornada(id) {
  return request(`${JORNADAS}/${id}`, { method: 'DELETE' })
}
