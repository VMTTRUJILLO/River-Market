export function seguimiento(pedido, tiempo = Date.now()) {
  const domicilio = pedido.entrega.tipo === 'domicilio'
  const pasos = ['Pedido recibido', 'Preparando tu mercado', domicilio ? 'En camino' : 'Listo para recoger', domicilio ? 'Entregado' : 'Recogido']
  const minutos = Math.max(0, (tiempo - Date.parse(pedido.fecha)) / 60000)
  const indice = pedido.estado === 'Entregada' ? 3 : pedido.estado === 'Pendiente' ? 0 : Math.min(2, Math.floor(minutos / 5))
  return { pasos, indice, cancelado: pedido.estado === 'Cancelada' }
}
export const destinoPedido = (pedido) => pedido.entrega.tipo === 'domicilio'
  ? pedido.entrega.direccion + ', ' + pedido.entrega.ciudad : pedido.entrega.tienda
