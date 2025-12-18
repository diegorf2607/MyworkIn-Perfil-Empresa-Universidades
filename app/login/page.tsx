"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"

export default function LoginPage() {
  const router = useRouter()
  const { appInitialized } = useAppStore()
  const [email, setEmail] = useState("admin@myworkin.com")
  const [password, setPassword] = useState("admin123")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock login - no real auth
    if (appInitialized) {
      router.push("/countries")
    } else {
      router.push("/admin/setup")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Image
              src="/images/myworkin-logo.png"
              alt="MyWorkIn"
              width={80}
              height={80}
              className="h-20 w-20 object-contain"
            />
          </div>
          <CardTitle className="text-2xl">MyWorkIn CRM</CardTitle>
          <CardDescription>Ingresa al CRM interno del equipo comercial</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">
              Iniciar sesión
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Rol: <span className="font-medium">Admin</span> (mock)
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
