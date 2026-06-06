// Manejo de sesión en el navegador: guarda el token JWT y datos del usuario
// en localStorage. Avisa con un evento 'auth-changed' para que App reaccione.

const TOKEN_KEY = 'comisiones.token'
const USER_KEY = 'comisiones.user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUsuario() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/** Guarda la sesión tras login/registro. Recibe la respuesta del backend. */
export function setSesion({ token, id, email, nombre }) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify({ id, email, nombre }))
  window.dispatchEvent(new Event('auth-changed'))
}

/**
 * Actualiza los datos del usuario sin tocar el token (ej. tras pedir /me para
 * traer el id en sesiones viejas que no lo tenían). No cierra sesión.
 */
export function actualizarUsuario({ id, email, nombre }) {
  localStorage.setItem(USER_KEY, JSON.stringify({ id, email, nombre }))
  window.dispatchEvent(new Event('auth-changed'))
}

/** Cierra la sesión (logout o token vencido). */
export function cerrarSesion() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  window.dispatchEvent(new Event('auth-changed'))
}
