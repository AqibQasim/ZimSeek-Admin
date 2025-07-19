import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set("authToken", "", { 
    maxAge: 0, 
    httpOnly: true, 
    path: "/", 
    secure: process.env.NODE_ENV === "production" 
  });
  return response;
}