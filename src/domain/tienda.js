import { ESTADOS_PEDIDO, transicionesPedido } from './seguimiento.js'
import { esImagenCatalogo } from '../data/imagenesCatalogo.js'
import { PRODUCTOS } from '../data/productos.js'
import { CATEGORIAS } from '../data/categorias.js'

export const ESTADOS_VENTA = ESTADOS_PEDIDO
export const TIENDAS = ['RiverMarket Centro', 'RiverMarket Norte', 'RiverMarket Sur']
const uuid = () => crypto.randomUUID()
const ahora = () => new Date().toISOString()
const exigirAdmin = (usuario) => {
  if (usuario?.rol !== 'admin') throw new Error('Necesitas una cuenta de administrador.')
}
const entero = (value, minimo, mensaje) => {
  if (!Number.isSafeInteger(value) || value < minimo || value > 100000000) throw new Error(mensaje)
}
const movimiento = (producto, tipo, stockAntes, actor, extra = {}) => ({
  id: uuid(),
  fecha: ahora(),
  productoId: producto.id,
  nombre: producto.nombre,
  tipo,
  stockAntes,
  stockDespues: producto.stock,
  actor,
  ...extra,
})

export function validarProducto(datos) {
  const producto = {
    nombre: String(datos.nombre || '').trim(),
    presentacion: String(datos.presentacion || '').trim(),
    categoria: datos.categoria,
    precio: Number(datos.precio),
    precioAntes: datos.precioAntes === '' ? 0 : Number(datos.precioAntes),
    stock: Number(datos.stock),
    imagen: String(datos.imagen || '').trim(),
  }
  if (producto.nombre.length < 2 || producto.nombre.length > 100)
    throw new Error('El nombre debe tener entre 2 y 100 caracteres.')
  if (!producto.presentacion || producto.presentacion.length > 80)
    throw new Error('Indica una presentación de hasta 80 caracteres.')
  if (!CATEGORIAS.some((c) => c.id === producto.categoria))
    throw new Error('Selecciona una categoría válida.')
  if (datos.precio === '' || datos.stock === '') throw new Error('Completa el precio y las existencias.')
  entero(producto.precio, 1, 'El precio debe ser un entero positivo en pesos colombianos.')
  entero(producto.stock, 0, 'El stock debe ser un entero igual o mayor que cero.')
  entero(producto.precioAntes, 0, 'El precio anterior debe ser cero o un entero positivo.')
  if (producto.precioAntes && producto.precioAntes <= producto.precio)
    throw new Error('El precio anterior debe ser mayor al precio de venta; déjalo vacío si no hay oferta.')
  if (producto.imagen && !esImagenCatalogo(producto.imagen)) {
    try {
      if (new URL(producto.imagen).protocol !== 'https:') throw new Error()
    } catch {
      throw new Error('Usa una URL de imagen que comience por https:// o deja el campo vacío.')
    }
  }
  return producto
}

export function guardarProducto(estado, datos, id, usuario) {
  exigirAdmin(usuario)
  const validado = validarProducto(datos)
  const anterior = id ? estado.productos.find((p) => p.id === id && p.activo) : null
  if (id && !anterior) throw new Error('Este producto ya no está disponible para editar.')
  const producto = { ...anterior, ...validado, id: id || uuid(), activo: true, actualizado: ahora() }
  const nota = anterior
    ? `Actualización de producto${anterior.precio !== producto.precio ? ` · precio: ${anterior.precio} → ${producto.precio} COP` : ''}`
    : 'Alta de producto'
  return {
    ...estado,
    productos: anterior
      ? estado.productos.map((p) => (p.id === id ? producto : p))
      : [producto, ...estado.productos],
    historial: [
      movimiento(producto, anterior ? 'Edición' : 'Creación', anterior?.stock || 0, usuario.nombre, {
        nota,
        antes: anterior,
        despues: producto,
      }),
      ...estado.historial,
    ],
  }
}

export function eliminarProducto(estado, id, usuario) {
  exigirAdmin(usuario)
  const producto = estado.productos.find((p) => p.id === id && p.activo)
  if (!producto) throw new Error('El producto ya fue eliminado.')
  // Baja lógica: los pedidos y movimientos conservan sus referencias.
  return {
    ...estado,
    productos: estado.productos.map((p) => (p.id === id ? { ...p, activo: false } : p)),
    historial: [
      movimiento(producto, 'Eliminación', producto.stock, usuario.nombre, {
        nota: 'Retirado del catálogo; se conserva el historial.',
      }),
      ...estado.historial,
    ],
  }
}

export function comprar(estado, items, usuario, entrega, solicitudId) {
  if (!usuario) throw new Error('Inicia sesión para finalizar tu compra.')
  const existente = estado.ventas.find((v) => v.solicitudId === solicitudId)
  if (existente) return { estado, venta: existente }
  if (!solicitudId || !items.length) throw new Error('Tu carrito está vacío.')
  const tipo = entrega?.tipo || 'recogida'
  if (!entrega?.nombre?.trim() || entrega.nombre.trim().length > 100 || !/^[\d\s+()-]{7,20}$/.test(entrega.telefono || '')) throw new Error('Completa tu nombre y teléfono.')
  if (!['recogida', 'domicilio'].includes(tipo)) throw new Error('Selecciona una forma de entrega válida.')
  if (tipo === 'recogida' && !TIENDAS.includes(entrega.tienda)) throw new Error('Selecciona un punto de recogida.')
  if (tipo === 'domicilio' && (!entrega.direccion?.trim() || entrega.direccion.trim().length < 8 || entrega.direccion.length > 180 || !entrega.ciudad?.trim() || entrega.ciudad.length > 80 || (entrega.indicaciones || '').length > 240)) throw new Error('Completa la ciudad y una dirección de entrega válida.')
  const ids = new Set()
  const lineas = items.map((item) => {
    if (ids.has(item.id)) throw new Error('El carrito contiene una línea duplicada.')
    ids.add(item.id)
    entero(item.cantidad, 1, 'Revisa las cantidades del carrito.')
    const p = estado.productos.find((p) => p.id === item.id && p.activo)
    if (!p) throw new Error(`${item.nombre || 'Un producto'} ya no está disponible. Retíralo del carrito.`)
    if (item.cantidad > p.stock)
      throw new Error(`Solo quedan ${p.stock} unidades de ${p.nombre}. Ajusta tu carrito.`)
    if (item.precio !== p.precio)
      throw new Error(`Cambió el precio de ${p.nombre}. Revisa el total actualizado antes de confirmar.`)
    return {
      id: p.id,
      nombre: p.nombre,
      presentacion: p.presentacion,
      precio: p.precio,
      cantidad: item.cantidad,
      imagen: p.imagen,
    }
  })
  const venta = {
    id: uuid(),
    numero: `RM-${String(estado.siguienteVenta).padStart(5, '0')}`,
    solicitudId,
    fecha: ahora(),
    cliente: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
    entrega: { nombre: entrega.nombre.trim(), telefono: entrega.telefono.trim(), tipo,
      ...(tipo === 'recogida' ? { tienda: entrega.tienda } : { direccion: entrega.direccion.trim(), ciudad: entrega.ciudad.trim(), indicaciones: (entrega.indicaciones || '').trim() }),
    },
    items: lineas,
    total: lineas.reduce((sum, p) => sum + p.precio * p.cantidad, 0),
    estado: 'Pedido recibido',
    cambios: [],
  }
  venta.cambios.push({ fecha: venta.fecha, estado: venta.estado, actor: usuario.nombre })
  const movimientos = []
  const productos = estado.productos.map((p) => {
    const item = lineas.find((i) => i.id === p.id)
    if (!item) return p
    const actualizado = { ...p, stock: p.stock - item.cantidad }
    movimientos.push(
      movimiento(actualizado, 'Venta', p.stock, usuario.nombre, { ventaId: venta.id, nota: venta.numero }),
    )
    return actualizado
  })
  return {
    venta,
    estado: {
      ...estado,
      productos,
      ventas: [venta, ...estado.ventas],
      historial: [...movimientos, ...estado.historial],
      siguienteVenta: estado.siguienteVenta + 1,
    },
  }
}

export function cambiarEstadoVenta(estado, id, nuevoEstado, usuario) {
  exigirAdmin(usuario)
  const venta = estado.ventas.find((v) => v.id === id)
  if (!venta || !transicionesPedido(venta).includes(nuevoEstado))
    throw new Error('Este cambio de estado ya no está disponible.')
  const movimientos = []
  const productos =
    nuevoEstado === 'Cancelada'
      ? estado.productos.map((p) => {
          const item = venta.items.find((i) => i.id === p.id)
          if (!item) return p
          const actualizado = { ...p, stock: p.stock + item.cantidad }
          movimientos.push(
            movimiento(actualizado, 'Devolución', p.stock, usuario.nombre, {
              ventaId: id,
              nota: `Cancelación ${venta.numero}`,
            }),
          )
          return actualizado
        })
      : estado.productos
  return {
    ...estado,
    productos,
    historial: [...movimientos, ...estado.historial],
    ventas: estado.ventas.map((v) =>
      v.id === id
        ? {
            ...v,
            estado: nuevoEstado,
            cambios: [...v.cambios, { fecha: ahora(), estado: nuevoEstado, actor: usuario.nombre }],
          }
        : v,
    ),
  }
}

export function crearDemo() {
  const productos = PRODUCTOS.map((p, index) => ({
    ...p,
    activo: true,
    stock: index === 0 ? 5 : index === 3 ? 0 : 18 + ((index * 7) % 43),
  }))
  let estado = {
    version: 1,
    productos,
    ventas: [],
    siguienteVenta: 1,
    historial: productos.map((p) =>
      movimiento(p, 'Inventario inicial', 0, 'RiverMarket', {
        nota: 'Inventario inicial',
      }),
    ),
  }
  const cliente = { id: 'demo-cliente', nombre: 'Valentina', email: 'cliente@rivermarket.com' }
  const ejemplos = [
    [
      ['leche', 2],
      ['pan', 1],
    ],
    [
      ['tomate', 3],
      ['queso', 1],
    ],
    [
      ['cafe', 1],
      ['huevos', 1],
    ],
  ]
  ejemplos.forEach((ejemplo, index) => {
    const items = ejemplo.map(([id, cantidad]) => ({
      ...estado.productos.find((p) => p.id === id),
      cantidad,
    }))
    const compra = comprar(
      estado,
      items,
      cliente,
      { nombre: 'Valentina', telefono: '3001234567', tienda: TIENDAS[index] },
      `demo-${index}`,
    )
    estado = compra.estado
    const fecha = new Date(Date.now() - (3 - index) * 86400000).toISOString()
    estado.ventas = estado.ventas.map((v) =>
      v.id === compra.venta.id
        ? {
            ...v,
            fecha,
            demo: true,
            estado: index === 0 ? 'Recogido' : index === 1 ? 'Pedido recibido' : 'Preparando tu mercado',
            cambios: [
              {
                fecha,
                estado: index === 0 ? 'Recogido' : index === 1 ? 'Pedido recibido' : 'Preparando tu mercado',
                actor: 'RiverMarket',
              },
            ],
          }
        : v,
    )
    estado.historial = estado.historial.map((m) =>
      m.ventaId === compra.venta.id ? { ...m, fecha, actor: 'RiverMarket' } : m,
    )
  })
  const apertura = new Date(Date.now() - 4 * 86400000).toISOString()
  estado.historial = estado.historial
    .map((m) => (m.tipo === 'Inventario inicial' ? { ...m, fecha: apertura } : m))
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
  return estado
}

export const esEstadoValido = (value) =>
  value?.version === 1 &&
  Array.isArray(value.productos) &&
  Array.isArray(value.ventas) &&
  Array.isArray(value.historial) &&
  Number.isSafeInteger(value.siguienteVenta)
