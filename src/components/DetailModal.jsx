import { useEffect } from 'react'
import { X, Clock, Briefcase, FileText, Trash2, Pencil, DollarSign } from 'lucide-react'
import { money, horas, fechaCorta } from '../lib/format.js'

/**
 * Detalle de un día (solo lectura) con desglose del cálculo del backend.
 * Permite editar (abre el form) o eliminar. Se cierra tocando el fondo o Esc.
 */
export default function DetailModal({ jornada, onClose, onEditar, onEliminar }) {
  useEffect(() => {
    if (!jornada) return
    const onEsc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [jornada, onClose])

  if (!jornada) return null
  const j = jornada

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn" onMouseDown={onClose}>
      <div
        className="w-full max-w-md bg-white dark:bg-[#15181d] rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col max-h-[88vh] overflow-hidden animate-slideUp"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Franja de color */}
        <div className={`h-2 w-full ${j.asistio ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`} />

        {/* Cabecera */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-50 dark:border-white/5 bg-[#fafafa] dark:bg-[#1b1f26]">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Detalle del día</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500">{fechaCorta(j.fecha)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto space-y-6 no-scrollbar">

          {/* Total */}
          <div className="bg-slate-50 dark:bg-white/5 border border-slate-100/80 dark:border-white/10 rounded-2xl p-5 flex justify-between items-center">
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold mb-1">Total del día</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                j.asistio ? 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400'
              }`}>
                {j.asistio ? 'Asistió' : 'No asistió'}
              </span>
            </div>
            <span className="text-[32px] font-bold tracking-tight text-gray-900 dark:text-gray-100 leading-none tabular-nums">
              {money(j.total)}
            </span>
          </div>

          {j.asistio ? (
            <div className="space-y-4">
              {/* Horario */}
              <Fila icon={Clock}>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Horario</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {j.entrada ?? '—'} a {j.salida ?? '—'}{' '}
                  <span className="font-normal text-gray-400 dark:text-gray-500">({horas(j.horas)})</span>
                </p>
              </Fila>

              {/* Ventas */}
              <Fila icon={DollarSign}>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Ventas brutas (con IVA)</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{money(j.ventasBrutas)}</p>
              </Fila>

              {/* Desglose */}
              <Fila icon={Briefcase}>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Desglose</p>
                <div className="mt-1 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl p-3 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Pago base:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 tabular-nums">{money(j.pagoBase)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-white/10 pt-2">
                    <span>Comisión:</span>
                    <span className="font-bold text-green-600 dark:text-green-400 tabular-nums">+{money(j.comision)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 dark:text-gray-100 border-t border-dashed border-gray-200 dark:border-white/10 pt-2">
                    <span>Total:</span>
                    <span className="tabular-nums">{money(j.total)}</span>
                  </div>
                </div>
              </Fila>

              {/* Nota */}
              {j.nota && (
                <Fila icon={FileText}>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Nota</p>
                  <p className="text-sm font-normal text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-wrap leading-relaxed">{j.nota}</p>
                </Fila>
              )}
            </div>
          ) : (
            <Fila icon={FileText}>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Motivo</p>
              <p className="text-sm font-normal text-gray-600 dark:text-gray-300 mt-1">{j.nota || 'No asistió este día (paga $0).'}</p>
            </Fila>
          )}

          {/* Acciones */}
          <div className="pt-4 border-t border-gray-50 dark:border-white/5 flex items-center gap-3">
            <button
              onClick={() => onEliminar(j)}
              className="px-4 py-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-2xl flex items-center gap-1.5 transition text-xs font-semibold active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
            <button
              onClick={() => onEditar(j)}
              className="flex-1 py-3 bg-black dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-2xl font-semibold text-xs tracking-wide flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
            >
              <Pencil className="w-4 h-4" />
              Editar día
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
