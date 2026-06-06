import { useEffect, useState } from 'react'
import { getToken, getUsuario, actualizarUsuario } from './auth.js'
import { getMe } from './api.js'
import Login from './components/Login.jsx'
import Panel from './components/Panel.jsx'

/**
 * Portero de autenticación: si no hay sesión muestra el login,
 * si la hay muestra la app. Reacciona al evento 'auth-changed'.
 */
export default function App() {
  const [autenticado, setAutenticado] = useState(() => !!getToken())
  const [usuario, setUsuario] = useState(() => getUsuario())

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

  if (!autenticado) return <Login />
  return <Panel usuario={usuario} />
}
