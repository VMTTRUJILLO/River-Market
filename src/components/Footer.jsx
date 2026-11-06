const REDES_SOCIALES = [
  {
    nombre: 'Instagram',
    href: 'https://www.instagram.com/supermercadocalderon/',
    aria: 'Instagram de RiverMarket',
    icono: <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2.2A2.8 2.8 0 0 0 4.2 7v10A2.8 2.8 0 0 0 7 19.8h10a2.8 2.8 0 0 0 2.8-2.8V7A2.8 2.8 0 0 0 17 4.2H7Zm5 2.3a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Zm0 2.2a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6Zm5.8-3.1a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6Z"/> ,
  },
  {
    nombre: 'Facebook',
    href: 'https://www.facebook.com/supermercadocalderonv/',
    aria: 'Facebook de RiverMarket',
    icono: <path d="M13.4 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2v2.2H7.6V13h2.7v8h3.1Z"/>,
  },
  {
    nombre: 'WhatsApp',
    href: 'https://wa.me/3102063867',
    aria: 'WhatsApp de RiverMarket',
    icono: <path d="M12 2a9.8 9.8 0 0 0-8.4 14.8L2.3 22l5.3-1.4A9.9 9.9 0 1 0 12 2Zm0 2.1a7.8 7.8 0 0 1 0 15.6 7.7 7.7 0 0 1-3.9-1l-.4-.2-2.4.6.6-2.3-.3-.4A7.8 7.8 0 0 1 12 4.1Zm-3 3.8c-.2 0-.5.1-.7.4-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.8 2.2.9 2.7.7 3.2.6.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.4l-1.8-.9c-.2-.1-.4-.1-.6.2l-.8 1c-.1.2-.3.2-.6.1-.3-.1-1.2-.4-2.2-1.3-.8-.7-1.3-1.6-1.5-1.9-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.5-.7-.5Z"/>,
  },
]

function Footer() {
  return (
    <footer className="footer rm-footer">
      <div className="container">
        <div className="columns is-variable is-8 rm-footer-main">
          <div className="column is-6 rm-footer-brand">
            <p className="title is-4 has-text-white">RiverMarket</p>
            <p className="has-text-grey-light rm-footer-description">
              Productos frescos y precios que fluyen a tu favor, en tienda y a domicilio.
            </p>
            <div className="rm-footer-socials" aria-label="Redes sociales de RiverMarket">
              {REDES_SOCIALES.map(({ nombre, href, aria, icono }) => (
                <a key={nombre} href={href} className="rm-social-link" aria-label={aria}
                  title={nombre} target="_blank" rel="noreferrer">
                  <svg viewBox="0 0 24 24" role="img" aria-hidden="true">{icono}</svg>
                </a>
              ))}
            </div>
            <p className="rm-footer-social-hint">Síguenos en nuestras redes sociales</p>
          </div>

          <div className="column is-6 rm-footer-contact">
            <p className="title is-6 has-text-white">Atención al cliente</p>
            <ul className="rm-footer-links">
              <li>Línea de atención: (601) 000 0000</li>
              <li><a href="mailto:servicio@rivermarket.co">servicio@rivermarket.co</a></li>
              <li>Lunes a domingo, 7:00 a. m. a 9:00 p. m.</li>
            </ul>
          </div>
        </div>

        <hr className="rm-footer-linea" />
        <div className="rm-footer-bottom">
          <p>© {new Date().getFullYear()} RiverMarket · Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
