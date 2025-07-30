"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import type { Form, FormResponse } from "@/types/form"
import { storage } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QuestionRenderer } from "@/components/form-builder/question-renderer"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle } from "lucide-react"

import { v4 as uuidv4 } from 'uuid';

export default function FormFill() {
  const params = useParams()
  const { toast } = useToast()
  const formId = params.id as string

  const [form, setForm] = useState<Form | null>(null)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadForm()
  }, [formId])

  const loadForm = async () => {
    try {
      const foundForm = await storage.getForm(formId)
      if (foundForm && foundForm.isPublished) {
        setForm(foundForm)
      }
    } catch (error) {
      console.error("Error loading form:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const validateForm = () => {
    if (!form) return false

    for (const question of form.questions) {
      if (question.required) {
        const answer = answers[question.id]
        if (
          !answer ||
          (Array.isArray(answer) && answer.length === 0) ||
          (typeof answer === "string" && !answer.trim())
        ) {
          return false
        }
      }
    }
    return true
  }

  const submitForm = async () => {
    if (!form || !validateForm()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response: FormResponse = {
        id: uuidv4(),
        formId: form.id,
        answers,
        submittedAt: new Date().toISOString(),
      }

      const success = await storage.saveResponse(response)
      if (success) {
        setIsSubmitted(true)
        toast({
          title: "Success",
          description: "Your response has been submitted",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to submit response",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting response:", error)
      toast({
        title: "Error",
        description: "Failed to submit response",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading form...</p>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Form Not Found</h2>
            <p className="text-gray-600">This form may not exist or is not published.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Thank You!</h2>
            <p className="text-gray-600">Your response has been recorded.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{form.title}</CardTitle>
            {form.description && <p className="text-gray-600 mt-2">{form.description}</p>}
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {form.questions.map((question) => (
            <Card key={question.id}>
              <CardContent className="pt-6">
                <QuestionRenderer
                  question={question}
                  value={answers[question.id]}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                />
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end">
            <Button onClick={submitForm} disabled={isSubmitting} size="lg">
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
