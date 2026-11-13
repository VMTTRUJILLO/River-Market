import test from 'node:test'
import assert from 'node:assert/strict'
import {
  codigoValido,
  normalizarAlimento,
  crearClienteAlimentos,
} from '../src/services/alimentos.js'
const codigo = '3017620422003'
const respuesta = (datos, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => datos,
})

test('valida códigos sin enviar texto libre a la API', () => {
  assert.equal(codigoValido('3017 6204-22003'), codigo)
  for (const valor of ['', 'leche', '<script>', '123456789', '1234567'])
    assert.throws(() => codigoValido(valor))
})
test('distingue nutrientes ausentes de cero y no inventa alérgenos ni Nutri-Score', () => {
  const p = normalizarAlimento(
    {
      nutriments: { salt_100g: 0, sugars_100g: null, fat_100g: -2 },
      nutriscore_grade: 'unknown',
      image_front_small_url: 'javascript:alert(1)',
    },
    codigo,
  )
  assert.equal(p.nutrientes.find((n) => n.nombre === 'Sal').valor, 0)
  assert.equal(p.nutrientes.find((n) => n.nombre === 'Azúcares').valor, null)
  assert.equal(p.nutrientes.find((n) => n.nombre === 'Grasas').valor, null)
  assert.deepEqual(p.alergenos, [])
  assert.equal(p.nutriscore, null)
  assert.equal(p.imagen, '')
})
test('la consulta usa campos limitados, traduce alérgenos y reutiliza la caché durante una hora', async () => {
  let llamadas = 0,
    tiempo = 1000
  const consultar = crearClienteAlimentos({
    ahora: () => tiempo,
    fetcher: async (url) => {
      llamadas++
      assert.match(
        url,
        /^https:\/\/world.openfoodfacts.org\/api\/v2\/product\/3017620422003.json\?fields=/,
      )
      return respuesta({
        status: 1,
        product: {
          product_name: 'Chocolate',
          allergens_tags: ['en:milk', 'en:nuts'],
          nutriscore_grade: 'e',
        },
      })
    },
  })
  const p = await consultar(codigo)
  assert.deepEqual(p.alergenos, ['Leche', 'Frutos de cáscara'])
  assert.equal(p.nutriscore, 'E')
  assert.equal(await consultar(codigo), p)
  assert.equal(llamadas, 1)
  tiempo += 3600001
  await consultar(codigo)
  assert.equal(llamadas, 2)
})
test('sin resultados, servicio caído y límite de peticiones tienen estados diferentes', async () => {
  for (const resultado of [respuesta({ status: 0 }), respuesta(null, 404)]) {
    assert.equal(await crearClienteAlimentos({ fetcher: async () => resultado })(codigo), null)
  }
  for (const resultado of [respuesta({}, 503), respuesta({ product: {} })]) {
    await assert.rejects(crearClienteAlimentos({ fetcher: async () => resultado })(codigo), {
      codigo: 'conexion',
    })
  }
  let llamadas = 0
  const consultar = crearClienteAlimentos({
    fetcher: async () => {
      llamadas++
      return respuesta({}, 429)
    },
  })
  await assert.rejects(consultar(codigo), { codigo: 'limite' })
  await assert.rejects(consultar('5449000000996'), { codigo: 'limite' })
  assert.equal(llamadas, 1)
})
test('cancelar al navegar aborta la petición y no se presenta como error de conexión', async () => {
  const controller = new AbortController()
  const consultar = crearClienteAlimentos({
    fetcher: async (_, { signal }) =>
      new Promise((_, reject) => {
        signal.addEventListener('abort', () => reject(new DOMException('Cancelado', 'AbortError')))
      }),
  })
  const pendiente = consultar(codigo, { signal: controller.signal })
  controller.abort()
  await assert.rejects(pendiente, { name: 'AbortError' })
})
