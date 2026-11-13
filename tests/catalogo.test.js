import test from 'node:test'
import assert from 'node:assert/strict'
import { access } from 'node:fs/promises'
import { actualizarCatalogo } from '../src/domain/actualizarCatalogo.js'
import { crearDemo, guardarProducto } from '../src/domain/tienda.js'
import { IMAGENES_CATALOGO } from '../src/data/imagenesCatalogo.js'

test('actualiza fotos antiguas sin perder personalizaciones, inventario ni ventas', () => {
  const estado = crearDemo()
  const foto = IMAGENES_CATALOGO.find((p) => p.id === 'frijol')
  const producto = estado.productos.find((p) => p.id === foto.id)
  Object.assign(producto, {
    imagen: foto.anterior,
    precio: 7777,
    stock: 4,
    nombre: 'Fríjol especial',
  })
  const personalizado = estado.productos.find((p) => p.id === 'arepas')
  personalizado.imagen = 'https://example.com/foto-propia.jpg'
  const actualizado = actualizarCatalogo(estado)
  const nuevo = actualizado.productos.find((p) => p.id === foto.id)
  assert.deepEqual(nuevo, { ...producto, imagen: foto.actual })
  assert.equal(
    actualizado.productos.find((p) => p.id === 'arepas'),
    personalizado,
  )
  assert.deepEqual(actualizado.ventas, estado.ventas)
  assert.deepEqual(actualizado.historial, estado.historial)
  assert.equal(actualizado.siguienteVenta, estado.siguienteVenta)
  assert.equal(actualizarCatalogo(actualizado), actualizado)
})
test('el catálogo local sigue siendo editable desde administración', async () => {
  const estado = crearDemo(),
    admin = { id: 'demo-admin', rol: 'admin', nombre: 'Administrador' }
  for (const foto of IMAGENES_CATALOGO)
    await access(new URL('../public' + foto.actual, import.meta.url))
  const producto = estado.productos.find((p) => p.id === 'frijol')
  const actualizado = guardarProducto(estado, { ...producto, stock: 22 }, producto.id, admin)
  assert.equal(actualizado.productos.find((p) => p.id === 'frijol').stock, 22)
  for (const imagen of ['/no-permitida.jpg', '//example.com/img.jpg', 'javascript:alert(1)']) {
    assert.throws(() => guardarProducto(estado, { ...producto, imagen }, producto.id, admin))
  }
})
test('normaliza los textos de registros iniciales anteriores sin alterar su historial comercial', () => {
  const estado = crearDemo()
  estado.historial[0].actor = 'Datos de prueba'
  estado.historial[0].nota = 'Existencias iniciales de demostración'
  estado.ventas[0].cambios[0].actor = 'Datos de prueba'
  estado.ventas[0].cliente.email = 'cliente@rivermarket.demo'
  const actualizado = actualizarCatalogo(estado)
  assert.equal(actualizado.historial[0].actor, 'RiverMarket')
  assert.equal(actualizado.historial[0].nota, 'Inventario inicial')
  assert.equal(actualizado.ventas[0].cliente.email, 'cliente@rivermarket.com')
  assert.equal(actualizado.ventas[0].total, estado.ventas[0].total)
  assert.equal(actualizado.ventas[0].estado, estado.ventas[0].estado)
  assert.equal(actualizarCatalogo(actualizado), actualizado)
})
