export const CARRITOS_KEY = 'rivermarket_carritos_v2'
export const CARRITO_ANTERIOR_KEY = 'rivermarket_carrito'
export const INVITADO = 'invitado'
export const propietarioCarrito = (usuario) => (usuario?.id ? `usuario:${usuario.id}` : INVITADO)

const itemValido = (item) =>
  item && typeof item.id === 'string' && Number.isSafeInteger(item.cantidad) && item.cantidad > 0

export function esCarritosValido(estado) {
  return (
    estado?.version === 2 &&
    estado.carritos &&
    typeof estado.carritos === 'object' &&
    !Array.isArray(estado.carritos) &&
    Object.entries(estado.carritos).every(
      ([propietario, items]) =>
        (propietario === INVITADO || propietario.startsWith('usuario:')) &&
        Array.isArray(items) &&
        items.every(itemValido),
    )
  )
}

export function crearCarritos(carritoAnterior = [], usuario = null) {
  // El carrito anterior no tenía propietario. Solo se recupera si hay una sesión
  // activa al actualizar; nunca se muestra como carrito público ni se asigna al siguiente visitante.
  return {
    version: 2,
    carritos:
      usuario?.id && Array.isArray(carritoAnterior)
        ? { [propietarioCarrito(usuario)]: carritoAnterior.filter(itemValido) }
        : {},
  }
}

export const obtenerCarrito = (estado, propietario) => estado.carritos[propietario] || []

export function guardarCarrito(estado, propietario, items) {
  return { ...estado, carritos: { ...estado.carritos, [propietario]: items } }
}

function combinarCarritos(cuenta, invitado) {
  const combinados = new Map(cuenta.map((item) => [item.id, { ...item }]))
  invitado.forEach((item) => {
    const anterior = combinados.get(item.id)
    const cantidad = (anterior?.cantidad || 0) + item.cantidad
    if (!Number.isSafeInteger(cantidad)) throw new Error('Revisa las cantidades de tu carrito.')
    combinados.set(item.id, { ...item, ...anterior, cantidad })
  })
  // La disponibilidad se sigue comprobando con el catálogo vigente en el carrito y al comprar.
  return [...combinados.values()]
}

export function cambiarSesionCarrito(estado, anterior, siguiente) {
  if (anterior === siguiente) return estado
  const invitado = obtenerCarrito(estado, INVITADO)
  if (siguiente === INVITADO) return guardarCarrito(estado, INVITADO, [])
  if (anterior !== INVITADO || !invitado.length) return estado
  const combinado = combinarCarritos(obtenerCarrito(estado, siguiente), invitado)
  return guardarCarrito(guardarCarrito(estado, siguiente, combinado), INVITADO, [])
}
