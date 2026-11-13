const CAMPOS = [
  'code',
  'product_name',
  'product_name_es',
  'brands',
  'quantity',
  'image_front_small_url',
  'nutriscore_grade',
  'nutriments',
  'ingredients_text_es',
  'ingredients_text',
  'allergens_tags',
].join(',')
const ALERGENOS = {
  'en:milk': 'Leche',
  'en:nuts': 'Frutos de cáscara',
  'en:soybeans': 'Soja',
  'en:gluten': 'Gluten',
  'en:eggs': 'Huevo',
  'en:peanuts': 'Maní',
  'en:fish': 'Pescado',
  'en:crustaceans': 'Crustáceos',
  'en:molluscs': 'Moluscos',
  'en:celery': 'Apio',
  'en:mustard': 'Mostaza',
  'en:sesame-seeds': 'Sésamo',
  'en:lupin': 'Altramuces',
  'en:sulphur-dioxide-and-sulphites': 'Dióxido de azufre y sulfitos',
}
export class ErrorAlimentos extends Error {
  constructor(codigo, mensaje) {
    super(mensaje)
    this.codigo = codigo
  }
}
export function codigoValido(valor) {
  const codigo = String(valor).replace(/[\s-]/g, '')
  if (!/^(?:\d{8}|\d{12,14})$/.test(codigo)) {
    throw new ErrorAlimentos(
      'codigo',
      'Escribe los 8, 12, 13 o 14 dígitos del código de barras del envase.',
    )
  }
  return codigo
}
export function normalizarAlimento(producto, codigo) {
  const nutrientes = producto.nutriments || {}
  const numero = (campo) => {
    const valor = nutrientes[campo]
    return typeof valor === 'number' && Number.isFinite(valor) && valor >= 0 ? valor : null
  }
  const imagen =
    typeof producto.image_front_small_url === 'string' &&
    /^https:\/\/images\.openfoodfacts\.org\//.test(producto.image_front_small_url)
      ? producto.image_front_small_url
      : ''
  return {
    codigo,
    nombre: producto.product_name_es || producto.product_name || 'Producto sin nombre registrado',
    marca: producto.brands || '',
    cantidad: producto.quantity || '',
    imagen,
    nutriscore: /^[a-e]$/i.test(producto.nutriscore_grade || '')
      ? producto.nutriscore_grade.toUpperCase()
      : null,
    ingredientes: (producto.ingredients_text_es || producto.ingredients_text || '').replace(
      /<[^>]*>|_/g,
      '',
    ),
    ingredientesEnEspanol: Boolean(producto.ingredients_text_es),
    alergenos: Array.isArray(producto.allergens_tags)
      ? producto.allergens_tags.map(
          (tag) => ALERGENOS[tag] || tag.replace(/^[a-z]{2}:/, '').replaceAll('-', ' '),
        )
      : [],
    nutrientes: [
      { nombre: 'Energía', valor: numero('energy-kcal_100g'), unidad: 'kcal' },
      { nombre: 'Azúcares', valor: numero('sugars_100g'), unidad: 'g' },
      { nombre: 'Grasas', valor: numero('fat_100g'), unidad: 'g' },
      { nombre: 'Saturadas', valor: numero('saturated-fat_100g'), unidad: 'g' },
      { nombre: 'Proteínas', valor: numero('proteins_100g'), unidad: 'g' },
      { nombre: 'Sal', valor: numero('salt_100g'), unidad: 'g' },
    ],
    fuente: `https://world.openfoodfacts.org/product/${codigo}`,
  }
}

// Consulta directa desde el navegador: sin claves, servidor ni datos de la cuenta.
// Caché de una hora y límite conservador inferior al de lectura de la API (15/min).
export function crearClienteAlimentos({
  fetcher = (...args) => fetch(...args),
  ahora = Date.now,
} = {}) {
  const cache = new Map()
  let peticiones = []
  let pausaHasta = 0
  return async function consultar(valor, { signal } = {}) {
    const codigo = codigoValido(valor)
    if (signal?.aborted) throw new DOMException('Consulta cancelada', 'AbortError')
    const guardado = cache.get(codigo)
    if (guardado && ahora() - guardado.fecha < 3600000) return guardado.alimento
    peticiones = peticiones.filter((fecha) => ahora() - fecha < 60000)
    if (ahora() < pausaHasta || peticiones.length >= 12) {
      throw new ErrorAlimentos(
        'limite',
        'Hiciste varias consultas seguidas. Espera un minuto e inténtalo de nuevo.',
      )
    }
    peticiones.push(ahora())
    const controller = new AbortController()
    const cancelar = () => controller.abort()
    signal?.addEventListener('abort', cancelar, { once: true })
    let agotado = false
    const timer = setTimeout(() => {
      agotado = true
      controller.abort()
    }, 12000)
    try {
      const respuesta = await fetcher(
        `https://world.openfoodfacts.org/api/v2/product/${codigo}.json?fields=${CAMPOS}`,
        {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        },
      )
      if (respuesta.status === 429) {
        pausaHasta = ahora() + 60000
        throw new ErrorAlimentos(
          'limite',
          'Open Food Facts está recibiendo muchas consultas. Espera un minuto para volver a intentar.',
        )
      }
      if (!respuesta.ok && respuesta.status !== 404) throw new Error('Servicio no disponible')
      const datos = respuesta.status === 404 ? { status: 0 } : await respuesta.json()
      if (datos.status !== 0 && (datos.status !== 1 || !datos.product))
        throw new Error('Respuesta incompleta')
      const alimento = datos.status === 1 ? normalizarAlimento(datos.product, codigo) : null
      if (cache.size >= 40) cache.delete(cache.keys().next().value)
      cache.set(codigo, { fecha: ahora(), alimento })
      return alimento
    } catch (error) {
      if (signal?.aborted) throw new DOMException('Consulta cancelada', 'AbortError')
      if (error instanceof ErrorAlimentos) throw error
      throw new ErrorAlimentos(
        'conexion',
        agotado
          ? 'La consulta está tardando más de lo esperado. Vuelve a intentarlo.'
          : 'No pudimos conectar con Open Food Facts. Revisa tu conexión y vuelve a intentarlo.',
      )
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener('abort', cancelar)
    }
  }
}
export const consultarAlimento = crearClienteAlimentos()
