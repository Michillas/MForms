import { supabase, isSupabaseConfigured } from "./supabase"
import type { Form, FormResponse } from "@/types/form"

// Demo data for development
const DEMO_FORMS_KEY = "demo-forms"
const DEMO_RESPONSES_KEY = "demo-responses"

// Demo storage functions for when Supabase is not configured
const demoStorage = {
  getForms(): Form[] {
    if (typeof window === "undefined") return []
    const forms = localStorage.getItem(DEMO_FORMS_KEY)
    return forms ? JSON.parse(forms) : []
  },

  getForm(id: string): Form | null {
    const forms = this.getForms()
    return forms.find((form) => form.id === id) || null
  },

  saveForm(form: Form): boolean {
    const forms = this.getForms()
    const existingIndex = forms.findIndex((f) => f.id === form.id)

    if (existingIndex >= 0) {
      forms[existingIndex] = { ...form, updatedAt: new Date().toISOString() }
    } else {
      forms.push({ ...form, createdAt: new Date().toISOString() })
    }

    localStorage.setItem(DEMO_FORMS_KEY, JSON.stringify(forms))
    return true
  },

  deleteForm(id: string): boolean {
    const forms = this.getForms().filter((form) => form.id !== id)
    localStorage.setItem(DEMO_FORMS_KEY, JSON.stringify(forms))

    // Also delete associated responses
    const responses = this.getFormResponses("all").filter((response) => response.formId !== id)
    localStorage.setItem(DEMO_RESPONSES_KEY, JSON.stringify(responses))
    return true
  },

  getFormResponses(formId: string): FormResponse[] {
    if (typeof window === "undefined") return []
    const responses = localStorage.getItem(DEMO_RESPONSES_KEY)
    const allResponses: FormResponse[] = responses ? JSON.parse(responses) : []

    if (formId === "all") return allResponses
    return allResponses.filter((response) => response.formId === formId)
  },

  saveResponse(response: FormResponse): boolean {
    const responses = this.getFormResponses("all")
    responses.push(response)
    localStorage.setItem(DEMO_RESPONSES_KEY, JSON.stringify(responses))
    return true
  },
}

export const storage = {
  // Forms
  async getForms(): Promise<Form[]> {
    if (!isSupabaseConfigured) {
      return demoStorage.getForms()
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching forms:", error)
      return []
    }

    return data.map((form) => ({
      id: form.id,
      title: form.title,
      description: form.description || "",
      questions: form.questions,
      isPublished: form.is_published,
      createdAt: form.created_at,
      updatedAt: form.updated_at,
      createdBy: form.user_id,
    }))
  },

  async getForm(id: string): Promise<Form | null> {
    if (!isSupabaseConfigured) {
      return demoStorage.getForm(id)
    }

    const { data, error } = await supabase.from("forms").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching form:", error)
      return null
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description || "",
      questions: data.questions,
      isPublished: data.is_published,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.user_id,
    }
  },

  async saveForm(form: Form): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return demoStorage.saveForm(form)
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false

    const formData = {
      id: form.id,
      title: form.title,
      description: form.description,
      questions: form.questions,
      is_published: form.isPublished,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("forms").upsert(formData)

    if (error) {
      console.error("Error saving form:", error)
      return false
    }

    return true
  },

  async deleteForm(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return demoStorage.deleteForm(id)
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false

    // Delete form responses first
    await supabase.from("form_responses").delete().eq("form_id", id)

    // Delete form
    const { error } = await supabase.from("forms").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting form:", error)
      return false
    }

    return true
  },

  // Responses
  async getFormResponses(formId: string): Promise<FormResponse[]> {
    if (!isSupabaseConfigured) {
      return demoStorage.getFormResponses(formId)
    }

    const { data, error } = await supabase
      .from("form_responses")
      .select("*")
      .eq("form_id", formId)
      .order("submitted_at", { ascending: false })

    if (error) {
      console.error("Error fetching responses:", error)
      return []
    }

    return data.map((response) => ({
      id: response.id,
      formId: response.form_id,
      answers: response.answers,
      submittedAt: response.submitted_at,
    }))
  },

  async saveResponse(response: FormResponse): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return demoStorage.saveResponse(response)
    }

    const { error } = await supabase.from("form_responses").insert({
      id: response.id,
      form_id: response.formId,
      answers: response.answers,
      submitted_at: response.submittedAt,
    })

    if (error) {
      console.error("Error saving response:", error)
      return false
    }

    return true
  },
}
