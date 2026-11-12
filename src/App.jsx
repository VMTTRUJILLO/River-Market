import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import OffersCarousel from './components/OffersCarousel'
import Productos from './components/Productos'
import Categorias from './components/Categorias'
import Tiendas from './components/Tiendas'
import BusquedasFrecuentes from './components/BusquedasFrecuentes'
import Footer from './components/Footer'
import CarritoPanel from './components/CarritoPanel'
import AuthPage from './pages/AuthPage'
import CategoriaPage from './pages/CategoriaPage'
import CategoriasPage from './pages/CategoriasPage'
import RecetasPage from './pages/RecetasPage'
import AdminPage from './pages/AdminPage'
import { navigate, useRoute } from './utils/useRoute'
import { Link } from './utils/Link'
import './pages/Catalogo.css'

function HomePage({ busqueda }) {
  return (
    <main>
      {!busqueda && (
        <>
          <Hero />
          <OffersCarousel />
        </>
      )}
      <Productos busqueda={busqueda} onLimpiar={() => navigate('/#productos')} />
      {!busqueda && (
        <>
          <Categorias />
          <Tiendas />
          <BusquedasFrecuentes
            onElegir={(termino) => navigate(`/?q=${encodeURIComponent(termino)}#productos`)}
          />
        </>
      )}
    </main>
  )
}

export default function App() {
  const { path, search, hash, href } = useRoute()
  const auth = path === '/ingresar'
  useEffect(() => {
    document.documentElement.classList.toggle('has-navbar-fixed-top', !auth)
    const frame = requestAnimationFrame(() => {
      const target = hash ? document.getElementById(hash.slice(1)) : null
      if (target) target.scrollIntoView()
      else window.scrollTo(0, 0)
    })
    return () => cancelAnimationFrame(frame)
  }, [href, auth, hash])
  let pagina
  if (auth) pagina = <AuthPage />
  else if (path === '/admin') pagina = <AdminPage />
  else if (path === '/recetas') pagina = <RecetasPage />
  else if (path === '/categorias') pagina = <CategoriasPage />
  else if (path.startsWith('/categoria/')) pagina = <CategoriaPage />
  else if (path === '/') pagina = <HomePage busqueda={search.get('q')?.trim() || ''} />
  else
    pagina = (
      <main className="section container">
        <h1 className="title">Página no encontrada</h1>
        <Link href="/">Volver al inicio</Link>
      </main>
    )
  return (
    <>
      {!auth && <Navbar />}
      {pagina}
      {!auth && <Footer />}
      <CarritoPanel />
    </>
  )
}
