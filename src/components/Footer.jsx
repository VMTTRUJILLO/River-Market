const ENLACES = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Ofertas', href: '#ofertas' },
  { label: 'Productos', href: '#productos' },
  { label: 'Categorías', href: '#categorias' },
  { label: 'Nuestras tiendas', href: '#tiendas' },
]

function Footer() {
  return (
    <footer className="footer rm-footer">
      <div className="container">
        <div className="columns">
          <div className="column is-5">
            <p className="title is-4 has-text-white">RiverMarket</p>
            <p className="has-text-grey-light">
              Productos frescos y precios que fluyen a tu favor, en tienda y a domicilio.
            </p>
          </div>

          <div className="column is-3">
            <p className="title is-6 has-text-white">Explora</p>
            <ul className="rm-footer-links">
              {ENLACES.map(({ label, href }) => (
                <li key={href}><a href={href}>{label}</a></li>
              ))}
            </ul>
          </div>

          <div className="column is-4">
            <p className="title is-6 has-text-white">Atención al cliente</p>
            <ul className="rm-footer-links">
              <li>Línea de atención: (601) 000 0000</li>
              <li>servicio@rivermarket.co</li>
              <li>Lunes a domingo, 7:00 a. m. a 9:00 p. m.</li>
            </ul>
          </div>
        </div>

        <hr className="rm-footer-linea" />
        <p className="is-size-7 has-text-grey-light has-text-centered">
          © {new Date().getFullYear()} RiverMarket · Todos los derechos reservados
        </p>
      </div>
    </footer>
  )
}

export default Footer