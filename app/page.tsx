"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Form } from "@/types/form"
import { storage } from "@/lib/storage"
import { createDemoForm } from "@/lib/demo-data"
import { isSupabaseConfigured } from "@/lib/supabase"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, FileText, Eye, Trash2, BarChart3, Share, Database } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

function DashboardContent() {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadForms()
  }, [])

  const loadForms = async () => {
    try {
      const formsData = await storage.getForms()

      // Create demo form if no forms exist and not using Supabase
      if (formsData.length === 0 && !isSupabaseConfigured) {
        await createDemoForm()
        const updatedForms = await storage.getForms()
        setForms(updatedForms)
      } else {
        setForms(formsData)
      }
    } catch (error) {
      console.error("Error loading forms:", error)
      toast({
        title: "Error",
        description: "Failed to load forms",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteForm = async (id: string) => {
    try {
      const success = await storage.deleteForm(id)
      if (success) {
        await loadForms()
        toast({
          title: "Success",
          description: "Form deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete form",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting form:", error)
      toast({
        title: "Error",
        description: "Failed to delete form",
        variant: "destructive",
      })
    }
  }

  const getResponseCount = async (formId: string) => {
    try {
      const responses = await storage.getFormResponses(formId)
      return responses.length
    } catch (error) {
      console.error("Error getting response count:", error)
      return 0
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading forms...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {!isSupabaseConfigured && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <Database className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Demo Mode Active:</strong> You're using local storage. Data will persist in this browser but won't
              be accessible from other devices.
              <br />
              <span className="text-sm">
                To enable full cloud functionality, configure Supabase environment variables.
              </span>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Forms</h1>
            <p className="text-gray-600 mt-2">
              Create and manage your forms
              {!isSupabaseConfigured && " (Demo Mode)"}
            </p>
          </div>
          <Link href="/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Form
            </Button>
          </Link>
        </div>

        {forms.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first form</p>
            <Link href="/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Form
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <FormCard key={form.id} form={form} onDelete={deleteForm} getResponseCount={getResponseCount} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FormCard({
  form,
  onDelete,
  getResponseCount,
}: {
  form: Form
  onDelete: (id: string) => void
  getResponseCount: (id: string) => Promise<number>
}) {
  const [responseCount, setResponseCount] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    getResponseCount(form.id).then(setResponseCount)
  }, [form.id, getResponseCount])

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{form.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">{form.description || "No description"}</CardDescription>
          </div>
          <Badge variant={form.isPublished ? "default" : "secondary"}>{form.isPublished ? "Published" : "Draft"}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>{form.questions.length} questions</span>
          <span>{responseCount} responses</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/create?id=${form.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              <FileText className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          {form.isPublished && (
            <Link href={`/form/${form.id}`} className="flex-1">
              <Button size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                Fill Form
              </Button>
            </Link>
          )}
          <Link href={`/form/${form.id}/responses`}>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4" />
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Form</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{form.title}"? This action cannot be undone and will also delete all
                  responses.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(form.id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        {form.isPublished && (
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-blue-600 hover:text-blue-700"
              onClick={() => {
                const shareUrl = `${window.location.origin}/form/${form.id}`
                navigator.clipboard.writeText(shareUrl)
                toast({
                  title: "Link Copied",
                  description: "Form link copied to clipboard",
                })
              }}
            >
              <Share className="h-4 w-4 mr-2" />
              Copy Share Link
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
