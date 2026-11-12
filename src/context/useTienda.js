import { createContext, useContext } from 'react'

export const TiendaContext = createContext(null)
export const useTienda = () => useContext(TiendaContext)
