import { useCallback, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { useTienda } from '../context/useTienda'
import { CATEGORIAS } from '../data/categorias'
import { ESTADOS_VENTA } from '../domain/tienda'
import { dinero, fecha, diaLocal, normalizar } from '../utils/format'
import { Link } from '../utils/Link'
import Modal from '../components/Modal'
import ProductoForm from '../components/ProductoForm'
import VentaDetalle from '../components/VentaDetalle'
import EstadoVenta from '../components/EstadoVenta'
import ImagenProducto from '../components/ImagenProducto'
import './AdminPage.css'

const cobrada = (venta) => ['Confirmada', 'Entregada'].includes(venta.estado)
const sumaVentas = (ventas) => ventas.filter(cobrada).reduce((sum, v) => sum + v.total, 0)
const categoriaNombre = (id) => CATEGORIAS.find((c) => c.id === id)?.nombre || id
function SinDatos({ texto = 'No hay registros que coincidan con los filtros.' }) {
  return (
    <div className="rm-empty-state">
      <h3 className="title is-5">Nada por aquí todavía</h3>
      <p>{texto}</p>
    </div>
  )
}
function TablaVentas({ ventas, seleccionar }) {
  if (!ventas.length) return <SinDatos />
  return (
    <div className="table-container">
      <table className="table is-fullwidth rm-admin-table">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Estado</th>
            <th>
              <span className="is-sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((v) => (
            <tr key={v.id}>
              <td>
                <strong>{v.numero}</strong>
                {v.demo && <small className="rm-table-subtext">De prueba</small>}
              </td>
              <td>
                {v.cliente.nombre}
                <small className="rm-table-subtext">{v.cliente.email}</small>
              </td>
              <td className="rm-nowrap">{fecha(v.fecha)}</td>
              <td className="rm-nowrap">
                <strong>{dinero(v.total)}</strong>
              </td>
              <td>
                <EstadoVenta estado={v.estado} />
              </td>
              <td>
                <button
                  className="button is-small is-primary is-light is-rounded"
                  aria-label={`Ver pedido ${v.numero}`}
                  onClick={() => seleccionar(v.id)}
                >
                  Ver detalle →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AdminPage() {
  const [fechaReferencia] = useState(() => Date.now())
  const { usuario } = useAuth()
  const { productos, ventas, historial, eliminarProducto } = useTienda()
  const [seccion, setSeccion] = useState('resumen')
  const [filtro, setFiltro] = useState('')
  const [categoria, setCategoria] = useState('')
  const [stock, setStock] = useState('')
  const [estadoVenta, setEstadoVenta] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [productoHistorial, setProductoHistorial] = useState('')
  const [tipoMovimiento, setTipoMovimiento] = useState('')
  const [limite, setLimite] = useState(20)
  const [modal, setModal] = useState(null)
  const [error, setError] = useState('')
  const cerrarModal = useCallback(() => {
    setModal(null)
    setError('')
  }, [])
  if (usuario?.rol !== 'admin')
    return (
      <main className="section container">
        <div className="rm-admin-access box">
          <span className="rm-eyebrow">ADMINISTRACIÓN RIVERMARKET</span>
          <h1 className="title is-3 mt-3">
            {usuario ? 'Acceso para administradores' : 'Inicia sesión para administrar'}
          </h1>
          <p className="mb-5">
            Este espacio permite gestionar productos, inventario y ventas de demostración.
          </p>
          <Link className="button is-primary is-rounded" href="/ingresar">
            {usuario ? 'Cambiar de cuenta' : 'Ir a iniciar sesión'}
          </Link>
          <Link className="button is-light is-rounded ml-2" href="/">
            Volver a la tienda
          </Link>
        </div>
      </main>
    )

  const activos = productos.filter((p) => p.activo)
  const alertas = activos.filter((p) => p.stock <= 5).sort((a, b) => a.stock - b.stock)
  const texto = normalizar(filtro)
  const productosFiltrados = productos.filter(
    (p) =>
      (stock === 'eliminados' ? !p.activo : p.activo) &&
      (!categoria || p.categoria === categoria) &&
      normalizar(`${p.nombre} ${p.presentacion}`).includes(texto) &&
      (stock === 'bajo' ? p.stock > 0 && p.stock <= 5 : stock === 'agotado' ? p.stock === 0 : true),
  )
  const ventasFiltradas = ventas.filter(
    (v) =>
      (!estadoVenta || v.estado === estadoVenta) &&
      (!desde || diaLocal(v.fecha) >= desde) &&
      (!hasta || diaLocal(v.fecha) <= hasta) &&
      normalizar(`${v.numero} ${v.cliente.nombre} ${v.cliente.email}`).includes(texto),
  )
  const movimientos = historial.filter(
    (m) =>
      (!productoHistorial || m.productoId === productoHistorial) &&
      (!tipoMovimiento || m.tipo === tipoMovimiento) &&
      normalizar(`${m.nombre} ${m.nota || ''} ${m.actor}`).includes(texto),
  )
  const cambiarSeccion = (id) => {
    setSeccion(id)
    setFiltro('')
    setLimite(20)
  }
  const verHistorial = (id) => {
    setProductoHistorial(id)
    cambiarSeccion('historial')
  }
  const borrar = () => {
    try {
      eliminarProducto(modal.producto.id)
      cerrarModal()
    } catch (err) {
      setError(err.message)
    }
  }
  const abrirVenta = (id) => setModal({ tipo: 'venta', id })
  const dias = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(fechaReferencia - (6 - i) * 86400000)
    const dia = diaLocal(date)
    return {
      dia,
      etiqueta: date.toLocaleDateString('es-CO', { weekday: 'short', timeZone: 'America/Bogota' }),
      total: sumaVentas(ventas.filter((v) => diaLocal(v.fecha) === dia)),
    }
  })
  const maxDia = Math.max(...dias.map((d) => d.total), 1)

  return (
    <main className="section rm-admin-page">
      <div className="container">
        <header className="rm-admin-header">
          <div>
            <p className="rm-eyebrow">TU TIENDA, BAJO CONTROL</p>
            <h1 className="title is-2 mt-2 mb-2">Administración</h1>
            <p>Hola, {usuario.nombre}. Así va RiverMarket.</p>
          </div>
          <Link href="/" className="button is-primary is-light is-rounded">
            Ver tienda →
          </Link>
        </header>
        <div className="rm-admin-demo">
          <span className="tag is-warning is-rounded">Demostración</span>
          <p>
            Productos, inventario y ventas guardados en este navegador. Todos los importes están en pesos
            colombianos.
          </p>
        </div>
        <nav className="rm-admin-nav" aria-label="Secciones de administración">
          {[
            ['resumen', 'Resumen', '◫'],
            ['productos', 'Productos', '◇'],
            ['ventas', 'Ventas', '$'],
            ['historial', 'Historial', '↺'],
          ].map(([id, label, icono]) => (
            <button
              key={id}
              className={seccion === id ? 'is-active' : ''}
              onClick={() => cambiarSeccion(id)}
              aria-pressed={seccion === id}
            >
              <span aria-hidden="true">{icono}</span>
              {label}
              {id === 'productos' && <small>{activos.length}</small>}
            </button>
          ))}
        </nav>

        {seccion === 'resumen' && (
          <>
            <section className="rm-metrics" aria-label="Resumen de la tienda">
              <article className="box rm-metric rm-metric-featured">
                <p>Ventas confirmadas</p>
                <strong>{dinero(sumaVentas(ventas))}</strong>
                <small>Confirmadas y entregadas · Total histórico</small>
              </article>
              <article className="box rm-metric">
                <p>Pedidos recibidos</p>
                <strong>{ventas.length}</strong>
                <small>{ventas.filter((v) => v.estado === 'Pendiente').length} pendientes de confirmar</small>
              </article>
              <article className="box rm-metric">
                <p>Productos en catálogo</p>
                <strong>{activos.length}</strong>
                <small>{activos.reduce((sum, p) => sum + p.stock, 0)} unidades disponibles</small>
              </article>
              <article className="box rm-metric">
                <p>Por reabastecer</p>
                <strong>
                  {alertas.length}
                  <span className="rm-metric-dot" />
                </strong>
                <small>Productos con 5 unidades o menos</small>
              </article>
            </section>
            <div className="columns mt-1">
              <section className="column is-7">
                <div className="box rm-admin-box">
                  <div className="rm-section-heading">
                    <div>
                      <h2 className="title is-5 mb-2">Ventas de la semana</h2>
                      <p className="is-size-7 has-text-grey">Últimos 7 días · Confirmadas y entregadas</p>
                    </div>
                    <span className="tag is-primary is-light is-rounded">COP</span>
                  </div>
                  <div className="rm-sales-chart" aria-label="Ventas por día">
                    {dias.map((d) => (
                      <div className="rm-chart-day" key={d.dia}>
                        <span className="rm-chart-value">{dinero(d.total)}</span>
                        <div className="rm-chart-track">
                          <div
                            className="rm-chart-bar"
                            style={{
                              height: `${Math.max(2, (d.total / maxDia) * 100)}%`,
                              opacity: d.total ? 1 : 0.15,
                            }}
                          />
                        </div>
                        <strong>{d.etiqueta}</strong>
                        <small>{d.dia.slice(5)}</small>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
              <section className="column is-5">
                <div className="box rm-admin-box">
                  <h2 className="title is-5">Atención al inventario</h2>
                  <p className="is-size-7 mb-4">
                    Repón tus productos para que nadie se quede sin sus favoritos.
                  </p>
                  {alertas.length ? (
                    <ul className="rm-stock-alerts">
                      {alertas.slice(0, 4).map((p) => (
                        <li key={p.id}>
                          <ImagenProducto src={p.imagen} alt="" />
                          <div>
                            <strong>{p.nombre}</strong>
                            <span
                              className={`tag is-light is-rounded ${p.stock === 0 ? 'is-danger' : 'is-warning'}`}
                            >
                              {p.stock === 0 ? 'Agotado' : `${p.stock} disponibles`}
                            </span>
                          </div>
                          <button
                            className="button is-small is-primary is-light is-rounded"
                            onClick={() => setModal({ tipo: 'producto', producto: p })}
                            aria-label={`Reponer ${p.nombre}`}
                          >
                            Reponer
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="notification is-primary is-light">
                      Tu inventario tiene buenas existencias.
                    </p>
                  )}
                  <button
                    className="button is-text is-small mt-4"
                    onClick={() => {
                      setStock('')
                      cambiarSeccion('productos')
                    }}
                  >
                    Ver inventario completo →
                  </button>
                </div>
              </section>
            </div>
            <section className="box rm-admin-box">
              <div className="rm-section-heading">
                <h2 className="title is-5 mb-0">Pedidos recientes</h2>
                <button
                  className="button is-primary is-light is-small is-rounded"
                  onClick={() => cambiarSeccion('ventas')}
                >
                  Ver todas las ventas
                </button>
              </div>
              <TablaVentas ventas={ventas.slice(0, 5)} seleccionar={abrirVenta} />
            </section>
          </>
        )}

        {seccion === 'productos' && (
          <section className="box rm-admin-box">
            <div className="rm-section-heading">
              <div>
                <h2 className="title is-4 mb-2">Productos e inventario</h2>
                <p className="is-size-7">Administra tu catálogo, precios y existencias.</p>
              </div>
              <button className="button is-primary is-rounded" onClick={() => setModal({ tipo: 'producto' })}>
                + Agregar producto
              </button>
            </div>
            <div className="rm-admin-filters">
              <div className="field rm-filter-grow">
                <label className="label" htmlFor="admin-producto-buscar">
                  Buscar producto
                </label>
                <input
                  id="admin-producto-buscar"
                  className="input"
                  type="search"
                  placeholder="Nombre o presentación"
                  value={filtro}
                  onChange={(e) => {
                    setFiltro(e.target.value)
                    setLimite(20)
                  }}
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="admin-categoria">
                  Categoría
                </label>
                <div className="select is-fullwidth">
                  <select
                    id="admin-categoria"
                    value={categoria}
                    onChange={(e) => {
                      setCategoria(e.target.value)
                      setLimite(20)
                    }}
                  >
                    <option value="">Todas las categorías</option>
                    {CATEGORIAS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label className="label" htmlFor="admin-stock">
                  Disponibilidad
                </label>
                <div className="select is-fullwidth">
                  <select
                    id="admin-stock"
                    value={stock}
                    onChange={(e) => {
                      setStock(e.target.value)
                      setLimite(20)
                    }}
                  >
                    <option value="">Todos los activos</option>
                    <option value="bajo">Stock bajo (1–5)</option>
                    <option value="agotado">Agotados</option>
                    <option value="eliminados">Eliminados</option>
                  </select>
                </div>
              </div>
            </div>
            <p className="is-size-7 mb-3">{productosFiltrados.length} productos encontrados</p>
            {!productosFiltrados.length ? (
              <SinDatos />
            ) : (
              <div className="table-container">
                <table className="table is-fullwidth rm-admin-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosFiltrados.slice(0, limite).map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="rm-table-product">
                            <ImagenProducto src={p.imagen} alt="" loading="lazy" />
                            <div>
                              <strong>{p.nombre}</strong>
                              <small className="rm-table-subtext">{p.presentacion}</small>
                            </div>
                          </div>
                        </td>
                        <td>{categoriaNombre(p.categoria)}</td>
                        <td className="rm-nowrap">
                          <strong>{dinero(p.precio)}</strong>
                          {p.precioAntes > p.precio && (
                            <del className="rm-table-subtext">{dinero(p.precioAntes)}</del>
                          )}
                        </td>
                        <td>
                          <span
                            className={`tag is-rounded is-light ${!p.activo ? '' : p.stock === 0 ? 'is-danger' : p.stock <= 5 ? 'is-warning' : 'is-primary'}`}
                          >
                            {p.stock} uds.
                          </span>
                          {!p.activo && <small className="rm-table-subtext">Eliminado</small>}
                        </td>
                        <td>
                          <div className="rm-row-actions">
                            {p.activo && (
                              <button
                                className="button is-small is-primary is-light is-rounded"
                                aria-label={`Editar ${p.nombre}`}
                                onClick={() => setModal({ tipo: 'producto', producto: p })}
                              >
                                Editar
                              </button>
                            )}
                            <button
                              className="button is-small is-light is-rounded"
                              aria-label={`Historial de ${p.nombre}`}
                              onClick={() => verHistorial(p.id)}
                            >
                              Historial
                            </button>
                            {p.activo && (
                              <button
                                className="button is-small is-danger is-light is-rounded"
                                aria-label={`Eliminar ${p.nombre}`}
                                onClick={() => setModal({ tipo: 'eliminar', producto: p })}
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {productosFiltrados.length > limite && (
              <button className="button is-light is-rounded" onClick={() => setLimite(limite + 20)}>
                Mostrar más productos
              </button>
            )}
          </section>
        )}

        {seccion === 'ventas' && (
          <section className="box rm-admin-box">
            <div className="rm-section-heading">
              <div>
                <h2 className="title is-4 mb-2">Control de ventas</h2>
                <p className="is-size-7">Consulta pedidos, confirma entregas y gestiona cancelaciones.</p>
              </div>
              <span className="tag is-primary is-light is-medium is-rounded">
                {ventasFiltradas.length} pedidos
              </span>
            </div>
            <div className="rm-admin-filters">
              <div className="field rm-filter-grow">
                <label className="label" htmlFor="ventas-buscar">
                  Buscar pedido o cliente
                </label>
                <input
                  id="ventas-buscar"
                  type="search"
                  className="input"
                  value={filtro}
                  onChange={(e) => {
                    setFiltro(e.target.value)
                    setLimite(20)
                  }}
                  placeholder="RM-00001 o nombre del cliente"
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="ventas-estado">
                  Estado
                </label>
                <div className="select">
                  <select
                    id="ventas-estado"
                    value={estadoVenta}
                    onChange={(e) => {
                      setEstadoVenta(e.target.value)
                      setLimite(20)
                    }}
                  >
                    <option value="">Todos</option>
                    {ESTADOS_VENTA.map((e) => (
                      <option key={e}>{e}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label className="label" htmlFor="ventas-desde">
                  Desde
                </label>
                <input
                  id="ventas-desde"
                  className="input"
                  type="date"
                  value={desde}
                  max={hasta || undefined}
                  onChange={(e) => setDesde(e.target.value)}
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="ventas-hasta">
                  Hasta
                </label>
                <input
                  id="ventas-hasta"
                  className="input"
                  type="date"
                  value={hasta}
                  min={desde || undefined}
                  onChange={(e) => setHasta(e.target.value)}
                />
              </div>
              <button
                className="button is-light is-rounded"
                onClick={() => {
                  setFiltro('')
                  setEstadoVenta('')
                  setDesde('')
                  setHasta('')
                }}
              >
                Limpiar filtros
              </button>
            </div>
            {desde && hasta && desde > hasta && (
              <p className="notification is-warning is-light" role="alert">
                La fecha inicial debe ser anterior o igual a la fecha final.
              </p>
            )}
            <div className="rm-sales-filter-total">
              <span>Ingresos de los pedidos filtrados</span>
              <strong>{dinero(sumaVentas(ventasFiltradas))}</strong>
              <small>Solo confirmados y entregados</small>
            </div>
            <TablaVentas ventas={ventasFiltradas.slice(0, limite)} seleccionar={abrirVenta} />
            {ventasFiltradas.length > limite && (
              <button className="button is-light is-rounded" onClick={() => setLimite(limite + 20)}>
                Mostrar más ventas
              </button>
            )}
          </section>
        )}

        {seccion === 'historial' && (
          <section className="box rm-admin-box">
            <h2 className="title is-4 mb-2">Historial de inventario</h2>
            <p className="is-size-7 mb-5">
              Cada alta, edición, venta y devolución, incluso de productos eliminados.
            </p>
            <div className="rm-admin-filters">
              <div className="field rm-filter-grow">
                <label className="label" htmlFor="historial-buscar">
                  Buscar movimiento
                </label>
                <input
                  id="historial-buscar"
                  className="input"
                  type="search"
                  value={filtro}
                  onChange={(e) => {
                    setFiltro(e.target.value)
                    setLimite(20)
                  }}
                  placeholder="Producto, pedido o responsable"
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="historial-producto">
                  Producto
                </label>
                <div className="select is-fullwidth">
                  <select
                    id="historial-producto"
                    value={productoHistorial}
                    onChange={(e) => {
                      setProductoHistorial(e.target.value)
                      setLimite(20)
                    }}
                  >
                    <option value="">Todos los productos</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                        {!p.activo ? ' (eliminado)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label className="label" htmlFor="historial-tipo">
                  Tipo
                </label>
                <div className="select">
                  <select
                    id="historial-tipo"
                    value={tipoMovimiento}
                    onChange={(e) => {
                      setTipoMovimiento(e.target.value)
                      setLimite(20)
                    }}
                  >
                    <option value="">Todos</option>
                    {['Inventario inicial', 'Creación', 'Edición', 'Venta', 'Devolución', 'Eliminación'].map(
                      (t) => (
                        <option key={t}>{t}</option>
                      ),
                    )}
                  </select>
                </div>
              </div>
            </div>
            <p className="is-size-7 mb-3">{movimientos.length} movimientos</p>
            {!movimientos.length ? (
              <SinDatos />
            ) : (
              <div className="table-container">
                <table className="table is-fullwidth rm-admin-table">
                  <thead>
                    <tr>
                      <th>Fecha / responsable</th>
                      <th>Producto</th>
                      <th>Movimiento</th>
                      <th>Stock antes → después</th>
                      <th>Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.slice(0, limite).map((m) => (
                      <tr key={m.id}>
                        <td className="rm-nowrap">
                          {fecha(m.fecha)}
                          <small className="rm-table-subtext">{m.actor}</small>
                        </td>
                        <td>
                          <strong>{m.nombre}</strong>
                        </td>
                        <td>
                          <span className="tag is-rounded is-light">{m.tipo}</span>
                        </td>
                        <td className="rm-nowrap">
                          {m.stockAntes} → <strong>{m.stockDespues}</strong>
                          <small className="rm-table-subtext">
                            {m.stockDespues - m.stockAntes > 0 ? '+' : ''}
                            {m.stockDespues - m.stockAntes} unidades
                          </small>
                        </td>
                        <td>
                          <p className="is-size-7">{m.nota}</p>
                          {m.antes && (
                            <details className="rm-history-details">
                              <summary>Ver cambios</summary>
                              {[
                                'nombre',
                                'presentacion',
                                'categoria',
                                'precio',
                                'precioAntes',
                                'stock',
                                'imagen',
                              ]
                                .filter((k) => m.antes[k] !== m.despues[k])
                                .map((k) => (
                                  <p key={k}>
                                    <b>
                                      {
                                        {
                                          nombre: 'Nombre',
                                          presentacion: 'Presentación',
                                          categoria: 'Categoría',
                                          precio: 'Precio',
                                          precioAntes: 'Precio anterior',
                                          stock: 'Stock',
                                          imagen: 'Imagen',
                                        }[k]
                                      }
                                      :
                                    </b>{' '}
                                    {String(m.antes[k] || '—')} → {String(m.despues[k] || '—')}
                                  </p>
                                ))}
                            </details>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {movimientos.length > limite && (
              <button className="button is-light is-rounded" onClick={() => setLimite(limite + 20)}>
                Mostrar más movimientos
              </button>
            )}
          </section>
        )}
        <p className="rm-admin-footnote">RiverMarket · Administración de demostración · Hora de Colombia</p>
        {modal?.tipo === 'producto' && <ProductoForm producto={modal.producto} cerrar={cerrarModal} />}
        {modal?.tipo === 'venta' && <VentaDetalle id={modal.id} cerrar={cerrarModal} />}
        {modal?.tipo === 'eliminar' && (
          <Modal titulo="Eliminar producto" cerrar={cerrarModal}>
            <p>
              ¿Quieres eliminar <strong>{modal.producto.nombre}</strong> del catálogo?
            </p>
            <p className="is-size-7 mt-3">
              Dejará de estar disponible para comprar. Sus ventas y movimientos permanecerán en el historial.
            </p>
            {error && (
              <p className="notification is-danger is-light mt-4" role="alert">
                {error}
              </p>
            )}
            <div className="buttons is-right mt-5">
              <button className="button is-light is-rounded" onClick={cerrarModal}>
                Conservar producto
              </button>
              <button className="button is-danger is-rounded" onClick={borrar}>
                Sí, eliminar producto
              </button>
            </div>
          </Modal>
        )}
      </div>
    </main>
  )
}
