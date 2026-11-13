import ArrowUpRight from '../components/ArrowUpRight'
import { IMAGENES_CATALOGO } from '../data/imagenesCatalogo'
import { Link } from '../utils/Link'

export default function CreditosPage() {
  return (
    <main className="section rm-catalog-page">
      <div className="container">
        <Link href="/">← Volver a RiverMarket</Link>
        <h1 className="title mt-5">Créditos de fotografía</h1>
        <p className="mb-5">
          Gracias a quienes comparten sus fotografías. Las imágenes del catálogo se muestran con
          tamaño y encuadre adaptados a las tarjetas; conservan las licencias indicadas.
        </p>
        <div className="table-container">
          <table className="table is-fullwidth">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Fotografía</th>
                <th>Autoría</th>
                <th>Licencia</th>
              </tr>
            </thead>
            <tbody>
              {IMAGENES_CATALOGO.map((foto) => (
                <tr key={foto.id}>
                  <td>{foto.nombre}</td>
                  <td>
                    <a href={foto.fuente} target="_blank" rel="noreferrer">
                      Ver original <ArrowUpRight />
                    </a>
                  </td>
                  <td>{foto.autor}</td>
                  <td>
                    <a href={foto.urlLicencia} target="_blank" rel="noreferrer">
                      {foto.licencia}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="is-size-7">
          Las demás fotografías del catálogo proceden de Unsplash. Las imágenes consultadas en
          Nutrición pertenecen a sus colaboradores en Open Food Facts y se enlazan desde cada ficha.
        </p>
      </div>
    </main>
  )
}
