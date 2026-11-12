import { useParams } from '../utils/useRoute'
import { CATEGORIAS } from '../data/categorias'
import { useTienda } from '../context/useTienda'
import { Link } from '../utils/Link'
import ProductoCard from '../components/ProductoCard'
export default function CategoriaPage() {
  const { id } = useParams()
  const { productos } = useTienda()
  const categoria = CATEGORIAS.find((c) => c.id === id)
  const visibles = productos.filter((p) => p.categoria === id && p.activo)
  if (!categoria)
    return (
      <main className="container section">
        <h1 className="title">Categoría no encontrada</h1>
        <Link href="/categorias">Ver categorías</Link>
      </main>
    )
  return (
    <main className="section rm-catalog-page">
      <div className="container">
        <Link href="/categorias">← Todas las categorías</Link>
        <header className="rm-catalog-heading">
          <img src={categoria.imagen} alt="" />
          <div>
            <span>CATÁLOGO RIVERMARKET</span>
            <h1>{categoria.nombre}</h1>
            <p>{categoria.detalle}. Encuentra tus favoritos y agrégalos al carrito.</p>
          </div>
        </header>
        <p className="subtitle is-6">{visibles.length} productos en esta categoría</p>
        <div className="rm-product-grid">
          {visibles.map((p) => (
            <ProductoCard key={p.id} producto={p} />
          ))}
        </div>
        {!visibles.length && (
          <div className="rm-empty-state">
            <h2 className="title is-4">Estamos preparando más productos</h2>
            <Link href="/categorias" className="button is-primary is-rounded">
              Explorar otras categorías
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
