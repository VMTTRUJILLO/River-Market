import { createContext, useContext } from 'react'

export const NotificacionesContext = createContext(null)
export const useNotificar = () => useContext(NotificacionesContext)
