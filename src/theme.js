// Manejo del tema (claro/oscuro): guarda la preferencia en localStorage y
// aplica/quita la clase .dark en <html>. Avisa con el evento 'theme-changed'.

const THEME_KEY = 'comisiones.theme'

/** Devuelve 'dark' o 'light'. Si no hay preferencia, sigue al sistema. */
export function getTema() {
  const guardado = localStorage.getItem(THEME_KEY)
  if (guardado === 'dark' || guardado === 'light') return guardado
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Aplica el tema al documento (sin guardar). Útil al iniciar. */
export function aplicarTema(tema) {
  const oscuro = tema === 'dark'
  document.documentElement.classList.toggle('dark', oscuro)
  // Color del chrome del navegador móvil (barra de estado).
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', oscuro ? '#0d0f12' : '#eaedf1')
}

/** Guarda y aplica el tema; avisa con 'theme-changed'. */
export function setTema(tema) {
  localStorage.setItem(THEME_KEY, tema)
  aplicarTema(tema)
  window.dispatchEvent(new Event('theme-changed'))
}

/** Alterna entre claro y oscuro. Devuelve el nuevo tema. */
export function alternarTema() {
  const nuevo = getTema() === 'dark' ? 'light' : 'dark'
  setTema(nuevo)
  return nuevo
}

/** Aplica el tema guardado al cargar la app (evita parpadeo). */
export function iniciarTema() {
  aplicarTema(getTema())
}
