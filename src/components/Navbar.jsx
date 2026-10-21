import { useState } from 'react'
import './Navbar.css'

const ITEMS = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Ofertas', href: '#ofertas' },
  { label: 'Categorías', href: '#categorias' },
  { label: 'Recetas', href: '#recetas' },
]

const CartLogo = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
)

const Navbar = () => {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [activo, setActivo] = useState('#inicio')

  const irA = (href) => {
    setActivo(href)
    setMenuAbierto(false)
  }

  return (
    <nav className="navbar is-dark is-fixed-top rm-navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <a className="navbar-item" href="#inicio">
          <span className="icon is-medium"><CartLogo /></span>
          <strong className="rm-brand">RiverMarket</strong>
        </a>

        <a
          role="button"
          className={`navbar-burger ${menuAbierto ? 'is-active' : ''}`}
          aria-label="menu"
          aria-expanded={menuAbierto}
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div className={`navbar-menu ${menuAbierto ? 'is-active' : ''}`}>
        <div className="navbar-start">
          {ITEMS.map(({ label, href }) => (
            <a
              key={href}
                href={href}
                data-text={label}
                className={`navbar-item is-tab rm-link ${activo === href ? 'is-active' : ''}`}
                onClick={() => irA(href)}
              >
              <span className="rm-link__text">{label}</span>
            </a>
          ))}
        </div>

        <div className="navbar-end">
          <div className="navbar-item">
            <div className="buttons">
              <a className="button is-light is-rounded" href="#ingresar">Ingresar</a>
              <a className="button is-warning is-rounded" href="#registro"><strong>Registrarse</strong></a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar