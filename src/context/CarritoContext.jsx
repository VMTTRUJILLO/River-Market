import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useAuth } from './useAuth'
import { useTienda } from './useTienda'
import { useNotificar } from './useNotificaciones'
import { guardar, leer } from '../utils/storage'
import {
  CARRITOS_KEY,
  CARRITO_ANTERIOR_KEY,
  crearCarritos,
  esCarritosValido,
  propietarioCarrito,
  obtenerCarrito,
  guardarCarrito,
  cambiarSesionCarrito,
} from '../domain/carritos'

import { CarritoContext as Context } from './useCarrito'
export function CarritoProvider({ children }) {
  const { usuario } = useAuth()
  const propietario = propietarioCarrito(usuario)
  const { productos } = useTienda()
  const notificar = useNotificar()
  const [estado, setEstado] = useState(
    () =>
      leer(CARRITOS_KEY, null, esCarritosValido) ||
      crearCarritos(leer(CARRITO_ANTERIOR_KEY, [], Array.isArray), usuario),
  )
  const ref = useRef(estado)
  const sesionAnterior = useRef(propietario)
  const [abierto, setAbierto] = useState(false)
  const actualizarEstado = useCallback((nuevo) => {
    ref.current = nuevo
    setEstado(nuevo)
  }, [])
  useLayoutEffect(() => {
    const guardado = leer(CARRITOS_KEY, null, esCarritosValido)
    const vigente = guardado || ref.current
    const anterior = sesionAnterior.current
    try {
      const nuevo = cambiarSesionCarrito(vigente, anterior, propietario)
      // Seleccionar y limpiar antes de pintar evita mostrar el carrito de la sesión anterior.
      actualizarEstado(nuevo)
      if (!guardado || nuevo !== vigente) guardar(CARRITOS_KEY, nuevo)
    } catch (error) {
      notificar(error.message, 'error')
    }
    sesionAnterior.current = propietario
    if (anterior !== propietario) setAbierto(false)
  }, [propietario, actualizarEstado, notificar])
  useEffect(() => {
    const sincronizar = (event) => {
      if (event.key === CARRITOS_KEY || event.key === null) {
        actualizarEstado(leer(CARRITOS_KEY, crearCarritos(), esCarritosValido))
      }
    }
    window.addEventListener('storage', sincronizar)
    return () => window.removeEventListener('storage', sincronizar)
  }, [actualizarEstado])
  const guardados = obtenerCarrito(estado, propietario)
  const items = guardados.map((item) => {
    const producto = productos.find((p) => p.id === item.id)
    return { ...item, ...producto, cantidad: item.cantidad, disponible: Boolean(producto?.activo) }
  })
  const actualizar = (operacion) => {
    try {
      // Releer permite conservar cambios de otras pestañas y de las demás cuentas.
      const vigente = leer(CARRITOS_KEY, ref.current, esCarritosValido)
      const nuevos = operacion(obtenerCarrito(vigente, propietario))
      const siguiente = guardarCarrito(vigente, propietario, nuevos)
      guardar(CARRITOS_KEY, siguiente)
      actualizarEstado(siguiente)
      return true
    } catch (error) {
      notificar(error.message, 'error')
      return false
    }
  }
  const agregar = (producto) => {
    const vigente = productos.find((p) => p.id === producto.id && p.activo)
    const correcto = actualizar((actuales) => {
      const cantidad = actuales.find((i) => i.id === producto.id)?.cantidad || 0
      if (!vigente || cantidad >= vigente.stock) {
        throw new Error(
          !vigente
            ? 'Este producto ya no está disponible.'
            : `No hay más existencias de ${vigente.nombre}.`,
        )
      }
      return cantidad
        ? actuales.map((i) => (i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i))
        : [...actuales, { ...vigente, cantidad: 1 }]
    })
    if (!correcto) return false
    notificar(`${vigente.nombre} se agregó a tu carrito.`)
    return true
  }
  const restar = (id) =>
    actualizar((actuales) =>
      actuales
        .map((i) => (i.id === id ? { ...i, cantidad: i.cantidad - 1 } : i))
        .filter((i) => i.cantidad > 0),
    )
  const quitar = (id) => actualizar((actuales) => actuales.filter((i) => i.id !== id))
  const vaciar = () => actualizar(() => [])
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
