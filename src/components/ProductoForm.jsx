import { useState } from 'react'
import { CATEGORIAS } from '../data/categorias'
import { useTienda } from '../context/useTienda'
import Modal from './Modal'
import ImagenProducto from './ImagenProducto'

export default function ProductoForm({ producto, cerrar }) {
  const { guardarProducto } = useTienda()
  const [form, setForm] = useState(
    producto
      ? { ...producto, precioAntes: producto.precioAntes || '' }
      : {
          nombre: '',
          categoria: CATEGORIAS[0].id,
          presentacion: '',
          precio: '',
          precioAntes: '',
          stock: '',
          imagen: '',
        },
  )
  const [error, setError] = useState('')
  const cambiar = (event) => setForm((actual) => ({ ...actual, [event.target.name]: event.target.value }))
  const enviar = (event) => {
    event.preventDefault()
    setError('')
    try {
      guardarProducto(form, producto?.id)
      cerrar()
    } catch (err) {
      setError(err.message)
    }
  }
  return (
    <Modal titulo={producto ? 'Editar producto' : 'Agregar producto'} cerrar={cerrar}>
      <form onSubmit={enviar}>
        <p className="mb-5 is-size-7">
          Los cambios se reflejan en el catálogo y quedan registrados en el historial.
        </p>
        <div className="field">
          <label className="label" htmlFor="prod-nombre">
            Nombre del producto
          </label>
          <input
            id="prod-nombre"
            className="input"
            name="nombre"
            required
            minLength={2}
            maxLength={100}
            value={form.nombre}
            onChange={cambiar}
            placeholder="Ej. Mango de temporada"
          />
        </div>
        <div className="columns">
          <div className="column">
            <label className="label" htmlFor="prod-categoria">
              Categoría
            </label>
            <div className="select is-fullwidth">
              <select id="prod-categoria" name="categoria" value={form.categoria} onChange={cambiar}>
                {CATEGORIAS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="column">
            <label className="label" htmlFor="prod-presentacion">
              Presentación
            </label>
            <input
              id="prod-presentacion"
              className="input"
              name="presentacion"
              required
              maxLength={80}
              value={form.presentacion}
              onChange={cambiar}
              placeholder="Ej. Kilo, bolsa 500 g"
            />
          </div>
        </div>
        <div className="columns">
          <div className="column">
            <label className="label" htmlFor="prod-precio">
              Precio (COP)
            </label>
            <input
              id="prod-precio"
              className="input"
              type="number"
              name="precio"
              min={1}
              max={100000000}
              step={1}
              required
              value={form.precio}
              onChange={cambiar}
            />
          </div>
          <div className="column">
            <label className="label" htmlFor="prod-anterior">
              Precio anterior (opcional)
            </label>
            <input
              id="prod-anterior"
              className="input"
              type="number"
              name="precioAntes"
              min={0}
              max={100000000}
              step={1}
              value={form.precioAntes}
              onChange={cambiar}
            />
            <p className="help">Solo si hay descuento.</p>
          </div>
          <div className="column">
            <label className="label" htmlFor="prod-stock">
              Stock disponible
            </label>
            <input
              id="prod-stock"
              className="input"
              type="number"
              name="stock"
              min={0}
              max={100000000}
              step={1}
              required
              value={form.stock}
              onChange={cambiar}
            />
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor="prod-imagen">
            URL de imagen (opcional)
          </label>
          <input
            id="prod-imagen"
            className="input"
            type="url"
            name="imagen"
            maxLength={2000}
            value={form.imagen}
            onChange={cambiar}
            placeholder="https://..."
          />
          <p className="help">Si la imagen no está disponible, se mostrará una tarjeta de RiverMarket.</p>
        </div>
        <div className="rm-form-preview">
          <ImagenProducto
            src={form.imagen.startsWith('https://') ? form.imagen : ''}
            alt="Vista previa del producto"
          />
          <div>
            <strong>{form.nombre || 'Tu nuevo producto'}</strong>
            <p>{form.presentacion || 'Presentación del producto'}</p>
          </div>
        </div>
        {error && (
          <p className="notification is-danger is-light mt-4" role="alert">
            {error}
          </p>
        )}
        <div className="buttons is-right mt-5">
          <button type="button" className="button is-light is-rounded" onClick={cerrar}>
            Cancelar
          </button>
          <button type="submit" className="button is-primary is-rounded">
            {producto ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
