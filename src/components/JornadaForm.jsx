import { useEffect, useState } from 'react'
import { crearJornada, actualizarJornada } from '../api.js'

// Devuelve "HH:mm" o null desde un <input type=time> (que ya da "HH:mm" o "").
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
  // Día por defecto: hoy si cae en el mes elegido, si no el día 1.
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
      onSaved()
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <div className="modal-fondo" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <header className="modal-cab">
          <h2>{jornada ? 'Editar día' : 'Nuevo día'}</h2>
          <button className="icono" onClick={onClose} aria-label="Cerrar">×</button>
        </header>

        <form onSubmit={enviar} className="form">
          <label className="campo">
            <span>Fecha</span>
            <input type="date" value={form.fecha} onChange={set('fecha')} required />
          </label>

          <label className="check">
            <input type="checkbox" checked={form.asistio} onChange={set('asistio')} />
            <span>Asistí este día</span>
          </label>

          {form.asistio && (
            <>
              <div className="fila">
                <label className="campo">
                  <span>Entrada</span>
                  <input type="time" value={form.entrada} onChange={set('entrada')} />
                </label>
                <label className="campo">
                  <span>Salida</span>
                  <input type="time" value={form.salida} onChange={set('salida')} />
                </label>
              </div>

              <label className="campo">
                <span>Ventas brutas (con IVA)</span>
                <input
                  type="number" min="0" step="1" inputMode="numeric"
                  placeholder="0"
                  value={form.ventasBrutas} onChange={set('ventasBrutas')}
                />
              </label>

              <label className="campo">
                <span>Valor hora <em>(opcional)</em></span>
                <input
                  type="number" min="0" step="1" inputMode="numeric"
                  placeholder="por defecto: 3098"
                  value={form.valorHora} onChange={set('valorHora')}
                />
              </label>
            </>
          )}

          <label className="campo">
            <span>Nota <em>(opcional)</em></span>
            <input
              type="text" maxLength={200}
              placeholder={form.asistio ? '' : 'feriado / no fui'}
              value={form.nota} onChange={set('nota')}
            />
          </label>

          {error && <p className="error">{error}</p>}

          <div className="acciones">
            <button type="button" className="btn fantasma" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
