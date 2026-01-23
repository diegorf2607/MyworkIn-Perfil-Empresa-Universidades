import type React from "react"

export default function VentasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This layout only exists to mark this route as using hideFilters
  // The actual sidebar/topbar come from /all/layout.tsx
  return <>{children}</>
}
