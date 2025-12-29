import axios from "axios";

export interface VerificationParams {
  contractAddress: string;
  sourceCode: string;
  contractName: string;
  compilerVersion: string;
  constructorArgs?: string;
  network: "testnet" | "mainnet";
}

export interface VerificationResult {
  success: boolean;
  message: string;
  guid?: string;
}

/**
 * Mantle Contract Verification Service
 * Reference: https://docs.mantle.xyz/network/for-developers/how-to-guides/how-to-verify-smart-contracts
 */
export class VerificationService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.MANTLESCAN_API_KEY || "";
  }

  /**
   * Get explorer API URL for network
   */
  private getExplorerApiUrl(network: "testnet" | "mainnet"): string {
    return network === "testnet"
      ? process.env.MANTLE_TESTNET_EXPLORER_API || "https://api-sepolia.mantlescan.xyz/api"
      : process.env.MANTLE_MAINNET_EXPLORER_API || "https://api.mantlescan.xyz/api";
  }

  /**
   * Verify contract on Mantle Explorer
   */
  async verifyContract(
    params: VerificationParams
  ): Promise<VerificationResult> {
    const apiUrl = this.getExplorerApiUrl(params.network);

    try {
      // Step 1: Submit verification request
      const response = await axios.post(
        `${apiUrl}`,
        new URLSearchParams({
          apikey: this.apiKey,
          module: "contract",
          action: "verifysourcecode",
          contractaddress: params.contractAddress,
          sourceCode: params.sourceCode,
          codeformat: "solidity-single-file",
          contractname: params.contractName,
          compilerversion: `v${params.compilerVersion}`,
          optimizationUsed: "1",
          runs: "200",
          constructorArguements: params.constructorArgs || "",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (response.data.status === "1") {
        const guid = response.data.result;

        // Step 2: Check verification status
        const statusResult = await this.checkVerificationStatus(
          guid,
          params.network
        );

        return {
          success: statusResult.success,
          message: statusResult.message,
          guid,
        };
      } else {
        return {
          success: false,
          message: response.data.result || "Verification failed",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Verification request failed",
      };
    }
  }

  /**
   * Check verification status
   */
  async checkVerificationStatus(
    guid: string,
    network: "testnet" | "mainnet"
  ): Promise<{ success: boolean; message: string }> {
    const apiUrl = this.getExplorerApiUrl(network);

    try {
      // Poll for verification result (max 10 attempts, 3s interval)
      for (let i = 0; i < 10; i++) {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const response = await axios.get(`${apiUrl}`, {
          params: {
            apikey: this.apiKey,
            module: "contract",
            action: "checkverifystatus",
            guid,
          },
        });

        const result = response.data.result;

        if (result === "Pass - Verified") {
          return {
            success: true,
            message: "Contract verified successfully",
          };
        } else if (result.includes("Fail")) {
          return {
            success: false,
            message: result,
          };
        }
        // If pending, continue polling
      }

      return {
        success: false,
        message: "Verification timeout",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Status check failed",
      };
    }
  }

  /**
   * Flatten Solidity source code
   * (Required for verification)
   */
  async flattenSource(sourcePath: string): Promise<string> {
    // This would use forge flatten or similar
    // For now, returning the source as-is
    // TODO: Implement actual flattening
    return "";
  }
}
