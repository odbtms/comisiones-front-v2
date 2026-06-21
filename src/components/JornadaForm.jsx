import { useEffect, useMemo, useState } from 'react'
import { X, Calendar, Clock, DollarSign, FileText, Plus, Pencil } from 'lucide-react'
import { sileo } from 'sileo'
import { crearJornada, actualizarJornada } from '../api.js'
import { fechaCorta, estimarHoras, money } from '../lib/format.js'

// Defaults del backend (solo para previsualizar; el total real lo calcula el servidor).
const VALOR_HORA_DEFAULT = 3098
const IVA = 0.19
const COMISION = 0.03

// Devuelve "HH:mm" o null desde un <input type=time>.
const hora = (v) => (v ? v : null)

function estadoInicial(jornada, anio, mes) {
  if (jornada) {
    return {
      fecha: jornada.fecha,
      entrada: jornada.entrada ?? '',
      salida: jornada.salida ?? '',
      valorHora: jornada.valorHora ?? '',
      ventasBrutas: jornada.ventasBrutas ?? '',
      asistio: jornada.asistio,
      nota: jornada.nota ?? '',
    }
  }
  const hoy = new Date()
  const mismoMes = hoy.getFullYear() === anio && hoy.getMonth() + 1 === mes
  const dd = mismoMes ? String(hoy.getDate()).padStart(2, '0') : '01'
  return {
    fecha: `${anio}-${String(mes).padStart(2, '0')}-${dd}`,
    entrada: '09:00',
    salida: '18:00',
    valorHora: '',
    ventasBrutas: '',
    asistio: true,
    nota: '',
  }
}

export default function JornadaForm({ jornada, anio, mes, onClose, onSaved }) {
  const [form, setForm] = useState(() => estadoInicial(jornada, anio, mes))
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [onClose])

  const set = (campo) => (e) => {
    const valor = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  // Previsualización del cálculo (estimado; el backend manda).
  const estim = useMemo(() => {
    if (!form.asistio) return { horas: 0, total: 0 }
    const h = estimarHoras(form.entrada, form.salida)
    const vh = form.valorHora === '' ? VALOR_HORA_DEFAULT : Number(form.valorHora)
    const pagoBase = h * vh
    const ventas = form.ventasBrutas === '' ? 0 : Number(form.ventasBrutas)
    const comision = Math.round(ventas / (1 + IVA)) * COMISION
    return { horas: h, total: Math.round(pagoBase + comision) }
  }, [form])

  async function enviar(e) {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    const payload = {
      fecha: form.fecha,
      entrada: form.asistio ? hora(form.entrada) : null,
      salida: form.asistio ? hora(form.salida) : null,
      valorHora: form.valorHora === '' ? null : Number(form.valorHora),
      ventasBrutas: form.asistio && form.ventasBrutas !== '' ? Number(form.ventasBrutas) : 0,
      asistio: form.asistio,
      nota: form.nota || null,
    }
    try {
      if (jornada) await actualizarJornada(jornada.id, payload)
      else await crearJornada(payload)
      sileo.success({
        title: jornada ? 'Cambios guardados' : 'Día agregado con éxito',
        description: fechaCorta(form.fecha),
      })
      onSaved() // cierra el form (el toast vive en App, no se desmonta)
    } catch (err) {
      setError(err.message)
      sileo.error({
        title: jornada ? 'No se pudo guardar' : 'No se pudo agregar el día',
        description: err.message,
      })
      setGuardando(false)
    }
  }

  const inputClase =
    'w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-800 dark:text-gray-100 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-sm [color-scheme:light] dark:[color-scheme:dark]'
  const labelClase =
    'text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2'

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn" onMouseDown={onClose}>
      <div
        className="w-full max-w-lg bg-white dark:bg-[#15181d] rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col max-h-[92vh] overflow-hidden animate-slideUp"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-50 dark:border-white/5 bg-[#fafafa] dark:bg-[#1b1f26]">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              {jornada ? <Pencil className="w-5 h-5 text-[#2563eb] dark:text-[#7c9deb]" /> : <Plus className="w-5 h-5 text-[#2563eb] dark:text-[#7c9deb]" />}
              {jornada ? 'Editar día' : 'Nuevo día'}
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-normal">Cargá entrada, salida y ventas</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <form onSubmit={enviar} className="p-6 overflow-y-auto space-y-5 no-scrollbar flex-1">

          {/* Fecha */}
          <div className="space-y-1">
            <label className={labelClase}>
              <Calendar className="w-4 h-4 text-gray-400" />
              Fecha
            </label>
            <input type="date" required value={form.fecha} onChange={set('fecha')} className={inputClase} />
            {form.fecha && (
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium pl-1">
                Se guardará como: <strong className="font-semibold">{fechaCorta(form.fecha)}</strong>
              </p>
            )}
          </div>

          {/* Asistí */}
          <label className="flex items-center gap-3 cursor-pointer select-none bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3">
            <input
              type="checkbox"
              checked={form.asistio}
              onChange={set('asistio')}
              className="w-5 h-5 accent-[#2563eb]"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Asistí este día</span>
          </label>

          {form.asistio && (
            <>
              {/* Horas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClase}><Clock className="w-4 h-4 text-gray-400" /> Entrada</label>
                  <input type="time" value={form.entrada} onChange={set('entrada')} className={inputClase} />
                </div>
                <div className="space-y-1">
                  <label className={labelClase}><Clock className="w-4 h-4 text-gray-400" /> Salida</label>
                  <input type="time" value={form.salida} onChange={set('salida')} className={inputClase} />
                </div>
              </div>

              {/* Duración */}
              <div className="bg-blue-50/50 dark:bg-blue-500/10 rounded-xl p-3 flex justify-between items-center text-xs border border-blue-50 dark:border-blue-500/20">
                <span className="font-medium text-blue-700 dark:text-blue-300">Duración calculada (con colación):</span>
                <span className="font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 px-2.5 py-1 rounded-lg">
                  {estim.horas} h
                </span>
              </div>

              {/* Ventas y valor hora */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClase}><DollarSign className="w-4 h-4 text-green-500" /> Ventas brutas</label>
                  <input
                    type="number" min="0" step="1" inputMode="numeric"
                    placeholder="con IVA"
                    value={form.ventasBrutas} onChange={set('ventasBrutas')}
                    className={`${inputClase} font-semibold`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClase}><DollarSign className="w-4 h-4 text-yellow-500" /> Valor hora</label>
                  <input
                    type="number" min="0" step="1" inputMode="numeric"
                    placeholder={`def. ${VALOR_HORA_DEFAULT}`}
                    value={form.valorHora} onChange={set('valorHora')}
                    className={`${inputClase} font-semibold`}
                  />
                </div>
              </div>
            </>
          )}

          {/* Nota */}
          <div className="space-y-1">
            <label className={labelClase}>
              <FileText className="w-4 h-4 text-gray-400" />
              Nota {form.asistio && <span className="text-gray-300 dark:text-gray-600 normal-case font-normal">(opcional)</span>}
            </label>
            <textarea
              value={form.nota}
              onChange={set('nota')}
              maxLength={200}
              rows={2}
              placeholder={form.asistio ? 'Detalles del día…' : 'feriado / no fui'}
              className={`${inputClase} resize-none`}
            />
          </div>

          {error && <p className="text-red-500 dark:text-red-400 text-sm font-medium">{error}</p>}

          {/* Estimado */}
          {form.asistio && (
            <div className="mt-2 bg-slate-900 dark:bg-black/40 dark:border dark:border-white/10 text-white rounded-2xl p-4 flex justify-between items-center shadow-lg">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Total estimado del día</p>
                <p className="text-xs font-normal text-gray-400">El servidor calcula el valor final</p>
              </div>
              <p className="text-2xl font-bold tracking-tight text-white tabular-nums">
                {money(estim.total)}
              </p>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-2 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-4 rounded-xl border border-gray-200 dark:border-white/15 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 font-semibold text-sm transition active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 py-4 rounded-xl bg-[#2563eb] text-white hover:bg-blue-700 font-bold text-sm tracking-wide shadow-lg hover:shadow-xl active:scale-[0.99] transition duration-200 disabled:opacity-60"
            >
              {guardando ? 'Guardando…' : jornada ? 'Guardar cambios' : 'Agregar día'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
