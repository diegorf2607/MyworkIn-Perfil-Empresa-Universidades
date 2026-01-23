import { Suspense } from "react"
import GlosarioContent from "./glosario-content"

export default function GlosarioGlobalPage() {
  return (
    <Suspense fallback={null}>
      <GlosarioContent />
    </Suspense>
  )
}
