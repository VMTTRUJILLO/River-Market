import test from 'node:test'
import assert from 'node:assert/strict'
import { comprar, crearDemo } from '../src/domain/tienda.js'
import { seguimiento, destinoPedido } from '../src/domain/seguimiento.js'
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
test('seguimiento avanza y persiste por fecha sin inventar una entrega final', () => {
  const pedido = { fecha: '2026-11-13T12:00:00Z', estado: 'Confirmada', entrega }
  const inicio = Date.parse(pedido.fecha)
  assert.equal(seguimiento(pedido, inicio).indice, 0)
  assert.equal(seguimiento(pedido, inicio + 5 * 60000).indice, 1)
  assert.equal(seguimiento(pedido, inicio + 60 * 60000).indice, 2)
  assert.equal(seguimiento({ ...pedido, estado: 'Entregada' }, inicio).indice, 3)
  assert.equal(seguimiento({ ...pedido, estado: 'Cancelada' }, inicio).cancelado, true)
  assert.equal(seguimiento({ ...pedido, estado: 'Pendiente' }, inicio + 60 * 60000).indice, 0)
  assert.equal(seguimiento({ ...pedido, entrega: { tienda: 'RiverMarket Centro' } }, inicio).pasos[2], 'Listo para recoger')
})
