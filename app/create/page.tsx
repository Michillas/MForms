"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Form, FormQuestion } from "@/types/form"
import { storage } from "@/lib/storage"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QuestionEditor } from "@/components/form-builder/question-editor"
import { Plus, Save, Eye, ArrowLeft, Share } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { v4 as uuidv4 } from 'uuid';

function CreateFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const editingId = searchParams.get("id")

  const [form, setForm] = useState<Form>({
    id: "",
    title: "Sin título",
    description: "",
    questions: [],
    isPublished: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  const [shareUrl, setShareUrl] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingId) {
      loadForm(editingId)
    } else {
      setForm((prev) => ({ ...prev, id: uuidv4() }))
    }
  }, [editingId])

  useEffect(() => {
    if (form.isPublished) {
      setShareUrl(`${window.location.origin}/form/${form.id}`)
    }
  }, [form.isPublished, form.id])

  const loadForm = async (id: string) => {
    try {
      const existingForm = await storage.getForm(id)
      if (existingForm) {
        setForm(existingForm)
      }
    } catch (error) {
      console.error("Error loading form:", error)
      toast({
        title: "Error",
        description: "Error cargando el formulario",
        variant: "destructive",
      })
    }
  }

  const addQuestion = () => {
    const newQuestion: FormQuestion = {
      id: uuidv4(),
      type: "short-answer",
      title: "Untitled Question",
      required: false,
      options: [],
    }
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }))
  }

  const updateQuestion = (index: number, question: FormQuestion) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? question : q)),
    }))
  }

  const deleteQuestion = (index: number) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }))
  }

  const saveForm = async () => {
    if (!form.title.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un título para el formulario",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const success = await storage.saveForm(form)
      if (success) {
        toast({
          title: "Éxito",
          description: "Formulario guardado con éxito",
        })
      } else {
        toast({
          title: "Error",
          description: "Error al guardar el formulario",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving form:", error)
      toast({
        title: "Error",
        description: "Error al guardar el formulario",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const togglePublish = async () => {
    const updatedForm = { ...form, isPublished: !form.isPublished }
    setForm(updatedForm)

    try {
      const success = await storage.saveForm(updatedForm)
      if (success) {
        toast({
          title: updatedForm.isPublished ? "Formulario Publicado" : "Formulario No Publicado",
          description: updatedForm.isPublished ? "Tu formulario está ahora en vivo y puede ser compartido" : "Tu formulario está ahora privado",
        })
      }
    } catch (error) {
      console.error("Error updating form:", error)
      toast({
        title: "Error",
        description: "Error al actualizar el formulario",
        variant: "destructive",
      })
    }
  }

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: "Link Copiado",
      description: "Enlace compartido copiado al portapapeles",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Constructor de Formularios</h1>
              <p className="text-gray-600">Crea y personaliza tu formulario</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={saveForm} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Guardando..." : "Guardar"}
            </Button>
            {form.isPublished && (
              <>
                <Button variant="outline" onClick={() => window.open(`/form/${form.id}`, "_blank")}>
                  <Eye className="h-4 w-4 mr-2" />
                  Vista Previa
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Share className="h-4 w-4 mr-2" />
                      Compartir
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Comparte tu Formulario</DialogTitle>
                      <DialogDescription>Copiar el enlace a continuación para compartir tu formulario con otros</DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-2">
                      <Input value={shareUrl} readOnly />
                      <Button onClick={copyShareUrl}>Copiar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
            <div className="flex items-center space-x-2">
              <Switch id="publish" checked={form.isPublished} onCheckedChange={togglePublish} />
              <Label htmlFor="publish">{form.isPublished ? "Publicado" : "Borrador"}</Label>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Form Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Formulario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="form-title">Título del Formulario</Label>
                <Input
                  id="form-title"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Ingrese el título del formulario"
                />
              </div>
              <div>
                <Label htmlFor="form-description">Descripción</Label>
                <Textarea
                  id="form-description"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Ingrese la descripción del formulario"
                  rows={3}
                />
              </div>
              {form.isPublished && (
                <div className="border-t pt-4">
                  <Label>Comparte tu Formulario</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input value={shareUrl} readOnly className="flex-1" />
                    <Button onClick={copyShareUrl} variant="outline">
                      Copiar Enlace
                    </Button>
                    <Button onClick={() => window.open(`/form/${form.id}`, "_blank")} variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Vista Previa
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Comparte este enlace con otros para recopilar respuestas</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Preguntas</h2>
              <Button onClick={addQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Pregunta
              </Button>
            </div>

            {form.questions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-600 mb-4">No hay preguntas agregadas aún</p>
                  <Button onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar tu primera pregunta
                  </Button>
                </CardContent>
              </Card>
            ) : (
              form.questions.map((question, index) => (
                <QuestionEditor
                  key={question.id}
                  question={question}
                  onUpdate={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
                  onDelete={() => deleteQuestion(index)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CreateForm() {
  return (
    <AuthGuard>
      <CreateFormContent />
    </AuthGuard>
  )
}
