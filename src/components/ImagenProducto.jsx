import { useState } from 'react'

export default function ImagenProducto({ src, alt, ...props }) {
  const [fallida, setFallida] = useState(null)
  return src && fallida !== src ? (
    <img src={src} alt={alt} {...props} onError={() => setFallida(src)} />
  ) : (
    <div className={`rm-image-placeholder ${props.className || ''}`} role="img" aria-label={alt}>
      <span aria-hidden="true">◇</span>
      <small>RiverMarket</small>
    </div>
  )
}
