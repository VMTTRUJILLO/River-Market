import { useSyncExternalStore } from 'react'

const subscribe = (listener) => {
  window.addEventListener('popstate', listener)
  return () => window.removeEventListener('popstate', listener)
}
const snapshot = () => window.location.pathname + window.location.search + window.location.hash

export function navigate(href, { replace = false } = {}) {
  const url = new URL(href, window.location.href)
  if (url.origin !== window.location.origin) return
  window.history[replace ? 'replaceState' : 'pushState']({}, '', url)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function useRoute() {
  const href = useSyncExternalStore(subscribe, snapshot)
  const url = new URL(href, window.location.origin)
  return { path: url.pathname.replace(/\/$/, '') || '/', search: url.searchParams, hash: url.hash, href }
}

export function useParams() {
  const { path } = useRoute()
  const parts = path.split('/').filter(Boolean)
  try {
    return { id: parts[0] === 'categoria' ? decodeURIComponent(parts[1] || '') : '' }
  } catch {
    return { id: '' }
  }
}
