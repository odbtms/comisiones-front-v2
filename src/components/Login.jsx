import { useState } from 'react'
import { login, register } from '../api.js'
import { setSesion } from '../auth.js'

/**
 * Pantalla de acceso. Alterna entre iniciar sesión y crear cuenta.
 * Al autenticar guarda la sesión (dispara 'auth-changed' y App muestra la app).
 */
export default function Login() {
  const [modo, setModo] = useState('login') // 'login' | 'registro'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  const esRegistro = modo === 'registro'

  async function enviar(e) {
    e.preventDefault()
    setError(null)
    setCargando(true)
    try {
      const r = esRegistro
        ? await register(email.trim(), password, nombre.trim())
        : await login(email.trim(), password)
      setSesion(r)
    } catch (err) {
      setError(err.message)
      setCargando(false)
    }
  }

  function cambiarModo() {
    setModo(esRegistro ? 'login' : 'registro')
    setError(null)
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <h1 className="auth-titulo">Comisiones</h1>
        <p className="auth-sub">
          {esRegistro ? 'Creá tu cuenta' : 'Iniciá sesión para ver tus días'}
        </p>

        <form className="form" onSubmit={enviar}>
          {esRegistro && (
            <label className="campo">
              <span>Nombre <em>(opcional)</em></span>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoComplete="name"
                maxLength={80}
              />
            </label>
          )}

          <label className="campo">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              inputMode="email"
            />
          </label>

          <label className="campo">
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={esRegistro ? 6 : undefined}
              autoComplete={esRegistro ? 'new-password' : 'current-password'}
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button className="btn" type="submit" disabled={cargando}>
            {cargando ? 'Un momento…' : esRegistro ? 'Crear cuenta' : 'Ingresar'}
          </button>
        </form>

        <button type="button" className="auth-toggle" onClick={cambiarModo}>
          {esRegistro
            ? '¿Ya tenés cuenta? Iniciá sesión'
            : '¿No tenés cuenta? Registrate'}
        </button>
      </div>
    </div>
  )
}
