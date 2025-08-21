import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "./firebase";
import type { Student, Lecturer, Course, ClassLevel } from "./types";

export const getAllStudents = async (): Promise<Student[]> => {
  const querySnapshot = await getDocs(collection(db, "students"));
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    const createdAtTimestamp = data.createdAt as Timestamp;
    return {
      id: doc.id,
      fullName: data.fullName,
      matriculationNumber: data.matriculationNumber,
      email: data.email,
      class: data.class,
      role: "student",
      createdAt: createdAtTimestamp?.toDate() || new Date(),
    };
  });
};

export const getAllLecturers = async (): Promise<Lecturer[]> => {
  const querySnapshot = await getDocs(collection(db, "lecturers"));
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    const createdAtTimestamp = data.createdAt as Timestamp;
    return {
      id: doc.id,
      fullName: data.fullName,
      email: data.email,
      role: "lecturer",
      createdAt: createdAtTimestamp?.toDate() || new Date(),
    };
  });
};

export const getAllCourses = async (): Promise<Course[]> => {
  const querySnapshot = await getDocs(collection(db, "courses"));
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    const createdAtTimestamp = data.createdAt as Timestamp;
    return {
      id: doc.id,
      title: data.title,
      lecturerId: data.lecturerId,
      lecturerName: data.lecturerName,
      requiredClass: data.requiredClass,
      files: data.files || [],
      createdAt: createdAtTimestamp?.toDate() || new Date(),
    };
  });
};

export const deleteCourse = async (courseId: string): Promise<void> => {
  await deleteDoc(doc(db, "courses", courseId));
};

export const deleteUser = async (
  userId: string,
  userType: "student" | "lecturer"
): Promise<void> => {
  // Delete from specific collection
  await deleteDoc(
    doc(db, userType === "student" ? "students" : "lecturers", userId)
  );
  // Delete from users collection
  await deleteDoc(doc(db, "users", userId));
};

export const createStudentByAdmin = async (studentData: {
  fullName: string;
  matriculationNumber: string;
  email: string;
  class: ClassLevel;
  password: string;
}): Promise<Student> => {
  // Create Firebase Auth user
  const { user } = await createUserWithEmailAndPassword(
    auth,
    studentData.email,
    studentData.password
  );

  const newStudent: Student = {
    id: user.uid,
    email: studentData.email,
    role: "student",
    fullName: studentData.fullName,
    matriculationNumber: studentData.matriculationNumber,
    class: studentData.class,
    createdAt: new Date(),
  };

  // Store in users collection
  await setDoc(doc(db, "users", user.uid), {
    email: studentData.email,
    role: "student",
  });

  // Store in students collection
  await setDoc(doc(db, "students", user.uid), newStudent);

  return newStudent;
};

export const createLecturerByAdmin = async (lecturerData: {
  fullName: string;
  email: string;
  password: string;
}): Promise<Lecturer> => {
  // Create Firebase Auth user
  const { user } = await createUserWithEmailAndPassword(
    auth,
    lecturerData.email,
    lecturerData.password
  );

  const newLecturer: Lecturer = {
    id: user.uid,
    email: lecturerData.email,
    role: "lecturer",
    fullName: lecturerData.fullName,
    createdAt: new Date(),
  };

  // Store in users collection
  await setDoc(doc(db, "users", user.uid), {
    email: lecturerData.email,
    role: "lecturer",
  });

  // Store in lecturers collection
  await setDoc(doc(db, "lecturers", user.uid), newLecturer);

  return newLecturer;
};

export const getSystemStats = async () => {
  const [students, lecturers, courses] = await Promise.all([
    getAllStudents(),
    getAllLecturers(),
    getAllCourses(),
  ]);

  const coursesWithNotes = courses.filter(
    (course) => course.files && course.files.length > 0
  ).length;

  // Get enrollments count
  const enrollmentsSnapshot = await getDocs(collection(db, "enrollments"));
  const totalEnrollments = enrollmentsSnapshot.size;
  const approvedEnrollments = enrollmentsSnapshot.docs.filter(
    (doc) => doc.data().approved
  ).length;

  // Get quiz results count
  const quizResultsSnapshot = await getDocs(collection(db, "quizResults"));
  const totalQuizAttempts = quizResultsSnapshot.size;

  return {
    totalStudents: students.length,
    totalLecturers: lecturers.length,
    totalCourses: courses.length,
    coursesWithNotes,
    totalEnrollments,
    approvedEnrollments,
    totalQuizAttempts,
  };
};
