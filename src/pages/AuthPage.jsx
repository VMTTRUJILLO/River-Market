import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import { useCarrito } from '../context/useCarrito'
import { USUARIOS_DEMO } from '../data/usuarios'
import { Link } from '../utils/Link'
import { navigate, useRoute } from '../utils/useRoute'
import MisPedidos from '../components/MisPedidos'
import './AuthPage.css'

export default function AuthPage() {
  const { abrirCarrito } = useCarrito()
  const { search } = useRoute()
  const continuarCompra = search.get('continuar') === 'compra'
  const [modo, setModo] = useState('login')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const { usuario, registrar, iniciarSesion, cerrarSesion, restablecerPassword } = useAuth()

  const cambiarModo = (nuevo) => {
    setModo(nuevo)
    setMensaje('')
    setError('')
    setPassword('')
    setConfirmar('')
  }
  const enviar = (e) => {
    e.preventDefault()
    setError('')
    setMensaje('')
    try {
      if (modo === 'registro') {
        if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.')
        if (password !== confirmar) throw new Error('Las contraseñas no coinciden.')
        registrar({ nombre, email, password })
        setMensaje('¡Tu cuenta de demostración fue creada y ya iniciaste sesión!')
      } else if (modo === 'login') {
        iniciarSesion(email, password)
        setMensaje('¡Bienvenido de nuevo a RiverMarket!')
      } else {
        if (password.length < 8) throw new Error('La nueva contraseña debe tener al menos 8 caracteres.')
        if (password !== confirmar) throw new Error('Las contraseñas no coinciden.')
        restablecerPassword(email, password)
        setMensaje('Contraseña actualizada. Ya puedes iniciar sesión con ella.')
        setModo('login')
      }
      setPassword('')
      setConfirmar('')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="rm-auth-page">
      <section className="rm-auth-visual">
        <Link className="rm-auth-brand" href="/">
          RiverMarket
        </Link>
        <div className="rm-auth-promo">
          <span className="rm-auth-kicker">FRESCO · LOCAL · CERCA DE TI</span>
          <h1>Todo lo que tu hogar necesita, en un solo lugar.</h1>
          <p>Compra fácil, descubre productos frescos y disfruta precios que fluyen a tu favor.</p>
          <div className="rm-auth-photo" role="img" aria-label="Canasta con frutas y verduras frescas" />
        </div>
        <span className="rm-auth-visual-foot">Tu mercado de confianza, a un clic.</span>
      </section>
      <section className="rm-auth-form-wrap">
        <Link href="/" className="rm-auth-back">
          ← Volver a RiverMarket
        </Link>
        <div className="rm-auth-card">
          {mensaje && (
            <p className="rm-auth-alert success" role="status">
              {mensaje}
            </p>
          )}
          {usuario ? (
            <>
              <span className="rm-auth-kicker">MI CUENTA</span>
              <h2>¡Hola, {usuario.nombre}!</h2>
              <p>Has iniciado sesión en  RiverMarket.</p>
              <p className="rm-auth-email">{usuario.email}</p>
              <div className="buttons mt-4">
                {usuario.rol === 'admin' && (
                  <Link className="button is-primary is-rounded" href="/admin">
                    Ir a administración
                  </Link>
                )}
                <button
                  className="button is-warning is-rounded"
                  onClick={() => {
                    navigate('/')
                    if (continuarCompra) abrirCarrito()
                  }}
                >
                  {continuarCompra ? 'Continuar mi compra' : 'Ir a comprar'}
                </button>
                <button
                  className="button is-light is-rounded"
                  onClick={() => {
                    try {
                      cerrarSesion()
                      setMensaje('')
                      setPassword('')
                      setEmail('')
                    } catch (err) {
                      setError(err.message)
                    }
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
              {error && (
                <p className="rm-auth-alert error" role="alert">
                  {error}
                </p>
              )}
              <MisPedidos usuario={usuario} />
            </>
          ) : (
            <>
              <span className="rm-auth-kicker">
                {modo === 'registro'
                  ? 'ÚNETE A RIVERMARKET'
                  : modo === 'recuperar'
                    ? 'RECUPERA TU ACCESO'
                    : 'QUÉ BUENO TENERTE AQUÍ'}
              </span>
              <h2>
                {modo === 'registro'
                  ? 'Crea tu cuenta'
                  : modo === 'recuperar'
                    ? 'Restablece tu contraseña'
                    : 'Inicia sesión'}
              </h2>
              <p className="rm-auth-intro">
                {modo === 'registro'
                  ? 'Regístrate y empieza a llenar tu carrito.'
                  : modo === 'recuperar'
                    ? 'Escribe tu correo y define una nueva contraseña para esta cuenta de prueba.'
                    : 'Ingresa para disfrutar una experiencia de compra más personal.'}
              </p>
              <div className="rm-auth-tabs">
                <button className={modo === 'login' ? 'active' : ''} onClick={() => cambiarModo('login')}>
                  Iniciar sesión
                </button>
                <button
                  className={modo === 'registro' ? 'active' : ''}
                  onClick={() => cambiarModo('registro')}
                >
                  Registrarme
                </button>
              </div>
              {continuarCompra && (
                <p className="notification is-primary is-light is-size-7">
                  Inicia sesión o crea una cuenta para continuar con tu carrito.
                </p>
              )}
              <form onSubmit={enviar}>
                {modo === 'registro' && (
                  <label>
                    Nombre completo
                    <input
                      required
                      minLength="2"
                      maxLength="100"
                      autoComplete="name"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Tu nombre"
                    />
                  </label>
                )}
                <label>
                  Correo electrónico
                  <input
                    required
                    maxLength="120"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@correo.com"
                  />
                </label>
                <label>
                  {modo === 'recuperar' ? 'Nueva contraseña' : 'Contraseña'}
                  <input
                    required
                    type="password"
                    minLength="8"
                    autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                  />
                </label>
                {(modo === 'registro' || modo === 'recuperar') && (
                  <label>
                    Confirmar contraseña
                    <input
                      required
                      type="password"
                      minLength="8"
                      value={confirmar}
                      onChange={(e) => setConfirmar(e.target.value)}
                      placeholder="Repite tu contraseña"
                    />
                  </label>
                )}
                {modo === 'login' && (
                  <button type="button" className="rm-auth-forgot" onClick={() => cambiarModo('recuperar')}>
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
                {error && (
                  <p className="rm-auth-alert error" role="alert">
                    {error}
                  </p>
                )}
                <button className="rm-auth-submit" type="submit">
                  {modo === 'registro'
                    ? 'Crear mi cuenta'
                    : modo === 'recuperar'
                      ? 'Actualizar contraseña'
                      : 'Ingresar a mi cuenta'}
                </button>
              </form>
              {modo === 'recuperar' && (
                <button className="rm-auth-forgot" onClick={() => cambiarModo('login')}>
                  Volver al inicio de sesión
                </button>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
