import test from 'node:test'
import assert from 'node:assert/strict'
import { comprar, crearDemo, cambiarEstadoVenta } from '../src/domain/tienda.js'
import { seguimiento, destinoPedido, pasosPedido, transicionesPedido, pedidoFinalizado } from '../src/domain/seguimiento.js'
const usuario = { id: 'delivery-test', nombre: 'Ana', email: 'ana@example.test' }
const entrega = { tipo: 'domicilio', nombre: 'Ana', telefono: '3001234567', direccion: 'Calle 10 # 20-30', ciudad: 'Bogotá', indicaciones: 'Portería' }
test('domicilio conserva dirección, total e inventario y rechaza datos incompletos', () => {
  const estado = crearDemo()
  const items = [{ ...estado.productos.find(p => p.id === 'leche'), cantidad: 1 }]
  for (const datos of [{ ...entrega, direccion: '' }, { ...entrega, ciudad: '' }, { ...entrega, tipo: 'otro' }]) assert.throws(() => comprar(estado, items, usuario, datos, crypto.randomUUID()))
  const { venta, estado: siguiente } = comprar(estado, items, usuario, entrega, 'domicilio-1')
  assert.equal(venta.entrega.direccion, entrega.direccion)
  assert.equal(venta.entrega.indicaciones, 'Portería')
  assert.equal(venta.total, items[0].precio)
  assert.equal(siguiente.productos.find(p=>p.id === 'leche').stock, items[0].stock - 1)
  assert.equal(destinoPedido(venta), 'Calle 10 # 20-30, Bogotá')
  assert.equal(comprar(siguiente, items, usuario, entrega, 'domicilio-1').venta.id, venta.id)
})
const admin = { id: 'admin-test', rol: 'admin', nombre: 'Administración' }
for (const tipo of ['domicilio', 'recogida']) {
  test('estados de ' + tipo + ': recorrido, historial, restricciones y stock', () => {
    let estado = crearDemo()
    const datos = tipo === 'domicilio' ? entrega : { nombre: 'Ana', telefono: '3001234567', tipo, tienda: 'RiverMarket Centro' }
    const items = [{ ...estado.productos.find(p => p.id === 'leche'), cantidad: 1 }]
    const compra = comprar(estado, items, usuario, datos, 'pasos-' + tipo)
    estado = compra.estado
    let pedido = compra.venta
    const pasos = pasosPedido(pedido)
    assert.equal(pedido.estado, 'Pedido recibido')
    const stock = estado.productos.find(p => p.id === 'leche').stock
    for (let i = 0; i < pasos.length; i++) {
      assert.equal(seguimiento(pedido).indice, i)
      assert.equal(pedidoFinalizado(pedido), i === 3)
      assert.throws(() => cambiarEstadoVenta(estado, pedido.id, tipo === 'domicilio' ? 'Listo para recoger' : 'En camino', admin))
      if (i === 3) break
      assert.deepEqual(transicionesPedido(pedido), [pasos[i + 1], 'Cancelada'])
      assert.throws(() => cambiarEstadoVenta(estado, pedido.id, pasos[i + 1], usuario), /administrador/)
      assert.throws(() => cambiarEstadoVenta(estado, pedido.id, pasos[i], admin))
      if (i < 2) assert.throws(() => cambiarEstadoVenta(estado, pedido.id, pasos[i + 2], admin))
      const cancelado = cambiarEstadoVenta(estado, pedido.id, 'Cancelada', admin)
      assert.equal(cancelado.productos.find(p => p.id === 'leche').stock, stock + 1)
      assert.equal(seguimiento(cancelado.ventas[0]).cancelado, true)
      assert.throws(() => cambiarEstadoVenta(cancelado, pedido.id, 'Cancelada', admin))
      estado = cambiarEstadoVenta(estado, pedido.id, pasos[i + 1], admin)
      pedido = estado.ventas.find(v => v.id === pedido.id)
      assert.equal(pedido.cambios.at(-1).estado, pasos[i + 1])
      assert.equal(pedido.cambios.at(-1).actor, admin.nombre)
      assert.ok(pedido.cambios.at(-1).fecha)
      assert.equal(estado.productos.find(p => p.id === 'leche').stock, stock)
    }
    assert.deepEqual(transicionesPedido(pedido), [])
    assert.throws(() => cambiarEstadoVenta(estado, pedido.id, 'Cancelada', admin))
    assert.equal(seguimiento(JSON.parse(JSON.stringify(pedido))).indice, 3)
  })
}
