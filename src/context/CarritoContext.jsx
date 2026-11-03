import { createContext, useCallback, useContext, useState } from 'react'

const CarritoContext = createContext(null)

export function CarritoProvider({ children }) {
  const [items, setItems] = useState([]) // [{ id, nombre, precio, cantidad, ... }]
  const [abierto, setAbierto] = useState(false)

  const agregar = (producto) => {
    setItems((actual) => {
      const existe = actual.find((i) => i.id === producto.id)
      if (existe) {
        return actual.map((i) => (i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i))
      }
      return [...actual, { ...producto, cantidad: 1 }]
    })
  }

  // Resta una unidad; si llega a 0, el producto sale del carrito
  const restar = (id) => {
    setItems((actual) =>
      actual
        .map((i) => (i.id === id ? { ...i, cantidad: i.cantidad - 1 } : i))
        .filter((i) => i.cantidad > 0)
    )
  }

  const quitar = (id) => setItems((actual) => actual.filter((i) => i.id !== id))
  const vaciar = () => setItems([])

  // useCallback: referencias estables para usarlas en efectos sin que se reinicien
  const abrirCarrito = useCallback(() => setAbierto(true), [])
  const cerrarCarrito = useCallback(() => setAbierto(false), [])

  const cantidadTotal = items.reduce((suma, i) => suma + i.cantidad, 0)
  const total = items.reduce((suma, i) => suma + i.precio * i.cantidad, 0)

  return (
    <CarritoContext.Provider
      value={{ items, agregar, restar, quitar, vaciar, cantidadTotal, total, abierto, abrirCarrito, cerrarCarrito }}
    >
      {children}
    </CarritoContext.Provider>
  )
}

export function useCarrito() {
  const ctx = useContext(CarritoContext)
  if (!ctx) throw new Error('useCarrito debe usarse dentro de <CarritoProvider>')
  return ctx
}