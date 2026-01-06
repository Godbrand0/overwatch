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
      testResults, // Extract testResults
      deployedBlockNumber, // Block number from deployment
      compilerVersion = "0.8.20",
      compileOnly = false,
    } = body;

    console.log("Deployment API called for user:", userId);

    // Verify user exists in DB
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error("User not found in DB during deployment:", userId, userError);
      return NextResponse.json(
        { error: "User not found in database. Please re-login." },
        { status: 401 }
      );
    }

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
      address: contractAddress.trim().toLowerCase(),
      network: network,
      name: contractName,
      abi: compilationResult.abi,
      source_code: sourceCode,
    };

    if (rwaProof) {
      insertData.rwa_proof = rwaProof;
    }

    if (deployedBlockNumber) {
      insertData.deployed_block_number = deployedBlockNumber;
    }

    if (testResults) {
      insertData.test_results = testResults;
    }

    if (constructorArgs) {
      insertData.constructor_args = constructorArgs;
    }

    if (deployTxHash) {
      insertData.deploy_tx_hash = deployTxHash;
    }

    console.log("Saving contract to DB:", {
      address: insertData.address,
      name: insertData.name,
      user_id: insertData.user_id,
      has_rwa_proof: !!insertData.rwa_proof,
      has_test_results: !!insertData.test_results
    });

    // Save contract to database using Supabase (upsert to handle existing contracts)
    let { data: contract, error: dbError } = await supabase
      .from('contracts')
      .upsert(insertData, { onConflict: 'address, network' })
      .select()
      .single();

    // Fallback: If error is related to missing column or schema cache issues, try without the extra columns
    const isMissingColumnError = dbError && (
      dbError.message.includes("column \"rwa_proof\" of relation \"contracts\" does not exist") ||
      dbError.message.includes("column \"test_results\" of relation \"contracts\" does not exist") ||
      dbError.message.includes("column \"constructor_args\" of relation \"contracts\" does not exist") ||
      dbError.message.includes("schema cache") // Catch "Could not find the 'constructor_args' column... in the schema cache"
    );

    if (isMissingColumnError) {
      console.warn("RWA Proof, Test Results, or Constructor Args column missing or schema cache issue, saving without them.");
      delete insertData.rwa_proof;
      delete insertData.test_results;
      delete insertData.constructor_args;
      const retry = await supabase
        .from('contracts')
        .upsert(insertData, { onConflict: 'address, network' })
        .select()
        .single();
      contract = retry.data;
      dbError = retry.error;
    }

    if (dbError) {
      console.error('Database error details:', {
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint,
        code: dbError.code
      });
      return NextResponse.json(
        { 
          error: "Failed to save contract to database: " + dbError.message,
          details: dbError.details,
          code: dbError.code,
          attemptedData: {
            address: insertData.address,
            user_id: insertData.user_id,
            network: insertData.network
          }
        },
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
