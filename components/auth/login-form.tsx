"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "./auth-provider"
import { isSupabaseConfigured } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Info } from "lucide-react"

interface LoginFormProps {
  onToggleMode: () => void
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn(email, password)
      if (!result.success) {
        setError(result.error || "Error durante el inicio de sesión")
      }
    } catch (err) {
      setError("Error durante el inicio de sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{isSupabaseConfigured ? "Inicio de Sesión de Administrador" : "Inicio de Sesión de Demostración"}</CardTitle>
        <CardDescription>
          {isSupabaseConfigured ? "Inicia sesión para gestionar tus formularios" : "Ingresa cualquier correo electrónico y contraseña para continuar"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isSupabaseConfigured && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Modo de Demostración:</strong> Puedes usar cualquier correo electrónico y contraseña para iniciar sesión. Los datos se almacenarán localmente en tu navegador.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isSupabaseConfigured ? "Ingrese su correo electrónico" : "demo@example.com"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSupabaseConfigured ? "Ingrese su contraseña" : "cualquier contraseña"}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>

          <div className="text-center">
            <Button type="button" variant="link" onClick={onToggleMode}>
              {"¿No tienes una cuenta? Regístrate"}
            </Button>
          </div>
        </form>

        {!isSupabaseConfigured && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Inicio Rápido</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Usa cualquier dirección de correo electrónico (por ejemplo, demo@example.com)</p>
              <p>• Usa cualquier contraseña (por ejemplo, demo123)</p>
              <p>• Tus datos se guardarán localmente</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
