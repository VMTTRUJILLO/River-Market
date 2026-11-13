export const ESTADOS_PEDIDO = [
  'Pedido recibido', 'Preparando tu mercado', 'En camino', 'Listo para recoger',
  'Entregado', 'Recogido', 'Cancelada',
]

export function pasosPedido(pedido) {
  const domicilio = pedido.entrega.tipo === 'domicilio'
  return ['Pedido recibido', 'Preparando tu mercado', domicilio ? 'En camino' : 'Listo para recoger', domicilio ? 'Entregado' : 'Recogido']
}

// Compatibilidad con pedidos e historial guardados antes del nuevo flujo.
export function normalizarEstado(estado, pedido) {
  return ({ Pendiente: 'Pedido recibido', Confirmada: 'Preparando tu mercado', Entregada: pasosPedido(pedido)[3] })[estado] || estado
}

export const pedidoFinalizado = (pedido) => ['Entregado', 'Recogido', 'Cancelada'].includes(normalizarEstado(pedido.estado, pedido))

export function transicionesPedido(pedido) {
  const pasos = pasosPedido(pedido)
  const indice = pasos.indexOf(normalizarEstado(pedido.estado, pedido))
  return indice >= 0 && indice < 3 ? [pasos[indice + 1], 'Cancelada'] : []
}

export function seguimiento(pedido) {
  const pasos = pasosPedido(pedido)
  const estado = normalizarEstado(pedido.estado, pedido)
  return { pasos, indice: Math.max(0, pasos.indexOf(estado)), cancelado: estado === 'Cancelada' }
}

export const destinoPedido = (pedido) => pedido.entrega.tipo === 'domicilio'
  ? pedido.entrega.direccion + ', ' + pedido.entrega.ciudad : pedido.entrega.tienda
