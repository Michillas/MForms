"use client"

import { useState } from "react"
import type { FormQuestion } from "@/types/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Trash2, Plus, GripVertical } from "lucide-react"

interface QuestionEditorProps {
  question: FormQuestion
  onUpdate: (question: FormQuestion) => void
  onDelete: () => void
}

export function QuestionEditor({ question, onUpdate, onDelete }: QuestionEditorProps) {
  const [localQuestion, setLocalQuestion] = useState(question)

  const handleUpdate = (updates: Partial<FormQuestion>) => {
    const updated = { ...localQuestion, ...updates }
    setLocalQuestion(updated)
    onUpdate(updated)
  }

  const addOption = () => {
    const options = [...(localQuestion.options || []), ""]
    handleUpdate({ options })
  }

  const updateOption = (index: number, value: string) => {
    const options = [...(localQuestion.options || [])]
    options[index] = value
    handleUpdate({ options })
  }

  const removeOption = (index: number) => {
    const options = localQuestion.options?.filter((_, i) => i !== index) || []
    handleUpdate({ options })
  }

  const needsOptions = ["multiple-choice", "checkbox", "dropdown"].includes(localQuestion.type)

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <GripVertical className="h-5 w-5 text-gray-400 mr-2" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Select
              value={localQuestion.type}
              onValueChange={(value: FormQuestion["type"]) => handleUpdate({ type: value })}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short-answer">Respuesta Corta</SelectItem>
                <SelectItem value="paragraph">Párrafo</SelectItem>
                <SelectItem value="multiple-choice">Opción Múltiple</SelectItem>
                <SelectItem value="checkbox">Casillas de Verificación</SelectItem>
                <SelectItem value="dropdown">Desplegable</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`question-title-${localQuestion.id}`}>Título de la Pregunta</Label>
          <Input
            id={`question-title-${localQuestion.id}`}
            value={localQuestion.title}
            onChange={(e) => handleUpdate({ title: e.target.value })}
            placeholder="Ingrese su pregunta"
          />
        </div>

        <div>
          <Label htmlFor={`question-desc-${localQuestion.id}`}>Descripción (opcional)</Label>
          <Textarea
            id={`question-desc-${localQuestion.id}`}
            value={localQuestion.description || ""}
            onChange={(e) => handleUpdate({ description: e.target.value })}
            placeholder="Agregar una descripción"
            rows={2}
          />
        </div>

        {needsOptions && (
          <div>
            <Label>Opciones</Label>
            <div className="space-y-2">
              {localQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Opción ${index + 1}`}
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeOption(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addOption}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Opción
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch
            id={`required-${localQuestion.id}`}
            checked={localQuestion.required}
            onCheckedChange={(checked) => handleUpdate({ required: checked })}
          />
          <Label htmlFor={`required-${localQuestion.id}`}>Requerido</Label>
        </div>
      </CardContent>
    </Card>
  )
}
