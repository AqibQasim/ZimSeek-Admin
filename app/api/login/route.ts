import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json(); // Expect idToken from client
    const auth = getAuth(adminApp);
    const decodedToken = await auth.verifyIdToken(idToken);
    console.log("Decoded token:", decodedToken); // Debug the token
    const uid = decodedToken.uid;

    // Check custom claim for admin role
    const user = await auth.getUser(uid);
    console.log("User data:", user); // Debug user data
    if (!user.customClaims?.admin) {
      return NextResponse.json({ message: "Unauthorized: Admin claim not set" }, { status: 403 });
    }

    // Generate custom token for session
    const token = await auth.createCustomToken(uid);
    const response = NextResponse.json({ message: "Login successful" });
    response.cookies.set("authToken", token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production" 
    });
    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ message: error.message || "Invalid credentials" }, { status: 401 });
  }
}