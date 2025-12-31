import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { VerificationService } from "@/lib/verification";

/**
 * Verify contract on block explorer
 * POST /api/verify
 */
export async function POST(request: NextRequest) {
  const userId = request.cookies.get("userId")?.value;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      contractAddress,
      sourceCode,
      contractName,
      constructorArgs = [],
      compilerVersion = "0.8.20",
      network = "testnet",
    } = body;

    if (!contractAddress || !sourceCode || !contractName) {
      return NextResponse.json(
        { error: "Missing required fields: contractAddress, sourceCode, contractName" },
        { status: 400 }
      );
    }

    // Verify contract on block explorer
    const verifier = new VerificationService();
    const result = await verifier.verifyContract({
      contractAddress,
      sourceCode,
      contractName,
      compilerVersion,
      constructorArgs: typeof constructorArgs === 'string' ? constructorArgs : "",
      network: network === 'mainnet' ? 'mainnet' : 'testnet',
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || "Verification failed" },
        { status: 400 }
      );
    }

    // Update contract in database to mark as verified
    const { error: dbError } = await supabase
      .from('contracts')
      .update({ verified_at: new Date().toISOString() })
      .eq('address', contractAddress)
      .eq('user_id', userId);

    if (dbError) {
      console.error('Database error while updating verification status:', dbError);
      // Continue even if DB update fails - verification on explorer succeeded
    }

    return NextResponse.json({
      success: true,
      guid: result.guid,
      message: "Contract verified successfully on block explorer",
    });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}
