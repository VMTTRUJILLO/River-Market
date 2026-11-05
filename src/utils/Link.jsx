import React from 'react'

// Standard anchors intentionally trigger a page navigation so direct URLs and refreshes work on static hosting.
export function Link({ href, children, ...props }) {
  return <a href={href} {...props}>{children}</a>
}
