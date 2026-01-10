"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updatePassword } from "@/lib/actions/auth"
import { AlertCircle, CheckCircle2, Loader2, Lock } from "lucide-react"

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  // Check if we have the required tokens from the URL
  const hasTokens = searchParams.get("type") === "recovery"

  useEffect(() => {
    if (!hasTokens) {
      setStatus("error")
      setMessage("Enlace inválido o expirado. Por favor solicita uno nuevo.")
    }
  }, [hasTokens])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("idle")
    setMessage("")

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setStatus("error")
      setMessage("Las contraseñas no coinciden")
      return
    }

    // Validate password length
    if (newPassword.length < 6) {
      setStatus("error")
      setMessage("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setLoading(true)

    const result = await updatePassword(newPassword)

    if (result.error) {
      setStatus("error")
      setMessage(result.error)
      setLoading(false)
    } else {
      setStatus("success")
      setMessage("Contraseña actualizada correctamente")

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/?message=password-updated")
      }, 2000)
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
              <CardTitle className="text-2xl font-bold text-center text-slate-800">Restablecer contraseña</CardTitle>
              <CardDescription className="text-center text-slate-500">Ingresa tu nueva contraseña</CardDescription>
            </CardHeader>
            <CardContent>
              {!hasTokens || status === "error" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{message || "Enlace inválido o expirado"}</span>
                  </div>
                  <Button onClick={() => router.push("/")} className="w-full bg-[#06477B] hover:bg-[#053d6a]">
                    Volver al login
                  </Button>
                </div>
              ) : status === "success" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg p-3">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{message}</span>
                  </div>
                  <p className="text-sm text-center text-slate-500">Redirigiendo al login...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-slate-700 font-medium">
                      Nueva contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="pl-10 h-11 border-slate-200 focus:border-[#06477B] focus:ring-[#06477B]/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-slate-700 font-medium">
                      Confirmar contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="pl-10 h-11 border-slate-200 focus:border-[#06477B] focus:ring-[#06477B]/20"
                      />
                    </div>
                  </div>

                  {status === "error" && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{message}</span>
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
                        Actualizando...
                      </>
                    ) : (
                      "Actualizar contraseña"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-xs text-slate-400 mt-6">
            © {new Date().getFullYear()} MyWorkIn CRM. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
