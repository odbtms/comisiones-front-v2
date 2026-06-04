import { useEffect, useState } from 'react'
import { getToken, getUsuario } from './auth.js'
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

  if (!autenticado) return <Login />
  return <Panel usuario={usuario} />
}
