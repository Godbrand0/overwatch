import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Get global RWA statistics and all anchored contracts
 * GET /api/rwa/stats
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch all anchored contracts across all users
    const { data: contracts, error } = await supabase
      .from("contracts")
      .select("address, name, rwa_type, legal_right, jurisdiction, custodian, offchain_asset_id, created_at, user_id")
      .eq("is_anchored", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching RWA stats:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Perform statistics
    const stats = {
      totalAnchored: contracts.length,
      byType: {} as Record<string, number>,
      byJurisdiction: {} as Record<string, number>,
      byLegalRight: {} as Record<string, number>,
      recentAnchors: contracts.slice(0, 5)
    };

    contracts.forEach(c => {
      if (c.rwa_type) stats.byType[c.rwa_type] = (stats.byType[c.rwa_type] || 0) + 1;
      if (c.jurisdiction) stats.byJurisdiction[c.jurisdiction] = (stats.byJurisdiction[c.jurisdiction] || 0) + 1;
      if (c.legal_right) stats.byLegalRight[c.legal_right] = (stats.byLegalRight[c.legal_right] || 0) + 1;
    });

    return NextResponse.json({ 
      success: true, 
      stats,
      contracts 
    });
  } catch (error: any) {
    console.error("RWA Stats API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch RWA statistics" },
      { status: 500 }
    );
  }
}
