import { useEffect, useState } from 'react'
import { Toaster } from 'sileo'
import { getToken, getUsuario, actualizarUsuario } from './auth.js'
import { getMe } from './api.js'
import { getTema } from './theme.js'
import Login from './components/Login.jsx'
import Panel from './components/Panel.jsx'

/**
 * Portero de autenticación: si no hay sesión muestra el login,
 * si la hay muestra la app. Reacciona al evento 'auth-changed'.
 */
export default function App() {
  const [autenticado, setAutenticado] = useState(() => !!getToken())
  const [usuario, setUsuario] = useState(() => getUsuario())
  // El tema de los toasts sigue al de la app (se cambia desde el perfil y
  // dispara 'theme-changed'); así las notificaciones combinan en claro/oscuro.
  const [tema, setTema] = useState(() => getTema())

  useEffect(() => {
    const onTema = () => setTema(getTema())
    window.addEventListener('theme-changed', onTema)
    return () => window.removeEventListener('theme-changed', onTema)
  }, [])

  useEffect(() => {
    const onAuth = () => {
      setAutenticado(!!getToken())
      setUsuario(getUsuario())
    }
    window.addEventListener('auth-changed', onAuth)
    return () => window.removeEventListener('auth-changed', onAuth)
  }, [])

  // Si hay sesión pero el usuario guardado no tiene id (sesión vieja, previa al
  // login multiusuario con id), lo traemos con /me. Así detecta si es admin.
  useEffect(() => {
    if (!getToken()) return
    const u = getUsuario()
    if (u && u.id != null) return
    getMe()
      .then((me) => actualizarUsuario(me))
      .catch(() => { /* token inválido: api.js ya cierra sesión en 401 */ })
  }, [autenticado])

  return (
    <>
      <Toaster
        position="top-center"
        theme={tema}
        offset={{ top: 16 }}
        options={{ roundness: 16 }}
      />
      {autenticado ? <Panel usuario={usuario} /> : <Login />}
    </>
  )
}
