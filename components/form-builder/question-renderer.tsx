"use client"

import type { FormQuestion } from "@/types/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface QuestionRendererProps {
  question: FormQuestion
  value?: string | string[]
  onChange: (value: string | string[]) => void
  disabled?: boolean
}

export function QuestionRenderer({ question, value, onChange, disabled }: QuestionRendererProps) {
  const renderInput = () => {
    switch (question.type) {
      case "short-answer":
        return (
          <Input
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Tu respuesta"
            disabled={disabled}
          />
        )

      case "paragraph":
        return (
          <Textarea
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Tu respuesta"
            rows={4}
            disabled={disabled}
          />
        )

      case "multiple-choice":
        return (
          <RadioGroup value={(value as string) || ""} onValueChange={onChange} disabled={disabled}>
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "checkbox":
        const checkboxValues = (value as string[]) || []
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={checkboxValues.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange([...checkboxValues, option])
                    } else {
                      onChange(checkboxValues.filter((v) => v !== option))
                    }
                  }}
                  disabled={disabled}
                />
                <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        )

      case "dropdown":
        return (
          <Select value={(value as string) || ""} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-medium">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </h3>
        {question.description && <p className="text-sm text-gray-600 mt-1">{question.description}</p>}
      </div>
      {renderInput()}
    </div>
  )
}
