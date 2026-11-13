import ArrowUpRight from './ArrowUpRight'
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Link } from '../utils/Link'
import '../pages/Nutricion.css'

export default function NutricionPromo() {
  const ref = useRef(null)
  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add(
        '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)',
        () => {
          const elemento = ref.current
          const x = gsap.quickTo('.rm-nutrition-orbit', 'x', {
            duration: 0.65,
            ease: 'power3.out',
          })
          const y = gsap.quickTo('.rm-nutrition-orbit', 'y', {
            duration: 0.65,
            ease: 'power3.out',
          })
          const mover = (evento) => {
            const rect = elemento.getBoundingClientRect()
            x(((evento.clientX - rect.left) / rect.width - 0.5) * 22)
            y(((evento.clientY - rect.top) / rect.height - 0.5) * 18)
          }
          const salir = () => {
            x(0)
            y(0)
          }
          elemento.addEventListener('pointermove', mover)
          elemento.addEventListener('pointerleave', salir)
          return () => {
            elemento.removeEventListener('pointermove', mover)
            elemento.removeEventListener('pointerleave', salir)
          }
        },
      )
      return () => media.revert()
    },
    { scope: ref },
  )
  return (
    <section className="section pt-0">
      <div className="container">
        <div className="rm-nutrition-promo" ref={ref}>
          <div>
            <p className="rm-eyebrow">TU MERCADO, CON MÁS INFORMACIÓN</p>
            <h2 className="title is-3 mt-3">Conoce lo que llevas</h2>
            <p>
              Descubre ingredientes, alérgenos e información nutricional con el código de barras de
              tus alimentos.
            </p>
            <Link href="/nutricion" className="button is-primary is-rounded mt-5">
              Explorar alimentos{' '}
              <span className="ml-3" aria-hidden="true">
                <ArrowUpRight />
              </span>
            </Link>
          </div>
          <div className="rm-nutrition-orbit" aria-hidden="true">
            <span className="rm-orbit-leaf">✦</span>
            <span className="rm-orbit-label">
              Una mirada a<br />
              <strong>tu etiqueta</strong>
            </span>
            <svg viewBox="0 0 180 60" className="rm-barcode">
              <path
                d="M10 0v60m7-60v60m14-60v60m8-60v60m13-60v60m8-60v60m14-60v60m7-60v60m15-60v60m7-60v60m14-60v60m8-60v60m13-60v60m8-60v60m13-60v60m8-60v60"
                stroke="currentColor"
                strokeWidth="4"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
