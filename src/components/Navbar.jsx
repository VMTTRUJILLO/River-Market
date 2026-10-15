import {useState} from 'react'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav
      className="navbar is-primary is-fixed-top"
      role="navigation"
      aria-label="main navigation"
    >
      <div className="navbar-brand">
        <a className="navbar-item" href="/">
          <strong>RiverMarket</strong>
        </a>

        <a
          role="button"
          className={`navbar-burger ${isMenuOpen ? 'is-active' : ''}`}
          aria-label="menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(!isMenuOpen )}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div className={`navbar-menu ${isMenuOpen ? 'is-active' : ''}`}>
        <div className="navbar-start">
          <a className="navbar-item">Inicio</a>
          <a className="navbar-item">Ofertas</a>

          <div className="navbar-item has-dropdown is-hoverable">
            <a className="navbar-link">Categorías</a>

            <div className="navbar-dropdown">
              <a className="navbar-item">Frutas y verduras</a>
              <a className="navbar-item">Lácteos</a>
              <a className="navbar-item">Despensa</a>
              <hr className="navbar-divider" />
              <a className="navbar-item">Ver todo</a>
            </div>
          </div>

          <a className="navbar-item">Recetas</a>
        </div>

        <div className="navbar-end">
          <div className="navbar-item">
            <div className="buttons">
              <a className="button is-light">Ingresar</a>
              <a className="button is-warning">
                <strong>Carrito</strong>
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar