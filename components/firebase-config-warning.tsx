"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { isFirebaseConfigured } from "@/lib/firebase"

export function FirebaseConfigWarning() {
  if (isFirebaseConfigured()) {
    return null
  }

  return (
    <Alert variant="destructive" className="mx-4 mt-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        Firebase is not configured. Please add your Firebase environment variables in Project Settings to enable
        authentication and database features.
      </AlertDescription>
    </Alert>
  )
}
