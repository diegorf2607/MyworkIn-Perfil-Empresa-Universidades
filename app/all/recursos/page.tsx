import { Suspense } from "react"
import RecursosContent from "./recursos-content"

export default function RecursosGlobalPage() {
  return (
    <Suspense fallback={null}>
      <RecursosContent />
    </Suspense>
  )
}
