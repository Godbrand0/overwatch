import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { GitHubService } from "@/lib/github";

/**
 * Get file content from a specific GitHub repository
 * GET /api/repos/[repoId]/file?path=...
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ repoId: string }> }
) {
  const userId = request.cookies.get("userId")?.value;
  const { repoId } = await params;
  const path = request.nextUrl.searchParams.get("path");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!path) {
    return NextResponse.json({ error: "Path is required" }, { status: 400 });
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
    const repo = await github.getRepositoryById(parseInt(repoId));

    if (!repo) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    const content = await github.getFileContent(repo.owner.login, repo.name, path);

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("Error fetching file content:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch file content" },
      { status: 500 }
    );
  }
}
