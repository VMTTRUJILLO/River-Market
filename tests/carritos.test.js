import test from 'node:test'
import assert from 'node:assert/strict'
import {
  crearCarritos,
  propietarioCarrito,
  obtenerCarrito,
  guardarCarrito,
  cambiarSesionCarrito,
  esCarritosValido,
  INVITADO,
} from '../src/domain/carritos.js'
const cliente = { id: 'cliente-a' }
const otraCuenta = { id: 'cliente-b' }
const a = propietarioCarrito(cliente),
  b = propietarioCarrito(otraCuenta)
const leche = { id: 'leche', nombre: 'Leche entera', precio: 4300, cantidad: 2 }
const banano = { id: 'banano', nombre: 'Banano criollo', precio: 3200, cantidad: 1 }

test('cerrar sesión vacía la vista invitada y permite recuperar únicamente el carrito de su propietario', () => {
  let estado = guardarCarrito(crearCarritos(), a, [leche])
  estado = guardarCarrito(estado, b, [banano])
  const antes = structuredClone(estado)
  estado = cambiarSesionCarrito(estado, a, INVITADO)
  assert.deepEqual(obtenerCarrito(estado, INVITADO), [])
  assert.deepEqual(obtenerCarrito(estado, a), antes.carritos[a])
  estado = cambiarSesionCarrito(estado, INVITADO, b)
  assert.deepEqual(obtenerCarrito(estado, b), [banano])
  estado = cambiarSesionCarrito(estado, b, INVITADO)
  estado = cambiarSesionCarrito(estado, INVITADO, a)
  assert.deepEqual(obtenerCarrito(estado, a), [leche])
  assert.deepEqual(obtenerCarrito(estado, b), [banano])
})
test('el carrito de visitante se combina una sola vez con la cuenta que inicia sesión', () => {
  let estado = guardarCarrito(crearCarritos(), a, [leche])
  estado = guardarCarrito(estado, b, [banano])
  estado = guardarCarrito(estado, INVITADO, [{ ...leche, cantidad: 1 }, banano])
  estado = cambiarSesionCarrito(estado, INVITADO, a)
  assert.deepEqual(obtenerCarrito(estado, a), [{ ...leche, cantidad: 3 }, banano])
  assert.deepEqual(obtenerCarrito(estado, INVITADO), [])
  assert.deepEqual(obtenerCarrito(estado, b), [banano])
  assert.equal(cambiarSesionCarrito(estado, INVITADO, a), estado)
  assert.equal(cambiarSesionCarrito(estado, a, a), estado)
})
test('vaciar o finalizar la compra solo modifica el carrito de la cuenta actual', () => {
  const estado = guardarCarrito(guardarCarrito(crearCarritos(), a, [leche]), b, [banano])
  const nuevo = guardarCarrito(estado, a, [])
  assert.deepEqual(obtenerCarrito(nuevo, a), [])
  assert.deepEqual(obtenerCarrito(nuevo, b), [banano])
  assert.deepEqual(obtenerCarrito(estado, a), [leche])
  const recargado = JSON.parse(JSON.stringify(nuevo))
  assert.ok(esCarritosValido(recargado))
  assert.deepEqual(obtenerCarrito(recargado, b), [banano])
})
test('una cuenta recién registrada recibe el carrito del visitante sin tocar otras cuentas', () => {
  const estado = guardarCarrito(guardarCarrito(crearCarritos(), a, [leche]), INVITADO, [banano])
  const nuevo = cambiarSesionCarrito(estado, INVITADO, b)
  assert.deepEqual(obtenerCarrito(nuevo, b), [banano])
  assert.deepEqual(obtenerCarrito(nuevo, a), [leche])
  assert.deepEqual(obtenerCarrito(nuevo, INVITADO), [])
})
test('migración del carrito anterior: no se expone públicamente ni se atribuye a un usuario futuro', () => {
  const conSesion = crearCarritos([leche, null, { id: 'invalido', cantidad: -1 }], cliente)
  assert.deepEqual(obtenerCarrito(conSesion, a), [leche])
  assert.deepEqual(obtenerCarrito(conSesion, INVITADO), [])
  const sinSesion = crearCarritos([leche])
  assert.deepEqual(obtenerCarrito(sinSesion, INVITADO), [])
  assert.deepEqual(obtenerCarrito(cambiarSesionCarrito(sinSesion, INVITADO, b), b), [])
})
test('los datos corruptos no se aceptan como carritos guardados', () => {
  for (const dato of [
    null,
    [],
    { version: 2, carritos: [] },
    { version: 2, carritos: { invitado: [null] } },
    { version: 2, carritos: { invitado: [{ id: 'leche', cantidad: 1.5 }] } },
  ]) {
    assert.ok(!esCarritosValido(dato))
  }
  assert.ok(esCarritosValido(crearCarritos()))
})
