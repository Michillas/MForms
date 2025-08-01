"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import type { Form, FormResponse } from "@/types/form"
import { storage } from "@/lib/storage"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download } from "lucide-react"

function FormResponsesContent() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string

  const [form, setForm] = useState<Form | null>(null)
  const [responses, setResponses] = useState<FormResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [formId])

  const loadData = async () => {
    try {
      const foundForm = await storage.getForm(formId)
      if (foundForm) {
        setForm(foundForm)
        const responsesData = await storage.getFormResponses(formId)
        setResponses(responsesData)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!form || responses.length === 0) return

    const headers = ["Fecha", ...form.questions.map((q) => q.title)]
    const rows = responses.map((response) => [
      new Date(response.submittedAt).toLocaleString(),
      ...form.questions.map((q) => {
        const answer = response.answers[q.id]
        if (Array.isArray(answer)) {
          return answer.join(", ")
        }
        return answer || ""
      }),
    ])

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${form.title}-responses.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando respuestas...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <h2 className="text-xl font-semibold mb-2">Formulario No Encontrado</h2>
              <p className="text-gray-600">Este formulario puede no existir.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{form.title}</h1>
              <p className="text-gray-600">Respuestas del Formulario</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {responses.length} {responses.length === 1 ? "Respuesta" : "Respuestas"}
            </Badge>
            {responses.length > 0 && (
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exportar a CSV
              </Button>
            )}
          </div>
        </div>

        {responses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay respuestas aún</h3>
              <p className="text-gray-600 mb-4">Comparte tu formulario para comenzar a recibir respuestas</p>
              {form.isPublished && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const url = `${window.location.origin}/form/${form.id}`
                    navigator.clipboard.writeText(url)
                  }}
                >
                  Copiar enlace del formulario
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {responses.map((response, index) => (
              <Card key={response.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Respuesta #{responses.length - index}
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      {new Date(response.submittedAt).toLocaleString()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {form.questions.map((question) => {
                      const answer = response.answers[question.id]
                      return (
                        <div key={question.id}>
                          <h4 className="font-medium text-gray-900 mb-1">{question.title}</h4>
                          <div className="text-gray-700">
                            {Array.isArray(answer) ? (
                              <ul className="list-disc list-inside">
                                {answer.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            ) : (
                              <p>{answer || <em className="text-gray-400">Sin respuesta</em>}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function FormResponses() {
  return (
    <AuthGuard>
      <FormResponsesContent />
    </AuthGuard>
  )
}
