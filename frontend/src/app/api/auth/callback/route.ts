import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";
import { supabase } from "@/lib/supabase";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;

/**
 * Handle GitHub OAuth callback
 * GET /api/auth/callback
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/error?message=No code provided", request.url));
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error("Failed access token");
    }

    // Get user info
    const octokit = new Octokit({ auth: accessToken });
    const { data: userData } = await octokit.rest.users.getAuthenticated();

    // Create or update user in database using Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({
        github_id: userData.id.toString(),
        github_username: userData.login,
        avatar_url: userData.avatar_url,
        access_token: accessToken, // In production, encrypt this!
      })
      .select()
      .single();

    if (userError) {
      throw new Error(`Database error: ${userError.message}`);
    }

    // Set session cookie
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(new URL("/error?message=Authentication failed", request.url));
  }
}
