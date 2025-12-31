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

  // Mapping of common Solidity versions to Etherscan-compatible strings
  private static readonly SOLC_VERSION_MAP: Record<string, string> = {
    "0.8.26": "v0.8.26+commit.8a97fa7a",
    "0.8.25": "v0.8.25+commit.b61c2a91",
    "0.8.24": "v0.8.24+commit.e11b9ed9",
    "0.8.23": "v0.8.23+commit.39ed3172",
    "0.8.22": "v0.8.22+commit.4f6ee32e",
    "0.8.21": "v0.8.21+commit.d9974bed",
    "0.8.20": "v0.8.20+commit.a1b79de6",
    "0.8.19": "v0.8.19+commit.7dd6d404",
    "0.8.18": "v0.8.18+commit.87f61d96",
    "0.8.17": "v0.8.17+commit.8df45f5f",
    "0.8.16": "v0.8.16+commit.07a7930e",
    "0.8.15": "v0.8.15+commit.e14f2714",
    "0.8.14": "v0.8.14+commit.80d49f37",
    "0.8.13": "v0.8.13+commit.abaa5c0e",
    "0.8.12": "v0.8.12+commit.f00d7308",
    "0.8.11": "v0.8.11+commit.d7f03943",
    "0.8.10": "v0.8.10+commit.fc410830",
    "0.8.9": "v0.8.9+commit.e5eed63a",
    "0.8.8": "v0.8.8+commit.05d6e8c4",
    "0.8.7": "v0.8.7+commit.e28d00a7",
    "0.8.6": "v0.8.6+commit.11564f7e",
    "0.8.5": "v0.8.5+commit.af6e0116",
    "0.8.4": "v0.8.4+commit.c7e474f2",
    "0.8.3": "v0.8.3+commit.8d00100c",
    "0.8.2": "v0.8.2+commit.661d1103",
    "0.8.1": "v0.8.1+commit.df193b15",
    "0.8.0": "v0.8.0+commit.c7c47477",
  };

  constructor() {
    this.apiKey = process.env.MANTLESCAN_API_KEY || "";
  }

  /**
   * Get explorer API URL for network (V2)
   * Etherscan V2 uses a unified endpoint for all chains
   */
  private getExplorerApiUrl(): string {
    return "https://api.etherscan.io/v2/api";
  }

  /**
   * Get chain ID for network
   */
  private getChainId(network: "testnet" | "mainnet"): string {
    return network === "testnet" ? "5003" : "5000";
  }

  /**
   * Verify contract on Mantle Explorer
   */
  async verifyContract(
    params: VerificationParams
  ): Promise<VerificationResult> {
    const apiUrl = this.getExplorerApiUrl();
    const chainId = this.getChainId(params.network);

    // Resolve full compiler version string
    const compilerVersion = VerificationService.SOLC_VERSION_MAP[params.compilerVersion] || 
                           (params.compilerVersion.startsWith('v') ? params.compilerVersion : `v${params.compilerVersion}`);

    try {
      // Step 1: Submit verification request
      const response = await axios.post(
        `${apiUrl}?chainid=${chainId}`,
        new URLSearchParams({
          apikey: this.apiKey,
          module: "contract",
          action: "verifysourcecode",
          contractaddress: params.contractAddress,
          sourceCode: params.sourceCode,
          codeformat: "solidity-single-file",
          contractname: params.contractName,
          compilerversion: compilerVersion,
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
    const apiUrl = this.getExplorerApiUrl();
    const chainId = this.getChainId(network);

    try {
      // Poll for verification result (max 10 attempts, 3s interval)
      for (let i = 0; i < 10; i++) {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const response = await axios.get(`${apiUrl}`, {
          params: {
            apikey: this.apiKey,
            chainid: chainId,
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
