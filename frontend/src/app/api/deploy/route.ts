import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { CompilerService } from "@/lib/compiler";
import { VerificationService } from "@/lib/verification";

/**
 * Deploy and verify contract
 * POST /api/deploy
 */
export async function POST(request: NextRequest) {
  const userId = request.cookies.get("userId")?.value;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      repositoryId,
      sourceCode,
      contractName,
      network,
      deployTxHash,
      contractAddress,
      constructorArgs,
      rwaProof, // Extract rwaProof
      compilerVersion = "0.8.20",
      compileOnly = false,
    } = body;

    // Compile contract
    const compiler = new CompilerService();
    const compilationResult = await compiler.compileContract(
      sourceCode,
      contractName,
      compilerVersion
    );

    if (!compilationResult.success) {
      return NextResponse.json(
        { error: compilationResult.error || "Compilation failed" },
        { status: 400 }
      );
    }

    // If compileOnly mode, just return compilation results
    if (compileOnly) {
      return NextResponse.json({
        success: true,
        abi: compilationResult.abi,
        bytecode: compilationResult.bytecode,
      });
    }

    // Save contract to database using Supabase
    let insertData: any = {
      user_id: userId,
      address: contractAddress,
      network: network,
      name: contractName,
      abi: compilationResult.abi,
      source_code: sourceCode,
    };

    if (rwaProof) {
      insertData.rwa_proof = rwaProof;
    }

    // Try insert with rwa_proof first
    let { data: contract, error: dbError } = await supabase
      .from('contracts')
      .insert(insertData)
      .select()
      .single();

    // Fallback: If error is related to missing column, try without rwa_proof
    if (dbError && dbError.message.includes("column \"rwa_proof\" of relation \"contracts\" does not exist")) {
      console.warn("RWA Proof column missing, saving without proof.");
      delete insertData.rwa_proof;
      const retry = await supabase
        .from('contracts')
        .insert(insertData)
        .select()
        .single();
      contract = retry.data;
      dbError = retry.error;
    }

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: "Failed to save contract to database: " + dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      contract,
      abi: compilationResult.abi,
      bytecode: compilationResult.bytecode
    });
  } catch (error: any) {
    console.error("Deployment error:", error);
    return NextResponse.json(
      { error: error.message || "Deployment failed" },
      { status: 500 }
    );
  }
}
