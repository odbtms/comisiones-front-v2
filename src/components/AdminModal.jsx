import { useEffect, useState } from 'react'
import { X, ShieldCheck, Mail, Briefcase, TrendingUp, Calendar, RefreshCw, Trash2 } from 'lucide-react'
import { sileo } from 'sileo'
import { getAdminUsuarios, eliminarAdminUsuario } from '../api.js'
import { money, fechaCorta } from '../lib/format.js'

/**
 * Panel de administración (solo lo abre el usuario admin). Lista los usuarios
 * registrados con sus estadísticas. Mantiene el mismo lenguaje visual que
 * ProfileModal / DetailModal: hoja redondeada que sube, franja de color,
 * tarjetas suaves y soporte de modo oscuro. Se cierra tocando el fondo o Esc.
 */
export default function AdminModal({ onClose }) {
  const [usuarios, setUsuarios] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [borrandoId, setBorrandoId] = useState(null)

  async function cargar() {
    setCargando(true)
    setError(null)
    try {
      setUsuarios(await getAdminUsuarios())
    } catch (e) {
      setError(e.message)
      setUsuarios(null)
    } finally {
      setCargando(false)
    }
  }

  async function eliminar(u) {
    const quien = u.nombre || u.email
    if (!window.confirm(
      `¿Eliminar a "${quien}"?\n\nSe borrarán su cuenta y sus ${u.jornadas} jornada(s). Esta acción no se puede deshacer.`
    )) return
    setBorrandoId(u.id)
    setError(null)
    try {
      await eliminarAdminUsuario(u.id)
      setUsuarios((prev) => prev.filter((x) => x.id !== u.id))
      sileo.success({ title: 'Usuario eliminado', description: quien })
    } catch (e) {
      setError(e.message)
      sileo.error({ title: 'No se pudo eliminar', description: e.message })
    } finally {
      setBorrandoId(null)
    }
  }

  useEffect(() => { cargar() }, [])

  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [onClose])

  const total = usuarios?.length ?? 0

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn" onMouseDown={onClose}>
      <div
        className="w-full max-w-md bg-white dark:bg-[#15181d] rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col max-h-[88vh] overflow-hidden animate-slideUp"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Franja de color */}
        <div className="h-2 w-full bg-gradient-to-r from-[#7c9deb] via-indigo-500 to-violet-600" />

        {/* Cabecera */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-50 dark:border-white/5 bg-[#fafafa] dark:bg-[#1b1f26]">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white grid place-items-center border-2 border-white dark:border-white/20 shadow-sm shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">Administración</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                {cargando ? 'Cargando…' : `${total} ${total === 1 ? 'usuario registrado' : 'usuarios registrados'}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto space-y-3.5 no-scrollbar">

          {cargando && (
            <div className="text-center py-10 text-sm text-gray-400 dark:text-gray-500">Cargando usuarios…</div>
          )}

          {error && !cargando && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl p-3 text-xs text-red-700 dark:text-red-400 flex items-center justify-between gap-2">
              <span>{error}</span>
              <button onClick={cargar} className="font-semibold underline shrink-0 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Reintentar
              </button>
            </div>
          )}

          {!cargando && !error && usuarios?.map((u, i) => (
            <UsuarioCard
              key={u.id}
              u={u}
              delay={i * 40}
              borrando={borrandoId === u.id}
              onEliminar={() => eliminar(u)}
            />
          ))}

          {!cargando && !error && total === 0 && (
            <div className="text-center py-10 text-sm text-gray-400 dark:text-gray-500">No hay usuarios.</div>
          )}

        </div>
      </div>
    </div>
  )
}

function UsuarioCard({ u, delay, borrando, onEliminar }) {
  const nombre = u.nombre || u.email || 'Cuenta'
  const inicial = nombre.charAt(0).toUpperCase()

  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`animate-appear bg-white dark:bg-[#1b1f26] rounded-3xl p-5 border border-gray-100 dark:border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition ${borrando ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* Identidad */}
      <div className="flex items-center gap-3 min-w-0">
        <span className={`w-10 h-10 rounded-full text-white text-sm font-bold grid place-items-center border-2 border-white dark:border-white/20 shadow-sm shrink-0 ${u.esAdmin ? 'bg-gradient-to-br from-indigo-500 to-violet-600' : 'bg-[#7c9deb]'}`}>
          {inicial}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{nombre}</h4>
            {u.esAdmin && (
              <span className="shrink-0 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-500/20 px-1.5 py-0.5 rounded-full">
                <ShieldCheck className="w-2.5 h-2.5" /> Admin
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 truncate">
            <Mail className="w-3 h-3 shrink-0" />
            <span className="truncate">{u.email}</span>
          </p>
        </div>

        {/* Eliminar (no para el admin / cuenta propia) */}
        {!u.esAdmin && (
          <button
            onClick={onEliminar}
            disabled={borrando}
            title={`Eliminar a ${nombre}`}
            className="p-2 rounded-full text-gray-300 dark:text-gray-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition active:scale-90 shrink-0"
          >
            {borrando
              ? <RefreshCw className="w-4 h-4 animate-spin" />
              : <Trash2 className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <Stat icon={Briefcase} label="Jornadas" value={u.jornadas} />
        <Stat icon={TrendingUp} label="Acumulado" value={money(u.totalAcumulado)} small />
        <Stat icon={Calendar} label="Último" value={u.ultimaFecha ? fechaCorta(u.ultimaFecha) : '—'} small />
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, value, small }) {
  return (
    <div className="bg-gray-50/70 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-2.5">
      <div className="flex items-center gap-1 mb-1.5">
        <Icon className="w-3 h-3 text-gray-400 dark:text-gray-500 stroke-[1.5]" />
        <span className="text-gray-400/80 dark:text-gray-500 text-[9px] font-medium tracking-tight uppercase">{label}</span>
      </div>
      <div className={`${small ? 'text-xs' : 'text-base'} font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-none tabular-nums`}>
        {value}
      </div>
    </div>
  )
}
