import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

export interface CompilationResult {
  success: boolean;
  abi: any[];
  bytecode: string;
  contractName: string;
  compilerVersion: string;
  sourceCode: string;
  error?: string;
}

/**
 * Foundry Compiler Service
 * Reference: https://book.getfoundry.sh/reference/forge/forge-build
 */
export class CompilerService {
  private foundryPath: string;
  private tempDir: string;

  constructor() {
    this.foundryPath = process.env.FOUNDRY_PATH || "forge";
    this.tempDir = path.join(process.cwd(), ".temp");
  }

  /**
   * Initialize temp directory
   */
  private async initTempDir(): Promise<void> {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error("Failed to create temp directory:", error);
    }
  }

  /**
   * Clean up temp files
   */
  private async cleanup(projectPath: string): Promise<void> {
    try {
      await fs.rm(projectPath, { recursive: true, force: true });
    } catch (error) {
      console.error("Cleanup failed:", error);
    }
  }

  /**
   * Compile Solidity contract using Foundry
   */
  async compileContract(
    sourceCode: string,
    contractName: string,
    solcVersion: string = "0.8.20"
  ): Promise<CompilationResult> {
    await this.initTempDir();

    const projectId = `compile_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;
    const projectPath = path.join(this.tempDir, projectId);

    try {
      // Create project structure
      await fs.mkdir(path.join(projectPath, "src"), { recursive: true });
      await fs.mkdir(path.join(projectPath, "out"), { recursive: true });

      // Write source code
      const contractPath = path.join(projectPath, "src", `${contractName}.sol`);
      await fs.writeFile(contractPath, sourceCode);

      // Create foundry.toml
      const foundryConfig = `
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "${solcVersion}"
optimizer = true
optimizer_runs = 200
via_ir = false
      `.trim();

      await fs.writeFile(path.join(projectPath, "foundry.toml"), foundryConfig);

      // Compile with Foundry
      const { stdout, stderr } = await execAsync(
        `${this.foundryPath} build --root ${projectPath} --force`
      );

      // Read compilation output
      const artifactPath = path.join(
        projectPath,
        "out",
        `${contractName}.sol`,
        `${contractName}.json`
      );

      const artifactContent = await fs.readFile(artifactPath, "utf-8");
      const artifact = JSON.parse(artifactContent);

      const result: CompilationResult = {
        success: true,
        abi: artifact.abi,
        bytecode: artifact.bytecode.object,
        contractName,
        compilerVersion: solcVersion,
        sourceCode,
      };

      // Cleanup
      await this.cleanup(projectPath);

      return result;
    } catch (error: any) {
      // Cleanup on error
      await this.cleanup(projectPath);

      return {
        success: false,
        abi: [],
        bytecode: "",
        contractName,
        compilerVersion: solcVersion,
        sourceCode,
        error: error.message || "Compilation failed",
      };
    }
  }

  /**
   * Extract constructor parameters from ABI
   */
  extractConstructorParams(abi: any[]): any[] {
    const constructor = abi.find((item) => item.type === "constructor");
    return constructor?.inputs || [];
  }

  /**
   * Encode constructor arguments
   */
  async encodeConstructorArgs(abi: any[], args: any[]): Promise<string> {
    // This would use ethers or viem to encode
    // For now, returning placeholder
    // TODO: Implement actual encoding
    return "0x";
  }

  /**
   * Run Foundry tests
   */
  async runTests(
    sourceCode: string,
    contractName: string,
    testCode: string
  ): Promise<TestResult> {
    await this.initTempDir();

    const projectId = `test_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;
    const projectPath = path.join(this.tempDir, projectId);

    try {
      // Create project structure
      await fs.mkdir(path.join(projectPath, "src"), { recursive: true });
      await fs.mkdir(path.join(projectPath, "test"), { recursive: true });

      // Write source code
      const contractPath = path.join(projectPath, "src", `${contractName}.sol`);
      await fs.writeFile(contractPath, sourceCode);

      // Write test code
      const testPath = path.join(projectPath, "test", `${contractName}.t.sol`);
      await fs.writeFile(testPath, testCode);

      // Resolve absolute path to local libs (assuming they are in ../contract/lib)
      const libsDir = path.resolve(process.cwd(), "../contract/lib");

      // Create foundry.toml
      const foundryConfig = `
[profile.default]
src = "src"
test = "test"
out = "out"
libs = ["${libsDir}"]
solc_version = "0.8.20"
optimizer = true
optimizer_runs = 200
      `.trim();

      await fs.writeFile(path.join(projectPath, "foundry.toml"), foundryConfig);

      // Run tests with JSON output
      // We ignore stderr because forge writes some info there even on success
      const { stdout } = await execAsync(
        `${this.foundryPath} test --root ${projectPath} --json`
      );

      // Parse JSON output
      // Forge output is a JSON object where keys are test files
      const output = JSON.parse(stdout);
      
      // Aggregate results
      let total = 0;
      let passed = 0;
      let failed = 0;
      const results: any[] = [];

      // Iterate through test results
      for (const fileKey in output) {
        const fileResult = output[fileKey];
        if (fileResult.test_results) {
          for (const testName in fileResult.test_results) {
            const test = fileResult.test_results[testName];
            total++;
            if (test.status === "Success") {
              passed++;
            } else {
              failed++;
            }
            results.push({
              name: testName,
              status: test.status,
              duration: test.duration,
              error: test.reason,
            });
          }
        }
      }

      // Cleanup
      await this.cleanup(projectPath);

      return {
        success: failed === 0,
        total,
        passed,
        failed,
        results,
      };

    } catch (error: any) {
      // Cleanup on error
      await this.cleanup(projectPath);

      return {
        success: false,
        total: 0,
        passed: 0,
        failed: 0,
        results: [],
        error: error.message || "Test execution failed",
      };
    }
  }
}

export interface TestResult {
  success: boolean;
  total: number;
  passed: number;
  failed: number;
  coverage?: number;
  results: any[];
  error?: string;
}
