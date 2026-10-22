import { createContext, useContext, useState } from 'react'

const CarritoContext = createContext(null)

export function CarritoProvider({ children }) {
  const [items, setItems] = useState([]) // [{ id, nombre, precio, cantidad, ... }]

  const agregar = (producto) => {
    setItems((actual) => {
      const existe = actual.find((i) => i.id === producto.id)
      if (existe) {
        return actual.map((i) => (i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i))
      }
      return [...actual, { ...producto, cantidad: 1 }]
    })
  }

  const cantidadTotal = items.reduce((suma, i) => suma + i.cantidad, 0)
  const total = items.reduce((suma, i) => suma + i.precio * i.cantidad, 0)

  return (
    <CarritoContext.Provider value={{ items, agregar, cantidadTotal, total }}>
      {children}
    </CarritoContext.Provider>
  )
}

export function useCarrito() {
  const ctx = useContext(CarritoContext)
  if (!ctx) throw new Error('useCarrito debe usarse dentro de <CarritoProvider>')
  return ctx
}