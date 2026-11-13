import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import CartIcon from './CartIcon'
import PersonIcon from './PersonIcon'
import { useCarrito } from '../context/useCarrito'
import { useAuth } from '../context/useAuth'
import { CATEGORIAS } from '../data/categorias'
import { Link } from '../utils/Link'
import { navigate, useRoute } from '../utils/useRoute'
import './Navbar.css'

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [texto, setTexto] = useState('')
  const { cantidadTotal, abrirCarrito } = useCarrito()
  const { usuario } = useAuth()
  const { path } = useRoute()
  const insignia = useRef(null)
  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        if (cantidadTotal)
          gsap.fromTo(
            insignia.current,
            { scale: 1.4 },
            { scale: 1, duration: 0.55, ease: 'back.out(2)', clearProps: 'transform' },
          )
      })
      return () => media.revert()
    },
    { dependencies: [cantidadTotal], revertOnUpdate: true },
  )
  const enviarBusqueda = (event) => {
    event.preventDefault()
    const termino = texto.trim()
    setTexto('')
    setMenuAbierto(false)
    navigate(termino ? `/?q=${encodeURIComponent(termino)}#productos` : '/#productos')
  }
  const cerrarMenu = () => setMenuAbierto(false)
  return (
    <nav className="navbar is-dark is-fixed-top rm-navbar" aria-label="Navegación principal">
      <div className="navbar-brand">
        <Link className="navbar-item" href="/" onClick={cerrarMenu}>
          <strong className="rm-brand">RiverMarket</strong>
        </Link>
        <button
          type="button"
          className={`navbar-burger ${menuAbierto ? 'is-active' : ''}`}
          aria-label="Abrir menú"
          aria-expanded={menuAbierto}
          aria-controls="rm-navigation"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          <span />
          <span />
          <span />
          <span />
        </button>
      </div>
      <div id="rm-navigation" className={`navbar-menu ${menuAbierto ? 'is-active' : ''}`}>
        <div className="navbar-start">
          {[
            ['/', 'Inicio'],
            ['/#ofertas', 'Ofertas'],
            ['/#productos', 'Productos'],
            ['/recetas', 'Recetas'],
            ['/nutricion', 'Nutrición'],
          ].map(([href, texto]) => (
            <Link className="navbar-item rm-link" href={href} key={href} onClick={cerrarMenu}>
              {texto}
            </Link>
          ))}
          <div className="navbar-item has-dropdown is-hoverable">
            <Link
              className="navbar-link is-arrowless rm-cat-link"
              href="/categorias"
              onClick={cerrarMenu}
            >
              Categorías
              <span className="rm-caret" aria-hidden="true" />
            </Link>
            <div className="navbar-dropdown">
              <Link className="navbar-item" href="/categorias" onClick={cerrarMenu}>
                <b>Ver todas las categorías</b>
              </Link>
              <hr className="navbar-divider" />
              {CATEGORIAS.map((c) => (
                <Link
                  key={c.id}
                  className="navbar-item"
                  href={`/categoria/${c.id}`}
                  onClick={cerrarMenu}
                >
                  {c.nombre}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <form className="navbar-item rm-search" role="search" onSubmit={enviarBusqueda}>
          <input
            className="input is-rounded"
            type="search"
            placeholder="Buscar productos..."
            aria-label="Buscar productos"
            maxLength={100}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
          <button type="submit" className="button is-warning is-rounded" aria-label="Buscar">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="10" cy="10" r="6" />
              <path d="m15 15 6 6" />
            </svg>
          </button>
        </form>
        <div className="navbar-end">
          {usuario?.rol === 'admin' && (
            <Link
              href="/admin"
              onClick={cerrarMenu}
              className={`navbar-item rm-admin-link ${path === '/admin' ? 'is-active' : ''}`}
            >
              Administrar
            </Link>
          )}
          <Link className="navbar-item" href="/ingresar" onClick={cerrarMenu}>
            <span className="icon has-text-warning">
              <PersonIcon />
            </span>
            <span className="ml-2 rm-user-name">{usuario ? usuario.nombre : 'Mi cuenta'}</span>
          </Link>
          <button
            type="button"
            className="navbar-item rm-cart-btn"
            aria-label={`Abrir carrito, ${cantidadTotal} productos`}
            onClick={() => {
              cerrarMenu()
              abrirCarrito()
            }}
          >
            <span className="icon is-medium rm-cart">
              <CartIcon />
              <span ref={insignia} className="tag is-warning is-rounded rm-badge">
                {cantidadTotal}
              </span>
            </span>
          </button>
        </div>
      </div>
    </nav>
  )
}
