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
      compilerVersion = "0.8.20",
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

    // Save contract to database using Supabase
    const { data: contract, error: dbError } = await supabase
      .from('contracts')
      .insert({
        user_id: userId,
        address: contractAddress,
        network: network,
        name: contractName,
        abi: compilationResult.abi,
        source_code: sourceCode,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue with deployment even if database fails for hackathon
    }

    // Verify contract (async, don't wait)
    if (contract) {
      const verifier = new VerificationService();
      verifier
        .verifyContract({
          contractAddress,
          sourceCode,
          contractName,
          compilerVersion,
          constructorArgs,
          network: network === 'mainnet' ? 'mainnet' : 'testnet',
        })
        .then(async (result) => {
          if (result.success && contract) {
            // Mark as verified in Supabase
            await supabase
              .from('contracts')
              .update({ verified_at: new Date().toISOString() })
              .eq('id', contract.id);
          }
        })
        .catch(err => console.error('Verification error:', err));
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
