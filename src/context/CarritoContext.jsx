import { useCallback, useRef, useState } from 'react'
import { useTienda } from './useTienda'
import { useNotificar } from './useNotificaciones'
import { guardar, leer } from '../utils/storage'

import { CarritoContext as Context } from './useCarrito'
const KEY = 'rivermarket_carrito'
export function CarritoProvider({ children }) {
  const { productos } = useTienda()
  const notificar = useNotificar()
  const [guardados, setGuardados] = useState(() =>
    leer(KEY, [], Array.isArray).filter(
      (i) => i && typeof i.id === 'string' && Number.isSafeInteger(i.cantidad) && i.cantidad > 0,
    ),
  )
  const ref = useRef(guardados)
  const [abierto, setAbierto] = useState(false)
  const items = guardados.map((item) => {
    const producto = productos.find((p) => p.id === item.id)
    return { ...item, ...producto, cantidad: item.cantidad, disponible: Boolean(producto?.activo) }
  })
  const actualizar = (nuevos) => {
    try {
      guardar(KEY, nuevos)
      ref.current = nuevos
      setGuardados(nuevos)
      return true
    } catch (error) {
      notificar(error.message, 'error')
      return false
    }
  }
  const agregar = (producto) => {
    const vigente = productos.find((p) => p.id === producto.id && p.activo)
    const cantidad = ref.current.find((i) => i.id === producto.id)?.cantidad || 0
    if (!vigente || cantidad >= vigente.stock) {
      notificar(
        !vigente ? 'Este producto ya no está disponible.' : `No hay más existencias de ${vigente.nombre}.`,
        'error',
      )
      return false
    }
    const nuevos = cantidad
      ? ref.current.map((i) => (i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i))
      : [...ref.current, { ...vigente, cantidad: 1 }]
    if (!actualizar(nuevos)) return false
    notificar(`${vigente.nombre} se agregó a tu carrito.`)
    return true
  }
  const restar = (id) =>
    actualizar(
      ref.current
        .map((i) => (i.id === id ? { ...i, cantidad: i.cantidad - 1 } : i))
        .filter((i) => i.cantidad > 0),
    )
  const quitar = (id) => actualizar(ref.current.filter((i) => i.id !== id))
  const vaciar = () => actualizar([])
  const abrirCarrito = useCallback(() => setAbierto(true), [])
  const cerrarCarrito = useCallback(() => setAbierto(false), [])
  return (
    <Context.Provider
      value={{
        items,
        agregar,
        restar,
        quitar,
        vaciar,
        cantidadTotal: items.reduce((sum, i) => sum + i.cantidad, 0),
        total: items.reduce((sum, i) => sum + i.precio * i.cantidad, 0),
        abierto,
        abrirCarrito,
        cerrarCarrito,
      }}
    >
      {children}
    </Context.Provider>
  )
}
