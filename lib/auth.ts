import { supabase, isSupabaseConfigured } from "./supabase"
import type { User } from "@supabase/supabase-js"

// Demo user for development when Supabase is not configured
const DEMO_USER = {
  id: "demo-user-123",
  email: "demo@example.com",
  user_metadata: { name: "Demo User" },
  created_at: new Date().toISOString(),
}

export const auth = {
  // Sign up
  async signUp(email: string, password: string, name: string) {
    if (!isSupabaseConfigured) {
      // Return demo success for development
      return {
        success: true,
        user: { ...DEMO_USER, email, user_metadata: { name } },
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, user: data.user }
  },

  // Sign in
  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured) {
      // Return demo success for development
      return {
        success: true,
        user: { ...DEMO_USER, email },
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, user: data.user }
  },

  // Sign out
  async signOut() {
    if (!isSupabaseConfigured) {
      return { success: true }
    }

    const { error } = await supabase.auth.signOut()
    return { success: !error, error: error?.message }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseConfigured) {
      // Check localStorage for demo user
      if (typeof window !== "undefined") {
        const demoUser = localStorage.getItem("demo-user")
        return demoUser ? JSON.parse(demoUser) : null
      }
      return null
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  },

  // Get session
  async getSession() {
    if (!isSupabaseConfigured) {
      const user = await this.getCurrentUser()
      return user ? { user } : null
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!isSupabaseConfigured) {
      // Return a mock subscription for development
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      }
    }

    return supabase.auth.onAuthStateChange(callback)
  },
}
