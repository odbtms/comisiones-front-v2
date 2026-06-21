import { useState } from 'react'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { sileo } from 'sileo'
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
  const [showPassword, setShowPassword] = useState(false)
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
      const quien = (r.nombre || '').trim()
      sileo.success({
        title: esRegistro ? '¡Cuenta creada!' : `¡Hola${quien ? `, ${quien}` : ' de nuevo'}!`,
        description: esRegistro ? 'Ya podés empezar a fichar.' : 'Sesión iniciada.',
      })
      setSesion(r) // dispara 'auth-changed' y desmonta el login (el toast vive en App)
    } catch (err) {
      setError(err.message)
      sileo.error({ title: 'No se pudo continuar', description: err.message })
      setCargando(false)
    }
  }

  function cambiarModo() {
    setModo(esRegistro ? 'login' : 'registro')
    setError(null)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f3f4f6] dark:bg-[#0d0f12] px-4 py-8 select-none font-sans text-gray-900 dark:text-gray-100 antialiased">
      <div className="w-full max-w-md bg-[#f8f9fa] dark:bg-[#15181d] rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-white/10 p-8 flex flex-col justify-between min-h-[640px] relative animate-appear">

        {/* Header */}
        <div className="text-center pt-8">
          <h1 className="text-[40px] font-bold tracking-tight text-black dark:text-white mb-1 p-0 leading-none">
            {esRegistro ? 'Crear cuenta' : 'Hola de nuevo'}
          </h1>
          <p className="text-sm font-normal text-gray-400 dark:text-gray-500">
            {esRegistro
              ? 'Registrate para empezar a fichar'
              : 'Ingresa tus credenciales para continuar'}
          </p>
        </div>

        <form onSubmit={enviar} className="flex-1 flex flex-col justify-center space-y-5 max-w-xs mx-auto w-full py-6">

          {esRegistro && (
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <User className="w-5 h-5 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
              </div>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre (opcional)"
                autoComplete="name"
                maxLength={80}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-white/5 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border border-gray-100 dark:border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-md focus:border-gray-200 dark:focus:border-white/25 focus:ring-1 focus:ring-gray-200 dark:focus:ring-white/15 outline-none transition-all text-center text-base"
              />
            </div>
          )}

          {/* Email */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
              <Mail className="w-5 h-5 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo Electrónico"
              required
              autoComplete="email"
              inputMode="email"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-white/5 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border border-gray-100 dark:border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-md focus:border-gray-200 dark:focus:border-white/25 focus:ring-1 focus:ring-gray-200 dark:focus:ring-white/15 outline-none transition-all text-center text-base"
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-5 h-5 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              minLength={esRegistro ? 6 : undefined}
              autoComplete={esRegistro ? 'new-password' : 'current-password'}
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white dark:bg-white/5 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border border-gray-100 dark:border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-md focus:border-gray-200 dark:focus:border-white/25 focus:ring-1 focus:ring-gray-200 dark:focus:ring-white/15 outline-none transition-all text-center text-base"
            />
            {password && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-black dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-xs text-center font-medium animate-pulse">
              {error}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={cargando}
              className="w-full py-4 px-6 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-base shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:bg-gray-900 dark:hover:bg-gray-200 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:active:scale-100"
            >
              {cargando ? 'Un momento…' : esRegistro ? 'Crear cuenta' : 'Ingresar'}
            </button>
          </div>
        </form>

        {/* Footer toggle */}
        <div className="text-center pb-4">
          <button
            type="button"
            onClick={cambiarModo}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium transition-colors hover:underline"
          >
            {esRegistro
              ? '¿Ya tenés cuenta? Iniciá sesión'
              : '¿No tenés cuenta? Registrate'}
          </button>
        </div>

      </div>
    </div>
  )
}
