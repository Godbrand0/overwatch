import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkRWACompliance } from "@/lib/rwa";

/**
 * Get contract details by address
 * GET /api/contracts/[address]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  try {
    const { data: contract, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("address", address)
      .single();

    if (error || !contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Check RWA compliance
    const rwaCompliance = checkRWACompliance(contract.abi);

    return NextResponse.json({ 
      contract: {
        ...contract,
        rwa_compliance: rwaCompliance
      } 
    });
  } catch (error: any) {
    console.error("Error fetching contract:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch contract" },
      { status: 500 }
    );
  }
}
