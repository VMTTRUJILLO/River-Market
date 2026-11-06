import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useCarrito } from '../context/CarritoContext'
import { PRODUCTOS_DESTACADOS } from '../data/productos'

gsap.registerPlugin(useGSAP, ScrollTrigger)
const formatear = n => n.toLocaleString('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 })

function ProductoCard({ p }) {
  const { agregar } = useCarrito()
  const [agregado, setAgregado] = useState(false)
  const descuento = Math.round((1 - p.precio / p.precioAntes) * 100)
  const alAgregar = () => { agregar(p); setAgregado(true); setTimeout(() => setAgregado(false), 1200) }
  return <div className="column is-half-mobile is-one-third-tablet is-one-quarter-desktop rm-prod">
    <div className="card">
      <span className="tag is-warning is-rounded rm-desc">-{descuento}%</span>
      <div className="rm-product-image"><img src={p.imagen} alt={p.nombre} loading="lazy"/></div>
      <div className="card-content">
        <h3 className="title is-6 mt-1 mb-1">{p.nombre}</h3>
        <p className="is-size-7 has-text-grey">{p.presentacion}</p>
        <p className="rm-precio mt-2">{formatear(p.precio)}</p>
        <p className="is-size-7 has-text-grey mb-3"><del>{formatear(p.precioAntes)}</del></p>
        <button className={`button is-fullwidth is-rounded ${agregado ? 'is-success' : 'is-primary'}`} onClick={alAgregar}>{agregado ? '✓ Agregado' : 'Agregar'}</button>
      </div>
    </div>
  </div>
}

const normalizar = t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
export default function Productos({ busqueda = '', onLimpiar }) {
  const contenedor = useRef(null)
  const termino = normalizar(busqueda.trim())
  const visibles = PRODUCTOS_DESTACADOS.filter(p => normalizar(p.nombre).includes(termino))
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.from('.rm-prod', { opacity:0, y:50, duration:.6, ease:'power3.out', stagger:.08, scrollTrigger:{ trigger:'.rm-prod-grid', start:'top 80%', once:true } })
  }, { scope:contenedor })
  return <section id="productos" ref={contenedor} className="section has-background-white"><div className="container">
    <h2 className="title is-3">Productos imperdibles</h2><p className="subtitle is-6">Los favoritos de la semana, con precio especial</p>
    {termino && <p className="mb-4">{visibles.length} resultado(s) para <b>“{busqueda}”</b> <button className="button is-small is-light is-rounded ml-2" onClick={onLimpiar}>Limpiar búsqueda</button></p>}
    {visibles.length === 0 && <div className="notification is-warning is-light">No encontramos ese producto entre los destacados. Explora las categorías para ver el catálogo completo.</div>}
    <div className="columns is-multiline is-mobile rm-prod-grid">{visibles.map(p=><ProductoCard key={p.id} p={p}/>)}</div>
    <div className="has-text-centered mt-4"><a href="/categorias" className="button is-primary is-rounded">Explorar todo el catálogo</a></div>
  </div></section>
}
