import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Get current user data and contract stats
 * GET /api/user
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

    // Get contract stats
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('id, verified_at')
      .eq('user_id', userId);

    if (contractsError) {
      console.error("Error fetching contracts:", contractsError);
    }

    const totalContracts = contracts?.length || 0;
    const verifiedContracts = contracts?.filter(c => c.verified_at).length || 0;

    // Get recent activity (last 5 contracts)
    const { data: recentActivity } = await supabase
      .from('contracts')
      .select('*')
      .eq('user_id', userId)
      .order('deployed_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      user: {
        id: user.id,
        github_username: user.github_username,
        avatar_url: user.avatar_url,
      },
      stats: {
        totalContracts,
        verifiedContracts,
        activeDeployments: 0, // Placeholder for now
      },
      recentActivity: recentActivity || [],
    });
  } catch (error: any) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
