"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"

export default function LoginPage() {
  const router = useRouter()
  const { appInitialized } = useAppStore()
  const [email, setEmail] = useState("admin@myworkin.com")
  const [password, setPassword] = useState("admin123")
  const [remember, setRemember] = useState(false)

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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#06477B] px-6 py-4">
        <h1 className="text-xl font-semibold text-white">MyWorkIn CRM</h1>
      </header>

      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(checked) => setRemember(checked as boolean)}
                />
                <Label htmlFor="remember" className="font-normal cursor-pointer">
                  Recordarme
                </Label>
              </div>

              <Button type="submit" className="w-full bg-[#06477B] hover:bg-[#053d64]">
                Ingresar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
