"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"
import { isFirebaseConfigured } from "@/lib/firebase"
import type { User } from "@/lib/types"
import type { User as FirebaseUser } from "firebase/auth"

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  isAuthenticated: boolean
  isStudent: boolean
  isLecturer: boolean
  isAdmin: boolean
  isFirebaseConfigured: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth()

  const contextValue = {
    ...auth,
    isFirebaseConfigured: isFirebaseConfigured(),
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}
