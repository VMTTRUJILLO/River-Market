import { useCallback, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useCarrito } from '../context/useCarrito'
import { useAuth } from '../context/useAuth'
import { useTienda } from '../context/useTienda'
import { useDialog } from '../utils/useDialog'
import { useEntrada } from '../utils/useEntrada'
import { navigate } from '../utils/useRoute'
import { dinero } from '../utils/format'
import { TIENDAS } from '../domain/tienda'
import ImagenProducto from './ImagenProducto'
import './CarritoPanel.css'

gsap.registerPlugin(useGSAP)

export default function CarritoPanel() {
  const { items, total, cantidadTotal, abierto, cerrarCarrito, agregar, restar, quitar, vaciar } =
    useCarrito()
  const { usuario } = useAuth()
  const { finalizarCompra } = useTienda()
  const [paso, setPaso] = useState('carrito')
  const [pedido, setPedido] = useState(null)
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [entrega, setEntrega] = useState({ nombre: '', telefono: '', tienda: TIENDAS[0] })
  const solicitud = useRef(null)
  const bloqueo = useRef(false)
  const raiz = useRef(null)
  const panel = useRef(null)
  useEntrada(panel, [paso, abierto], '.rm-cart-checkout > *, .rm-cart-line, .rm-cart-vacio')
  const cerrar = useCallback(() => {
    cerrarCarrito()
    setPaso('carrito')
    setError('')
    setPedido(null)
  }, [cerrarCarrito])
  useDialog(panel, abierto, cerrar)
  useGSAP(
    () => {
      const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.3
      gsap.to('.rm-cart-overlay', { autoAlpha: abierto ? 1 : 0, duration, overwrite: true })
      gsap.to('.rm-cart-drawer', {
        xPercent: abierto ? 0 : 100,
        autoAlpha: abierto ? 1 : 0,
        duration,
        ease: 'power3.out',
        overwrite: true,
      })
    },
    { scope: raiz, dependencies: [abierto], revertOnUpdate: true },
  )
  const invalido = items.some((p) => !p.disponible || p.cantidad > p.stock)
  const continuar = () => {
    if (!usuario) {
      cerrar()
      navigate('/ingresar?continuar=compra')
      return
    }
    solicitud.current = crypto.randomUUID()
    setEntrega((actual) => ({ ...actual, nombre: actual.nombre || usuario.nombre }))
    setError('')
    setPaso('confirmar')
  }
  const comprar = (event) => {
    event.preventDefault()
    if (bloqueo.current) return
    bloqueo.current = true
    setOcupado(true)
    setError('')
    try {
      const venta = finalizarCompra(items, entrega, solicitud.current)
      vaciar()
      setPedido(venta)
      setPaso('exito')
    } catch (err) {
      setError(err.message)
    } finally {
      bloqueo.current = false
      setOcupado(false)
    }
  }
  return (
    <div ref={raiz} className="rm-cart-root">
      <div className="rm-cart-overlay" onClick={cerrar} aria-hidden="true" />
      <aside
        ref={panel}
        className="rm-cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rm-cart-titulo"
        inert={!abierto}
      >
        <header className="rm-cart-header">
          <h2 id="rm-cart-titulo" className="title is-5 has-text-white mb-0">
            {paso === 'exito'
              ? '¡Gracias por tu compra!'
              : paso === 'confirmar'
                ? 'Finalizar compra'
                : 'Tu carrito'}
            {paso === 'carrito' && cantidadTotal > 0 && (
              <span className="tag is-warning is-rounded ml-3">{cantidadTotal}</span>
            )}
          </h2>
          <button type="button" className="delete is-medium" aria-label="Cerrar carrito" onClick={cerrar} />
        </header>
        {paso === 'exito' && pedido ? (
          <div className="rm-cart-checkout">
            <div className="rm-order-success" role="status">
              <span aria-hidden="true">✓</span>
              <h3 className="title is-4">Pedido {pedido.numero}</h3>
              <p>Tu pedido está listo. ¡Gracias por elegirnos!</p>
            </div>
            <p className="mb-4">
              Recogida en <strong>{pedido.entrega.tienda}</strong>, a nombre de {pedido.entrega.nombre}.
            </p>
            <ul className="rm-order-lines">
              {pedido.items.map((i) => (
                <li key={i.id}>
                  <span>
                    {i.cantidad} × {i.nombre}
                  </span>
                  <strong>{dinero(i.precio * i.cantidad)}</strong>
                </li>
              ))}
            </ul>
            <div className="rm-cart-total mt-4">
              <span>Total</span>
              <strong>{dinero(pedido.total)}</strong>
            </div>
            <p className="is-size-7 mb-5">No se realizó ningún cobro.</p>
            <button className="button is-primary is-rounded is-fullwidth" onClick={cerrar}>
              Seguir comprando
            </button>
            <button
              className="button is-light is-rounded is-fullwidth mt-3"
              onClick={() => {
                cerrar()
                navigate('/ingresar')
              }}
            >
              Ver mis pedidos
            </button>
          </div>
        ) : paso === 'confirmar' && usuario ? (
          <form className="rm-cart-checkout" onSubmit={comprar}>
            <button
              type="button"
              className="button is-text mb-4"
              onClick={() => {
                setPaso('carrito')
                setError('')
              }}
            >
              ← Volver al carrito
            </button>
            <p className="rm-eyebrow">RECOGIDA EN TIENDA · SIN COSTO</p>
            <h3 className="title is-4 mt-2">Ya casi es tuyo</h3>
            <p className="mb-4">Confirma tus datos y revisa el pedido.</p>
            <div className="field">
              <label className="label" htmlFor="compra-nombre">
                Nombre de quien recoge
              </label>
              <input
                id="compra-nombre"
                className="input"
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
                value={entrega.nombre}
                onChange={(e) => setEntrega({ ...entrega, nombre: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="compra-telefono">
                Teléfono
              </label>
              <input
                id="compra-telefono"
                className="input"
                required
                type="tel"
                pattern="[0-9\s+()\-]{7,20}"
                maxLength={20}
                autoComplete="tel"
                placeholder="3001234567"
                value={entrega.telefono}
                onChange={(e) => setEntrega({ ...entrega, telefono: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="compra-tienda">
                Punto de recogida
              </label>
              <div className="select is-fullwidth">
                <select
                  id="compra-tienda"
                  value={entrega.tienda}
                  onChange={(e) => setEntrega({ ...entrega, tienda: e.target.value })}
                >
                  {TIENDAS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <ul className="rm-order-lines mt-5">
              {items.map((i) => (
                <li key={i.id}>
                  <span>
                    {i.cantidad} × {i.nombre}
                  </span>
                  <strong>{dinero(i.precio * i.cantidad)}</strong>
                </li>
              ))}
            </ul>
            <div className="rm-cart-total mt-4">
              <span>Total</span>
              <strong>{dinero(total)}</strong>
            </div>
            <p className="notification is-warning is-light is-size-7">
              Compra simulada. No se solicitarán datos de pago ni se realizará un cobro.
            </p>
            {error && (
              <p className="notification is-danger is-light" role="alert">
                {error}
              </p>
            )}
            {invalido && (
              <p className="notification is-warning is-light" role="alert">
                Cambió la disponibilidad. Vuelve al carrito y ajusta las cantidades.
              </p>
            )}
            <button
              type="submit"
              className="button is-primary is-rounded is-fullwidth"
              disabled={ocupado || invalido || !items.length}
            >
              Confirmar compra
            </button>
          </form>
        ) : items.length === 0 ? (
          <div className="rm-cart-vacio">
            <p className="is-size-1" aria-hidden="true">
              🛒
            </p>
            <h3 className="title is-5 mt-3">Tu carrito está vacío</h3>
            <p className="mb-4">Agrega productos para verlos aquí.</p>
            <button className="button is-primary is-rounded" onClick={cerrar}>
              Seguir comprando
            </button>
          </div>
        ) : (
          <>
            <ul className="rm-cart-list">
              {items.map((p) => (
                <li key={p.id} className="rm-cart-line">
                  <ImagenProducto className="rm-cart-product-image" src={p.imagen} alt={p.nombre} />
                  <div>
                    <p className="has-text-weight-semibold">{p.nombre}</p>
                    <p className="is-size-7 has-text-grey">
                      {p.presentacion} · {dinero(p.precio)}
                    </p>
                    {(!p.disponible || p.cantidad > p.stock) && (
                      <p className="has-text-danger is-size-7">
                        {!p.disponible ? 'Producto retirado del catálogo' : `Solo quedan ${p.stock} unidades`}
                      </p>
                    )}
                    <div className="rm-cart-qty">
                      <button
                        className="button is-small is-rounded"
                        aria-label={`Quitar una unidad de ${p.nombre}`}
                        onClick={() => restar(p.id)}
                      >
                        −
                      </button>
                      <span>{p.cantidad}</span>
                      <button
                        className="button is-small is-rounded"
                        aria-label={`Agregar una unidad de ${p.nombre}`}
                        onClick={() => agregar(p)}
                        disabled={!p.disponible || p.cantidad >= p.stock}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="rm-cart-side">
                    <button
                      className="delete is-small"
                      aria-label={`Quitar ${p.nombre} del carrito`}
                      onClick={() => quitar(p.id)}
                    />
                    <strong>{dinero(p.precio * p.cantidad)}</strong>
                  </div>
                </li>
              ))}
            </ul>
            <footer className="rm-cart-footer">
              <div className="rm-cart-total">
                <span>Total</span>
                <strong>{dinero(total)}</strong>
              </div>
              <p className="is-size-7">Recogida sin costo</p>
              <button
                className="button is-primary is-rounded is-fullwidth"
                onClick={continuar}
                disabled={invalido}
              >
                {usuario ? 'Finalizar compra' : 'Inicia sesión para comprar'}
              </button>
              <button className="button is-light is-rounded is-fullwidth" onClick={vaciar}>
                Vaciar carrito
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
