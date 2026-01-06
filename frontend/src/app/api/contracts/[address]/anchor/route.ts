import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Anchor RWA contract metadata
 * POST /api/contracts/[address]/anchor
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  const userId = request.cookies.get("userId")?.value;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      anchorTxHash,
      rwaType,
      legalRight,
      jurisdiction,
      custodian,
      offchainAssetId,
      legalDocHash,
      appraiserId
    } = body;

    console.log("Anchoring contract:", address, "for user:", userId);

    const { data: contract, error: updateError } = await supabase
      .from("contracts")
      .update({
        is_anchored: true,
        anchor_tx_hash: anchorTxHash,
        rwa_type: rwaType,
        legal_right: legalRight,
        jurisdiction: jurisdiction,
        custodian: custodian,
        offchain_asset_id: offchainAssetId,
        legal_doc_hash: legalDocHash,
        appraiser_id: appraiserId
      })
      .eq("address", address.trim().toLowerCase())
      .eq("user_id", userId) // Ensure only the owner can anchor
      .select()
      .single();

    if (updateError) {
      console.error("Error updating contract with anchor data:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, contract });
  } catch (error: any) {
    console.error("Anchoring API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to anchor contract" },
      { status: 500 }
    );
  }
}
