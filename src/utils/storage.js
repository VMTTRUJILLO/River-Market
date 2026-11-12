export function leer(key, fallback, validar = () => true) {
  try {
    const value = JSON.parse(localStorage.getItem(key))
    return value != null && validar(value) ? value : fallback
  } catch {
    return fallback
  }
}

export function guardar(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    throw new Error(
      'No pudimos guardar los cambios en este navegador. Revisa el espacio disponible y permite el almacenamiento local.',
    )
  }
}
