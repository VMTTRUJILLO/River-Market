import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { CATEGORIAS } from '../data/categorias'

gsap.registerPlugin(useGSAP, ScrollTrigger)

function Categorias() {
  const contenedor = useRef(null)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      gsap.from('.rm-cat', {
        opacity: 0,
        y: 50,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: '.rm-cat-grid',
          start: 'top 80%',
          once: true,
        },
      })
    },
    { scope: contenedor }
  )

  return (
    <section id="categorias" ref={contenedor} className="section">
      <div className="container">
        <h2 className="title is-3">Categorías</h2>
        <p className="subtitle is-6">Encuentra todo lo que necesitas en un solo lugar</p>

        <div className="columns is-multiline is-mobile rm-cat-grid">
          {CATEGORIAS.map((c) => (
            <div
              key={c.id}
              className="column is-half-mobile is-one-third-tablet is-one-quarter-desktop rm-cat"
            >
              <div className="card">
                <div className="card-content has-text-centered">
                  <p className="is-size-1" aria-hidden="true">{c.emoji}</p>
                  <h3 className="title is-5 mt-3 mb-1">{c.nombre}</h3>
                  <p className="subtitle is-6">{c.detalle}</p>
                </div>
                <footer className="card-footer">
                  <a href="#categorias" className="card-footer-item">Ver productos</a>
                </footer>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Categorias