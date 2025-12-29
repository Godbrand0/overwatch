import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { GitHubService } from "@/lib/github";

/**
 * Get user's GitHub repositories
 * GET /api/repos
 */
export async function GET(request: NextRequest) {
  const userId = request.cookies.get("userId")?.value;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.access_token) {
      return NextResponse.json({ error: "No access token" }, { status: 404 });
    }

    const github = new GitHubService(user.access_token);
    const repos = await github.getRepositories();

    return NextResponse.json({ repos });
  } catch (error: any) {
    console.error("Error fetching repos:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}
