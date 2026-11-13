import ArrowUpRight from '../components/ArrowUpRight'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { consultarAlimento, codigoValido } from '../services/alimentos'
import { useEntrada } from '../utils/useEntrada'
import { Link } from '../utils/Link'
import ImagenProducto from '../components/ImagenProducto'
import './Nutricion.css'

const EJEMPLOS = [
  { codigo: '3017620422003', nombre: 'Crema de avellanas' },
  { codigo: '5449000000996', nombre: 'Bebida de cola' },
]
const numero = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 })

function FichaAlimento({ alimento }) {
  return (
    <article className="rm-food-result" aria-labelledby="alimento-nombre">
      <div className="rm-food-overview">
        <div className="rm-food-image">
          <ImagenProducto src={alimento.imagen} alt={alimento.nombre} />
        </div>
        <div className="rm-food-title">
          <p className="rm-eyebrow">{alimento.marca || 'ETIQUETA DEL PRODUCTO'}</p>
          <h2 className="title is-3 mt-2" id="alimento-nombre">
            {alimento.nombre}
          </h2>
          {alimento.cantidad && <p className="mb-3">{alimento.cantidad}</p>}
          <p className="is-size-7">Código de barras: {alimento.codigo}</p>
          <a href={alimento.fuente} target="_blank" rel="noreferrer" className="rm-food-source">
            Ver ficha en Open Food Facts <ArrowUpRight />
          </a>
        </div>
        <div className="rm-score">
          <p className="has-text-weight-bold">Nutri-Score</p>
          {alimento.nutriscore ? (
            <div className="rm-score-scale" aria-label={`Nutri-Score ${alimento.nutriscore}`}>
              {'ABCDE'.split('').map((letra) => (
                <span
                  key={letra}
                  className={`rm-score-${letra.toLowerCase()} ${letra === alimento.nutriscore ? 'is-selected' : ''}`}
                  aria-hidden="true"
                >
                  {letra}
                </span>
              ))}
            </div>
          ) : (
            <p className="is-size-7 mt-3">Sin puntuación disponible</p>
          )}
          <p className="is-size-7 mt-3">Compara productos de la misma categoría.</p>
        </div>
      </div>
      <div className="rm-food-detail">
        <h3 className="title is-5 mb-2">Una mirada a sus nutrientes</h3>
        <p className="is-size-7 mb-4">
          Por 100 g o 100 ml, según la presentación indicada en el envase.
        </p>
        <dl className="rm-nutrients">
          {alimento.nutrientes.map((nutriente) => (
            <div key={nutriente.nombre}>
              <dt>{nutriente.nombre}</dt>
              <dd>
                {nutriente.valor === null ? (
                  <span className="is-size-7">No disponible</span>
                ) : (
                  <>
                    <strong>{numero.format(nutriente.valor)}</strong>{' '}
                    <span>{nutriente.unidad}</span>
                  </>
                )}
              </dd>
            </div>
          ))}
        </dl>
        <div className="columns is-variable is-6 mt-4">
          <section className="column is-7">
            <h3 className="title is-5">Ingredientes</h3>
            <p className="rm-ingredients">
              {alimento.ingredientes || 'Este producto todavía no tiene ingredientes registrados.'}
            </p>
            {alimento.ingredientes && !alimento.ingredientesEnEspanol && (
              <p className="is-size-7 mt-3">Información en el idioma original de la etiqueta.</p>
            )}
          </section>
          <section className="column">
            <h3 className="title is-5">Alérgenos declarados</h3>
            {alimento.alergenos.length ? (
              <ul className="tags">
                {alimento.alergenos.map((alergeno) => (
                  <li key={alergeno} className="tag is-warning is-light is-rounded">
                    {alergeno}
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                No hay alérgenos registrados en esta ficha. Esto no significa que el producto esté
                libre de alérgenos.
              </p>
            )}
            <p className="is-size-7 mt-3">
              Revisa siempre el envase, especialmente si tienes alergias. La información de la
              comunidad puede estar incompleta o cambiar.
            </p>
          </section>
        </div>
      </div>
    </article>
  )
}

export default function NutricionPage() {
  const [codigo, setCodigo] = useState('')
  const [estado, setEstado] = useState({ tipo: 'inicio' })
  const peticion = useRef(null)
  const resultado = useRef(null)
  const raiz = useRef(null)
  useEffect(() => () => peticion.current?.abort(), [])
  useEntrada(resultado, [estado], ':scope > *')
  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        if (estado.tipo === 'cargando')
          gsap.to('.rm-loading-dot', {
            y: -6,
            duration: 0.4,
            stagger: 0.14,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
          })
      })
      return () => media.revert()
    },
    { scope: raiz, dependencies: [estado.tipo], revertOnUpdate: true },
  )

  const consultar = async (valor) => {
    let limpio
    try {
      limpio = codigoValido(valor)
    } catch (error) {
      peticion.current?.abort()
      setEstado({ tipo: 'error', mensaje: error.message })
      return
    }
    peticion.current?.abort()
    const controller = new AbortController()
    peticion.current = controller
    setCodigo(limpio)
    setEstado({ tipo: 'cargando' })
    try {
      const alimento = await consultarAlimento(limpio, {
        signal: controller.signal,
      })
      if (controller.signal.aborted) return
      setEstado(alimento ? { tipo: 'listo', alimento } : { tipo: 'vacio', codigo: limpio })
    } catch (error) {
      if (!controller.signal.aborted) setEstado({ tipo: 'error', mensaje: error.message })
    }
  }
  return (
    <main className="section rm-nutrition-page" ref={raiz}>
      <div className="container">
        <Link href="/" className="rm-food-back">
          ← Volver al mercado
        </Link>
        <header className="rm-nutrition-heading">
          <p className="rm-eyebrow">ELIGE CON MÁS INFORMACIÓN</p>
          <h1 className="title">Conoce lo que llevas</h1>
          <p>
            Tu etiqueta, más clara. Consulta alimentos por su código de barras y descubre qué hay
            detrás de cada ingrediente.
          </p>
        </header>
        <section className="rm-food-search" aria-label="Buscar información nutricional">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              consultar(codigo)
            }}
          >
            <label className="label" htmlFor="codigo-alimento">
              Código de barras del envase
            </label>
            <div className="rm-food-search-controls">
              <input
                id="codigo-alimento"
                className="input is-rounded"
                inputMode="numeric"
                autoComplete="off"
                maxLength={24}
                placeholder="Ej. 3017620422003"
                value={codigo}
                onChange={(event) => setCodigo(event.target.value)}
                aria-describedby="codigo-ayuda"
              />
              <button
                type="submit"
                className="button is-primary is-rounded"
                disabled={estado.tipo === 'cargando'}
              >
                Consultar alimento{' '}
                <span className="ml-3" aria-hidden="true">
                  <ArrowUpRight />
                </span>
              </button>
            </div>
            <p className="help" id="codigo-ayuda">
              Encuentra los números debajo de las barras. También puedes explorar una de estas
              etiquetas:
            </p>
          </form>
          <div className="rm-food-examples">
            {EJEMPLOS.map((ejemplo) => (
              <button
                className="button is-small is-rounded is-light"
                key={ejemplo.codigo}
                onClick={() => consultar(ejemplo.codigo)}
                disabled={estado.tipo === 'cargando'}
              >
                {ejemplo.nombre}{' '}
                <span className="ml-2" aria-hidden="true">
                  <ArrowUpRight />
                </span>
              </button>
            ))}
          </div>
        </section>
        <div ref={resultado} className="rm-food-results" aria-busy={estado.tipo === 'cargando'}>
          {estado.tipo === 'inicio' && (
            <div className="rm-food-welcome">
              <span aria-hidden="true">✦</span>
              <h2 className="title is-4">Pequeñas etiquetas, grandes descubrimientos</h2>
              <p>
                Ingredientes, nutrientes y alérgenos en un solo lugar.
                <br />
                Empieza con un código o elige una etiqueta de arriba.
              </p>
            </div>
          )}
          {estado.tipo === 'cargando' && (
            <div className="rm-food-welcome" role="status">
              <div className="rm-loading" aria-hidden="true">
                <i className="rm-loading-dot" />
                <i className="rm-loading-dot" />
                <i className="rm-loading-dot" />
              </div>
              <p>Consultando la etiqueta en Open Food Facts…</p>
            </div>
          )}
          {estado.tipo === 'vacio' && (
            <div className="rm-empty-state" role="status">
              <span className="rm-empty-symbol" aria-hidden="true">
                ⌕
              </span>
              <h2 className="title is-4 mt-2">Aún no encontramos esta etiqueta</h2>
              <p>
                El código {estado.codigo} no está registrado en Open Food Facts. Revisa los números
                o consulta otro alimento.
              </p>
            </div>
          )}
          {estado.tipo === 'error' && (
            <div className="notification is-warning is-light" role="alert">
              <p>{estado.mensaje}</p>
              <p className="is-size-7 mt-2">Puedes ajustar el código y volver a consultar.</p>
            </div>
          )}
          {estado.tipo === 'listo' && (
            <>
              <p className="is-sr-only" role="status">
                Ficha encontrada: {estado.alimento.nombre}.
              </p>
              <FichaAlimento alimento={estado.alimento} />
            </>
          )}
        </div>
        <footer className="rm-food-attribution">
          <p>
            Datos abiertos de{' '}
            <a href="https://world.openfoodfacts.org/" target="_blank" rel="noreferrer">
              Open Food Facts
            </a>{' '}
            ·{' '}
            <a
              href="https://opendatacommons.org/licenses/odbl/1-0/"
              target="_blank"
              rel="noreferrer"
            >
              ODbL
            </a>
            . Fotografías de sus colaboradores bajo{' '}
            <a
              href="https://creativecommons.org/licenses/by-sa/3.0/"
              target="_blank"
              rel="noreferrer"
            >
              CC BY-SA 3.0
            </a>
            .
          </p>
          <p>La disponibilidad de una ficha nutricional no indica existencias en RiverMarket.</p>
        </footer>
      </div>
    </main>
  )
}
