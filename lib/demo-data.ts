import type { Form } from "@/types/form"
import { storage } from "./storage"

export async function createDemoForm() {
  const demoForm: Form = {
    id: "demo-form-123",
    title: "Customer Feedback Survey",
    description: "Help us improve our services by sharing your feedback",
    questions: [
      {
        id: "q1",
        type: "short-answer",
        title: "What is your name?",
        description: "Please enter your full name",
        required: true,
      },
      {
        id: "q2",
        type: "multiple-choice",
        title: "How would you rate our service?",
        required: true,
        options: ["Excellent", "Good", "Average", "Poor"],
      },
      {
        id: "q3",
        type: "checkbox",
        title: "Which features do you use most? (Select all that apply)",
        required: false,
        options: ["Dashboard", "Reports", "Settings", "Support", "Mobile App"],
      },
      {
        id: "q4",
        type: "paragraph",
        title: "Any additional comments or suggestions?",
        description: "Please share any feedback that could help us improve",
        required: false,
      },
    ],
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // Check if demo form already exists
  const existingForm = await storage.getForm(demoForm.id)
  if (!existingForm) {
    await storage.saveForm(demoForm)
  }

  return demoForm
}
