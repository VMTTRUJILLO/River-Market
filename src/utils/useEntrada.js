import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export function useEntrada(ref, dependencias = [], selector) {
  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const elementos = selector ? ref.current?.querySelectorAll(selector) : ref.current
        if (!elementos || (selector && !elementos.length)) return
        gsap.fromTo(
          elementos,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.42,
            stagger: 0.045,
            ease: 'power2.out',
            clearProps: 'opacity,transform',
          },
        )
      })
      return () => media.revert()
    },
    { scope: ref, dependencies: dependencias, revertOnUpdate: true },
  )
}
