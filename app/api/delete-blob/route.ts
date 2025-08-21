import { del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth as adminAuth } from "@/lib/firebase-admin";

export async function DELETE(request: Request): Promise<NextResponse> {
  const authToken = request.headers.get("authorization")?.split("Bearer ")[1];

  if (!authToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Authenticate the user to ensure they are allowed to perform this action
    await adminAuth.verifyIdToken(authToken);
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { message: "Missing or invalid 'url' in request body." },
        { status: 400 }
      );
    }

    // Delete the blob from Vercel Blob storage using its URL
    await del(url);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // If the blob does not exist, `@vercel/blob` throws a `BlobNotFoundError`.
    // We can treat this as a success since the file is already gone.
    if (error.code === "not_found") {
      console.warn(
        `Blob not found during deletion, but proceeding: ${error.message}`
      );
      return NextResponse.json({ success: true, message: "Blob not found." });
    }
    // For other errors, return a generic 500.
    console.error("Error deleting blob:", error);
    return NextResponse.json(
      { message: "Failed to delete file." },
      { status: 500 }
    );
  }
}
