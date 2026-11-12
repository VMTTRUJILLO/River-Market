import { useEffect } from 'react'

export function useDialog(ref, abierto, cerrar) {
  useEffect(() => {
    if (!abierto) return
    const previo = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = requestAnimationFrame(() =>
      ref.current?.querySelector('button, input, select, [href]')?.focus(),
    )
    const teclado = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        cerrar()
        return
      }
      if (event.key !== 'Tab') return
      const elementos = [
        ...(ref.current?.querySelectorAll(
          'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea, [tabindex="0"]',
        ) || []),
      ].filter((el) => el.getClientRects().length)
      const primero = elementos[0],
        ultimo = elementos.at(-1)
      if (!primero) {
        event.preventDefault()
        return
      }
      if (
        event.shiftKey &&
        (document.activeElement === primero || !ref.current.contains(document.activeElement))
      ) {
        event.preventDefault()
        ultimo.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === ultimo || !ref.current.contains(document.activeElement))
      ) {
        event.preventDefault()
        primero.focus()
      }
    }
    document.addEventListener('keydown', teclado)
    return () => {
      cancelAnimationFrame(timer)
      document.removeEventListener('keydown', teclado)
      document.body.style.overflow = overflow
      if (previo?.isConnected) previo.focus()
    }
  }, [ref, abierto, cerrar])
}
