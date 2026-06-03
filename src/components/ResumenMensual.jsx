import { money, horas, diaFecha } from '../lib/format.js'

export default function ResumenMensual({ resumen, onEditar, onEliminar }) {
  const { jornadas = [] } = resumen ?? {}

  if (jornadas.length === 0) {
    return (
      <div className="vacio">
        <p>No hay días cargados este mes.</p>
        <p className="tenue">Tocá <strong>+ Nuevo día</strong> para empezar.</p>
      </div>
    )
  }

  return (
    <ul className="lista">
      {jornadas.map((j, i) => {
        const f = diaFecha(j.fecha)
        return (
          <li
            key={j.id}
            className={`tarjeta ${j.asistio ? '' : 'ausente'}`}
            style={{ '--i': i }}
          >
            <button className="tarjeta-cuerpo" onClick={() => onEditar(j)}>
              <div className="fecha">
                <span className="dia-num">{f.numero}</span>
                <span className="dia-sem">{f.dia}</span>
              </div>

              <div className="datos">
                {j.asistio ? (
                  <>
                    <div className="linea-top">
                      <span className="rango">
                        {j.entrada ?? '—'}<i>→</i>{j.salida ?? '—'}
                      </span>
                      <span className="chip">{horas(j.horas)}</span>
                    </div>
                    <div className="detalle">
                      <span>Base {money(j.pagoBase)}</span>
                      <span>·</span>
                      <span>Comisión {money(j.comision)}</span>
                    </div>
                  </>
                ) : (
                  <span className="etiqueta-ausente">
                    {j.nota || 'No asistió'}
                  </span>
                )}
              </div>

              <div className="total">
                <span className="total-num">{money(j.total)}</span>
              </div>
            </button>

            <button
              className="icono borrar"
              aria-label="Eliminar día"
              onClick={() => onEliminar(j)}
            >
              ×
            </button>
          </li>
        )
      })}
    </ul>
  )
}
