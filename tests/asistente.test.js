import test from 'node:test'
import assert from 'node:assert/strict'
import { crearDemo } from '../src/domain/tienda.js'
import { responderAsistente, buscarProductos, cantidadSolicitada } from '../src/domain/asistente.js'
import {
  claveConversacion,
  restaurarConversacion,
  rutaChatValida,
} from '../src/domain/conversacion.js'
const datos = () => ({ ...crearDemo(), items: [], usuario: null })

test('consulta nombres, plurales, tildes, categorías y presupuesto con los productos vigentes', () => {
  const d = datos()
  assert.deepEqual(responderAsistente('¿Cuánto cuesta el fríjol cargamanto?', d).productos, [
    'frijol',
  ])
  assert.deepEqual(responderAsistente('busco leches', d).productos, ['leche'])
  assert.deepEqual(responderAsistente('hola, tiene leche', d).productos, ['leche'])
  assert.deepEqual(responderAsistente('comida para mi gato', d).productos, ['gato'])
  assert.deepEqual(responderAsistente('busco fresa', d).productos, ['fresas'])
  const seleccion = buscarProductos('frutas por menos de $ 5.000', d.productos).encontrados
  assert.ok(seleccion.length)
  assert.ok(seleccion.every((p) => p.precio < 5000 && p.categoria === 'frutas-verduras'))
  assert.equal(seleccion[0].id, 'zanahoria')
  d.productos.find((p) => p.id === 'leche').precio = 4700
  assert.match(responderAsistente('precio de leche', d).texto, /4.700/)
  d.productos.find((p) => p.id === 'leche').activo = false
  assert.deepEqual(responderAsistente('busco leche', d).productos, [])
  d.productos.push({
    id: 'quinoa-nueva',
    nombre: 'Quinoa orgánica',
    categoria: 'despensa',
    stock: 3,
    activo: true,
    precio: 7000,
    presentacion: '500 g',
  })
  assert.deepEqual(responderAsistente('busco quinoa orgánica', d).productos, ['quinoa-nueva'])
})
test('no inventa productos ni datos de alergias; las consultas ajenas reciben una guía de alcance', () => {
  const d = datos()
  assert.match(responderAsistente('busco leche de avena', d).texto, /No encontré/)
  assert.deepEqual(
    responderAsistente('productos sin gluten', d).acciones.map((a) => a.valor),
    ['/nutricion'],
  )
  assert.match(
    responderAsistente('explícame la física cuántica', d).texto,
    /No tengo una respuesta/,
  )
  assert.ok(responderAsistente('como puedo pagar', d).acciones.some((a) => a.tipo === 'carrito'))
  assert.match(responderAsistente('seguir buscando', d).texto, /nombre de un producto/)
})
test('las órdenes de agregar son explícitas, validan cantidades y consideran stock más carrito', () => {
  const d = datos()
  assert.deepEqual(responderAsistente('agrega dos leches', d).operacion, {
    productoId: 'leche',
    cantidad: 2,
  })
  assert.deepEqual(responderAsistente('puedes agregar 2 huevos', d).operacion, {
    productoId: 'huevos',
    cantidad: 2,
  })
  for (const mensaje of [
    'agrega 0 leches',
    'agrega -1 leches',
    'agrega 1.5 leches',
    'agrega 100 leches',
    'no agrega leche',
    'como puedo agregar leche',
  ])
    assert.equal(responderAsistente(mensaje, d).operacion, undefined)
  assert.equal(cantidadSolicitada('agrega tres del primero'), 3)
  const leche = d.productos.find((p) => p.id === 'leche')
  d.items = [{ ...leche, cantidad: leche.stock - 1 }]
  assert.equal(responderAsistente('agrega 2 leches', d).operacion, undefined)
  assert.match(responderAsistente('agrega 2 leches', d).texto, /hasta 1 más/)
  assert.match(responderAsistente('agrega una manzana', d).texto, /agotado/)
})
test('mantiene referencias al resultado mostrado y pagina sin agregar un producto ambiguo', () => {
  const d = datos(),
    primera = responderAsistente('ver ofertas', d)
  const agregar = responderAsistente('agrega 2 del primero', d, primera.contexto)
  assert.deepEqual(agregar.operacion, { productoId: primera.productos[0], cantidad: 2 })
  const mas = responderAsistente('ver más', d, primera.contexto)
  assert.ok(mas.productos.length)
  assert.ok(mas.productos.every((id) => !primera.productos.includes(id)))
  const ambigua = responderAsistente('agrega dos', d, primera.contexto)
  assert.equal(ambigua.operacion, undefined)
  assert.equal(ambigua.cantidad, 2)
  assert.match(ambigua.texto, /Cuál prefieres/)
})
test('pedidos y resumen corresponden solamente a la cuenta y al carrito actuales', () => {
  const d = datos()
  assert.match(responderAsistente('mis pedidos', d).texto, /Inicia sesión/)
  d.usuario = { id: 'otra-cuenta', nombre: 'Lucía' }
  assert.match(responderAsistente('mis pedidos', d).texto, /Todavía no tienes pedidos/)
  d.usuario = { id: 'demo-cliente', nombre: 'Alejandra' }
  assert.match(responderAsistente('mis pedidos', d).texto, /RM-000/)
  d.items = [{ id: 'leche', nombre: 'Leche entera', precio: 4300, cantidad: 2 }]
  assert.match(responderAsistente('mi carrito', d).texto, /8.600/)
  assert.match(responderAsistente('mi carrito', d).texto, /2 × Leche entera/)
})
test('el historial restaura únicamente contenido permitido y usa claves distintas para cada cuenta', () => {
  assert.notEqual(claveConversacion({ id: 'a' }), claveConversacion({ id: 'b' }))
  assert.notEqual(claveConversacion({ id: 'a' }), claveConversacion(null))
  assert.ok(!rutaChatValida('javascript:alert(1)'))
  assert.ok(!rutaChatValida('https://example.com'))
  const recuperado = restaurarConversacion({
    mensajes: [
      {
        id: '1',
        autor: 'river',
        texto: 'Hola',
        productos: ['leche', null],
        cantidad: -1,
        acciones: [
          { tipo: 'ruta', etiqueta: 'Mal', valor: 'javascript:alert(1)' },
          { tipo: 'carrito', etiqueta: 'Mi carrito' },
        ],
      },
    ],
  })
  assert.deepEqual(recuperado.mensajes[0].productos, ['leche'])
  assert.equal(recuperado.mensajes[0].cantidad, 1)
  assert.equal(recuperado.mensajes[0].acciones.length, 1)
  assert.ok(restaurarConversacion({ mensajes: [null] }).mensajes.length)
})
