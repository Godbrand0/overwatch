import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { VerificationService } from "@/lib/verification";
import { CompilerService } from "@/lib/compiler";

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

    // Flatten source code before verification
    const compiler = new CompilerService();
    let flattenedSource = sourceCode;
    try {
      flattenedSource = await compiler.flattenContract(sourceCode, contractName, compilerVersion);
    } catch (flattenError) {
      console.error("Failed to flatten source code for verification:", flattenError);
      // Fallback to original source code if flattening fails
    }

    // Encode constructor arguments if provided as an array
    let encodedArgs = "";
    if (Array.isArray(constructorArgs)) {
      encodedArgs = await compiler.encodeConstructorArgs(
        typeof body.abi === 'string' ? JSON.parse(body.abi) : body.abi || [],
        constructorArgs
      );
    } else if (typeof constructorArgs === 'string') {
      encodedArgs = constructorArgs.replace("0x", "");
    }

    // Verify contract on block explorer
    const verifier = new VerificationService();
    const result = await verifier.verifyContract({
      contractAddress,
      sourceCode: flattenedSource,
      contractName,
      compilerVersion,
      constructorArgs: encodedArgs,
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
