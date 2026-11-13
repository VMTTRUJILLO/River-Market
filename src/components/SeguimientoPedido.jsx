import { seguimiento, destinoPedido } from '../domain/seguimiento'
export default function SeguimientoPedido({ pedido }) {
  const { pasos, indice, cancelado } = seguimiento(pedido)
  return <section className="rm-tracking" aria-label="Seguimiento del pedido">
    <div className="rm-account-heading"><h3>Seguimiento de tu pedido</h3><span className="rm-pill">{cancelado ? 'Cancelado' : pasos[indice]}</span></div>
    {cancelado ? <p>Este pedido fue cancelado.</p> : <ol className="rm-tracking-steps">{pasos.map((paso, i) => <li key={paso} className={i <= indice ? 'is-complete' : ''} aria-current={i === indice ? 'step' : undefined}><span aria-hidden="true">{i < indice ? '✓' : i + 1}</span><div><strong>{paso}</strong><small>{i === indice ? 'Estado actual' : i < indice ? 'Completado' : 'Próximo paso'}</small></div></li>)}</ol>}
    <p className="rm-destination"><strong>{pedido.entrega.tipo === 'domicilio' ? 'Entrega a domicilio' : 'Recogida en tienda'}</strong><br />{destinoPedido(pedido)}<br />{pedido.entrega.nombre} · {pedido.entrega.telefono}</p>
    {pedido.entrega.indicaciones && <p>{pedido.entrega.indicaciones}</p>}
  </section>
}
