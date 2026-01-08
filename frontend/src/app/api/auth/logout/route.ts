import { NextRequest, NextResponse } from "next/server";

/**
 * Handle user logout
 * POST /api/auth/logout
 */
export async function POST(request: NextRequest) {
  try {
    // Clear the userId cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("userId", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // Immediately expire the cookie
    });

    return response;
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: error.message || "Logout failed" },
      { status: 500 }
    );
  }
}
