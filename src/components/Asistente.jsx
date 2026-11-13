import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useAuth } from '../context/useAuth'
import { useTienda } from '../context/useTienda'
import { useCarrito } from '../context/useCarrito'
import { responderAsistente } from '../domain/asistente'
import {
  claveConversacion,
  crearMensaje,
  nuevaConversacion,
  restaurarConversacion,
  rutaChatValida,
} from '../domain/conversacion'
import { dinero } from '../utils/format'
import { navigate } from '../utils/useRoute'
import ImagenProducto from './ImagenProducto'
import './Asistente.css'

gsap.registerPlugin(useGSAP)

function IconoRiver({ tipo = 'river' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {tipo === 'cerrar' ? (
        <path d="m6 6 12 12M18 6 6 18" />
      ) : tipo === 'enviar' ? (
        <path d="m5 12 7-7 7 7M12 5v14" />
      ) : tipo === 'reiniciar' ? (
        <>
          <path d="M4 10a8 8 0 1 1 1 7M4 4v6h6" />
        </>
      ) : (
        <>
          <path d="M20 11a8 8 0 0 1-8 8H5l-3 3V11a9 9 0 0 1 18 0Z" />
          <path d="M7 12c2 3 6 3 8 0M8 8h.01M14 8h.01" />
        </>
      )}
    </svg>
  )
}

export default function Asistente() {
  const { usuario } = useAuth()
  const { productos, ventas } = useTienda()
  const { items, agregar, abrirCarrito, abierto: carritoAbierto } = useCarrito()
  const clave = claveConversacion(usuario)
  const [conversacion, setConversacion] = useState(() => {
    try {
      return restaurarConversacion(JSON.parse(sessionStorage.getItem(clave)))
    } catch {
      return nuevaConversacion()
    }
  })
  const actual = useRef(conversacion)
  const [abierto, setAbierto] = useState(false)
  const [texto, setTexto] = useState('')
  const raiz = useRef(null),
    panel = useRef(null),
    lista = useRef(null),
    campo = useRef(null),
    lanzador = useRef(null)
  const visible = abierto && !carritoAbierto
  const cerrar = () => {
    setAbierto(false)
    lanzador.current?.focus({ preventScroll: true })
  }
  // El cambio se resuelve antes de pintar; el chat no reaparece al cerrar el carrito.
  if (carritoAbierto && abierto) setAbierto(false)
  useEffect(() => {
    const viewport = window.visualViewport
    const ajustar = () => {
      const alto = viewport?.height || window.innerHeight
      const teclado = Math.max(0, window.innerHeight - alto - (viewport?.offsetTop || 0))
      raiz.current?.style.setProperty('--rm-chat-alto', `${alto}px`)
      raiz.current?.style.setProperty('--rm-chat-teclado', `${teclado}px`)
      if (raiz.current) raiz.current.dataset.compacto = String(alto < 500)
    }
    ajustar()
    viewport?.addEventListener('resize', ajustar)
    viewport?.addEventListener('scroll', ajustar)
    window.addEventListener('resize', ajustar)
    return () => {
      viewport?.removeEventListener('resize', ajustar)
      viewport?.removeEventListener('scroll', ajustar)
      window.removeEventListener('resize', ajustar)
    }
  }, [])
  useEffect(() => {
    if (!visible) return
    const frame = requestAnimationFrame(() => campo.current?.focus({ preventScroll: true }))
    return () => cancelAnimationFrame(frame)
  }, [visible])
  useEffect(() => {
    try {
      sessionStorage.setItem(clave, JSON.stringify(conversacion))
    } catch {
      /* El chat sigue funcionando en memoria. */
    }
  }, [clave, conversacion])
  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add(
        {
          reducido: '(prefers-reduced-motion: reduce)',
          normal: '(prefers-reduced-motion: no-preference)',
        },
        (contexto) => {
          gsap.to(panel.current, {
            autoAlpha: visible ? 1 : 0,
            y: visible ? 0 : 16,
            scale: visible ? 1 : 0.97,
            duration: contexto.conditions.reducido ? 0 : 0.28,
            ease: 'power3.out',
            overwrite: true,
          })
        },
      )
      return () => media.revert()
    },
    { scope: raiz, dependencies: [visible], revertOnUpdate: true },
  )
  const ultimoId = conversacion.mensajes.at(-1)?.id
  useGSAP(
    () => {
      if (!visible) return
      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const ultimos = Array.from(lista.current.querySelectorAll('[data-chat-message]')).slice(-2)
        gsap.fromTo(
          ultimos,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.3,
            stagger: 0.06,
            ease: 'power2.out',
            clearProps: 'opacity,transform',
          },
        )
      })
      return () => media.revert()
    },
    { scope: raiz, dependencies: [ultimoId, visible], revertOnUpdate: true },
  )
  useEffect(() => {
    if (!visible) return
    const elemento = lista.current
    const ultimo = elemento.lastElementChild
    // Una respuesta larga comienza por su encabezado; el usuario puede recorrer sus tarjetas.
    const top = Math.max(
      0,
      Math.min(elemento.scrollHeight - elemento.clientHeight, (ultimo?.offsetTop || 0) - 12),
    )
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elemento.scrollTop = top
      return
    }
    const tween = gsap.to(elemento, {
      scrollTop: top,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: true,
    })
    return () => tween.kill()
  }, [ultimoId, visible])

  const guardarRespuesta = (consulta, respuesta) => {
    const { operacion, contexto, ...contenido } = respuesta
    let mensaje = contenido
    if (operacion) {
      const producto = productos.find((p) => p.id === operacion.productoId && p.activo)
      const correcto = producto && agregar(producto, operacion.cantidad)
      mensaje = correcto
        ? {
            texto: `¡Listo! Agregué ${operacion.cantidad} × ${producto.nombre} a tu carrito.`,
            acciones: [{ tipo: 'carrito', etiqueta: 'Ver mi carrito' }],
            sugerencias: ['Seguir buscando', 'Ver ofertas'],
          }
        : {
            texto:
              'No pude agregar el producto. Revisa su disponibilidad y el aviso de la tienda antes de volver a intentarlo.',
            acciones: [{ tipo: 'carrito', etiqueta: 'Revisar carrito' }],
          }
    }
    const nuevo = {
      mensajes: [
        ...actual.current.mensajes,
        crearMensaje('usuario', { texto: consulta }),
        crearMensaje('river', mensaje),
      ].slice(-40),
      contexto: contexto || actual.current.contexto,
    }
    actual.current = nuevo
    setConversacion(nuevo)
    setTexto('')
  }
  const consultar = (consulta) => {
    const limpio = consulta.trim().slice(0, 400)
    if (!limpio) return
    guardarRespuesta(
      limpio,
      responderAsistente(limpio, { productos, ventas, items, usuario }, actual.current.contexto),
    )
  }
  const agregarProducto = (id, cantidad = 1) => {
    const producto = productos.find((p) => p.id === id && p.activo)
    guardarRespuesta(`Agregar ${cantidad} × ${producto?.nombre || 'producto'}`, {
      operacion: { productoId: id, cantidad },
      contexto: { ...actual.current.contexto, ids: [id] },
    })
  }
  const ejecutar = (accion) => {
    if (accion.tipo === 'carrito') {
      setAbierto(false)
      abrirCarrito()
    } else if (accion.tipo === 'ruta' && rutaChatValida(accion.valor)) {
      cerrar()
      navigate(accion.valor)
    }
  }
  const reiniciar = () => {
    const nuevo = nuevaConversacion()
    actual.current = nuevo
    setConversacion(nuevo)
    setTexto('')
    campo.current?.focus({ preventScroll: true })
  }
  return (
    <div className="rm-chat-widget" ref={raiz}>
      <section
        ref={panel}
        className="rm-chat-panel"
        data-abierto={visible}
        role="dialog"
        id="rm-chat-panel"
        aria-labelledby="rm-chat-titulo"
        aria-hidden={!visible}
        inert={!visible}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            cerrar()
          }
        }}
      >
        <header className="rm-chat-header">
          <span className="rm-chat-avatar">
            <IconoRiver />
          </span>
          <div>
            <h2 id="rm-chat-titulo">River</h2>
            <p>Tu asistente de compras</p>
          </div>
          <button
            type="button"
            className="rm-chat-icon"
            aria-label="Reiniciar conversación"
            title="Reiniciar conversación"
            onClick={reiniciar}
          >
            <IconoRiver tipo="reiniciar" />
          </button>
          <button
            type="button"
            className="rm-chat-icon"
            aria-label="Cerrar asistente"
            onClick={cerrar}
          >
            <IconoRiver tipo="cerrar" />
          </button>
        </header>
        <div className="rm-chat-intro">
          <span aria-hidden="true" /> Productos, precios y ayuda para tu mercado
        </div>
        <div
          ref={lista}
          className="rm-chat-messages"
          role="log"
          aria-label="Conversación con River"
          aria-live="polite"
          aria-relevant="additions"
          tabIndex={0}
        >
          {conversacion.mensajes.map((mensaje) => (
            <div
              key={mensaje.id}
              data-chat-message
              className={`rm-chat-message ${mensaje.autor === 'usuario' ? 'is-user' : 'is-river'}`}
            >
              <span className="rm-chat-author">{mensaje.autor === 'usuario' ? 'Tú' : 'River'}</span>
              <p className="rm-chat-bubble">{mensaje.texto}</p>
              {mensaje.productos?.length > 0 && (
                <ol className="rm-chat-products">
                  {mensaje.productos.map((id, index) => {
                    const producto = productos.find((p) => p.id === id && p.activo)
                    const cantidad = mensaje.cantidad || 1
                    const agregados = items.find((p) => p.id === id)?.cantidad || 0
                    return (
                      <li key={id} className="rm-chat-product">
                        {producto ? (
                          <>
                            <ImagenProducto
                              src={producto.imagen}
                              alt={producto.nombre}
                              loading="lazy"
                            />
                            <div>
                              <span className="rm-chat-product-number">{index + 1}.</span>{' '}
                              <strong>{producto.nombre}</strong>
                              <small>{producto.presentacion}</small>
                              <b>{dinero(producto.precio)}</b>
                              <small>
                                {producto.stock > 0 ? `${producto.stock} disponibles` : 'Agotado'}
                              </small>
                            </div>
                            <button
                              type="button"
                              className="button is-primary is-small is-rounded"
                              disabled={producto.stock < agregados + cantidad}
                              aria-label={`Agregar ${cantidad} ${producto.nombre} desde el chat`}
                              onClick={() => agregarProducto(id, cantidad)}
                            >
                              {producto.stock === 0 ? 'Agotado' : `+ ${cantidad}`}
                            </button>
                          </>
                        ) : (
                          <p>Este producto ya no está disponible en el catálogo.</p>
                        )}
                      </li>
                    )
                  })}
                </ol>
              )}
              {mensaje.acciones?.length > 0 && (
                <div className="rm-chat-actions">
                  {mensaje.acciones.map((accion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="button is-small is-primary is-light is-rounded"
                      onClick={() => ejecutar(accion)}
                    >
                      {accion.etiqueta}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="rm-chat-suggestions" aria-label="Consultas sugeridas">
          {(conversacion.mensajes.at(-1)?.sugerencias || []).map((sugerencia) => (
            <button type="button" key={sugerencia} onClick={() => consultar(sugerencia)}>
              {sugerencia}
            </button>
          ))}
        </div>
        <form
          className="rm-chat-form"
          onSubmit={(event) => {
            event.preventDefault()
            consultar(texto)
          }}
        >
          <label className="is-sr-only" htmlFor="rm-chat-input">
            Mensaje para River
          </label>
          <textarea
            id="rm-chat-input"
            ref={campo}
            rows={1}
            maxLength={400}
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault()
                consultar(texto)
              }
            }}
            placeholder="¿Qué buscas para tu mercado?"
          />
          <button
            type="submit"
            className="rm-chat-send"
            disabled={!texto.trim()}
            aria-label="Enviar mensaje"
          >
            <IconoRiver tipo="enviar" />
          </button>
        </form>
        <p className="rm-chat-foot">RiverMarket · A un mensaje de tu próximo favorito</p>
      </section>
      <button
        ref={lanzador}
        type="button"
        className="rm-chat-launcher"
        hidden={carritoAbierto}
        aria-label={visible ? 'Cerrar asistente de RiverMarket' : 'Abrir asistente de RiverMarket'}
        aria-expanded={visible}
        aria-controls="rm-chat-panel"
        onClick={() => (visible ? cerrar() : setAbierto(true))}
      >
        <IconoRiver tipo={visible ? 'cerrar' : 'river'} />
        <span>{visible ? 'Cerrar chat' : '¿Te ayudo?'}</span>
        <i aria-hidden="true" />
      </button>
    </div>
  )
}
