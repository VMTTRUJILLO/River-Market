import { useTienda } from '../context/useTienda'
import { dinero, fecha } from '../utils/format'
import EstadoVenta from './EstadoVenta'

export default function MisPedidos({ usuario }) {
  const { ventas } = useTienda()
  const pedidos = ventas.filter((v) => v.cliente.id === usuario.id)
  return (
    <section className="rm-my-orders mt-5">
      <h3 className="title is-5">Mis pedidos</h3>
      {pedidos.length === 0 ? (
        <p>Aún no tienes pedidos. Tu próxima compra aparecerá aquí.</p>
      ) : (
        pedidos.map((v) => (
          <details key={v.id} className="rm-my-order">
            <summary>
              <strong>{v.numero}</strong>
              <EstadoVenta estado={v.estado} />
              <span>{dinero(v.total)}</span>
            </summary>
            <p className="is-size-7 mt-3">
              {fecha(v.fecha)}
              {v.demo ? ' · Pedido de prueba' : ''}
            </p>
            <ul className="rm-order-lines">
              {v.items.map((i) => (
                <li key={i.id}>
                  <span>
                    {i.cantidad} × {i.nombre}
                  </span>
                  <strong>{dinero(i.precio * i.cantidad)}</strong>
                </li>
              ))}
            </ul>
            <p className="is-size-7 mt-3">Recogida: {v.entrega.tienda}. Compra simulada, sin cobro real.</p>
          </details>
        ))
      )}
    </section>
  )
}
