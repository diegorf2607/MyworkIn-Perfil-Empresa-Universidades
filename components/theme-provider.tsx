'use client'

import * as React from 'react'
// TODO: Install next-themes package if theme provider is needed
// import {
//   ThemeProvider as NextThemesProvider,
//   type ThemeProviderProps,
// } from 'next-themes'

// export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
//   return <NextThemesProvider {...props}>{children}</NextThemesProvider>
// }

// Temporary placeholder - uncomment and install next-themes if needed
export function ThemeProvider({ children, ...props }: React.PropsWithChildren) {
  return <>{children}</>
}
