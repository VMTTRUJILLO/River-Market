import PillNav from './PillNav'
import './Navbar.css'

const ITEMS = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Ofertas', href: '#ofertas' },
  { label: 'Categorías', href: '#categorias' },
  { label: 'Recetas', href: '#recetas' },
  { label: 'Carrito', href: '#carrito' },
]

const CartLogo = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
)

const Navbar = () => {
  return (
    <header className="rm-navbar">
      <div className="rm-navbar__nav">
        <PillNav
          logo={<CartLogo />}
          logoAlt="RiverMarket"
          logoHref="#inicio"
          items={ITEMS}
          defaultActiveIndex={0}
          theme="light"
          layout="split"
          size="md"
          surface="solid"
          itemStyle="plain"
          hoverEffect="fill"
          indicator="dot"
          barColor="#cfeff3"
          highlightColor="#0e7c7c"
          textColor="#1B2A2F"
          bounce={0.3}
          stretch={0.5}
          collapse="auto"
          intro
          ariaLabel="Principal"
        />
      </div>

      <div className="rm-navbar__actions">
        <a className="button is-light is-rounded" href="#ingresar">
          Ingresar
        </a>
        <a className="button is-warning is-rounded" href="#registro">
          <strong>Registrarse</strong>
        </a>
      </div>
    </header>
  )
}

export default Navbar