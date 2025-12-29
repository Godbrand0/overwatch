import { NextRequest, NextResponse } from "next/server";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || "http://localhost:3000/api/auth/callback";

/**
 * Initiate GitHub OAuth flow
 * GET /api/auth/github
 */
export async function GET(request: NextRequest) {
  const scope = "repo read:user user:email";
  const state = Math.random().toString(36).substring(7);

  const authUrl = new URL("https://github.com/login/oauth/authorize");
  authUrl.searchParams.set("client_id", GITHUB_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", GITHUB_CALLBACK_URL);
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}
