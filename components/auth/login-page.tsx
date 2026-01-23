"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { login } from "@/lib/actions/auth"
import { AlertCircle, CheckCircle2, Loader2, Lock, Mail } from "lucide-react"
import { ForgotPasswordDialog } from "./forgot-password-dialog"

export function LoginPage({ successMessage }: { successMessage?: string }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await login(email, password)

      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    } catch (err) {
      setError("Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full bg-gradient-to-r from-[#06477B] to-[#0a5a9c] px-6 py-5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <h1 className="text-white text-xl font-semibold tracking-tight">MyWorkIn CRM</h1>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4">
              <div className="w-12 h-12 bg-[#06477B]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6 text-[#06477B]" />
              </div>
              <CardTitle className="text-2xl font-bold text-center text-slate-800">Iniciar sesión</CardTitle>
              <CardDescription className="text-center text-slate-500">
                Ingresa tus credenciales para acceder al CRM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-10 h-11 border-slate-200 focus:border-[#06477B] focus:ring-[#06477B]/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-10 h-11 border-slate-200 focus:border-[#06477B] focus:ring-[#06477B]/20"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-[#06477B] hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(checked) => setRemember(checked as boolean)}
                    disabled={loading}
                    className="border-slate-300 data-[state=checked]:bg-[#06477B] data-[state=checked]:border-[#06477B]"
                  />
                  <Label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">
                    Recordarme
                  </Label>
                </div>

                {successMessage && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg p-3">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium bg-[#06477B] hover:bg-[#053d6a] transition-colors shadow-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Ingresando...
                    </>
                  ) : (
                    "Ingresar"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-slate-400 mt-6">
            © {new Date().getFullYear()} MyWorkIn CRM. Todos los derechos reservados.
          </p>
        </div>
      </div>

      <ForgotPasswordDialog open={showForgotPassword} onOpenChange={setShowForgotPassword} />
    </div>
  )
}
