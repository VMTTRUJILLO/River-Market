import { useState } from 'react'
import { useTienda } from '../context/useTienda'
import { dinero, fecha } from '../utils/format'
import { useRoute } from '../utils/useRoute'
import EstadoVenta from './EstadoVenta'
import SeguimientoPedido from './SeguimientoPedido'
import { pedidoFinalizado, destinoPedido } from '../domain/seguimiento'
export default function MisPedidos({ usuario }) {
  const { ventas } = useTienda()
  const { search } = useRoute()
  const [filtro, setFiltro] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')
  const pedidos = ventas.filter(v => v.cliente.id === usuario.id).sort((a,b)=>b.fecha.localeCompare(a.fecha))
  const visibles = pedidos.filter(v => (filtro === 'Todos' || (filtro === 'Activos' ? !pedidoFinalizado(v) : v.estado === filtro)) && v.numero.toLowerCase().includes(busqueda.toLowerCase()))
  return <section className="rm-account-orders"><div className="rm-account-heading"><div><p className="rm-eyebrow">CADA COMPRA, A TU ALCANCE</p><h2 className="title is-4">Mis pedidos</h2></div><span>{pedidos.length} pedidos</span></div>
    <div className="rm-order-filters"><label>Buscar pedido<input className="input is-rounded" placeholder="RM-00004" value={busqueda} onChange={e=>setBusqueda(e.target.value)} /></label><label>Mostrar<select className="input" value={filtro} onChange={e=>setFiltro(e.target.value)}>{['Todos','Activos','Pedido recibido','Preparando tu mercado','En camino','Listo para recoger','Entregado','Recogido','Cancelada'].map(f=><option key={f}>{f}</option>)}</select></label></div>
    {!visibles.length && <div className="rm-account-empty"><h3>No hay pedidos para mostrar</h3><p>{pedidos.length ? 'Prueba otro filtro o número de pedido.' : 'Tu próxima compra tendrá su lugar aquí.'}</p></div>}
    {visibles.map(v=><details key={v.id} className="rm-account-order" open={search.get('pedido') === v.id || undefined}><summary><div><strong>{v.numero}</strong><small>{fecha(v.fecha)}</small></div><EstadoVenta estado={v.estado}/><strong>{dinero(v.total)}</strong><span className="rm-order-open">Ver detalle ↓</span></summary><div className="rm-account-order-body"><p>{v.items.reduce((s,i)=>s+i.cantidad,0)} productos · {destinoPedido(v)}</p><SeguimientoPedido pedido={v}/><h3 className="title is-6 mt-5">Resumen de compra</h3><ul className="rm-order-lines">{v.items.map(i=><li key={i.id}><span>{i.cantidad} × {i.nombre}<small>{i.presentacion}</small></span><strong>{dinero(i.precio*i.cantidad)}</strong></li>)}</ul><div className="rm-cart-total mt-4"><span>Total del pedido</span><strong>{dinero(v.total)}</strong></div><h3 className="title is-6 mt-5">Historial del pedido</h3>{v.cambios.map((c,i)=><p className="rm-history-event" key={i}><strong>{c.estado}</strong><small>{fecha(c.fecha)}</small></p>)}</div></details>)}
  </section>
}
