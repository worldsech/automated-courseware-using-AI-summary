import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

export interface CreateAdminData {
  fullName: string
  email: string
  password: string
}

export const createFirstAdmin = async (adminData: CreateAdminData) => {
  try {
    // Create Firebase Auth user
    const { user } = await createUserWithEmailAndPassword(auth, adminData.email, adminData.password)

    // Store in users collection with admin role
    await setDoc(doc(db, "users", user.uid), {
      email: adminData.email,
      role: "admin",
    })

    // Store in lecturers collection (admins use lecturer interface)
    await setDoc(doc(db, "lecturers", user.uid), {
      id: user.uid,
      email: adminData.email,
      role: "admin",
      fullName: adminData.fullName,
      createdAt: new Date(),
    })

    console.log("Admin user created successfully:", adminData.email)
    return user
  } catch (error) {
    console.error("Failed to create admin user:", error)
    throw error
  }
}
