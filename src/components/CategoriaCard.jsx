import { Link } from '../utils/Link'
import ImagenProducto from './ImagenProducto'
export default function CategoriaCard({ categoria }) {
  return (
    <Link href={`/categoria/${categoria.id}`} className="card rm-category-card">
      <div className="rm-category-image">
        <ImagenProducto src={categoria.imagen} alt={categoria.nombre} loading="lazy" />
      </div>
      <div className="card-content">
        <h3 className="title is-5 mb-2">{categoria.nombre}</h3>
        <p>{categoria.detalle}</p>
      </div>
      <footer className="card-footer">
        <span className="card-footer-item">
          Ver productos <span aria-hidden="true">→</span>
        </span>
      </footer>
    </Link>
  )
}
