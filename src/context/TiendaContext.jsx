import { useCallback, useEffect, useRef, useState } from 'react'
import {
  crearDemo,
  esEstadoValido,
  guardarProducto,
  eliminarProducto,
  comprar,
  cambiarEstadoVenta,
} from '../domain/tienda'
import { guardar, leer } from '../utils/storage'
import { actualizarCatalogo } from '../domain/actualizarCatalogo'
import { useAuth } from './useAuth'
import { useNotificar } from './useNotificaciones'

import { TiendaContext as Context } from './useTienda'
const KEY = 'rivermarket_tienda_v1'

export function TiendaProvider({ children }) {
  const { usuario } = useAuth()
  const notificar = useNotificar()
  const [estado, setEstado] = useState(() =>
    actualizarCatalogo(leer(KEY, null, esEstadoValido) || crearDemo()),
  )
  const ref = useRef(estado)
  const actualizar = useCallback((value) => {
    ref.current = value
    setEstado(value)
  }, [])
  useEffect(() => {
    try {
      const guardado = leer(KEY, null, esEstadoValido)
      if (!guardado || actualizarCatalogo(guardado) !== guardado) guardar(KEY, ref.current)
    } catch (error) {
      notificar(error.message, 'error')
    }
    const sincronizar = (event) => {
      if (event.key === KEY) actualizar(actualizarCatalogo(leer(KEY, ref.current, esEstadoValido)))
    }
    window.addEventListener('storage', sincronizar)
    return () => window.removeEventListener('storage', sincronizar)
  }, [actualizar, notificar])
  const transaccion = (operacion) => {
    // Se relee antes de cada operación para respetar cambios de otra pestaña.
    const vigente = actualizarCatalogo(leer(KEY, ref.current, esEstadoValido))
    let resultado
    try {
      resultado = operacion(vigente)
    } catch (error) {
      actualizar(vigente)
      throw error
    }
    guardar(KEY, resultado)
    actualizar(resultado)
    return resultado
  }
  const guardarDatosProducto = (datos, id) => {
    transaccion((e) => guardarProducto(e, datos, id, usuario))
    notificar(id ? 'Producto actualizado.' : 'Producto agregado al catálogo.')
  }
  const eliminar = (id) => {
    transaccion((e) => eliminarProducto(e, id, usuario))
    notificar('Producto eliminado del catálogo. Su historial se conserva.')
  }
  const finalizarCompra = (items, entrega, solicitudId) => {
    let venta
    transaccion((e) => {
      const resultado = comprar(e, items, usuario, entrega, solicitudId)
      venta = resultado.venta
      return resultado.estado
    })
    notificar(`¡Compra realizada! Tu pedido es ${venta.numero}.`)
    return venta
  }
  const cambiarEstado = (id, nuevoEstado) => {
    transaccion((e) => cambiarEstadoVenta(e, id, nuevoEstado, usuario))
    notificar(
      nuevoEstado === 'Cancelada'
        ? 'Venta cancelada y existencias devueltas al inventario.'
        : `Venta marcada como ${nuevoEstado.toLowerCase()}.`,
    )
  }
  return (
    <Context.Provider
      value={{
        ...estado,
        guardarProducto: guardarDatosProducto,
        eliminarProducto: eliminar,
        finalizarCompra,
        cambiarEstado,
      }}
    >
      {children}
    </Context.Provider>
  )
}
