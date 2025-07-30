import { createClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "" &&
  supabaseAnonKey !== "" &&
  supabaseUrl.startsWith("https://")
)

// Create a mock client for development when env vars are missing
const createMockClient = () => ({
  auth: {
    signUp: async () => ({ data: null, error: { message: "Supabase not configured" } }),
    signInWithPassword: async () => ({ data: null, error: { message: "Supabase not configured" } }),
    signOut: async () => ({ error: { message: "Supabase not configured" } }),
    getUser: async () => ({ data: { user: null } }),
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: () => ({
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        order: () => ({ data: [], error: null }),
        single: () => ({ data: null, error: { message: "Supabase not configured" } }),
      }),
    }),
    insert: () => ({ error: { message: "Supabase not configured" } }),
    upsert: () => ({ error: { message: "Supabase not configured" } }),
    delete: () => ({
      eq: () => ({ error: { message: "Supabase not configured" } }),
    }),
  }),
})

// Only create the real Supabase client if properly configured
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseAnonKey!) : createMockClient()

// Log configuration status
if (typeof window !== "undefined") {
  if (isSupabaseConfigured) {
    console.log("✅ Supabase configured successfully")
  } else {
    console.log("⚠️ Running in demo mode - Supabase not configured")
  }
}

// Types for our database
export type Database = {
  public: {
    Tables: {
      forms: {
        Row: {
          id: string
          title: string
          description: string | null
          questions: any
          is_published: boolean
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          questions: any
          is_published?: boolean
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          questions?: any
          is_published?: boolean
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      form_responses: {
        Row: {
          id: string
          form_id: string
          answers: any
          submitted_at: string
        }
        Insert: {
          id?: string
          form_id: string
          answers: any
          submitted_at?: string
        }
        Update: {
          id?: string
          form_id?: string
          answers?: any
          submitted_at?: string
        }
      }
    }
  }
}
