import { Link } from '../utils/Link'
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { PRODUCTOS } from '../data/productos'

gsap.registerPlugin(useGSAP)

const PRODUCTOS_ANIMACION = ['🍎', '🥖', '🥛', '🍌', '🥕', '🧀', '🍅', '🥩', '🍊', '🥚']
const TARJETAS_HERO = [
  { id: 'fresas', etiqueta: 'Frescura diaria', clase: 'card-uno' },
  { id: 'aguacate', etiqueta: 'Natural y fresco', clase: 'card-dos' },
  { id: 'pan', etiqueta: 'Recién horneado', clase: 'card-tres' },
  { id: 'leche', etiqueta: 'Calidad para tu hogar', clase: 'card-cuatro' },
]

function Hero() {
  const contenedor = useRef(null)
  const tlRef = useRef(null)

  useGSAP(() => {
    const navbar = document.querySelector('.rm-navbar')
    const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    gsap.set('.carrito, .producto', { xPercent: -50, yPercent: -50 })
    gsap.set('.carrito-izq', { x: '-60vw', scaleX: -1 })
    gsap.set('.carrito-der', { x: '60vw' })
    gsap.set('.producto', { opacity: 0 })
    gsap.set('.aparece', { opacity: 0, y: 30 })
    gsap.set('.rm-hero-card', { opacity: 0, y: 35, scale: .92 })

    if (navbar) gsap.set(navbar, { backgroundColor: '#0e7c7c' })

    const tl = gsap.timeline()
    tlRef.current = tl

    tl.to('.carrito-izq', { x: '-6vw', duration: 1, ease: 'power2.in' })
      .to('.carrito-der', { x: '6vw', duration: 1, ease: 'power2.in' }, '<')
      .add('impacto')
      .fromTo('.flash', { opacity: 0.9 }, { opacity: 0, duration: 0.4 }, 'impacto')
      .to('.rm-body', { x: 10, duration: 0.05, repeat: 7, yoyo: true, ease: 'none' }, 'impacto')
      .set('.producto', { opacity: 1 }, 'impacto')
      .to('.producto', {
        x: () => gsap.utils.random(-400, 400),
        y: () => gsap.utils.random(-200, -70),
        rotation: () => gsap.utils.random(-360, 360),
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.03,
      }, 'impacto')
      .to('.carrito-izq', { x: '-25vw', rotation: -30, opacity: 0, duration: 0.7, ease: 'power2.out' }, 'impacto')
      .to('.carrito-der', { x: '25vw', rotation: 30, opacity: 0, duration: 0.7, ease: 'power2.out' }, 'impacto')
      .to('.producto', { y: '+=450', opacity: 0, duration: 0.8, ease: 'power2.in', stagger: 0.03 }, 'impacto+=0.7')
      .to('.aparece', { opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.7)', stagger: 0.15 }, 'impacto+=0.6')
      .to('.rm-hero-card', { opacity: 1, y: 0, scale: 1, duration: .8, ease: 'power3.out', stagger: .12 }, 'impacto+=1')
      .to('.btn-saltar', { autoAlpha: 0, duration: 0.3 })

    if (navbar) {
      tl.fromTo(navbar,
        { backgroundColor: '#e7f2f2' },
        { backgroundColor: '#1B2A2F', duration: 1.2, ease: 'power2.out' },
        'impacto'
      )
    }

    if (!reducirMovimiento) {
      gsap.to('.rm-hero-orb--uno', { x: 35, y: -22, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      gsap.to('.rm-hero-orb--dos', { x: -28, y: 24, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      gsap.to('.rm-hero-card--flotante', { y: '-=13', rotation: '+=1.5', duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: .35 })
      gsap.to('.rm-hero-spark', { scale: 1.45, opacity: .45, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: .25 })
    } else {
      tl.progress(1)
      gsap.set('.rm-hero-card', { opacity: 1, y: 0, scale: 1 })
    }
  }, { scope: contenedor })

  const buscarProducto = id => PRODUCTOS.find(p => p.id === id)

  return (
    <section id="inicio" ref={contenedor} className="hero is-primary is-fullheight-with-navbar rm-hero">
      <div className="rm-hero-textura" aria-hidden="true" />
      <div className="rm-hero-orb rm-hero-orb--uno" aria-hidden="true" />
      <div className="rm-hero-orb rm-hero-orb--dos" aria-hidden="true" />
      <div className="rm-hero-spark rm-hero-spark--uno" aria-hidden="true" />
      <div className="rm-hero-spark rm-hero-spark--dos" aria-hidden="true" />
      <div className="rm-hero-spark rm-hero-spark--tres" aria-hidden="true" />

      {TARJETAS_HERO.map((tarjeta) => {
        const producto = buscarProducto(tarjeta.id)
        return producto ? (
          <div key={tarjeta.id} className={`rm-hero-card rm-hero-card--flotante ${tarjeta.clase}`}>
            <img src={producto.imagen} alt={producto.nombre} />
            <span>{tarjeta.etiqueta}</span>
          </div>
        ) : null
      })}

      <div className="hero-body rm-body">
        <div className="flash" />
        <span className="rm-abs carrito carrito-izq" aria-hidden="true">🛒</span>
        <span className="rm-abs carrito carrito-der" aria-hidden="true">🛒</span>
        {PRODUCTOS_ANIMACION.map((producto, i) => (
          <span key={i} className="rm-abs producto" aria-hidden="true">{producto}</span>
        ))}

        <div className="container has-text-centered rm-hero-copy">
          <span className="rm-hero-eyebrow aparece"><span /> TU MERCADO, MÁS FRESCO QUE NUNCA</span>
          <h1 className="title is-1 has-text-white aparece">RiverMarket</h1>
          <p className="subtitle is-4 has-text-white aparece">Productos y precios inigualables</p>
          <p className="rm-hero-support aparece">Todo lo que necesitas para tu hogar, en un solo lugar.</p>
          <div className="buttons is-centered aparece">
            <Link className="button is-warning is-medium rm-hero-cta" href="#ofertas"><strong>Ver ofertas</strong></Link>
            <Link className="button is-light is-medium rm-hero-secondary" href="/recetas">Cocinar con recetas</Link>
          </div>
          <div className="rm-hero-benefits aparece">
            <span>✦ Frescura diaria</span><span>✦ Buenos precios</span><span>✦ Compra fácil</span>
          </div>
        </div>

        <button className="button is-light is-small btn-saltar" onClick={() => tlRef.current?.progress(1)}>
          Saltar intro
        </button>
      </div>
    </section>
  )
}

export default Hero
