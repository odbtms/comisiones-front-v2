import { useEffect, useState } from 'react'
import { X, Mail, Calendar, Clock, Briefcase, TrendingUp, ShoppingBag, LogOut, Moon, Sun, ShieldCheck, ChevronRight } from 'lucide-react'
import { sileo } from 'sileo'
import { money, horas, nombreMes } from '../lib/format.js'
import { getTema, alternarTema } from '../theme.js'

/**
 * Perfil del usuario: nombre, email y un resumen del mes que se está viendo.
 * Mantiene el mismo lenguaje visual que DetailModal (hoja redondeada que sube).
 * Se cierra tocando el fondo o con Esc.
 */
export default function ProfileModal({ usuario, resumen, anio, mes, esAdmin, onOpenAdmin, onClose, onLogout }) {
  const [tema, setTemaLocal] = useState(() => getTema())

  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [onClose])

  function toggleTema() {
    setTemaLocal(alternarTema())
  }

  const oscuro = tema === 'dark'
  const nombre = usuario?.nombre || usuario?.email || 'Cuenta'
  const inicial = nombre.charAt(0).toUpperCase()

  // Total facturado del mes (ventas brutas). Lo manda el backend en el resumen;
  // si por algún motivo no viniera, lo calculamos sumando las jornadas.
  const totalVentas =
    resumen?.totalVentasBrutas != null
      ? Number(resumen.totalVentasBrutas)
      : (resumen?.jornadas ?? []).reduce((acc, j) => acc + Number(j.ventasBrutas || 0), 0)

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn" onMouseDown={onClose}>
      <div
        className="w-full max-w-md bg-white dark:bg-[#15181d] rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col max-h-[88vh] overflow-hidden animate-slideUp"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Franja de color */}
        <div className="h-2 w-full bg-gradient-to-r from-[#7c9deb] via-indigo-500 to-violet-600" />

        {/* Cabecera con avatar */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-50 dark:border-white/5 bg-[#fafafa] dark:bg-[#1b1f26]">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-12 h-12 rounded-full bg-[#7c9deb] text-white text-lg font-bold grid place-items-center border-2 border-white dark:border-white/20 shadow-sm shrink-0">
              {inicial}
            </span>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{nombre}</h3>
              {usuario?.email && (
                <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3 shrink-0" />
                  <span className="truncate">{usuario.email}</span>
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto space-y-6 no-scrollbar">

          {/* Total del mes */}
          <div className="bg-slate-50 dark:bg-white/5 border border-slate-100/80 dark:border-white/10 rounded-2xl p-5 flex justify-between items-center">
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold mb-1">Total del mes</p>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 capitalize">
                {nombreMes(mes)} {anio}
              </span>
            </div>
            <span className="text-[32px] font-bold tracking-tight text-gray-900 dark:text-gray-100 leading-none tabular-nums">
              {money(resumen?.totalGeneral ?? 0)}
            </span>
          </div>

          {/* Resumen del mes */}
          <div className="space-y-4">
            <Fila icon={ShoppingBag}>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Ventas del mes</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 tabular-nums">{money(totalVentas)}</p>
            </Fila>

            <Fila icon={Calendar}>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Días trabajados</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{resumen?.diasTrabajados ?? 0}</p>
            </Fila>

            <Fila icon={Clock}>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Horas del mes</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{resumen ? horas(resumen.totalHoras) : '—'}</p>
            </Fila>

            <Fila icon={Briefcase}>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Desglose</p>
              <div className="mt-1 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Pago base:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 tabular-nums">{money(resumen?.totalPagoBase)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-white/10 pt-2">
                  <span>Comisión:</span>
                  <span className="font-bold text-green-600 dark:text-green-400 tabular-nums">+{money(resumen?.totalComision)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 dark:text-gray-100 border-t border-dashed border-gray-200 dark:border-white/10 pt-2">
                  <span>Total:</span>
                  <span className="tabular-nums">{money(resumen?.totalGeneral)}</span>
                </div>
              </div>
            </Fila>

            {resumen?.diasTrabajados > 0 && (
              <Fila icon={TrendingUp}>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Promedio por día</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {money(Math.round(Number(resumen.totalGeneral) / resumen.diasTrabajados))}
                </p>
              </Fila>
            )}
          </div>

          {/* Administración (solo el usuario admin) */}
          {esAdmin && (
            <div className="pt-4 border-t border-gray-50 dark:border-white/5">
              <button
                onClick={onOpenAdmin}
                className="w-full flex items-center justify-between gap-3 bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 border border-violet-100 dark:border-violet-500/20 rounded-2xl px-4 py-3 transition active:scale-[0.99]"
              >
                <span className="flex items-center gap-2.5 text-sm font-semibold text-violet-800 dark:text-violet-200">
                  <span className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  Administración
                </span>
                <ChevronRight className="w-4 h-4 text-violet-400 dark:text-violet-300/70 shrink-0" />
              </button>
            </div>
          )}

          {/* Modo oscuro */}
          <div className="pt-4 border-t border-gray-50 dark:border-white/5">
            <button
              onClick={toggleTema}
              className="w-full flex items-center justify-between gap-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-100 dark:border-white/10 rounded-2xl px-4 py-3 transition active:scale-[0.99]"
            >
              <span className="flex items-center gap-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
                <span className="p-1.5 rounded-lg bg-white dark:bg-white/10 text-gray-500 dark:text-gray-300 shadow-sm">
                  {oscuro ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </span>
                Modo oscuro
              </span>
              {/* Interruptor */}
              <span className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${oscuro ? 'bg-[#7c9deb]' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${oscuro ? 'translate-x-5' : 'translate-x-0'}`} />
              </span>
            </button>
          </div>

          {/* Cerrar sesión */}
          <div className="pt-1">
            <button
              onClick={() => { sileo.info({ title: 'Sesión cerrada' }); onLogout() }}
              className="w-full py-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-2xl flex items-center justify-center gap-1.5 transition text-xs font-semibold active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

function Fila({ icon: Icon, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-300 mt-0.5">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
