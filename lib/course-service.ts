import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  getDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import type {
  Course,
  Enrollment,
  Quiz,
  QuizResult,
  ClassLevel,
  CourseFile,
} from "./types";

export const createCourse = async (courseData: {
  title: string;
  lecturerId: string;
  lecturerName: string;
  requiredClass: ClassLevel;
}): Promise<Course> => {
  const docRef = await addDoc(collection(db, "courses"), {
    ...courseData,
    files: [],
    createdAt: new Date(),
  });

  return {
    id: docRef.id,
    ...courseData,
    files: [],
    createdAt: new Date(),
  };
};

export const getCoursesByLecturer = async (
  lecturerId: string
): Promise<Course[]> => {
  const q = query(
    collection(db, "courses"),
    where("lecturerId", "==", lecturerId)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Handle backward compatibility with old notesUrl field
      files:
        data.files ||
        (data.notesUrl
          ? [
              {
                id: "legacy",
                name: "Course Notes",
                url: data.notesUrl,
                size: 0,
                uploadedAt: data.createdAt?.toDate() || new Date(),
                type: "application/pdf",
              },
            ]
          : []),
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  }) as Course[];
};

export const uploadCourseFile = async (
  courseId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<CourseFile> => {
  return new Promise(async (resolve, reject) => {
    if (!auth.currentUser) {
      return reject(new Error("User must be authenticated to upload files."));
    }

    try {
      const token = await auth.currentUser.getIdToken();
      const fileName = `${Date.now()}_${file.name}`;
      const url = `/api/upload-blob?filename=${encodeURIComponent(
        fileName
      )}&courseId=${encodeURIComponent(courseId)}`;

      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);

      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      // Content-Type is set automatically by the browser for File objects

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(Math.round(progress));
        }
      };

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const newBlob = JSON.parse(xhr.responseText);

            const courseFile: CourseFile = {
              id: fileName,
              name: file.name,
              url: newBlob.url,
              size: file.size,
              uploadedAt: new Date(),
              type: file.type,
            };

            await updateDoc(doc(db, "courses", courseId), {
              files: arrayUnion(courseFile),
            });

            resolve(courseFile);
          } catch (error) {
            console.error(
              "Error processing upload response or updating Firestore:",
              error
            );
            reject(new Error("File uploaded but failed to update course."));
          }
        } else {
          let errorMessage = "Failed to upload file.";
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.message || errorMessage;
          } catch (e) {
            // Ignore if response is not JSON
          }
          reject(new Error(errorMessage));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error during file upload."));
      };

      xhr.send(file);
    } catch (error) {
      console.error("Error starting file upload:", error);
      reject(new Error("Failed to start file upload."));
    }
  });
};

export const deleteCourseFile = async (
  courseId: string,
  fileId: string
): Promise<void> => {
  // Get course to find the file
  const courseDoc = await getDoc(doc(db, "courses", courseId));
  if (!courseDoc.exists()) {
    throw new Error("Course not found");
  }

  const courseData = courseDoc.data();
  const fileToDelete = (courseData.files as CourseFile[])?.find(
    (f) => f.id === fileId
  );

  if (!fileToDelete) {
    throw new Error("File not found in course document.");
  }

  // 1. Delete from Vercel Blob storage via our API route
  if (!auth.currentUser) {
    throw new Error("User must be authenticated to delete files.");
  }
  const token = await auth.currentUser.getIdToken();

  const response = await fetch("/api/delete-blob", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url: fileToDelete.url }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        `Failed to delete file from storage. Status: ${response.status}`
    );
  }

  // 2. Remove file reference from Firestore course document
  await updateDoc(doc(db, "courses", courseId), {
    files: arrayRemove(fileToDelete),
  });
};

export const getPendingEnrollments = async (
  lecturerId: string
): Promise<(Enrollment & { studentName: string; courseName: string })[]> => {
  try {
    // Get lecturer's courses
    const courses = await getCoursesByLecturer(lecturerId);
    const courseIds = courses.map((c) => c.id);

    if (courseIds.length === 0) return [];

    // Get pending enrollments for these courses
    const enrollments: (Enrollment & {
      studentName: string;
      courseName: string;
    })[] = [];

    for (const courseId of courseIds) {
      try {
        const q = query(
          collection(db, "enrollments"),
          where("courseId", "==", courseId),
          where("approved", "==", false)
        );
        const querySnapshot = await getDocs(q);

        for (const enrollmentDoc of querySnapshot.docs) {
          try {
            const enrollmentData = enrollmentDoc.data();

            // Get student name with error handling
            const studentDoc = await getDoc(
              doc(db, "students", enrollmentData.studentId)
            ).catch(() => null);
            const studentName = studentDoc?.exists()
              ? studentDoc.data().fullName
              : "Unknown Student";

            // Get course name
            const course = courses.find((c) => c.id === courseId);
            const courseName = course?.title || "Unknown Course";

            const enrolledAtTimestamp = enrollmentData.enrolledAt as Timestamp;
            enrollments.push({
              id: enrollmentDoc.id,
              studentId: enrollmentData.studentId,
              courseId: enrollmentData.courseId,
              approved: enrollmentData.approved,
              enrolledAt: enrolledAtTimestamp?.toDate() || new Date(),
              studentName,
              courseName,
            });
          } catch (error) {
            console.error("Error processing enrollment:", error);
          }
        }
      } catch (error) {
        console.error(
          "Error fetching enrollments for course:",
          courseId,
          error
        );
      }
    }

    return enrollments;
  } catch (error) {
    console.error("Error fetching pending enrollments:", error);
    return [];
  }
};

export const approveEnrollment = async (
  enrollmentId: string
): Promise<void> => {
  await updateDoc(doc(db, "enrollments", enrollmentId), {
    approved: true,
  });
};

export const createQuiz = async (
  quizData: Omit<Quiz, "id" | "createdAt">
): Promise<Quiz> => {
  const docRef = await addDoc(collection(db, "quizzes"), {
    ...quizData,
    createdAt: new Date(),
  });

  return {
    id: docRef.id,
    ...quizData,
    createdAt: new Date(),
  };
};

export const getQuizzesByCourse = async (courseId: string): Promise<Quiz[]> => {
  const q = query(collection(db, "quizzes"), where("courseId", "==", courseId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as Quiz[];
};

export const getStudentScores = async (
  lecturerId: string
): Promise<
  (QuizResult & {
    studentName: string;
    quizTitle: string;
    courseName: string;
  })[]
> => {
  const courses = await getCoursesByLecturer(lecturerId);
  const results: (QuizResult & {
    studentName: string;
    quizTitle: string;
    courseName: string;
  })[] = [];

  for (const course of courses) {
    const quizzes = await getQuizzesByCourse(course.id);

    for (const quiz of quizzes) {
      const q = query(
        collection(db, "quizResults"),
        where("quizId", "==", quiz.id)
      );
      const querySnapshot = await getDocs(q);

      for (const resultDoc of querySnapshot.docs) {
        const resultData = resultDoc.data();

        // Get student name
        const studentDoc = await getDoc(
          doc(db, "students", resultData.studentId)
        );
        const studentName = studentDoc.exists()
          ? studentDoc.data().fullName
          : "Unknown Student";
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
          studentName,
          quizTitle: quiz.title,
          courseName: course.title,
        });
      }
    }
  }

  return results;
};

export const getCourseStudents = async (
  courseId: string
): Promise<(Enrollment & { studentName: string; studentEmail: string })[]> => {
  try {
    // Get approved enrollments for this course
    const q = query(
      collection(db, "enrollments"),
      where("courseId", "==", courseId),
      where("approved", "==", true)
    );
    const querySnapshot = await getDocs(q);

    const students: (Enrollment & {
      studentName: string;
      studentEmail: string;
    })[] = [];

    for (const enrollmentDoc of querySnapshot.docs) {
      try {
        const enrollmentData = enrollmentDoc.data();

        // Get student details with error handling
        const studentDoc = await getDoc(
          doc(db, "students", enrollmentData.studentId)
        ).catch(() => null);
        const studentName = studentDoc?.exists()
          ? studentDoc.data().fullName
          : "Unknown Student";
        const studentEmail = studentDoc?.exists()
          ? studentDoc.data().email
          : "unknown@email.com";

        const enrolledAtTimestamp = enrollmentData.enrolledAt as Timestamp;
        students.push({
          id: enrollmentDoc.id,
          studentId: enrollmentData.studentId,
          courseId: enrollmentData.courseId,
          approved: enrollmentData.approved,
          enrolledAt: enrolledAtTimestamp?.toDate() || new Date(),
          studentName,
          studentEmail,
        });
      } catch (error) {
        console.error("Error processing student enrollment:", error);
      }
    }

    return students;
  } catch (error) {
    console.error("Error fetching course students:", error);
    return [];
  }
};
