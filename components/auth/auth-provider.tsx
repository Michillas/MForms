"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { auth } from "@/lib/auth"
import { isSupabaseConfigured } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Demo mode - check localStorage for demo user
      const demoUser = localStorage.getItem("demo-user")
      setUser(demoUser ? JSON.parse(demoUser) : null)
      setLoading(false)
      return
    }

    // Get initial session
    auth.getSession().then((session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const result = await auth.signIn(email, password)
    if (result.success && result.user && !isSupabaseConfigured) {
      // Store demo user in localStorage
      localStorage.setItem("demo-user", JSON.stringify(result.user))
      setUser(result.user)
    }
    return result
  }

  const signUp = async (email: string, password: string, name: string) => {
    const result = await auth.signUp(email, password, name)
    if (result.success && result.user && !isSupabaseConfigured) {
      // Store demo user in localStorage
      localStorage.setItem("demo-user", JSON.stringify(result.user))
      setUser(result.user)
    }
    return result
  }

  const signOut = async () => {
    await auth.signOut()
    if (!isSupabaseConfigured) {
      localStorage.removeItem("demo-user")
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
