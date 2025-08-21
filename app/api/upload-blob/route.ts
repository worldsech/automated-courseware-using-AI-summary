import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth as adminAuth } from "@/lib/firebase-admin";

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");
  const courseId = searchParams.get("courseId");

  if (!filename || !courseId) {
    return NextResponse.json(
      { message: "Missing filename or courseId query parameter." },
      { status: 400 }
    );
  }

  if (!request.body) {
    return NextResponse.json(
      { message: "No file to upload." },
      { status: 400 }
    );
  }

  // 1. Authenticate the user
  const authToken = request.headers.get("authorization")?.split("Bearer ")[1];
  if (!authToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(authToken);
    // You could add extra logic here, e.g., check if `decodedToken.uid`
    // has permission to upload to this `courseId`.
    console.log(
      `User ${decodedToken.uid} authenticated for file upload to course ${courseId}`
    );
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // The filename from the client is used directly. Vercel Blob sanitizes this,
    // but in a real-world scenario, you might want to add your own sanitization
    // or generate a unique name on the server.
    const blob = await put(
      `courses/${courseId}/materials/${filename}`,
      request.body,
      {
        access: "public",
      }
    );

    return NextResponse.json(blob);
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error);
    return NextResponse.json(
      { message: "Failed to upload file." },
      { status: 500 }
    );
  }
}
