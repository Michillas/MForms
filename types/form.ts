export interface FormQuestion {
  id: string
  type: "short-answer" | "paragraph" | "multiple-choice" | "checkbox" | "dropdown"
  title: string
  description?: string
  required: boolean
  options?: string[] // For multiple-choice, checkbox, dropdown
}

export interface Form {
  id: string
  title: string
  description: string
  questions: FormQuestion[]
  isPublished: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string // User ID who created the form
}

export interface FormResponse {
  id: string
  formId: string
  answers: Record<string, string | string[]>
  submittedAt: string
}
