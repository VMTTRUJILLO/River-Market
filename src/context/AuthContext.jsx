import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)
const USERS_KEY = 'rivermarket_demo_users'
const SESSION_KEY = 'rivermarket_demo_session'

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => read(USERS_KEY, []))
  const [usuario, setUsuario] = useState(() => read(SESSION_KEY, null))

  useEffect(() => localStorage.setItem(USERS_KEY, JSON.stringify(users)), [users])
  useEffect(() => {
    if (usuario) localStorage.setItem(SESSION_KEY, JSON.stringify(usuario))
    else localStorage.removeItem(SESSION_KEY)
  }, [usuario])

  const registrar = ({ nombre, email, password }) => {
    const correo = email.trim().toLowerCase()
    if (users.some((u) => u.email === correo)) throw new Error('Ya existe una cuenta con ese correo.')
    const nuevo = { id: crypto.randomUUID(), nombre: nombre.trim(), email: correo, password }
    setUsers((actuales) => [...actuales, nuevo])
    setUsuario({ id: nuevo.id, nombre: nuevo.nombre, email: nuevo.email })
  }

  const iniciarSesion = (email, password) => {
    const cuenta = users.find((u) => u.email === email.trim().toLowerCase() && u.password === password)
    if (!cuenta) throw new Error('Correo o contraseña incorrectos.')
    setUsuario({ id: cuenta.id, nombre: cuenta.nombre, email: cuenta.email })
  }

  const cerrarSesion = () => setUsuario(null)

  const restablecerPassword = (email, nuevaPassword) => {
    const correo = email.trim().toLowerCase()
    if (!users.some((u) => u.email === correo)) throw new Error('No encontramos una cuenta con ese correo.')
    setUsers((actuales) => actuales.map((u) => u.email === correo ? { ...u, password: nuevaPassword } : u))
  }

  const value = useMemo(() => ({ usuario, registrar, iniciarSesion, cerrarSesion, restablecerPassword }), [usuario, users])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
