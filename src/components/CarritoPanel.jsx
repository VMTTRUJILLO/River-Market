import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useCarrito } from '../context/CarritoContext'
import './CarritoPanel.css'

gsap.registerPlugin(useGSAP)

const formatear = (n) =>
  n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

const reducirMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function CarritoPanel() {
  const { items, total, cantidadTotal, abierto, cerrarCarrito, agregar, restar, quitar, vaciar } = useCarrito()
  const raiz = useRef(null)
  const botonCerrar = useRef(null)
  const primera = useRef(true)

  // Abrir / cerrar con GSAP
  useGSAP(
    () => {
      const k = primera.current || reducirMovimiento() ? 0 : 1 // 0 = sin animación
      primera.current = false
      const capas = '.rm-cart-overlay, .rm-cart-drawer'

      if (abierto) {
        gsap.set(capas, { visibility: 'visible' })
        gsap.to('.rm-cart-overlay', { opacity: 1, duration: 0.3 * k, overwrite: true })
        gsap.to('.rm-cart-drawer', { xPercent: 0, duration: 0.45 * k, ease: 'power3.out', overwrite: true })
        gsap.from('.rm-cart-line, .rm-cart-vacio', {
          x: 30,
          opacity: 0,
          duration: 0.4 * k,
          ease: 'power2.out',
          stagger: 0.06,
          delay: 0.15 * k,
        })
      } else {
        gsap.to('.rm-cart-overlay', { opacity: 0, duration: 0.25 * k, overwrite: true })
        gsap.to('.rm-cart-drawer', {
          xPercent: 100,
          duration: 0.35 * k,
          ease: 'power3.in',
          overwrite: true,
          onComplete: () => gsap.set(capas, { visibility: 'hidden' }),
        })
      }
    },
    { scope: raiz, dependencies: [abierto] }
  )

  // Escape cierra, la página de atrás no se desplaza y el foco se devuelve al botón del carrito
  useEffect(() => {
    if (!abierto) return
    const previo = document.activeElement
    const alTeclear = (e) => {
      if (e.key === 'Escape') cerrarCarrito()
    }
    document.addEventListener('keydown', alTeclear)
    document.body.style.overflow = 'hidden'
    botonCerrar.current?.focus()
    return () => {
      document.removeEventListener('keydown', alTeclear)
      document.body.style.overflow = ''
      previo?.focus?.()
    }
  }, [abierto, cerrarCarrito])

  // El producto se encoge y se desvanece antes de salir del carrito
  const quitarAnimado = (id, el) => {
    if (!el || reducirMovimiento()) return quitar(id)
    gsap.to(el, {
      opacity: 0,
      x: 40,
      height: 0,
      paddingTop: 0,
      paddingBottom: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => quitar(id),
    })
  }

  const seguirComprando = () => {
    cerrarCarrito()
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div ref={raiz}>
      <div className="rm-cart-overlay" onClick={cerrarCarrito} aria-hidden="true" />

      <aside
        className="rm-cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rm-cart-titulo"
        inert={!abierto}
      >
        <header className="rm-cart-header">
          <h2 id="rm-cart-titulo" className="title is-5 has-text-white mb-0">
            Tu carrito
            {cantidadTotal > 0 && <span className="tag is-warning is-rounded ml-3">{cantidadTotal}</span>}
          </h2>
          <button
            ref={botonCerrar}
            type="button"
            className="delete is-medium"
            aria-label="Cerrar carrito"
            onClick={cerrarCarrito}
          />
        </header>

        {items.length === 0 ? (
          <div className="rm-cart-vacio">
            <p className="is-size-1" aria-hidden="true">🛒</p>
            <p className="title is-5 mt-3">Tu carrito está vacío</p>
            <p className="subtitle is-6">Agrega productos para verlos aquí</p>
            <button type="button" className="button is-primary is-rounded" onClick={seguirComprando}>
              Seguir comprando
            </button>
          </div>
        ) : (
          <>
            <ul className="rm-cart-list">
              {items.map((p) => (
                <li key={p.id} className="rm-cart-line">
                  <img className="rm-cart-product-image" src={p.imagen} alt={p.nombre} />

                  <div>
                    <p className="has-text-weight-semibold">{p.nombre}</p>
                    <p className="is-size-7 has-text-grey">
                      {p.presentacion && `${p.presentacion} · `}
                      {formatear(p.precio)}
                    </p>

                    <div className="rm-cart-qty">
                      <button
                        type="button"
                        className="button is-small is-rounded"
                        aria-label={`Quitar una unidad de ${p.nombre}`}
                        onClick={(e) =>
                          p.cantidad === 1
                            ? quitarAnimado(p.id, e.currentTarget.closest('.rm-cart-line'))
                            : restar(p.id)
                        }
                      >
                        −
                      </button>
                      <span aria-live="polite">{p.cantidad}</span>
                      <button
                        type="button"
                        className="button is-small is-rounded"
                        aria-label={`Agregar una unidad de ${p.nombre}`}
                        onClick={() => agregar(p)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="rm-cart-side">
                    <button
                      type="button"
                      className="delete is-small"
                      aria-label={`Quitar ${p.nombre} del carrito`}
                      onClick={(e) => quitarAnimado(p.id, e.currentTarget.closest('.rm-cart-line'))}
                    />
                    <strong>{formatear(p.precio * p.cantidad)}</strong>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="rm-cart-footer">
              <div className="rm-cart-total">
                <span>Total</span>
                <strong>{formatear(total)}</strong>
              </div>
              <button type="button" className="button is-primary is-rounded is-fullwidth" disabled title="Próximamente">
                Finalizar compra
              </button>
              <button type="button" className="button is-light is-rounded is-fullwidth" onClick={vaciar}>
                Vaciar carrito
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}

export default CarritoPanel