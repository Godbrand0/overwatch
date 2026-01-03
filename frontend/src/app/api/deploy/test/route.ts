import { NextRequest, NextResponse } from "next/server";
import { CompilerService } from "@/lib/compiler";

const compiler = new CompilerService();

/**
 * Run tests for a contract
 * POST /api/deploy/test
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceCode, contractName, testCode } = body;

    if (!sourceCode || !contractName || !testCode) {
      return NextResponse.json(
        { error: "Missing required fields: sourceCode, contractName, testCode" },
        { status: 400 }
      );
    }

    const result = await compiler.runTests(sourceCode, contractName, testCode);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Test execution error:", error);
    return NextResponse.json(
      { error: error.message || "Test execution failed" },
      { status: 500 }
    );
  }
}
