import { BIENVENIDA, SUGERENCIAS } from './asistente.js'

export const crearMensaje = (autor, datos) => ({ id: crypto.randomUUID(), autor, ...datos })
export const nuevaConversacion = () => ({
  mensajes: [crearMensaje('river', { texto: BIENVENIDA, sugerencias: SUGERENCIAS })],
  contexto: {},
})
export const claveConversacion = (usuario) => `rivermarket_chat_v1:${usuario?.id || 'invitado'}`
export const rutaChatValida = (ruta) =>
  typeof ruta === 'string' &&
  ['/', '/ingresar', '/categorias', '/recetas', '/nutricion', '/#tiendas', '/#ofertas'].includes(
    ruta,
  )
export function restaurarConversacion(valor) {
  if (!valor || !Array.isArray(valor.mensajes) || !valor.mensajes.length) return nuevaConversacion()
  const mensajes = valor.mensajes
    .slice(-40)
    .filter(
      (m) =>
        m &&
        typeof m.id === 'string' &&
        ['river', 'usuario'].includes(m.autor) &&
        typeof m.texto === 'string',
    )
    .map((m) => ({
      id: m.id,
      autor: m.autor,
      texto: m.texto.slice(0, 10000),
      productos: Array.isArray(m.productos)
        ? m.productos.filter((id) => typeof id === 'string').slice(0, 4)
        : [],
      cantidad:
        Number.isSafeInteger(m.cantidad) && m.cantidad > 0 && m.cantidad <= 99 ? m.cantidad : 1,
      acciones: Array.isArray(m.acciones)
        ? m.acciones
            .filter(
              (a) =>
                a &&
                typeof a.etiqueta === 'string' &&
                (a.tipo === 'carrito' || (a.tipo === 'ruta' && rutaChatValida(a.valor))),
            )
            .slice(0, 4)
        : [],
      sugerencias: Array.isArray(m.sugerencias)
        ? m.sugerencias.filter((s) => typeof s === 'string' && s.length <= 100).slice(0, 4)
        : [],
    }))
  if (!mensajes.length) return nuevaConversacion()
  const c = valor.contexto || {}
  return {
    mensajes,
    contexto: {
      ids: Array.isArray(c.ids) ? c.ids.filter((id) => typeof id === 'string').slice(0, 4) : [],
      consulta: typeof c.consulta === 'string' ? c.consulta.slice(0, 400) : '',
      offset: Number.isSafeInteger(c.offset) && c.offset >= 0 ? c.offset : 0,
    },
  }
}
