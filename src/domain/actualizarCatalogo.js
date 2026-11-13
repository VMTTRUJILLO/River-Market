import { IMAGENES_CATALOGO } from '../data/imagenesCatalogo.js'

// Actualización idempotente: no toca fotos personalizadas, precios, stock ni pedidos.
export function actualizarCatalogo(estado) {
  let cambio = false
  const productos = estado.productos.map((producto) => {
    const foto = IMAGENES_CATALOGO.find((item) => item.id === producto.id)
    if (!foto || producto.imagen !== foto.anterior) return producto
    cambio = true
    return { ...producto, imagen: foto.actual }
  })
  const limpiarMovimiento = (movimiento) => {
    const actor = movimiento.actor === 'Datos de prueba' ? 'RiverMarket' : movimiento.actor
    const nota =
      movimiento.nota === 'Existencias iniciales de demostración'
        ? 'Inventario inicial'
        : movimiento.nota
    if (actor === movimiento.actor && nota === movimiento.nota) return movimiento
    cambio = true
    return { ...movimiento, actor, ...(nota === undefined ? {} : { nota }) }
  }
  const historial = estado.historial.map(limpiarMovimiento)
  const ventas = estado.ventas.map((venta) => {
    const cambios = venta.cambios.map(limpiarMovimiento)
    const cliente =
      venta.demo &&
      venta.cliente.id === 'demo-cliente' &&
      venta.cliente.email === 'cliente@rivermarket.demo'
        ? { ...venta.cliente, email: 'cliente@rivermarket.com' }
        : venta.cliente
    if (cliente === venta.cliente && cambios.every((item, i) => item === venta.cambios[i]))
      return venta
    cambio = true
    return { ...venta, cliente, cambios }
  })
  return cambio ? { ...estado, productos, historial, ventas } : estado
}
