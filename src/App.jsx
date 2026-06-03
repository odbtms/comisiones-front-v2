import { useCallback, useEffect, useState } from 'react'
import { getResumen, eliminarJornada } from './api.js'
import { money, horas, nombreMes } from './lib/format.js'
import ResumenMensual from './components/ResumenMensual.jsx'
import JornadaForm from './components/JornadaForm.jsx'

const hoy = new Date()

export default function App() {
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes] = useState(hoy.getMonth() + 1)
  const [resumen, setResumen] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [editando, setEditando] = useState(null) // jornada | 'nueva' | null

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
      cargar()
    } catch (e) {
      setError(e.message)
    }
  }

  function onGuardado() {
    setEditando(null)
    cargar()
  }

  return (
    <div className="app">
      <header className="cabecera">
        <h1>Comisiones</h1>
        <nav className="mes-nav">
          <button className="icono" onClick={() => cambiarMes(-1)} aria-label="Mes anterior">‹</button>
          <span className="mes-actual">
            {nombreMes(mes)} <b>{anio}</b>
          </span>
          <button className="icono" onClick={() => cambiarMes(1)} aria-label="Mes siguiente">›</button>
        </nav>
      </header>

      <section className="totales">
        <div className="total-grande">
          <span className="rotulo">Total del mes</span>
          <span className="cifra">{money(resumen?.totalGeneral)}</span>
        </div>
        <div className="mini-totales">
          <div><span className="rotulo">Días</span><b>{resumen?.diasTrabajados ?? '—'}</b></div>
          <div><span className="rotulo">Horas</span><b>{resumen ? horas(resumen.totalHoras) : '—'}</b></div>
          <div><span className="rotulo">Base</span><b>{money(resumen?.totalPagoBase)}</b></div>
          <div><span className="rotulo">Comisión</span><b>{money(resumen?.totalComision)}</b></div>
        </div>
      </section>

      <main className="contenido">
        {error && (
          <div className="aviso-error">
            <p>{error}</p>
            <button className="btn fantasma" onClick={cargar}>Reintentar</button>
          </div>
        )}
        {cargando && !resumen && <div className="cargando">Cargando…</div>}
        {resumen && (
          <ResumenMensual
            resumen={resumen}
            onEditar={(j) => setEditando(j)}
            onEliminar={confirmarEliminar}
          />
        )}
      </main>

      <button className="fab" onClick={() => setEditando('nueva')}>
        <span>+</span> Nuevo día
      </button>

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
