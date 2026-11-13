import { useEffect, useRef, useState } from 'react'
import { USUARIOS_DEMO } from '../data/usuarios'
import { guardar, leer } from '../utils/storage'
import { useNotificar } from './useNotificaciones'

import { AuthContext } from './useAuth'
const USERS_KEY = 'rivermarket_demo_users'
const SESSION_KEY = 'rivermarket_demo_session'
const datosPublicos = ({ id, nombre, email, rol }) => ({ id, nombre, email, rol: rol || 'cliente' })
const leerUsuarios = () => {
  const anteriores = leer(USERS_KEY, [], Array.isArray).filter(
    (u) => u && typeof u.email === 'string' && typeof u.password === 'string',
  )
  return [
    ...anteriores.map((u) => ({
      ...u,
      rol: USUARIOS_DEMO.find((d) => d.id === u.id)?.rol || 'cliente',
    })),
    ...USUARIOS_DEMO.filter((d) => !anteriores.some((u) => u.email === d.email)),
  ]
}

export function AuthProvider({ children }) {
  const notificar = useNotificar()
  const [users, setUsers] = useState(leerUsuarios)
  const usersRef = useRef(users)
  const [usuario, setUsuario] = useState(() => {
    const session = leer(SESSION_KEY, null)
    const account = users.find((u) => u.id === session?.id)
    return account ? datosPublicos(account) : null
  })
  useEffect(() => {
    const sincronizar = (event) => {
      if (event.key !== SESSION_KEY && event.key !== USERS_KEY && event.key !== null) return
      const cuentas = leerUsuarios()
      usersRef.current = cuentas
      setUsers(cuentas)
      const session = leer(SESSION_KEY, null)
      const cuenta = cuentas.find((u) => u.id === session?.id)
      setUsuario(cuenta ? datosPublicos(cuenta) : null)
    }
    window.addEventListener('storage', sincronizar)
    return () => window.removeEventListener('storage', sincronizar)
  }, [])
  const sesion = (cuenta) => {
    const datos = cuenta ? datosPublicos(cuenta) : null
    guardar(SESSION_KEY, datos)
    setUsuario(datos)
  }
  const actualizar = (nuevos) => {
    guardar(USERS_KEY, nuevos)
    usersRef.current = nuevos
    setUsers(nuevos)
  }
  const registrar = ({ nombre, email, password }) => {
    const correo = email.trim().toLowerCase()
    if (nombre.trim().length < 2)
      throw new Error('Escribe tu nombre completo (mínimo 2 caracteres).')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) throw new Error('Escribe un correo válido.')
    if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.')
    if (usersRef.current.some((u) => u.email === correo))
      throw new Error('Ya existe una cuenta con ese correo.')
    const nuevo = {
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      email: correo,
      password,
      rol: 'cliente',
    }
    actualizar([...usersRef.current, nuevo])
    sesion(nuevo)
    notificar(`¡Cuenta creada! Bienvenido a RiverMarket, ${nuevo.nombre}.`)
  }
  const iniciarSesion = (email, password) => {
    const cuenta = usersRef.current.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password,
    )
    if (!cuenta) throw new Error('Correo o contraseña incorrectos.')
    sesion(cuenta)
    notificar(`¡Hola, ${cuenta.nombre}! Iniciaste sesión correctamente.`)
  }
  const cerrarSesion = () => {
    sesion(null)
    notificar('Cerraste sesión correctamente.')
  }
  const restablecerPassword = (email, nuevaPassword) => {
    const correo = email.trim().toLowerCase()
    if (nuevaPassword.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.')
    if (!usersRef.current.some((u) => u.email === correo))
      throw new Error('No encontramos una cuenta con ese correo.')
    actualizar(
      usersRef.current.map((u) => (u.email === correo ? { ...u, password: nuevaPassword } : u)),
    )
    notificar('Contraseña actualizada.')
  }
  return (
    <AuthContext.Provider
      value={{ usuario, registrar, iniciarSesion, cerrarSesion, restablecerPassword }}
    >
      {children}
    </AuthContext.Provider>
  )
}
