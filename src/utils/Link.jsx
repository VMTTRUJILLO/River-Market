import { navigate } from './useRoute'

export function Link({ href, children, onClick, ...props }) {
  return (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        onClick?.(event)
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          props.target ||
          props.download
        )
          return
        if (new URL(href, window.location.href).origin !== window.location.origin) return
        event.preventDefault()
        navigate(href)
      }}
    >
      {children}
    </a>
  )
}
