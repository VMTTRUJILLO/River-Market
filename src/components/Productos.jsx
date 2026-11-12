import { useTienda } from '../context/useTienda'
import { CATEGORIAS } from '../data/categorias'
import { Link } from '../utils/Link'
import { normalizar } from '../utils/format'
import ProductoCard from './ProductoCard'

const destacados = ['banano', 'leche', 'huevos', 'pan', 'tomate', 'queso', 'zanahoria', 'carne']
export default function Productos({ busqueda = '', onLimpiar }) {
  const { productos } = useTienda()
  const termino = normalizar(busqueda)
  const palabras = termino.split(/\s+/)
  const visibles = productos.filter(
    (p) =>
      p.activo &&
      (termino
        ? palabras.every((t) =>
            normalizar(
              `${p.nombre} ${p.presentacion} ${CATEGORIAS.find((c) => c.id === p.categoria)?.nombre || ''}`,
            ).includes(t),
          )
        : destacados.includes(p.id)),
  )
  return (
    <section id="productos" className="section has-background-white">
      <div className="container">
        <div className="rm-section-heading">
          <div>
            <h2 className="title is-3">{termino ? 'Resultados de búsqueda' : 'Productos imperdibles'}</h2>
            <p className="subtitle is-6">
              {termino
                ? 'Encuentra tus favoritos en todo nuestro catálogo'
                : 'Los favoritos de la semana, con precio especial'}
            </p>
          </div>
          {termino && (
            <button className="button is-light is-rounded" onClick={onLimpiar}>
              Limpiar búsqueda
            </button>
          )}
        </div>
        {termino && (
          <p className="rm-search-summary mb-5" role="status">
            {visibles.length} {visibles.length === 1 ? 'producto encontrado' : 'productos encontrados'} para{' '}
            <strong>“{busqueda}”</strong>
          </p>
        )}
        {visibles.length === 0 ? (
          <div className="rm-empty-state">
            <span className="rm-empty-symbol" aria-hidden="true">
              ⌕
            </span>
            <h3 className="title is-4">
              {termino ? 'No encontramos coincidencias' : 'Pronto tendremos más favoritos'}
            </h3>
            <p>
              {termino
                ? 'Prueba con otra palabra, revisa la ortografía o explora nuestras categorías.'
                : 'Explora las categorías para descubrir el catálogo disponible.'}
            </p>
            <div className="buttons is-centered mt-4">
              <button className="button is-primary is-rounded" onClick={onLimpiar}>
                Ver destacados
              </button>
              <Link className="button is-light is-rounded" href="/categorias">
                Explorar categorías
              </Link>
            </div>
          </div>
        ) : (
          <div className="rm-product-grid">
            {visibles.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
        )}
        {visibles.length > 0 && (
          <div className="has-text-centered mt-5">
            <Link href="/categorias" className="button is-primary is-light is-rounded">
              Explorar todo el catálogo →
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
