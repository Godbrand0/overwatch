import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { GitHubService } from "@/lib/github";

/**
 * Get contents of a specific path in a GitHub repository
 * GET /api/repos/[repoId]/contents?path=...
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ repoId: string }> }
) {
  const userId = request.cookies.get("userId")?.value;
  const { repoId } = await params;
  const path = request.nextUrl.searchParams.get("path") || "";

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.access_token) {
      return NextResponse.json({ error: "No access token" }, { status: 404 });
    }

    const github = new GitHubService(user.access_token);
    
    // Get repo details to get owner and name
    const repo = await github.getRepositoryById(parseInt(repoId));

    if (!repo) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    const contents = await github.getRepositoryContents(repo.owner.login, repo.name, path);

    return NextResponse.json({ contents, repo });
  } catch (error: any) {
    console.error("Error fetching repository contents:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch repository contents" },
      { status: 500 }
    );
  }
}
