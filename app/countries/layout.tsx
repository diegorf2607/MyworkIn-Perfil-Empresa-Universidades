// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function CountriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
