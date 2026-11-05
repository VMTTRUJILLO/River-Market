import { useState } from 'react'
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

function HomePage() {
  const [busqueda, setBusqueda] = useState('')
  const buscarDesdeFrecuentes = (termino) => {
    setBusqueda(termino)
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })
  }
  return <>
    <Navbar busqueda={busqueda} onBuscar={setBusqueda}/>
    <Hero/><OffersCarousel/>
    <Productos busqueda={busqueda} onLimpiar={() => setBusqueda('')}/>
    <Categorias/><Tiendas/>
    <BusquedasFrecuentes onElegir={buscarDesdeFrecuentes}/>
    <Footer/><CarritoPanel/>
  </>
}

export default function App() {
  const path = window.location.pathname.replace(/\/$/, '') || '/'
  if (path === '/ingresar') return <AuthPage/>
  if (path === '/recetas') return <RecetasPage/>
  if (path === '/categorias') return <CategoriasPage/>
  if (path.startsWith('/categoria/')) return <CategoriaPage/>
  return <HomePage/>
}
