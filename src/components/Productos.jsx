import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useCarrito } from '../context/CarritoContext'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const PRODUCTOS = [
  { id: 'banano',    emoji: '🍌', nombre: 'Banano criollo',      presentacion: 'Kilo',          precio: 3200,  precioAntes: 4200 },
  { id: 'leche',     emoji: '🥛', nombre: 'Leche entera',        presentacion: 'Bolsa 1.000 ml', precio: 4300,  precioAntes: 5100 },
  { id: 'huevos',    emoji: '🥚', nombre: 'Huevos rojos',        presentacion: 'Cubeta x30',    precio: 17900, precioAntes: 21500 },
  { id: 'pan',       emoji: '🥖', nombre: 'Pan tajado integral', presentacion: '500 g',         precio: 6900,  precioAntes: 8200 },
  { id: 'tomate',    emoji: '🍅', nombre: 'Tomate chonto',       presentacion: 'Kilo',          precio: 4800,  precioAntes: 5900 },
  { id: 'queso',     emoji: '🧀', nombre: 'Queso campesino',     presentacion: '500 g',         precio: 14900, precioAntes: 18900 },
  { id: 'zanahoria', emoji: '🥕', nombre: 'Zanahoria',           presentacion: 'Kilo',          precio: 2900,  precioAntes: 3600 },
  { id: 'carne',     emoji: '🥩', nombre: 'Carne molida de res', presentacion: '500 g',         precio: 15900, precioAntes: 19900 },
]

const formatear = (n) =>
  n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

function ProductoCard({ p }) {
  const { agregar } = useCarrito()
  const [agregado, setAgregado] = useState(false)
  const descuento = Math.round((1 - p.precio / p.precioAntes) * 100)

  const alAgregar = () => {
    agregar(p)
    setAgregado(true)
    setTimeout(() => setAgregado(false), 1200)
  }

  return (
    <div className="column is-half-mobile is-one-third-tablet is-one-quarter-desktop rm-prod">
      <div className="card">
        <span className="tag is-warning is-rounded rm-desc">-{descuento}%</span>
        <div className="card-content">
          <p className="is-size-1 has-text-centered" aria-hidden="true">{p.emoji}</p>
          <h3 className="title is-6 mt-3 mb-1">{p.nombre}</h3>
          <p className="is-size-7 has-text-grey">{p.presentacion}</p>
          <p className="rm-precio mt-2">{formatear(p.precio)}</p>
          <p className="is-size-7 has-text-grey mb-3"><del>{formatear(p.precioAntes)}</del></p>
          <button
            className={`button is-fullwidth is-rounded ${agregado ? 'is-success' : 'is-primary'}`}
            onClick={alAgregar}
          >
            {agregado ? '✓ Agregado' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Productos() {
  const contenedor = useRef(null)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.from('.rm-prod', {
        opacity: 0,
        y: 50,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: '.rm-prod-grid', start: 'top 80%', once: true },
      })
    },
    { scope: contenedor }
  )

  return (
    <section id="productos" ref={contenedor} className="section">
      <div className="container">
        <h2 className="title is-3">Productos imperdibles</h2>
        <p className="subtitle is-6">Los favoritos de la semana, con precio especial</p>

        <div className="columns is-multiline is-mobile rm-prod-grid">
          {PRODUCTOS.map((p) => (
            <ProductoCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Productos