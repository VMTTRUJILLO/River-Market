import test from 'node:test'
import assert from 'node:assert/strict'
import {
  crearDemo,
  comprar,
  guardarProducto,
  eliminarProducto,
  cambiarEstadoVenta,
} from '../src/domain/tienda.js'

const admin = { id: 'demo-admin', nombre: 'Admin', rol: 'admin' }
const cliente = { id: 'cliente-test', nombre: 'Cliente', email: 'cliente@prueba.demo', rol: 'cliente' }
const entrega = { nombre: 'Cliente', telefono: '3001234567', tienda: 'RiverMarket Centro' }
const linea = (estado, id = 'banano', cantidad = 1) => ({
  ...estado.productos.find((p) => p.id === id),
  cantidad,
})

test('una compra guarda el total, descuenta existencias y registra el movimiento sin mutar el estado anterior', () => {
  const inicial = crearDemo()
  const { estado, venta } = comprar(inicial, [linea(inicial, 'banano', 2)], cliente, entrega, 'compra-1')
  assert.equal(venta.total, 6400)
  assert.equal(estado.productos.find((p) => p.id === 'banano').stock, 3)
  assert.equal(inicial.productos.find((p) => p.id === 'banano').stock, 5)
  assert.equal(estado.ventas.length, inicial.ventas.length + 1)
  assert.equal(estado.historial[0].stockAntes, 5)
  assert.equal(estado.historial[0].stockDespues, 3)
  assert.equal(estado.historial[0].ventaId, venta.id)
  const repetida = comprar(estado, [linea(estado, 'banano', 2)], cliente, entrega, 'compra-1')
  assert.equal(repetida.estado, estado)
  assert.equal(repetida.venta.id, venta.id)
})

test('compra inválida no genera ventas ni descuenta parcialmente el inventario', () => {
  const inicial = crearDemo()
  const snapshot = structuredClone(inicial)
  for (const items of [
    [],
    [linea(inicial, 'banano', 6)],
    [linea(inicial, 'banano', 0)],
    [linea(inicial, 'banano', 1.5)],
    [linea(inicial), linea(inicial)],
    [linea(inicial, 'leche'), linea(inicial, 'banano', 99)],
    [{ ...linea(inicial), precio: 1 }],
  ]) {
    assert.throws(() => comprar(inicial, items, cliente, entrega, crypto.randomUUID()))
    assert.deepEqual(inicial, snapshot)
  }
  assert.throws(() => comprar(inicial, [linea(inicial)], null, entrega, 'sin-cliente'), /Inicia sesión/)
  assert.throws(() => comprar(inicial, [linea(inicial)], cliente, {}, 'sin-datos'), /Completa/)
})

test('solo el administrador puede cambiar productos y estados de ventas', () => {
  const inicial = crearDemo()
  const producto = linea(inicial)
  assert.throws(() => guardarProducto(inicial, producto, producto.id, cliente), /administrador/)
  assert.throws(() => eliminarProducto(inicial, producto.id, cliente), /administrador/)
  assert.throws(
    () => cambiarEstadoVenta(inicial, inicial.ventas[0].id, 'Cancelada', cliente),
    /administrador/,
  )
})

test('CRUD valida datos, conserva los pedidos históricos y evita vender productos eliminados', () => {
  const inicial = crearDemo()
  const datos = {
    nombre: 'Mango de prueba',
    presentacion: 'Kilo',
    categoria: 'frutas-verduras',
    stock: 12,
    precio: 5000,
    precioAntes: '',
    imagen: '',
  }
  const creado = guardarProducto(inicial, datos, null, admin)
  const producto = creado.productos[0]
  assert.equal(producto.stock, 12)
  assert.equal(creado.historial[0].tipo, 'Creación')
  for (const invalido of [
    { stock: -1 },
    { stock: 1.5 },
    { stock: '' },
    { precio: 0 },
    { precio: '' },
    { precioAntes: 3000 },
    { categoria: 'inexistente' },
    { nombre: ' ' },
    { imagen: 'javascript:alert(1)' },
  ]) {
    assert.throws(() => guardarProducto(creado, { ...datos, ...invalido }, producto.id, admin))
  }
  const { estado: comprado, venta } = comprar(
    creado,
    [linea(creado, producto.id, 2)],
    cliente,
    entrega,
    'mango',
  )
  const editado = guardarProducto(
    comprado,
    { ...producto, nombre: 'Mango nuevo', stock: 10, precio: 6000 },
    producto.id,
    admin,
  )
  assert.equal(editado.ventas.find((v) => v.id === venta.id).items[0].nombre, 'Mango de prueba')
  assert.equal(editado.ventas.find((v) => v.id === venta.id).total, 10000)
  assert.equal(editado.historial[0].antes.precio, 5000)
  assert.equal(editado.historial[0].despues.precio, 6000)
  const eliminado = eliminarProducto(editado, producto.id, admin)
  assert.equal(eliminado.productos.find((p) => p.id === producto.id).activo, false)
  assert.throws(
    () => comprar(eliminado, [linea(eliminado, producto.id)], cliente, entrega, 'eliminado'),
    /no está disponible/,
  )
  assert.equal(eliminado.ventas.length, comprado.ventas.length)
  const cancelado = cambiarEstadoVenta(eliminado, venta.id, 'Cancelada', admin)
  assert.equal(cancelado.productos.find((p) => p.id === producto.id).stock, 12)
  assert.equal(cancelado.productos.find((p) => p.id === producto.id).activo, false)
})

test('cancelar devuelve stock exactamente una vez y los estados finales no se reabren', () => {
  const inicial = crearDemo()
  const { estado, venta } = comprar(inicial, [linea(inicial, 'banano', 2)], cliente, entrega, 'cancelar')
  const cancelado = cambiarEstadoVenta(estado, venta.id, 'Cancelada', admin)
  assert.equal(cancelado.productos.find((p) => p.id === 'banano').stock, 5)
  assert.equal(cancelado.historial[0].tipo, 'Devolución')
  assert.throws(() => cambiarEstadoVenta(cancelado, venta.id, 'Cancelada', admin), /no está disponible/)
  assert.throws(() => cambiarEstadoVenta(cancelado, venta.id, 'Confirmada', admin), /no está disponible/)
  const entregado = cambiarEstadoVenta(estado, venta.id, 'Entregada', admin)
  assert.throws(() => cambiarEstadoVenta(entregado, venta.id, 'Cancelada', admin), /no está disponible/)
})

test('los datos de prueba mantienen un historial de stock consistente', () => {
  const inicial = crearDemo()
  for (const p of inicial.productos) {
    const movimientos = inicial.historial
      .filter((m) => m.productoId === p.id)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
    assert.equal(movimientos[0].stockAntes, 0)
    for (let i = 1; i < movimientos.length; i++)
      assert.equal(movimientos[i].stockAntes, movimientos[i - 1].stockDespues)
    assert.equal(movimientos.at(-1).stockDespues, p.stock)
  }
})
