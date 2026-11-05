import { useParams } from '../utils/useRoute'
import { CATEGORIAS } from '../data/categorias'
import { PRODUCTOS } from '../data/productos'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CarritoPanel from '../components/CarritoPanel'
import { useCarrito } from '../context/CarritoContext'
import './Catalogo.css'

const dinero = n => n.toLocaleString('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0})
function Tarjeta({ producto }) {
 const { agregar } = useCarrito()
 return <article className="rm-catalog-card"><img src={producto.imagen} alt={producto.nombre} loading="lazy"/><div><h3>{producto.nombre}</h3><p>{producto.presentacion}</p><strong>{dinero(producto.precio)}</strong>{producto.precioAntes && <del>{dinero(producto.precioAntes)}</del>}<button onClick={()=>agregar(producto)}>Agregar al carrito</button></div></article>
}
export default function CategoriaPage(){
 const { id } = useParams()
 const categoria=CATEGORIAS.find(c=>c.id===id)
 const productos=PRODUCTOS.filter(p=>p.categoria===id)
 if(!categoria) return <><Navbar/><main className="container section"><h1 className="title">Categoría no encontrada</h1><a href="/">Volver al inicio</a></main><Footer/></>
 return <><Navbar/><main className="section rm-catalog-page"><div className="container"><a href="/#categorias">← Todas las categorías</a><header className="rm-catalog-heading"><img src={categoria.imagen} alt=""/><div><span>CATÁLOGO RIVERMARKET</span><h1>{categoria.nombre}</h1><p>{categoria.detalle}. Encuentra tus favoritos y agrégalos al carrito.</p></div></header><p className="subtitle is-6">{productos.length} productos disponibles</p><div className="rm-catalog-grid">{productos.map(p=><Tarjeta key={p.id} producto={p}/>)}</div></div></main><Footer/><CarritoPanel/></>
}
