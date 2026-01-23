"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestPasswordReset } from "@/lib/actions/auth"
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react"

interface ForgotPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus("idle")

    const result = await requestPasswordReset(email)

    if (result.error) {
      setStatus("error")
      setMessage(result.error)
    } else {
      setStatus("success")
      setMessage("Se ha enviado un enlace de recuperación a tu correo")
      setEmail("")
    }

    setLoading(false)
  }

  const handleClose = () => {
    setEmail("")
    setStatus("idle")
    setMessage("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Recuperar contraseña</DialogTitle>
          <DialogDescription>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="reset-email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="pl-10"
              />
            </div>
          </div>

          {status === "success" && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg p-3">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 bg-transparent"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-[#06477B] hover:bg-[#053d6a]">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar enlace"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
