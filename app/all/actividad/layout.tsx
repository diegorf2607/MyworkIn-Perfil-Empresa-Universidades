import type React from "react"

export default function ActividadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Layout passthrough - sidebar/topbar come from /all/layout.tsx
  return <>{children}</>
}
