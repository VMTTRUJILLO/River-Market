import { useRef } from 'react'
import { useDialog } from '../utils/useDialog'

export default function Modal({ titulo, cerrar, children, ancho = '' }) {
  const ref = useRef(null)
  useDialog(ref, true, cerrar)
  return (
    <div className={`modal is-active rm-modal ${ancho}`}>
      <div className="modal-background" onClick={cerrar} />
      <section ref={ref} className="modal-card" role="dialog" aria-modal="true" aria-label={titulo}>
        <header className="modal-card-head">
          <h2 className="modal-card-title">{titulo}</h2>
          <button type="button" className="delete" aria-label="Cerrar ventana" onClick={cerrar} />
        </header>
        <div className="modal-card-body">{children}</div>
      </section>
    </div>
  )
}
