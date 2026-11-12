import { CATEGORIAS } from '../data/categorias'
import { Link } from '../utils/Link'
import CategoriaCard from '../components/CategoriaCard'
export default function CategoriasPage() {
  return (
    <main className="section rm-catalog-page">
      <div className="container">
        <Link href="/">← Volver al inicio</Link>
        <h1 className="title is-2 mt-4">Todas las categorías</h1>
        <p className="subtitle">Explora cada sección de nuestro supermercado.</p>
        <div className="rm-category-grid">
          {CATEGORIAS.map((c) => (
            <CategoriaCard key={c.id} categoria={c} />
          ))}
        </div>
      </div>
    </main>
  )
}
