export default function EstadoVenta({ estado }) {
  const estilo =
    { Pendiente: 'is-warning', Confirmada: 'is-primary', Entregada: 'is-success', Cancelada: 'is-danger' }[
      estado
    ] || 'is-light'
  return <span className={`tag is-rounded is-light ${estilo}`}>{estado}</span>
}
