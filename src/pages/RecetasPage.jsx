import { RECETAS } from '../data/recetas'
import { useTienda } from '../context/useTienda'
import { useCarrito } from '../context/useCarrito'
import './Recetas.css'

const dinero=n=>n.toLocaleString('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0})
function Receta({ receta }) {
 const { agregar }=useCarrito()
 const { productos: catalogo } = useTienda()
 const productos=receta.productos.map(id=>catalogo.find(p=>p.id===id && p.activo)).filter(Boolean)
 return <article className="rm-recipe-card"><img className="rm-recipe-cover" src={receta.imagen} alt={receta.nombre} loading="lazy"/><div className="rm-recipe-body"><div className="rm-recipe-meta">{receta.tiempo} · {receta.porciones} porciones · {receta.dificultad}</div><h2>{receta.nombre}</h2><p>{receta.descripcion}</p><h3>Ingredientes</h3><ul>{receta.ingredientes.map(i=><li key={i}>{i}</li>)}</ul><h3>Preparación</h3><ol>{receta.pasos.map(p=><li key={p}>{p}</li>)}</ol><h3>Compra los ingredientes</h3><div className="rm-recipe-products">{productos.map(p=><button key={p.id} disabled={p.stock === 0} onClick={()=>agregar(p)}><img src={p.imagen} alt=""/><span>{p.nombre}<b>{dinero(p.precio)}</b></span><strong>+</strong></button>)}</div></div></article>
}
export default function RecetasPage(){return <><main className="section rm-recipes-page"><div className="container"><span className="rm-recipes-eyebrow">INSPÍRATE Y COCINA</span><h1 className="title is-2">Recetas para disfrutar</h1><p className="subtitle">Ideas sencillas, ingredientes frescos y mucho sabor en tu mesa.</p><div className="rm-recipes-grid">{RECETAS.map(r=><Receta key={r.id} receta={r}/>)}</div></div></main></>}
