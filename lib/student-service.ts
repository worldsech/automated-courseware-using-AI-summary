import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Course, Enrollment, Quiz, QuizResult, ClassLevel } from "./types";

export const getAvailableCourses = async (
  studentClass: ClassLevel
): Promise<Course[]> => {
  const q = query(
    collection(db, "courses"),
    where("requiredClass", "==", studentClass)
  );
  const querySnapshot = await getDocs(q);

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

export const enrollInCourse = async (
  studentId: string,
  courseId: string
): Promise<Enrollment> => {
  const docRef = await addDoc(collection(db, "enrollments"), {
    studentId,
    courseId,
    approved: false,
    enrolledAt: new Date(),
  });

  return {
    id: docRef.id,
    studentId,
    courseId,
    approved: false,
    enrolledAt: new Date(),
  };
};

export const getStudentEnrollments = async (
  studentId: string
): Promise<(Enrollment & { course: Course })[]> => {
  try {
    const q = query(
      collection(db, "enrollments"),
      where("studentId", "==", studentId)
    );
    const querySnapshot = await getDocs(q);

    const enrollments: (Enrollment & { course: Course })[] = [];

    for (const enrollmentDoc of querySnapshot.docs) {
      try {
        const enrollmentData = enrollmentDoc.data();

        // Get course details with error handling
        const courseDoc = await getDoc(
          doc(db, "courses", enrollmentData.courseId)
        );
        if (courseDoc.exists()) {
          const courseData = courseDoc.data();
          const enrolledAtTimestamp = enrollmentData.enrolledAt as Timestamp;
          const createdAtTimestamp = courseData.createdAt as Timestamp;

          enrollments.push({
            id: enrollmentDoc.id,
            studentId: enrollmentData.studentId,
            courseId: enrollmentData.courseId,
            approved: enrollmentData.approved,
            enrolledAt: enrolledAtTimestamp?.toDate() || new Date(),
            course: {
              id: courseDoc.id,
              title: courseData.title,
              lecturerId: courseData.lecturerId,
              lecturerName: courseData.lecturerName,
              requiredClass: courseData.requiredClass,
              files: courseData.files || [],
              createdAt: createdAtTimestamp?.toDate() || new Date(),
            },
          });
        }
      } catch (error) {
        console.error("Error processing enrollment:", error);
        // Continue with other enrollments
      }
    }

    return enrollments;
  } catch (error) {
    console.error("Error fetching student enrollments:", error);
    return []; // Return empty array instead of throwing
  }
};

export const checkEnrollmentStatus = async (
  studentId: string,
  courseId: string
): Promise<Enrollment | null> => {
  const q = query(
    collection(db, "enrollments"),
    where("studentId", "==", studentId),
    where("courseId", "==", courseId)
  );
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) return null;

  const doc = querySnapshot.docs[0];
  const data = doc.data();
  const enrolledAtTimestamp = data.enrolledAt as Timestamp;

  return {
    id: doc.id,
    studentId: data.studentId,
    courseId: data.courseId,
    approved: data.approved,
    enrolledAt: enrolledAtTimestamp?.toDate() || new Date(),
    course: data.course,
    studentName: data.studentName,
    studentEmail: data.studentEmail,
  };
};

export const getQuizzesForCourse = async (
  courseId: string
): Promise<Quiz[]> => {
  const q = query(collection(db, "quizzes"), where("courseId", "==", courseId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as Quiz[];
};

export const submitQuizResult = async (
  result: Omit<QuizResult, "id" | "completedAt">
): Promise<QuizResult> => {
  const docRef = await addDoc(collection(db, "quizResults"), {
    ...result,
    completedAt: new Date(),
  });

  return {
    id: docRef.id,
    ...result,
    completedAt: new Date(),
  };
};

export const getStudentQuizResults = async (
  studentId: string
): Promise<(QuizResult & { quizTitle: string; courseName: string })[]> => {
  try {
    const q = query(
      collection(db, "quizResults"),
      where("studentId", "==", studentId)
    );
    const querySnapshot = await getDocs(q);

    const results: (QuizResult & { quizTitle: string; courseName: string })[] =
      [];

    for (const resultDoc of querySnapshot.docs) {
      try {
        const resultData = resultDoc.data();

        // Get quiz and course details with error handling
        const [quizDoc, courseDoc] = await Promise.all([
          getDoc(doc(db, "quizzes", resultData.quizId)).catch(() => null),
          getDoc(doc(db, "courses", resultData.courseId)).catch(() => null),
        ]);

        const quizTitle = quizDoc?.exists()
          ? quizDoc.data().title
          : "Unknown Quiz";
        const courseName = courseDoc?.exists()
          ? courseDoc.data().title
          : "Unknown Course";
        const completedAtTimestamp = resultData.completedAt as Timestamp;
        results.push({
          id: resultDoc.id,
          studentId: resultData.studentId,
          quizId: resultData.quizId,
          courseId: resultData.courseId,
          score: resultData.score,
          totalQuestions: resultData.totalQuestions,
          answers: resultData.answers,
          completedAt: completedAtTimestamp?.toDate() || new Date(),
          quizTitle,
          courseName,
        });
      } catch (error) {
        console.error("Error processing quiz result:", error);
        // Continue with other results
      }
    }

    return results;
  } catch (error) {
    console.error("Error fetching student quiz results:", error);
    return []; // Return empty array instead of throwing
  }
};
