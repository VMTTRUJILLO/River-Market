import { CATEGORIAS } from '../data/categorias.js'
import { SUCURSALES, HORARIO } from '../data/tiendas.js'
import { RECETAS } from '../data/recetas.js'
import { dinero, normalizar, fecha } from '../utils/format.js'

export const SUGERENCIAS = ['Ver ofertas', 'Busco leche', 'Mi carrito', 'Horarios y tiendas']
export const BIENVENIDA =
  '¡Hola! Soy River, tu asistente de compras. Te ayudo a encontrar productos, revisar tu carrito y resolver dudas de RiverMarket. ¿Qué necesitas hoy?'
const OMITIR = new Set(
  'mi mis tiene vendes algun alguna informacion sobre pagar pago pagos como puedo hacer finalizar hola buenos buenas dias tardes noches por favor me puedes puede podrias mostrar muestra muestrame ver verlos quiero necesito busco buscar hay tienen tienes venden vende de del la el las los un una unos unas y o para con en que cual cuales cuanto cuantos cuanta cuantas cuesta cuestan vale valen precio precios stock disponibilidad disponible disponibles quedan unidades unidad productos producto comprar compra agregar agrega agregame anade anadir anademe pon poner al carrito tambien favor hasta menos mas barato baratos barata baratas economico economicos oferta ofertas descuento descuentos pesos cop mil primero primera segundo segunda tercero tercera cuarto cuarta ese esa esos esas este esta ellos estos estas su sus dame dos tres cuatro cinco seis siete ocho nueve diez'.split(
    ' ',
  ),
)
const ALIAS = {
  fresas: 'fresa',
  zanahorias: 'zanahoria',
  aguacates: 'aguacate',
  aceites: 'aceite',
  pastas: 'pasta',
  detergentes: 'detergente',
  jabones: 'jabon',
  leches: 'leche',
  huevos: 'huevo',
  tomates: 'tomate',
  frutas: 'fruta',
  verduras: 'verdura',
  carnes: 'carne',
  bebidas: 'bebida',
  bananos: 'banano',
  bananas: 'banano',
  banana: 'banano',
  frijoles: 'frijol',
  arepas: 'arepa',
  gaseosas: 'gaseosa',
  refresco: 'gaseosa',
  refrescos: 'gaseosa',
  soda: 'gaseosa',
  panes: 'pan',
  manzanas: 'manzana',
  quesos: 'queso',
  yogures: 'yogur',
  comida: 'alimento',
  croquetas: 'alimento',
  perros: 'perro',
  gatos: 'gato',
  jugos: 'jugo',
  lacteos: 'lacteo',
  granos: 'grano',
  cereales: 'cereal',
}
const limpiar = (texto) =>
  normalizar(String(texto))
    .replace(/[^a-z0-9ñ.,\s$-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
const palabras = (texto) =>
  limpiar(texto)
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p.replace(/^[.,$]+|[.,$]+$/g, ''))
    .filter(Boolean)
    .map((p) => ALIAS[p] || p)
const ruta = (etiqueta, valor) => ({ tipo: 'ruta', etiqueta, valor })
const carrito = { tipo: 'carrito', etiqueta: 'Abrir mi carrito' }
const respuesta = (texto, extra = {}) => ({
  texto,
  productos: [],
  acciones: [],
  sugerencias: [],
  ...extra,
})
const NUMEROS = {
  un: 1,
  una: 1,
  uno: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
}

export function cantidadSolicitada(texto) {
  const coincidencia = texto.match(
    /(?:^|\s)(-?\d+(?:[.,]\d+)?|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)(?=\s|$)/,
  )
  if (!coincidencia) return 1
  return NUMEROS[coincidencia[1]] || Number(coincidencia[1].replace(',', '.'))
}

export function buscarProductos(texto, productos) {
  const consulta = limpiar(texto)
  const limite = consulta.match(
    /(?:menos de|hasta|maximo|presupuesto de)\s*\$?\s*(\d[\d.,]*)(?:\s*(mil|k))?\b/,
  )
  let maximo = null
  if (limite) maximo = Number(limite[1].replace(/[.,]/g, '')) * (limite[2] ? 1000 : 1)
  const base = limite ? consulta.replace(limite[0], '') : consulta
  const terminos = palabras(base).filter((p) => !OMITIR.has(p) && !/^[-\d.,$]+$/.test(p))
  const ofertas = /\b(ofertas?|descuentos?)\b/.test(consulta)
  const baratos = /\b(barat[oa]s?|economic[oa]s?)\b/.test(consulta) || maximo !== null
  let encontrados = productos.filter((p) => {
    if (
      !p.activo ||
      (maximo !== null && (consulta.includes('menos de') ? p.precio >= maximo : p.precio > maximo))
    )
      return false
    if (ofertas && !(p.precioAntes > p.precio && p.stock > 0)) return false
    const categoria = CATEGORIAS.find((c) => c.id === p.categoria)
    const campos = palabras(`${p.nombre} ${categoria?.nombre || ''}`)
    return terminos.every((t) => campos.includes(t))
  })
  const categoriasAmplias = [
    'fruta',
    'verdura',
    'lacteo',
    'carne',
    'panaderia',
    'despensa',
    'bebida',
    'aseo',
    'hogar',
    'mascotas',
  ]
  const directos = encontrados.filter((p) => terminos.every((t) => palabras(p.nombre).includes(t)))
  if (terminos.length && directos.length && !terminos.some((t) => categoriasAmplias.includes(t)))
    encontrados = directos
  if (baratos)
    encontrados.sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0) || a.precio - b.precio)
  else if (ofertas)
    encontrados.sort((a, b) => 1 - b.precio / b.precioAntes - (1 - a.precio / a.precioAntes))
  else encontrados.sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0))
  return { encontrados, terminos, maximo, ofertas, baratos }
}

function referidos(texto, contexto, productos) {
  const ordinal = texto.match(/\b(primer[oa]?|segund[oa]|tercer[oa]?|cuart[oa])\b/)
  const indice = ordinal
    ? /primer/.test(ordinal[0])
      ? 0
      : /segund/.test(ordinal[0])
        ? 1
        : /tercer/.test(ordinal[0])
          ? 2
          : 3
    : null
  const ids = contexto.ids || []
  if (indice !== null) return productos.filter((p) => p.id === ids[indice] && p.activo)
  if (
    /\b(ese|esa|este|esta|ellos|estos|esas|esos)\b/.test(texto) ||
    buscarProductos(texto, productos).terminos.length === 0
  ) {
    return ids.map((id) => productos.find((p) => p.id === id && p.activo)).filter(Boolean)
  }
  return null
}

export function responderAsistente(mensaje, datos, contexto = {}) {
  const texto = limpiar(mensaje)
  const { productos, items = [], usuario = null, ventas = [] } = datos
  if (!texto)
    return respuesta('Escribe tu consulta o elige una de estas opciones.', {
      sugerencias: SUGERENCIAS,
    })
  if (
    /^(hola|buenos dias|buenas tardes|buenas noches|buenas|hey)(?:[, ]+river)?[.,! ]*$/.test(texto)
  )
    return respuesta(BIENVENIDA, { sugerencias: SUGERENCIAS })
  if (/^(gracias|muchas gracias|listo|perfecto|ok|chao|adios)[.! ]*$/.test(texto))
    return respuesta('¡Con gusto! Aquí estoy cuando necesites algo para tu mercado.', {
      sugerencias: ['Ver ofertas', 'Mi carrito'],
    })
  if (/\b(ayuda|ayudar|haces|funcionas|humano|asesor|quien eres)\b/.test(texto))
    return respuesta(
      'Soy el asistente de compras de RiverMarket. Puedo buscar productos por nombre, categoría o presupuesto, consultar su disponibilidad y agregarlos a tu carrito. Prueba «busco leche», «frutas hasta 5000» o «agrega 2 leches».',
      { sugerencias: SUGERENCIAS },
    )
  if (
    /\b(alergenos?|alergias?|gluten|lactosa|calorias|nutricion|nutricional|ingredientes|nutri|saludable|diabetico|diabetes)\b/.test(
      texto,
    )
  )
    return respuesta(
      'Para conocer ingredientes, nutrientes y alérgenos, consulta el código de barras del envase en Nutrición. El catálogo no confirma si un producto es apto para una alergia; revisa siempre la etiqueta.',
      { acciones: [ruta('Consultar información nutricional', '/nutricion')] },
    )
  if (/\b(horario|horarios|abren|cierran|abierto|atencion)\b/.test(texto))
    return respuesta(
      `Nuestro horario de atención es: ${HORARIO.toLowerCase()} Puedes consultar las direcciones en el mapa de tiendas.`,
      { acciones: [ruta('Ver nuestras tiendas', '/#tiendas')] },
    )
  const ciudad = SUCURSALES.find((t) => texto.includes(normalizar(t.ciudad)))
  if (ciudad)
    return respuesta(`${ciudad.nombre}\n${ciudad.direccion}, ${ciudad.ciudad}.\n${HORARIO}`, {
      acciones: [ruta('Ver mapa de tiendas', '/#tiendas')],
    })
  if (/\b(tiendas?|sucursales?|direccion|ubicacion|donde quedan|donde estan)\b/.test(texto))
    return respuesta(
      `Tenemos ${SUCURSALES.length} puntos en Colombia. Dime una ciudad, por ejemplo Bogotá, Medellín o Cali, o explora el mapa.`,
      {
        acciones: [ruta('Ver tiendas y direcciones', '/#tiendas')],
        sugerencias: ['Tienda en Bogotá', 'Tienda en Medellín', 'Tienda en Cali'],
      },
    )
  if (
    /\b(envio|envios|domicilio|entrega|recogida|recoger)\b/.test(texto) &&
    !/\b(pedido|pedidos)\b/.test(texto)
  )
    return respuesta(
      'Al finalizar tu compra puedes elegir recogida en tienda sin costo. Revisa el punto de recogida en el carrito antes de confirmar.',
      { acciones: [carrito] },
    )
  if (
    /\b(mis pedidos|mi pedido|estado del pedido|estado de mi compra|historial de compras|mis compras)\b/.test(
      texto,
    )
  ) {
    if (!usuario)
      return respuesta(
        'Inicia sesión para consultar tus pedidos. Cada cuenta tiene su propio historial.',
        { acciones: [ruta('Ir a mi cuenta', '/ingresar')] },
      )
    const propios = ventas.filter((v) => v.cliente.id === usuario.id).slice(0, 3)
    return respuesta(
      propios.length
        ? `Estos son tus últimos pedidos:\n${propios.map((v) => `${v.numero} · ${v.estado} · ${dinero(v.total)}\n${fecha(v.fecha)}`).join('\n\n')}`
        : 'Todavía no tienes pedidos. Cuando completes una compra aparecerá en tu cuenta.',
      { acciones: [ruta('Ver mis pedidos', '/ingresar')] },
    )
  }
  if (
    /\b(sesion|login|registr|cuenta|contrasena|registro|registrarme|registrarse)\w*\b/.test(texto)
  )
    return respuesta(
      usuario
        ? `${usuario.nombre}, ya tienes una sesión iniciada. Desde Mi cuenta puedes consultar tus pedidos o cerrar sesión. Tu carrito se conserva para esta cuenta.`
        : 'En Mi cuenta puedes iniciar sesión o elegir Registrarme. Al entrar recuperarás tu carrito y se añadirán los productos que hayas elegido como visitante.',
      { acciones: [ruta('Ir a mi cuenta', '/ingresar')] },
    )
  if (/\b(recetas?|cocinar|preparar|desayuno|almuerzo|cena)\b/.test(texto))
    return respuesta(
      `Tenemos ideas para tu mesa: ${RECETAS.slice(0, 3)
        .map((r) => r.nombre.toLowerCase())
        .join(', ')}. En Recetas puedes ver los pasos y agregar sus productos.`,
      { acciones: [ruta('Descubrir recetas', '/recetas')] },
    )
  if (/\b(como|puedo)\b/.test(texto) && /\b(agregar|anadir|quitar|eliminar|vaciar)\b/.test(texto))
    return respuesta(
      'Busca un producto y pulsa Agregar. También puedes escribirme «agrega 2 leches». Para ajustar cantidades o quitar productos, abre tu carrito.',
      { acciones: [carrito], sugerencias: ['Busco leche', 'Ver ofertas'] },
    )
  if (/^(seguir buscando|buscar de nuevo)$/.test(texto))
    return respuesta(
      '¿Qué buscas para tu mercado? Dime el nombre de un producto, una categoría o tu presupuesto.',
      { sugerencias: SUGERENCIAS },
    )
  if (/^(quita|quitar|elimina|eliminar|vacia|vaciar|borra)\b/.test(texto))
    return respuesta(
      'Puedes quitar productos, ajustar cantidades o vaciar tu carrito desde este botón. Así revisas exactamente qué quieres conservar.',
      { acciones: [carrito] },
    )
  const agregar =
    /^(?:(?:por favor|puedes|me puedes|podrias|me podrias|quiero) )?(agrega(?:r(?:me)?|me)?|anade(?:me)?|anadir|pon(?:me)?|poner|mete)\b/.test(
      texto,
    )
  if (agregar) {
    const cantidad = cantidadSolicitada(texto)
    if (!Number.isSafeInteger(cantidad) || cantidad < 1 || cantidad > 99)
      return respuesta('Indica una cantidad entera entre 1 y 99, por ejemplo «agrega 2 leches».')
    const seleccion = referidos(texto, contexto, productos)
    const candidatos =
      seleccion === null ? buscarProductos(texto, productos).encontrados : seleccion
    if (!candidatos.length)
      return respuesta(
        'No encontré ese producto en el catálogo actual. Dime su nombre o elige uno de los productos disponibles.',
        { sugerencias: ['Ver ofertas', 'Buscar productos'] },
      )
    if (candidatos.length > 1)
      return respuesta(
        `¿Cuál prefieres? Puedes pulsar el producto o decir «agrega ${cantidad} del primero».`,
        {
          productos: candidatos.slice(0, 4).map((p) => p.id),
          cantidad,
          contexto: { ...contexto, ids: candidatos.slice(0, 4).map((p) => p.id) },
        },
      )
    const producto = candidatos[0]
    const enCarrito = items.find((i) => i.id === producto.id)?.cantidad || 0
    if (producto.stock < cantidad + enCarrito)
      return respuesta(
        producto.stock === 0
          ? `${producto.nombre} está agotado en este momento.`
          : `Hay ${producto.stock} unidades de ${producto.nombre} y ya tienes ${enCarrito} en tu carrito. Puedes agregar hasta ${Math.max(0, producto.stock - enCarrito)} más.`,
        { productos: [producto.id], acciones: [carrito] },
      )
    return respuesta('', {
      operacion: { productoId: producto.id, cantidad },
      contexto: { ...contexto, ids: [producto.id] },
    })
  }
  if (/\b(carrito|canasta|bolsa de compra)\b/.test(texto)) {
    const total = items.reduce((s, p) => s + p.precio * p.cantidad, 0),
      cantidad = items.reduce((s, p) => s + p.cantidad, 0)
    return respuesta(
      cantidad
        ? `Tu carrito tiene ${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'}:\n${items.map((p) => `${p.cantidad} × ${p.nombre} · ${dinero(p.precio * p.cantidad)}`).join('\n')}\n\nTotal: ${dinero(total)}.\nAbre el carrito para ajustar cantidades, quitar productos o finalizar la compra.`
        : 'Tu carrito está vacío. Busca un producto o descubre las ofertas para empezar.',
      { acciones: [carrito], sugerencias: items.length ? [] : ['Ver ofertas', 'Busco leche'] },
    )
  }
  if (
    (/\b(pagar|pago|pagos|finalizar|comprar|compra|compras)\b/.test(texto) &&
      buscarProductos(texto, productos).terminos.length === 0) ||
    /\b(finalizar compra|como compro|como comprar|medios de pago|tarjeta|nequi)\b/.test(texto)
  )
    return respuesta(
      'Revisa los productos en tu carrito y pulsa Finalizar compra. Necesitas iniciar sesión y elegir el punto de recogida. La confirmación se hace desde el carrito.',
      { acciones: [carrito] },
    )
  const mas = /^(ver |mostrar |muestra )?mas[.! ]*$/.test(texto)
  const consulta = mas && contexto.consulta ? contexto.consulta : texto
  const busqueda = buscarProductos(consulta, productos)
  const referencia = !mas ? referidos(texto, contexto, productos) : null
  if (
    referencia?.length &&
    /\b(precio|cuesta|stock|quedan|disponibilidad|ese|esa|primero|segundo)\b/.test(texto)
  )
    busqueda.encontrados = referencia
  const vocabulario = palabras(
    productos.map((p) => p.nombre).join(' ') + ' ' + CATEGORIAS.map((c) => c.nombre).join(' '),
  )
  const reconoce = busqueda.terminos.some((t) => vocabulario.includes(t))
  const esBusqueda =
    reconoce ||
    /^(busco|buscar|tienes|tienen|hay|venden|precio|cuanto cuesta|quiero|necesito)\b/.test(texto) ||
    busqueda.maximo !== null ||
    busqueda.ofertas ||
    busqueda.baratos ||
    /\b(catalogo|productos|categorias)\b/.test(texto) ||
    mas ||
    referencia?.length
  if (esBusqueda) {
    // Las palabras de navegación no son términos de producto.
    if (/^(catalogo|categorias|buscar productos|ver productos|productos)$/.test(consulta))
      busqueda.encontrados = productos.filter((p) => p.activo)
    const offset = mas ? (contexto.offset || 0) + 4 : 0
    const pagina = busqueda.encontrados.slice(offset, offset + 4)
    if (!pagina.length)
      return respuesta(
        mas && busqueda.encontrados.length
          ? 'Ya te mostré todos los resultados. Prueba otra categoría o producto.'
          : `No encontré productos para «${mensaje.trim()}». Prueba un nombre más corto o explora las categorías.`,
        {
          acciones: [ruta('Explorar categorías', '/categorias')],
          sugerencias: ['Busco arroz', 'Ver ofertas'],
        },
      )
    const ids = pagina.map((p) => p.id)
    const detalle =
      pagina.length === 1
        ? `${pagina[0].nombre}: ${dinero(pagina[0].precio)} por ${pagina[0].presentacion.toLowerCase()}. ${pagina[0].stock ? `Hay ${pagina[0].stock} unidades disponibles.` : 'Está agotado por ahora.'}`
        : `${busqueda.ofertas ? 'Estas son algunas ofertas actuales' : busqueda.baratos ? 'Estas opciones están ordenadas de menor a mayor precio' : 'Encontré estas opciones para ti'}. Puedes agregarlas aquí mismo.`
    return respuesta(detalle, {
      productos: ids,
      contexto: { consulta, offset, ids },
      sugerencias: [...(offset + 4 < busqueda.encontrados.length ? ['Ver más'] : []), 'Mi carrito'],
      acciones: [],
    })
  }
  return respuesta(
    'Puedo ayudarte con productos, ofertas, tu carrito, pedidos y dudas de RiverMarket. No tengo una respuesta para esa consulta. Prueba «busco arroz» o elige una opción.',
    { sugerencias: SUGERENCIAS },
  )
}
