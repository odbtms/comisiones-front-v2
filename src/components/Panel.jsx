import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Clock, Calendar, Briefcase, ChevronRight, Plus, LogOut,
  Search, RefreshCw, ChevronLeft,
} from 'lucide-react'
import { getResumen, eliminarJornada } from '../api.js'
import { cerrarSesion } from '../auth.js'
import { money, horas, nombreMes, fechaCorta } from '../lib/format.js'
import JornadaForm from './JornadaForm.jsx'
import DetailModal from './DetailModal.jsx'

const hoy = new Date()

/** La app en sí (días + resumen del mes). Se muestra solo si hay sesión. */
export default function Panel({ usuario }) {
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes] = useState(hoy.getMonth() + 1)
  const [resumen, setResumen] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [seleccion, setSeleccion] = useState(null)       // jornada para ver detalle
  const [editando, setEditando] = useState(null)          // jornada | 'nueva' | null

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      setResumen(await getResumen(anio, mes))
    } catch (e) {
      setError(e.message)
      setResumen(null)
    } finally {
      setCargando(false)
    }
  }, [anio, mes])

  useEffect(() => { cargar() }, [cargar])

  function cambiarMes(delta) {
    let m = mes + delta
    let a = anio
    if (m < 1) { m = 12; a-- }
    if (m > 12) { m = 1; a++ }
    setMes(m)
    setAnio(a)
  }

  async function confirmarEliminar(j) {
    if (!window.confirm(`¿Eliminar el día ${j.fecha}?`)) return
    try {
      await eliminarJornada(j.id)
      setSeleccion(null)
      cargar()
    } catch (e) {
      setError(e.message)
    }
  }

  function onGuardado() {
    setEditando(null)
    cargar()
  }

  const jornadas = resumen?.jornadas ?? []

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return jornadas
    return jornadas.filter((j) => {
      const fecha = fechaCorta(j.fecha).toLowerCase()
      return (
        fecha.includes(q) ||
        j.fecha.includes(q) ||
        (j.nota?.toLowerCase().includes(q)) ||
        (j.entrada?.includes(q)) ||
        (j.salida?.includes(q))
      )
    })
  }, [jornadas, busqueda])

  const inicial = (usuario?.nombre || usuario?.email || '?').charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-[#eaedf1] flex flex-col items-center justify-center sm:py-6 px-0 sm:px-4 font-sans antialiased text-gray-900 select-none">
      <div className="w-full max-w-md bg-[#f4f6fa] sm:rounded-[40px] shadow-2xl overflow-hidden border border-gray-200/40 p-0 flex flex-col min-h-screen sm:min-h-0 sm:h-[880px] relative">

        {/* Notch decorativo (solo desktop) */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-black rounded-full z-40 hidden sm:block" />

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto px-6 pt-8 pb-32 no-scrollbar relative">

          {/* Barra superior: recargar + perfil */}
          <div className="flex justify-between items-center mb-5 mt-4 sm:mt-6">
            <button
              onClick={cargar}
              className="p-2 bg-white/70 hover:bg-white rounded-full text-gray-400 hover:text-black shadow-sm transition active:scale-90"
              title="Recargar"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            </button>

            <div className="flex items-center gap-1.5 bg-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-gray-200/50 pl-1.5 pr-3 py-1 rounded-full">
              <span className="w-7 h-7 rounded-full bg-[#7c9deb] text-white text-xs font-bold grid place-items-center border border-white">
                {inicial}
              </span>
              <span className="text-xs font-semibold text-gray-800 max-w-[120px] truncate">
                {usuario?.nombre || usuario?.email || 'Cuenta'}
              </span>
              <button
                onClick={cerrarSesion}
                className="ml-1.5 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Título */}
          <div className="mb-3">
            <h2 className="text-[38px] font-extrabold tracking-tight text-gray-950 p-0 m-0 leading-tight">
              Comisiones
            </h2>
          </div>

          {/* Navegación de mes */}
          <div className="flex items-center justify-between mb-4 bg-white/80 border border-white/60 rounded-full p-1 shadow-sm">
            <button
              onClick={() => cambiarMes(-1)}
              className="p-2 rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition active:scale-90"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-gray-700 capitalize">
              {nombreMes(mes)} <span className="text-gray-400 font-medium">{anio}</span>
            </span>
            <button
              onClick={() => cambiarMes(1)}
              className="p-2 rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition active:scale-90"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Balance del mes */}
          <div className="mb-6 flex items-baseline">
            <span className="text-[28px] font-thin text-gray-400 mr-1 leading-none">$</span>
            <span className="text-[52px] font-extrabold tracking-tight text-black leading-none tabular-nums">
              {(resumen?.totalGeneral ?? 0).toLocaleString('es-CL')}
            </span>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-2.5 mb-7">
            <Kpi icon={Clock} label="Horas" value={resumen ? horas(resumen.totalHoras) : '—'} />
            <Kpi icon={Calendar} label="Días" value={resumen?.diasTrabajados ?? '—'} />
            <Kpi icon={Briefcase} label="Base" value={money(resumen?.totalPagoBase)} small />
          </div>

          {/* Buscador */}
          <div className="mb-5 relative">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por día o nota…"
              className="w-full pl-9 pr-8 py-2.5 rounded-full bg-white text-xs border border-gray-100 shadow-sm focus:border-gray-300 focus:ring-0 outline-none transition"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-3 top-2 px-1 py-0.5 bg-gray-100 uppercase rounded text-[9px] font-bold text-gray-400 hover:text-black"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-3 mb-4 text-xs text-red-700 flex items-center justify-between gap-2">
              <span>{error}</span>
              <button onClick={cargar} className="font-semibold underline shrink-0">Reintentar</button>
            </div>
          )}

          {/* Lista de días */}
          <div className="space-y-3.5 pb-20">
            {cargando && !resumen ? (
              <div className="text-center py-10 text-sm text-gray-400">Cargando…</div>
            ) : filtradas.length > 0 ? (
              filtradas.map((j, i) => (
                <button
                  key={j.id}
                  onClick={() => setSeleccion(j)}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className="animate-appear w-full text-left bg-white rounded-3xl p-5 border border-white/60 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:scale-[1.005] active:scale-[0.995] transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-base font-extrabold text-[#111] tracking-tight m-0 p-0">
                      {fechaCorta(j.fecha)}
                    </h4>
                    {j.asistio ? (
                      <p className="text-xs font-normal text-gray-400 m-0 p-0">
                        {j.entrada ?? '—'} - {j.salida ?? '—'} · {horas(j.horas)}
                      </p>
                    ) : (
                      <p className="text-xs font-medium text-amber-500 m-0 p-0 italic">
                        {j.nota || 'No asistió'}
                      </p>
                    )}
                    {j.asistio && j.nota && (
                      <p className="text-[10px] text-gray-400/90 font-normal truncate max-w-[180px] pt-0.5">
                        {j.nota}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`text-[17px] font-extrabold tracking-tight ${j.asistio ? 'text-[#22c55e]' : 'text-gray-300'}`}>
                      {money(j.total)}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-10 bg-white/50 border border-dashed border-gray-200 rounded-3xl p-6">
                <p className="text-sm text-gray-400 font-medium">
                  {busqueda
                    ? 'No se encontraron días para la búsqueda.'
                    : 'No hay días cargados este mes.'}
                </p>
                {busqueda ? (
                  <button
                    onClick={() => setBusqueda('')}
                    className="mt-3 text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Limpiar búsqueda
                  </button>
                ) : (
                  <p className="mt-1 text-xs text-gray-400">Tocá «Nuevo día» para empezar.</p>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Botón flotante */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#f4f6fa] via-[#f4f6fa]/95 to-transparent pt-12 pb-8 px-6 text-center pointer-events-none z-30">
          <button
            onClick={() => setEditando('nueva')}
            className="pointer-events-auto inline-flex items-center gap-1.5 bg-[#7c9deb] hover:bg-[#688edc] active:scale-95 transition-all py-3 px-6 rounded-full text-white font-semibold text-sm shadow-[0_6px_22px_rgba(124,157,235,0.4)] cursor-pointer tracking-tight"
          >
            <Plus className="w-4 h-4 text-white stroke-[3px]" />
            Nuevo día
          </button>
        </div>

      </div>

      {/* Modales */}
      <DetailModal
        jornada={seleccion}
        onClose={() => setSeleccion(null)}
        onEditar={(j) => { setSeleccion(null); setEditando(j) }}
        onEliminar={confirmarEliminar}
      />

      {editando && (
        <JornadaForm
          jornada={editando === 'nueva' ? null : editando}
          anio={anio}
          mes={mes}
          onClose={() => setEditando(null)}
          onSaved={onGuardado}
        />
      )}
    </div>
  )
}

function Kpi({ icon: Icon, label, value, small }) {
  return (
    <div className="bg-white/80 backdrop-blur border border-white/60 rounded-[20px] p-3 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-1 mb-2">
        <Icon className="w-3 h-3 text-gray-400 stroke-[1.5]" />
        <span className="text-gray-400/80 text-[10px] font-medium tracking-tight">{label}</span>
      </div>
      <div className={`${small ? 'text-base' : 'text-xl'} font-bold text-black tracking-tight leading-none pt-0.5 tabular-nums`}>
        {value}
      </div>
    </div>
  )
}
