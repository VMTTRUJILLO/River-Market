import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import CartIcon from './CartIcon'
import PersonIcon from './PersonIcon'
import { useCarrito } from '../context/CarritoContext'
import './Navbar.css'

gsap.registerPlugin(useGSAP)

const ITEMS = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Ofertas', href: '#ofertas' },
  { label: 'Categorías', href: '#categorias' },
  { label: 'Productos', href: '#productos' },
  { label: 'Recetas', href: '#recetas' },
]

const Navbar = () => {
  const navRef = useRef(null)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [activo, setActivo] = useState('#inicio')
  const { cantidadTotal } = useCarrito()

  const irA = (href) => {
    setActivo(href)
    setMenuAbierto(false)
  }

  // Scroll-spy: marca como activa la sección que está en la franja central de la pantalla
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) setActivo(`#${e.target.id}`)
        })
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    ITEMS.forEach(({ href }) => {
      const seccion = document.getElementById(href.slice(1))
      if (seccion) observer.observe(seccion)
    })
    return () => observer.disconnect()
  }, [])

  // El contador "rebota" cada vez que cambia
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
        </div>

        <div className="navbar-end">
          <a className="navbar-item" href="#ingresar">
            <span className="icon is-medium has-text-warning">
              <PersonIcon />
            </span>
            <span className="is-flex is-flex-direction-column ml-2">
              <span className="is-size-7 has-text-grey-light">Mi cuenta</span>
              <span className="has-text-weight-bold">Ingresa o regístrate</span>
            </span>
          </a>

          <a
            className="navbar-item"
            href="#carrito"
            aria-label={`Carrito de compras, ${cantidadTotal} productos`}
          >
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