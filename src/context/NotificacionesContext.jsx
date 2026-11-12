import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

import { NotificacionesContext as Context } from './useNotificaciones'

function Aviso({ aviso, cerrar }) {
  const ref = useRef(null)
  useEffect(() => {
    const animacion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? null
      : gsap.fromTo(ref.current, { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25 })
    const timer = setTimeout(() => cerrar(aviso.id), 6500)
    return () => {
      clearTimeout(timer)
      animacion?.kill()
    }
  }, [aviso.id, cerrar])
  return (
    <div
      ref={ref}
      className={`notification rm-toast ${aviso.tipo === 'error' ? 'is-danger is-light' : 'is-primary is-light'}`}
      role={aviso.tipo === 'error' ? 'alert' : 'status'}
    >
      <span className="rm-toast-icon" aria-hidden="true">
        {aviso.tipo === 'error' ? '!' : '✓'}
      </span>
      <span>{aviso.texto}</span>
      <button className="delete" aria-label="Cerrar aviso" onClick={() => cerrar(aviso.id)} />
    </div>
  )
}

export function NotificacionesProvider({ children }) {
  const [avisos, setAvisos] = useState([])
  const notificar = useCallback(
    (texto, tipo = 'success') => setAvisos([{ id: crypto.randomUUID(), texto, tipo }]),
    [],
  )
  const cerrar = useCallback((id) => setAvisos((actual) => actual.filter((a) => a.id !== id)), [])
  return (
    <Context.Provider value={notificar}>
      {children}
      <div className="rm-toast-stack" aria-label="Notificaciones">
        {avisos.map((aviso) => (
          <Aviso key={aviso.id} aviso={aviso} cerrar={cerrar} />
        ))}
      </div>
    </Context.Provider>
  )
}
