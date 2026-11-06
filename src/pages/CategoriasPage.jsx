import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { CATEGORIAS } from '../data/categorias'
import './Catalogo.css'
export default function CategoriasPage(){return <><Navbar/><main className="section rm-catalog-page"><div className="container"><a href="/">← Volver al inicio</a><h1 className="title is-2 mt-4">Todas las categorías</h1><p className="subtitle">Explora cada sección de nuestro supermercado.</p><div className="rm-category-grid">{CATEGORIAS.map(c=><a className="rm-category-tile" href={`/categoria/${c.id}`} key={c.id}><img src={c.imagen} alt={c.nombre}/><span><b>{c.nombre}</b><small>{c.detalle}</small></span></a>)}</div></div></main><Footer/></>}
