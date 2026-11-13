export default function EstadoVenta({ estado }) {
  const estilo =
    { 'Pedido recibido': 'is-warning', 'Preparando tu mercado': 'is-primary', 'En camino': 'is-info', 'Listo para recoger': 'is-info', Entregado: 'is-success', Recogido: 'is-success', Cancelada: 'is-danger' }[
      estado
    ] || 'is-light'
  return <span className={`tag is-rounded is-light ${estilo}`}>{estado}</span>
}
