import { pedidoFinalizado } from '../domain/seguimiento'
import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import { useTienda } from '../context/useTienda'
import { dinero, fecha } from '../utils/format'
import { Link } from '../utils/Link'
import { navigate } from '../utils/useRoute'
import MisPedidos from '../components/MisPedidos'
import './CuentaPage.css'
export default function CuentaPage() {
  const { usuario, cerrarSesion } = useAuth()
  const { ventas } = useTienda()
  const [error, setError] = useState('')
  const pedidos = ventas.filter(v => v.cliente.id === usuario.id)
  const activos = pedidos.filter(v => !pedidoFinalizado(v))
  return <main className="rm-account container section">
    <header className="rm-account-hero"><div><p className="rm-eyebrow">TU ESPACIO RIVERMARKET</p><h1 className="title is-2">¡Hola, {usuario.nombre}!</h1><p>Tu mercado, tus pedidos y todo lo que necesitas, en un solo lugar.</p></div><Link href="/#productos" className="button is-warning is-rounded">Explorar productos ↗</Link></header>
    <div className="rm-account-layout"><aside className="rm-account-profile"><span className="rm-avatar" aria-hidden="true">{usuario.nombre.slice(0,1).toUpperCase()}</span><h2 className="title is-4">Mi cuenta</h2><strong>{usuario.nombre}</strong><p>{usuario.email}</p><hr /><p>Información de tu cuenta</p><small>Tus compras y datos de entrega se conservan en el historial de cada pedido.</small>{usuario.rol === 'admin' && <Link className="button is-primary is-rounded mt-4" href="/admin">Administración</Link>}<button className="button is-light is-rounded mt-5" onClick={() => { try { cerrarSesion(); navigate('/') } catch(e) { setError(e.message) } }}>Cerrar sesión</button>{error && <p role="alert">{error}</p>}</aside>
    <div className="rm-account-content"><section className="rm-account-stats" aria-label="Resumen de actividad"><div><span>Pedidos realizados</span><strong>{pedidos.length}</strong></div><div><span>Pedidos activos</span><strong>{activos.length}</strong></div><div><span>Total en compras</span><strong>{dinero(pedidos.filter(v => v.estado !== 'Cancelada').reduce((s,v)=>s+v.total,0))}</strong></div></section><MisPedidos usuario={usuario} /><section className="rm-account-activity"><h2 className="title is-5">Actividad reciente</h2>{pedidos.length ? pedidos.slice().sort((a,b)=>b.fecha.localeCompare(a.fecha)).slice(0,5).map(v=><p key={v.id}><strong>{v.numero}</strong> · {v.estado}<small>{fecha(v.fecha)}</small></p>) : <p>Cuando realices tu primera compra, podrás consultar aquí tu actividad.</p>}</section></div></div>
  </main>
}
