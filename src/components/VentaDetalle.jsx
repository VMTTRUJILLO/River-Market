import { useState } from 'react'
import { useTienda } from '../context/useTienda'
import { transicionesPedido } from '../domain/seguimiento'
import { dinero, fecha } from '../utils/format'
import Modal from './Modal'
import EstadoVenta from './EstadoVenta'
import { destinoPedido } from '../domain/seguimiento'

export default function VentaDetalle({ id, cerrar }) {
  const { ventas, cambiarEstado } = useTienda()
  const venta = ventas.find((v) => v.id === id)
  const [confirmar, setConfirmar] = useState(false)
  const [error, setError] = useState('')
  if (!venta) return null
  const actualizar = (estado) => {
    try {
      cambiarEstado(id, estado)
      setConfirmar(false)
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }
  return (
    <Modal titulo={`Pedido ${venta.numero}`} cerrar={cerrar}>
      <div className="rm-section-heading">
        <div>
          <EstadoVenta estado={venta.estado} />
        </div>
        <span className="is-size-7">{fecha(venta.fecha)}</span>
      </div>
      <div className="rm-sale-customer">
        <div>
          <p className="rm-eyebrow">CLIENTE</p>
          <strong>{venta.cliente.nombre}</strong>
          <p>{venta.cliente.email}</p>
        </div>
        <div>
          <p className="rm-eyebrow">{venta.entrega.tipo === 'domicilio' ? 'DOMICILIO' : 'RECOGIDA'}</p>
          <strong>{destinoPedido(venta)}</strong>
          <p>
            {venta.entrega.nombre} · {venta.entrega.telefono}
          </p>
        </div>
      </div>
      {venta.entrega.indicaciones && <p>{venta.entrega.indicaciones}</p>}
      <ul className="rm-order-lines mt-4">
        {venta.items.map((i) => (
          <li key={i.id}>
            <div>
              {i.cantidad} × {i.nombre}
              <p className="is-size-7 has-text-grey">
                {i.presentacion} · {dinero(i.precio)} por unidad
              </p>
            </div>
            <strong>{dinero(i.precio * i.cantidad)}</strong>
          </li>
        ))}
      </ul>
      <div className="rm-cart-total my-4">
        <span>Total</span>
        <strong>{dinero(venta.total)}</strong>
      </div>
      <h3 className="title is-6 mt-5 mb-3">Historial del pedido</h3>
      <ol className="rm-order-timeline">
        {venta.cambios.map((c, i) => (
          <li key={i}>
            <strong>{c.estado}</strong>
            <span>
              {fecha(c.fecha)} · {c.actor}
            </span>
          </li>
        ))}
      </ol>
      {error && (
        <p className="notification is-danger is-light mt-4" role="alert">
          {error}
        </p>
      )}
      {confirmar ? (
        <div className="notification is-warning is-light mt-5">
          <p className="has-text-weight-bold">¿Cancelar este pedido?</p>
          <p className="is-size-7 mt-2">
            Las unidades volverán al inventario y la venta dejará de contar como ingreso. Esta acción es
            definitiva.
          </p>
          <div className="buttons mt-3">
            <button className="button is-danger is-rounded" onClick={() => actualizar('Cancelada')}>
              Sí, cancelar venta
            </button>
            <button className="button is-light is-rounded" onClick={() => setConfirmar(false)}>
              Conservar pedido
            </button>
          </div>
        </div>
      ) : (
        <div className="buttons mt-5">
          {transicionesPedido(venta).map((estado) => (
            <button
              key={estado}
              className={`button is-rounded ${estado === 'Cancelada' ? 'is-danger is-light' : 'is-primary'}`}
              onClick={() => (estado === 'Cancelada' ? setConfirmar(true) : actualizar(estado))}
            >
              {estado === 'Cancelada'
                ? 'Cancelar venta'
                : `Marcar: ${estado}`}
            </button>
          ))}
        </div>
      )}
    </Modal>
  )
}
