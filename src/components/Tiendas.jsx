import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const TIENDAS = [
  { id: 'bogota',        ciudad: 'Bogotá',        nombre: 'RiverMarket Chapinero',   direccion: 'Cra. 13 # 60-25',  lat: 4.71,  lon: -74.07 },
  { id: 'medellin',      ciudad: 'Medellín',      nombre: 'RiverMarket El Poblado',  direccion: 'Cl. 10 # 38-14',   lat: 6.25,  lon: -75.57 },
  { id: 'cali',          ciudad: 'Cali',          nombre: 'RiverMarket Granada',     direccion: 'Av. 9N # 15-40',   lat: 3.45,  lon: -76.53 },
  { id: 'barranquilla',  ciudad: 'Barranquilla',  nombre: 'RiverMarket Norte',       direccion: 'Cl. 84 # 52-30',   lat: 10.96, lon: -74.80 },
  { id: 'cartagena',     ciudad: 'Cartagena',     nombre: 'RiverMarket Bocagrande',  direccion: 'Cra. 3 # 8-25',    lat: 10.39, lon: -75.48 },
  { id: 'bucaramanga',   ciudad: 'Bucaramanga',   nombre: 'RiverMarket Cabecera',    direccion: 'Cra. 33 # 48-12',  lat: 7.12,  lon: -73.12 },
  { id: 'pereira',       ciudad: 'Pereira',       nombre: 'RiverMarket Circunvalar', direccion: 'Av. Circunvalar # 5-60', lat: 4.81, lon: -75.69 },
  { id: 'cucuta',        ciudad: 'Cúcuta',        nombre: 'RiverMarket Caobos',      direccion: 'Av. 0 # 12-45',    lat: 7.89,  lon: -72.51 },
  { id: 'santamarta',    ciudad: 'Santa Marta',   nombre: 'RiverMarket Rodadero',    direccion: 'Cra. 2 # 11-20',   lat: 11.24, lon: -74.20 },
  { id: 'pasto',         ciudad: 'Pasto',         nombre: 'RiverMarket Centro',      direccion: 'Cl. 18 # 25-10',   lat: 1.21,  lon: -77.28 },
  { id: 'villavicencio', ciudad: 'Villavicencio', nombre: 'RiverMarket Llanos',      direccion: 'Cra. 40 # 30-15',  lat: 4.15,  lon: -73.63 },
  { id: 'manizales',     ciudad: 'Manizales',     nombre: 'RiverMarket Cable',       direccion: 'Cra. 23 # 62-30',  lat: 5.07,  lon: -75.52 },
]

// Silueta aproximada de Colombia: [longitud, latitud]
const CONTORNO = [
  [-71.3, 12.5], [-72.0, 12.2], [-72.9, 11.6], [-73.8, 11.3], [-74.3, 11.2], [-74.9, 11.0],
  [-75.5, 10.4], [-75.7, 9.6], [-76.3, 9.0], [-76.8, 8.6], [-77.3, 8.7], [-77.3, 7.9],
  [-77.8, 7.2], [-77.5, 6.4], [-77.4, 5.6], [-77.4, 4.6], [-77.1, 3.9], [-77.7, 3.3],
  [-78.4, 2.4], [-78.8, 1.8], [-78.9, 1.3], [-78.2, 0.9], [-77.4, 0.4], [-76.5, 0.2],
  [-75.3, -0.1], [-74.4, -0.9], [-73.4, -1.8], [-72.1, -2.4], [-70.9, -3.4], [-70.0, -4.2],
  [-69.6, -2.6], [-69.5, -1.1], [-69.9, 0.6], [-69.2, 1.1], [-68.0, 1.7], [-67.1, 1.8],
  [-67.4, 3.0], [-67.7, 4.4], [-67.5, 5.8], [-67.8, 6.3], [-68.9, 6.2], [-70.0, 6.9],
  [-71.1, 7.0], [-72.0, 7.1], [-72.4, 7.8], [-72.5, 8.9], [-72.8, 9.7], [-72.9, 10.8],
  [-71.7, 11.7],
]

// Proyección: convierte longitud/latitud en coordenadas del SVG
const ANCHO = 360
const ALTO = 500
const proyectar = (lon, lat) => [((lon + 79.5) / 13) * ANCHO, ((13.5 - lat) / 18) * ALTO]

const PUNTOS_CONTORNO = CONTORNO.map(([lon, lat]) => proyectar(lon, lat).join(',')).join(' ')
const PUNTOS = TIENDAS.map((t) => ({ ...t, pos: proyectar(t.lon, t.lat) }))

function Tiendas() {
  const contenedor = useRef(null)
  const [seleccion, setSeleccion] = useState(0)
  const tienda = PUNTOS[seleccion]

  const alTeclear = (i) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSeleccion(i)
    }
  }

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const contorno = contenedor.current.querySelector('.rm-contorno')
      const largo = contorno.getTotalLength()
      gsap.set(contorno, { strokeDasharray: largo, strokeDashoffset: largo, fillOpacity: 0 })

      gsap
        .timeline({ scrollTrigger: { trigger: '.rm-mapa', start: 'top 75%', once: true } })
        .to(contorno, { strokeDashoffset: 0, duration: 2, ease: 'power1.inOut' })
        .to(contorno, { fillOpacity: 1, duration: 0.6 }, '-=0.5')
        .from('.rm-pin', { y: -30, opacity: 0, duration: 0.5, ease: 'bounce.out', stagger: 0.12 }, '-=0.3')
        .from('.rm-lista .panel-block', { opacity: 0, x: -20, duration: 0.4, stagger: 0.05 }, '<')

      // Ondas de "radar" en cada tienda
      gsap.to('.rm-pulso', { attr: { r: 16 }, opacity: 0, duration: 1.6, ease: 'power1.out', repeat: -1, stagger: 0.25 })
    },
    { scope: contenedor }
  )

  return (
    <section id="tiendas" ref={contenedor} className="section has-background-white">
      <div className="container">
        <h2 className="title is-3">Nuestras tiendas</h2>
        <p className="subtitle is-6">{TIENDAS.length} puntos en Colombia, cerca de ti</p>

        <div className="columns is-vcentered">
          <div className="column is-5">
            <nav className="panel is-primary">
              <p className="panel-heading">Elige una ciudad</p>
              <div className="rm-lista">
                {PUNTOS.map((t, i) => (
                  <a
                    key={t.id}
                    role="button"
                    tabIndex={0}
                    className={`panel-block ${i === seleccion ? 'is-active' : ''}`}
                    onClick={() => setSeleccion(i)}
                    onKeyDown={alTeclear(i)}
                  >
                    <span className="panel-icon" aria-hidden="true">📍</span>
                    {t.ciudad}
                  </a>
                ))}
              </div>
            </nav>

            <div className="box" aria-live="polite">
              <span className="tag is-warning is-rounded mb-2">{tienda.ciudad}</span>
              <h3 className="title is-5 mb-2">{tienda.nombre}</h3>
              <p className="is-size-6">{tienda.direccion}</p>
              <p className="is-size-7 has-text-grey">Abierto todos los días · 7:00 a. m. a 9:00 p. m.</p>
            </div>
          </div>

          <div className="column is-7">
            <svg
              viewBox={`0 0 ${ANCHO} ${ALTO}`}
              className="rm-mapa"
              role="img"
              aria-label="Mapa estilizado de Colombia con las tiendas de RiverMarket"
            >
              <polygon className="rm-contorno" points={PUNTOS_CONTORNO} />
              {PUNTOS.map((t, i) => {
                const [x, y] = t.pos
                const activa = i === seleccion
                return (
                  <g
                    key={t.id}
                    className={`rm-pin ${activa ? 'is-selected' : ''}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`${t.ciudad}: ${t.nombre}`}
                    onClick={() => setSeleccion(i)}
                    onKeyDown={alTeclear(i)}
                  >
                    <circle cx={x} cy={y} r="12" fill="transparent" />
                    <circle className="rm-pulso" cx={x} cy={y} r="4" />
                    <circle className="rm-punto" cx={x} cy={y} r={activa ? 7 : 5} />
                    {activa && <text className="rm-etiqueta" x={x + 11} y={y + 4}>{t.ciudad}</text>}
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Tiendas