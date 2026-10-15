import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

const PRODUCTOS = ['🍎', '🥖', '🥛', '🍌', '🥕', '🧀', '🍅', '🥩', '🍊', '🥚']

function Hero() {
  const contenedor = useRef(null)
  const tlRef = useRef(null)

  useGSAP(
    () => {
      
      gsap.set('.carrito, .producto', { xPercent: -50, yPercent: -50 })
      gsap.set('.carrito-izq', { x: '-60vw', scaleX: -1 })
      gsap.set('.carrito-der', { x: '60vw'})
      gsap.set('.producto', { opacity: 0 })
      gsap.set('.aparece', { opacity: 0, y: 30 })

      
      const tl = gsap.timeline()
      tlRef.current = tl

      tl.to('.carrito-izq', { x: '-6vw', duration: 1, ease: 'power2.in' })
        .to('.carrito-der', { x: '6vw', duration: 1, ease: 'power2.in' }, '<')
        .add('impacto')
        .fromTo('.flash', { opacity: 0.9 }, { opacity: 0, duration: 0.4 }, 'impacto')
        .to('.rm-body', { x: 10, duration: 0.05, repeat: 7, yoyo: true, ease: 'none' }, 'impacto')
        .set('.producto', { opacity: 1 }, 'impacto')
        .to(
          '.producto',
          {
            x: () => gsap.utils.random(-400, 400),
            y: () => gsap.utils.random(-200, -70),
            rotation: () => gsap.utils.random(-360, 360),
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.03,
          },
          'impacto'
        )
        .to('.carrito-izq', { x: '-25vw', rotation: -30, opacity: 0, duration: 0.7, ease: 'power2.out' }, 'impacto')
        .to('.carrito-der', { x: '25vw', rotation: 30, opacity: 0, duration: 0.7, ease: 'power2.out' }, 'impacto')
        .to('.producto', { y: '+=450', opacity: 0, duration: 0.8, ease: 'power2.in', stagger: 0.03 }, 'impacto+=0.7')
        .to('.aparece', { opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.7)', stagger: 0.15 }, 'impacto+=0.6')
        .to('.btn-saltar', { autoAlpha: 0, duration: 0.3 })
    },
    { scope: contenedor }
  )

  return (
    <section ref={contenedor} className="hero is-primary is-fullheight-with-navbar rm-hero">
      <div className="hero-body rm-body">
        <div className="flash"></div>

        <span className="rm-abs carrito carrito-izq">🛒</span>
        <span className="rm-abs carrito carrito-der">🛒</span>
        {PRODUCTOS.map((p, i) => (
          <span key={i} className="rm-abs producto">{p}</span>
        ))}

        <div className="container has-text-centered">
          <h1 className="title is-1 aparece">RiverMarket</h1>
          <p className="subtitle is-4 aparece">Productos y precios inigualables</p>
          <div className="buttons is-centered aparece">
            <a className="button is-warning is-medium"><strong>Ver ofertas</strong></a>
            <a className="button is-light is-medium">Cocinar con recetas</a>
          </div>
        </div>

        <button className="button is-light is-small btn-saltar" onClick={() => tlRef.current.progress(1)}>
          Saltar intro
        </button>
      </div>
    </section>
  )
}

export default Hero