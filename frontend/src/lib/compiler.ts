import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { existsSync } from "fs";
import { encodeAbiParameters } from "viem";

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
    const envPath = process.env.FOUNDRY_PATH;
    // If FOUNDRY_PATH is an absolute path, verify it exists. 
    // Otherwise, or if it doesn't exist, fallback to "forge"
    if (envPath && envPath.startsWith("/") && !existsSync(envPath)) {
      console.warn(`FOUNDRY_PATH ${envPath} not found, falling back to "forge"`);
      this.foundryPath = "forge";
    } else {
      this.foundryPath = envPath || "forge";
    }
    this.tempDir = path.join(os.tmpdir(), "overwatch-compiler");
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
    if (!sourceCode) {
      return {
        success: false,
        abi: [],
        bytecode: "",
        contractName: contractName || "Unknown",
        compilerVersion: solcVersion,
        sourceCode: "",
        error: "Source code is required for compilation",
      };
    }

    if (!contractName) {
      return {
        success: false,
        abi: [],
        bytecode: "",
        contractName: "Unknown",
        compilerVersion: solcVersion,
        sourceCode,
        error: "Contract name is required for compilation",
      };
    }
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

      // Resolve absolute path to local libs (assuming they are in ../contract/lib)
      const libsDir = path.resolve(process.cwd(), "../contract/lib");

      // Create foundry.toml with explicit remappings
      const foundryConfig = `
[profile.default]
src = "src"
out = "out"
libs = ["${libsDir}"]
remappings = [
  "@openzeppelin/contracts/=${libsDir}/openzeppelin-contracts/contracts/",
  "forge-std/=${libsDir}/forge-std/src/"
]
solc_version = "${solcVersion}"
optimizer = true
optimizer_runs = 200
via_ir = true
      `.trim();

      await fs.writeFile(path.join(projectPath, "foundry.toml"), foundryConfig);

      // Compile with Foundry
      try {
        const { stdout, stderr } = await execAsync(
          `${this.foundryPath} build --root ${projectPath} --force`
        );
      } catch (execError: any) {
        // Extract a cleaner error message from forge output
        let errorMessage = execError.message;
        if (execError.stderr) {
          errorMessage = execError.stderr;
        } else if (execError.stdout) {
          errorMessage = execError.stdout;
        }
        throw new Error(errorMessage);
      }

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

      // Clean up the error message to be more user-friendly
      let cleanError = error.message || "Compilation failed";
      
      // If it's a forge error, try to make it more readable
      if (cleanError.includes("Error (")) {
        // Keep the specific Solidity error but remove the full command line noise
        const lines = cleanError.split('\n');
        const errorLines = lines.filter((line: string) => 
          line.includes("Error (") || 
          line.includes("ParserError:") || 
          line.includes("-->") ||
          line.trim().startsWith("|")
        );
        if (errorLines.length > 0) {
          cleanError = errorLines.join('\n');
        }
      }

      return {
        success: false,
        abi: [],
        bytecode: "",
        contractName,
        compilerVersion: solcVersion,
        sourceCode,
        error: cleanError,
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
    if (!args || args.length === 0) return "";

    try {
      const constructor = abi.find((item) => item.type === "constructor");
      if (!constructor || !constructor.inputs || constructor.inputs.length === 0) {
        return "";
      }

      // Encode using viem
      const encoded = encodeAbiParameters(
        constructor.inputs,
        args
      );

      // Remove 0x prefix for Etherscan
      return encoded.replace("0x", "");
    } catch (error) {
      console.error("Failed to encode constructor arguments:", error);
      return "";
    }
  }

  /**
   * Flatten Solidity contract using Foundry
   */
  async flattenContract(
    sourceCode: string,
    contractName: string,
    solcVersion: string = "0.8.20"
  ): Promise<string> {
    await this.initTempDir();

    const projectId = `flatten_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;
    const projectPath = path.join(this.tempDir, projectId);

    try {
      // Create project structure
      await fs.mkdir(path.join(projectPath, "src"), { recursive: true });

      // Write source code
      const contractPath = path.join(projectPath, "src", `${contractName}.sol`);
      await fs.writeFile(contractPath, sourceCode);

      // Resolve absolute path to local libs (assuming they are in ../contract/lib)
      const libsDir = path.resolve(process.cwd(), "../contract/lib");

      // Create foundry.toml with explicit remappings
      const foundryConfig = `
[profile.default]
src = "src"
out = "out"
libs = ["${libsDir}"]
remappings = [
  "@openzeppelin/contracts/=${libsDir}/openzeppelin-contracts/contracts/",
  "forge-std/=${libsDir}/forge-std/src/"
]
solc_version = "${solcVersion}"
      `.trim();

      await fs.writeFile(path.join(projectPath, "foundry.toml"), foundryConfig);

      // Flatten with Foundry
      const { stdout } = await execAsync(
        `${this.foundryPath} flatten ${contractPath} --root ${projectPath}`
      );

      // Cleanup
      await this.cleanup(projectPath);

      return stdout;
    } catch (error: any) {
      // Cleanup on error
      await this.cleanup(projectPath);
      console.error("Flattening failed:", error);
      throw new Error(error.message || "Flattening failed");
    }
  }

  /**
   * Run Foundry tests
   */
  async runTests(
    sourceCode: string,
    contractName: string,
    testCode: string
  ): Promise<TestResult> {
    if (!sourceCode || !contractName || !testCode) {
      return {
        success: false,
        total: 0,
        passed: 0,
        failed: 0,
        coverage: 0,
        results: [],
        error: "Source code, contract name, and test code are required for testing",
      };
    }
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

      // Create foundry.toml with explicit remappings
      const foundryConfig = `
[profile.default]
src = "src"
test = "test"
out = "out"
libs = ["${libsDir}"]
remappings = [
  "@openzeppelin/contracts/=${libsDir}/openzeppelin-contracts/contracts/",
  "forge-std/=${libsDir}/forge-std/src/"
]
solc_version = "0.8.20"
optimizer = true
optimizer_runs = 200
via_ir = true
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
              logs: test.logs || [],
              traces: test.traces || [],
              gasUsed: test.gas_used,
            });
          }
        }
      }

      // Run coverage to get detailed info
      let coverage = 0;
      try {
        const { stdout: coverageStdout } = await execAsync(
          `${this.foundryPath} coverage --root ${projectPath} --report summary`
        );
        
        // Simple regex to find the coverage for our contract
        // The table looks like: | src/ContractName.sol | 57.14% (8/14) | ...
        const lines = coverageStdout.split('\n');
        const contractLine = lines.find(line => line.includes(`src/${contractName}.sol`));
        if (contractLine) {
          const match = contractLine.match(/(\d+\.\d+)%/);
          if (match) {
            coverage = parseFloat(match[1]);
          }
        }
      } catch (coverageError) {
        console.error("Coverage execution failed:", coverageError);
      }

      // Cleanup
      await this.cleanup(projectPath);

      return {
        success: failed === 0,
        total,
        passed,
        failed,
        coverage,
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
        coverage: 0,
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
  coverage: number;
  results: any[];
  error?: string;
}
