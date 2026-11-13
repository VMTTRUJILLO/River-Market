import { useEffect } from 'react'
import gsap from 'gsap'

const TARJETAS = '.rm-product-card, .rm-category-card, .rm-recipe-card'
const BOTONES = 'button:not(:disabled), a.button, .rm-auth-submit'

export function useInteracciones(ref, ruta) {
  useEffect(() => {
    const raiz = ref.current
    const media = gsap.matchMedia()
    media.add(
      '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)',
      () => {
        const tocados = new Set()
        let pulsado = null
        const animar = (elemento, valores) => {
          if (!elemento) return
          tocados.add(elemento)
          gsap.to(elemento, {
            duration: 0.28,
            ...valores,
            ease: 'power2.out',
            overwrite: 'auto',
          })
        }
        const tarjeta = (evento, activa) => {
          const elemento = evento.target.closest?.(TARJETAS)
          if (!elemento || elemento.contains(evento.relatedTarget)) return
          // Mantener el foco del teclado visible al salir con el puntero.
          if (!activa && elemento.contains(document.activeElement) && evento.type === 'pointerout')
            return
          animar(elemento, { y: activa ? -8 : 0, scale: activa ? 1.012 : 1 })
          animar(
            elemento.querySelector(
              '.rm-product-image img, .rm-category-image img, .rm-recipe-cover',
            ),
            { scale: activa ? 1.045 : 1 },
          )
        }
        const entrar = (event) => tarjeta(event, true)
        const salir = (event) => tarjeta(event, false)
        const presionar = (event) => {
          pulsado = event.target.closest?.(BOTONES)
          animar(pulsado, { scale: 0.96, duration: 0.12 })
        }
        const soltar = () => {
          animar(pulsado, { scale: 1 })
          pulsado = null
        }
        const eventos = [
          ['pointerover', entrar],
          ['pointerout', salir],
          ['focusin', entrar],
          ['focusout', salir],
          ['pointerdown', presionar],
        ]
        eventos.forEach(([nombre, funcion]) => raiz.addEventListener(nombre, funcion))
        window.addEventListener('pointerup', soltar)
        window.addEventListener('pointercancel', soltar)
        return () => {
          eventos.forEach(([nombre, funcion]) => raiz.removeEventListener(nombre, funcion))
          window.removeEventListener('pointerup', soltar)
          window.removeEventListener('pointercancel', soltar)
          tocados.forEach((elemento) => {
            gsap.killTweensOf(elemento)
            gsap.set(elemento, { clearProps: 'transform' })
          })
        }
      },
    )
    return () => media.revert()
  }, [ref, ruta])
}
