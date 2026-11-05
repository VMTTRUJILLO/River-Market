import { useMemo } from 'react'

// Lee parámetros sencillos de la URL sin incorporar una librería de enrutamiento.
export function useParams() {
  return useMemo(() => {
    const parts = window.location.pathname.split('/').filter(Boolean)
    return { id: parts[0] === 'categoria' ? decodeURIComponent(parts[1] || '') : '' }
  }, [])
}
