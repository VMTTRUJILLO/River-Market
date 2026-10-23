import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import CartIcon from './CartIcon'
import PersonIcon from './PersonIcon'
import { useCarrito } from '../context/CarritoContext'
import { CATEGORIAS } from '../data/categorias'
import './Navbar.css'

gsap.registerPlugin(useGSAP)

const ITEMS = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Ofertas', href: '#ofertas' },
  { label: 'Productos', href: '#productos' },
]
const SECCIONES = ['inicio', 'ofertas', 'productos', 'categorias']

const Navbar = ({ busqueda, onBuscar }) => {
  const navRef = useRef(null)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [activo, setActivo] = useState('#inicio')
  const { cantidadTotal } = useCarrito()

  const irA = (href) => {
    setActivo(href)
    setMenuAbierto(false)
  }

  const enviarBusqueda = (e) => {
    e.preventDefault()
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })
    setMenuAbierto(false)
  }

  // Scroll-spy: marca la sección que está en la franja central de la pantalla
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) setActivo(`#${e.target.id}`)
        })
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    SECCIONES.forEach((id) => {
      const seccion = document.getElementById(id)
      if (seccion) observer.observe(seccion)
    })
    return () => observer.disconnect()
  }, [])

  // El contador del carrito rebota al cambiar
  useGSAP(
    () => {
      if (cantidadTotal > 0) {
        gsap.fromTo('.rm-badge', { scale: 1.7 }, { scale: 1, duration: 0.45, ease: 'back.out(3)' })
      }
    },
    { scope: navRef, dependencies: [cantidadTotal] }
  )

  return (
    <nav ref={navRef} className="navbar is-dark is-fixed-top rm-navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <a className="navbar-item" href="#inicio" onClick={() => irA('#inicio')}>
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

           <a
              className="navbar-item rm-link"
              href="#"
              data-text="Recetas"
              title="Próximamente"
              aria-disabled="true"
              onClick={(e) => e.preventDefault()}
            >
              <span className="rm-link__text">Recetas</span>
            </a>

          <div className="navbar-item has-dropdown is-hoverable">
            {/* Página de otro módulo: el botón existe, pero todavía no tiene enlace activo */}
            <a
              href="#categorias"
              data-text="Categorías ▾"
              className={`navbar-link is-arrowless rm-link ${activo === '#categorias' ? 'rm-activo' : ''}`}
              onClick={() => irA('#categorias')}
            >
              <span className="rm-link__text">Categorías ▾</span>
            </a>

            <div className="navbar-dropdown">
              <a className="navbar-item" href="#categorias" onClick={() => irA('#categorias')}>
                <span className="has-text-weight-bold">Ver todas las categorías</span>
              </a>
              <hr className="navbar-divider" />
              {CATEGORIAS.map((c) => (
                <a key={c.id} className="navbar-item" href="#categorias" onClick={() => irA('#categorias')}>
                  <span className="mr-2" aria-hidden="true">{c.emoji}</span>
                  {c.nombre}
                </a>
              ))}
            </div>
          </div>
        </div>

        <form className="navbar-item rm-search" role="search" onSubmit={enviarBusqueda}>
          <div className="control has-icons-left is-expanded">
            <input
              className="input is-rounded"
              type="search"
              placeholder="Buscar productos..."
              aria-label="Buscar productos"
              value={busqueda}
              onChange={(e) => onBuscar(e.target.value)}
            />
            <span className="icon is-left">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </span>
          </div>
        </form>

        <div className="navbar-end">
          <a className="navbar-item" href="#ingresar">
            <span className="icon is-medium has-text-warning">
              <PersonIcon />
            </span>
            <span className="is-flex is-flex-direction-column ml-2 is-hidden-desktop-only">
              <span className="is-size-7 has-text-grey-light">Mi cuenta</span>
              <span className="has-text-weight-bold">Ingresa o regístrate</span>
            </span>
          </a>

          <a className="navbar-item" href="#carrito" aria-label={`Carrito de compras, ${cantidadTotal} productos`}>
            <span className="icon is-medium rm-cart">
              <CartIcon />
              <span className="tag is-warning is-rounded rm-badge">{cantidadTotal}</span>
            </span>
          </a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar