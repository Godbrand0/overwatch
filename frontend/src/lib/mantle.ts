import {
  createPublicClient,
  http,
  type Address,
  type Hash,
  type TransactionReceipt,
} from "viem";
import { mantle, mantleSepoliaTestnet } from "viem/chains";

/**
 * Mantle Network Configuration
 * Reference: https://docs.mantle.xyz/network/for-developers/quick-access
 */
export const MANTLE_NETWORKS = {
  testnet: {
    chain: mantleSepoliaTestnet,
    rpcUrl: process.env.NEXT_PUBLIC_MANTLE_TESTNET_RPC || "https://rpc.sepolia.mantle.xyz",
    explorerUrl: "https://sepolia.mantlescan.xyz",
    explorerApiUrl: process.env.MANTLE_TESTNET_EXPLORER_API || "https://api-sepolia.mantlescan.xyz/api",
  },
  mainnet: {
    chain: mantle,
    rpcUrl: process.env.NEXT_PUBLIC_MANTLE_MAINNET_RPC || "https://rpc.mantle.xyz",
    explorerUrl: "https://mantlescan.xyz",
    explorerApiUrl: process.env.MANTLE_MAINNET_EXPLORER_API || "https://api.mantlescan.xyz/api",
  },
} as const;

export type MantleNetwork = keyof typeof MANTLE_NETWORKS;

export class MantleService {
  private publicClient;
  private network: MantleNetwork;

  constructor(network: MantleNetwork = "testnet") {
    this.network = network;
    const config = MANTLE_NETWORKS[network];

    this.publicClient = createPublicClient({
      chain: config.chain,
      transport: http(config.rpcUrl),
    });
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(hash: Hash): Promise<TransactionReceipt> {
    return await this.publicClient.getTransactionReceipt({ hash });
  }

  /**
   * Get current block number
   */
  async getBlockNumber(): Promise<bigint> {
    return await this.publicClient.getBlockNumber();
  }

  /**
   * Get contract bytecode
   */
  async getBytecode(address: Address): Promise<string> {
    const code = await this.publicClient.getBytecode({ address });
    return code || "0x";
  }

  /**
   * Estimate gas for deployment
   */
  async estimateDeployGas(
    bytecode: string,
    constructorArgs?: string
  ): Promise<bigint> {
    const data = constructorArgs ? `${bytecode}${constructorArgs}` : bytecode;

    return await this.publicClient.estimateGas({
      data: data as `0x${string}`,
    });
  }

  /**
   * Get transaction by hash
   */
  async getTransaction(hash: Hash) {
    return await this.publicClient.getTransaction({ hash });
  }

  /**
   * Get logs for contract
   */
  async getLogs(params: {
    address?: Address;
    fromBlock?: bigint;
    toBlock?: bigint;
    event?: any;
  }) {
    return await this.publicClient.getLogs({
      address: params.address,
      fromBlock: params.fromBlock,
      toBlock: params.toBlock,
    });
  }

  /**
   * Watch for new blocks
   */
  watchBlocks(callback: (block: any) => void) {
    return this.publicClient.watchBlocks({
      onBlock: callback,
    });
  }

  /**
   * Get network config
   */
  getNetworkConfig() {
    return MANTLE_NETWORKS[this.network];
  }
}
