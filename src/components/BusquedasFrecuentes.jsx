import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const BUSQUEDAS = [
  { termino: 'Leche', emoji: '🥛' },
  { termino: 'Huevos', emoji: '🥚' },
  { termino: 'Pan', emoji: '🥖' },
  { termino: 'Queso', emoji: '🧀' },
  { termino: 'Carne', emoji: '🥩' },
  { termino: 'Banano', emoji: '🍌' },
  { termino: 'Tomate', emoji: '🍅' },
  { termino: 'Zanahoria', emoji: '🥕' },
]

function BusquedasFrecuentes({ onElegir }) {
  const contenedor = useRef(null)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.from('.rm-chip', {
        opacity: 0,
        scale: 0.6,
        duration: 0.4,
        ease: 'back.out(2)',
        stagger: 0.07,
        scrollTrigger: { trigger: '.rm-chips', start: 'top 85%', once: true },
      })
    },
    { scope: contenedor }
  )

  return (
    <section id="frecuentes" ref={contenedor} className="section">
      <div className="container">
        <h2 className="title is-3">Búsquedas frecuentes</h2>
        <p className="subtitle is-6">Encuentra más rápido lo que otros clientes buscan</p>

        <div className="buttons rm-chips">
          {BUSQUEDAS.map(({ termino, emoji }) => (
            <button
              key={termino}
              className="button is-rounded is-primary is-light rm-chip"
              onClick={() => onElegir(termino)}
            >
              <span className="icon is-small" aria-hidden="true">{emoji}</span>
              <span>{termino}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BusquedasFrecuentes