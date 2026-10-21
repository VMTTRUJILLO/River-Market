import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const OFERTAS = [
  { id: 1, color: 'warning', texto: 'has-text-dark',  etiqueta: '-30%', titulo: 'Frutas de temporada',   detalle: 'Frescura directa del campo a tu mesa',   emoji: '🍎🍌🍊', boton: 'Ver frutas' },
  { id: 2, color: 'primary', texto: 'has-text-white', etiqueta: '2x1',  titulo: 'Lácteos para el mes',   detalle: 'Leche, queso y yogur al mejor precio',   emoji: '🥛🧀',   boton: 'Ver lácteos' },
  { id: 3, color: 'success', texto: 'has-text-white', etiqueta: '-20%', titulo: 'Verduras frescas',      detalle: 'Del campo a tu cocina cada mañana',      emoji: '🥕🍅🥦', boton: 'Ver verduras' },
  { id: 4, color: 'danger',  texto: 'has-text-white', etiqueta: '-25%', titulo: 'Carnes y huevos',       detalle: 'Proteína de calidad para toda la semana', emoji: '🥩🥚',   boton: 'Ver carnes' },
]

const INTERVALO = 5000

function OfertasCarousel() {
  const contenedor = useRef(null)
  const direccion = useRef(1)
  const [indice, setIndice] = useState(0)
  const [pausado, setPausado] = useState(false)

  const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const mover = (dir) => {
    direccion.current = dir
    setIndice((i) => (i + dir + OFERTAS.length) % OFERTAS.length)
  }

  const irA = (i) => {
    direccion.current = i > indice ? 1 : -1
    setIndice(i)
  }

  // Autoplay: se reinicia con cada cambio y se detiene si hay hover/foco
  useEffect(() => {
    if (pausado || reducirMovimiento) return
    const id = setInterval(() => mover(1), INTERVALO)
    return () => clearInterval(id)
  }, [pausado, indice])

  // Animación de entrada cada vez que cambia la oferta
  useGSAP(
    () => {
      const d = direccion.current
      const dur = reducirMovimiento ? 0 : 0.6
      gsap.fromTo('.rm-slide', { opacity: 0, x: 60 * d }, { opacity: 1, x: 0, duration: dur, ease: 'power3.out' })
      gsap.from('.slide-item', { y: 24, opacity: 0, duration: dur, ease: 'back.out(1.7)', stagger: 0.1, delay: 0.15 })
    },
    { scope: contenedor, dependencies: [indice], revertOnUpdate: true }
  )

  const oferta = OFERTAS[indice]

  return (
    <section id="ofertas" className="section" ref={contenedor}>
      <div className="container">
        <h2 className="title is-3">Ofertas del día</h2>
        <p className="subtitle is-6">Aprovecha antes de que se acaben</p>

        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Ofertas del día"
          onMouseEnter={() => setPausado(true)}
          onMouseLeave={() => setPausado(false)}
          onFocus={() => setPausado(true)}
          onBlur={() => setPausado(false)}
        >
          <div className={`hero is-medium is-${oferta.color} rm-slide`} aria-live={pausado ? 'polite' : 'off'}>
            <div className="hero-body">
              <div className="columns is-vcentered">
                <div className="column is-7">
                  <span className="tag is-dark is-large mb-4 slide-item">{oferta.etiqueta}</span>
                  <h3 className={`title is-2 ${oferta.texto} slide-item`}>{oferta.titulo}</h3>
                  <p className={`subtitle is-5 ${oferta.texto} slide-item`}>{oferta.detalle}</p>
                  <a className="button is-dark is-medium is-rounded slide-item" href="#categorias">{oferta.boton}</a>
                </div>
                <div className="column is-5 has-text-centered">
                  <span className="rm-emoji slide-item" aria-hidden="true">{oferta.emoji}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="is-flex is-justify-content-center is-align-items-center mt-5">
            <button className="button is-light is-rounded" onClick={() => mover(-1)} aria-label="Oferta anterior">‹</button>
            <div className="is-flex is-align-items-center mx-4">
              {OFERTAS.map((o, i) => (
                <button
                  key={o.id}
                  className={`rm-dot ${i === indice ? 'is-active' : ''}`}
                  onClick={() => irA(i)}
                  aria-label={`Ir a la oferta ${i + 1}`}
                  aria-current={i === indice}
                />
              ))}
            </div>
            <button className="button is-light is-rounded" onClick={() => mover(1)} aria-label="Oferta siguiente">›</button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default OfertasCarousel