import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import OffersCarousel from './components/OffersCarousel' 
import Productos from './components/Productos'
import Categorias from './components/Categorias'
import Tiendas from './components/Tiendas'
import BusquedasFrecuentes from './components/BusquedasFrecuentes'
import Footer from './components/Footer'

function App() {
  const [busqueda, setBusqueda] = useState('')

  const buscarDesdeFrecuentes = (termino) => {
    setBusqueda(termino)
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Navbar busqueda={busqueda} onBuscar={setBusqueda} />
      <Hero />
      <OffersCarousel />
      <Productos busqueda={busqueda} onLimpiar={() => setBusqueda('')} />
      <Categorias />
      <Tiendas />
      <BusquedasFrecuentes onElegir={buscarDesdeFrecuentes} />
      <Footer />
    </>
  )
}

export default App