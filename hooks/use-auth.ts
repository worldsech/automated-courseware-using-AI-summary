"use client"

import { useState, useEffect } from "react"
import { type User as FirebaseUser, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getUserData } from "@/lib/auth"
import type { User } from "@/lib/types"

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser)

      if (firebaseUser) {
        try {
          const userData = await getUserData(firebaseUser.uid)
          if (!userData) {
            // Create a basic user object from Firebase auth data
            const fallbackUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              role: "student", // Default role when we can't fetch from Firestore
              fullName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
              createdAt: new Date(),
            }
            setUser(fallbackUser)
            console.warn("Using fallback user data. Configure Firestore for full functionality.")
          } else {
            setUser(userData)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          if (firebaseUser.email) {
            const fallbackUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              role: "student",
              fullName: firebaseUser.displayName || firebaseUser.email.split("@")[0],
              createdAt: new Date(),
            }
            setUser(fallbackUser)
          } else {
            setUser(null)
          }
        }
      } else {
        setUser(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  return {
    user,
    firebaseUser,
    loading,
    isAuthenticated: !!user,
    isStudent: user?.role === "student",
    isLecturer: user?.role === "lecturer",
    isAdmin: user?.role === "admin",
  }
}
