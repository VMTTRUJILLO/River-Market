import { useCarrito } from '../context/useCarrito'
import { dinero } from '../utils/format'
import ImagenProducto from './ImagenProducto'

export default function ProductoCard({ producto: p }) {
  const { agregar, items } = useCarrito()
  const cantidad = items.find((i) => i.id === p.id)?.cantidad || 0
  const descuento = p.precioAntes > p.precio ? Math.round((1 - p.precio / p.precioAntes) * 100) : 0
  return (
    <article className="card rm-product-card">
      <div className="rm-product-image">
        <ImagenProducto src={p.imagen} alt={p.nombre} loading="lazy" />
        {descuento > 0 && <span className="tag is-warning is-rounded rm-desc">−{descuento}%</span>}
      </div>
      <div className="card-content">
        <h3 className="title is-6 mb-1">{p.nombre}</h3>
        <p className="rm-presentation">{p.presentacion}</p>
        <div className="rm-product-prices">
          <strong className="rm-precio">{dinero(p.precio)}</strong>
          <span className="rm-old-price">{descuento > 0 && <del>{dinero(p.precioAntes)}</del>}</span>
        </div>
        <p className={`rm-stock ${p.stock === 0 ? 'has-text-danger' : ''}`}>
          {p.stock === 0 ? 'Agotado por ahora' : p.stock <= 5 ? `¡Quedan ${p.stock}!` : 'Disponible'}
          {cantidad > 0 ? ` · ${cantidad} en tu carrito` : ''}
        </p>
        <button
          className="button is-primary is-fullwidth is-rounded"
          onClick={() => agregar(p)}
          disabled={p.stock === 0 || cantidad >= p.stock}
          aria-label={`Agregar ${p.nombre} al carrito`}
        >
          {p.stock === 0 ? 'Agotado' : cantidad >= p.stock ? 'Máximo en carrito' : 'Agregar al carrito'}
        </button>
      </div>
    </article>
  )
}
