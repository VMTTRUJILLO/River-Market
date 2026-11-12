import { CATEGORIAS } from '../data/categorias'
import { Link } from '../utils/Link'
import CategoriaCard from './CategoriaCard'
export default function Categorias() {
  return (
    <section id="categorias" className="section">
      <div className="container">
        <h2 className="title is-3">Categorías</h2>
        <p className="subtitle is-6">Encuentra todo lo que necesitas en un solo lugar</p>
        <div className="rm-category-grid">
          {CATEGORIAS.map((c) => (
            <CategoriaCard key={c.id} categoria={c} />
          ))}
        </div>
        <div className="has-text-centered mt-5">
          <Link href="/categorias" className="button is-primary is-rounded">
            Ver todas las categorías
          </Link>
        </div>
      </div>
    </section>
  )
}
