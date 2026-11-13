import test from 'node:test'
import assert from 'node:assert/strict'
import { crearDemo } from '../src/domain/tienda.js'
import { actualizarCatalogo } from '../src/domain/actualizarCatalogo.js'
test('migra estados e historial antiguos por modalidad sin alterar pedidos ni inventario', () => {
  const original = crearDemo()
  for (const tipo of ['domicilio', 'recogida']) {
    for (const [anterior, nuevo] of [['Pendiente','Pedido recibido'], ['Confirmada','Preparando tu mercado'], ['Entregada', tipo === 'domicilio' ? 'Entregado' : 'Recogido'], ['Cancelada','Cancelada']]) {
      const estado = structuredClone(original)
      const venta = estado.ventas[0]
      venta.entrega.tipo = tipo
      venta.estado = anterior
      venta.cambios = [{ fecha: venta.fecha, estado: anterior, actor: 'Ana' }]
      const actualizado = actualizarCatalogo(estado)
      assert.equal(actualizado.ventas[0].estado, nuevo)
      assert.equal(actualizado.ventas[0].cambios[0].estado, nuevo)
      assert.equal(actualizado.ventas[0].cambios[0].fecha, venta.fecha)
      assert.deepEqual(actualizado.ventas[0].items, venta.items)
      assert.equal(actualizado.ventas[0].total, venta.total)
      assert.deepEqual(actualizado.productos, estado.productos)
      assert.deepEqual(actualizado.historial, estado.historial)
      assert.equal(estado.ventas[0].estado, anterior)
      assert.equal(actualizarCatalogo(actualizado), actualizado)
    }
  }
})
