import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "./firebase"
import type { User, Student, Lecturer, UserRole, ClassLevel } from "./types"

export interface RegisterStudentData {
  fullName: string
  matriculationNumber: string
  email: string
  class: ClassLevel
  password: string
}

export interface RegisterLecturerData {
  fullName: string
  email: string
  password: string
}

export const registerStudent = async (data: RegisterStudentData): Promise<Student> => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password)

    const studentData: Student = {
      id: user.uid,
      email: data.email,
      role: "student",
      fullName: data.fullName,
      matriculationNumber: data.matriculationNumber,
      class: data.class,
      createdAt: new Date(),
    }

    // Store in users collection
    await setDoc(doc(db, "users", user.uid), {
      email: data.email,
      role: "student",
    })

    // Store in students collection
    await setDoc(doc(db, "students", user.uid), studentData)

    return studentData
  } catch (error) {
    console.error("Registration error:", error)
    throw new Error("Registration failed. Please check your Firebase configuration.")
  }
}

export const registerLecturer = async (data: RegisterLecturerData): Promise<Lecturer> => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password)

    const lecturerData: Lecturer = {
      id: user.uid,
      email: data.email,
      role: "lecturer",
      fullName: data.fullName,
      createdAt: new Date(),
    }

    // Store in users collection
    await setDoc(doc(db, "users", user.uid), {
      email: data.email,
      role: "lecturer",
    })

    // Store in lecturers collection
    await setDoc(doc(db, "lecturers", user.uid), lecturerData)

    return lecturerData
  } catch (error) {
    console.error("Registration error:", error)
    throw new Error("Registration failed. Please check your Firebase configuration.")
  }
}

export const signIn = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password)
}

export const signOut = async () => {
  return await firebaseSignOut(auth)
}

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    const user = auth.currentUser
    if (!user || !user.email) {
      throw new Error("No authenticated user found")
    }

    // Re-authenticate user before changing password
    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)

    // Update password
    await updatePassword(user, newPassword)
  } catch (error: any) {
    console.error("Change password error:", error)
    if (error.code === "auth/wrong-password") {
      throw new Error("Current password is incorrect")
    } else if (error.code === "auth/weak-password") {
      throw new Error("New password is too weak. Please choose a stronger password.")
    } else if (error.code === "auth/requires-recent-login") {
      throw new Error("Please sign out and sign in again before changing your password")
    }
    throw new Error("Failed to change password. Please try again.")
  }
}

export const getUserData = async (uid: string): Promise<User | null> => {
  try {
    console.log("[v0] Fetching user data for uid:", uid)
    const userDoc = await getDoc(doc(db, "users", uid))
    if (!userDoc.exists()) {
      console.log("[v0] User document not found in users collection")
      return null
    }

    const userData = userDoc.data()
    const role = userData.role as UserRole
    console.log("[v0] User role from users collection:", role)

    if (role === "student") {
      const studentDoc = await getDoc(doc(db, "students", uid))
      const result = studentDoc.exists() ? (studentDoc.data() as Student) : null
      console.log("[v0] Student data fetched:", !!result)
      return result
    } else if (role === "lecturer") {
      const lecturerDoc = await getDoc(doc(db, "lecturers", uid))
      const result = lecturerDoc.exists() ? (lecturerDoc.data() as Lecturer) : null
      console.log("[v0] Lecturer data fetched:", !!result)
      return result
    } else if (role === "admin") {
      console.log("[v0] Fetching admin data from lecturers collection")
      const adminDoc = await getDoc(doc(db, "lecturers", uid))
      const result = adminDoc.exists() ? (adminDoc.data() as Lecturer) : null
      console.log("[v0] Admin data fetched:", !!result)
      return result
    }

    console.log("[v0] Unknown role or no matching collection:", role)
    return null
  } catch (error) {
    console.error("Firestore access error:", error)
    // Return null when Firestore isn't configured or has permission issues
    return null
  }
}
