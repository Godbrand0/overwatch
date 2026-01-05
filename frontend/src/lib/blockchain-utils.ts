import { createPublicClient, http } from "viem";
import { mantle, mantleSepoliaTestnet } from "wagmi/chains";

/**
 * Get block number from transaction hash
 * This is called after deploying a contract to capture the deployment block
 */
export async function getBlockNumberFromTx(
  txHash: string,
  network: "testnet" | "mainnet"
): Promise<number | null> {
  try {
    const chain = network === "testnet" ? mantleSepoliaTestnet : mantle;
    const rpcUrl =
      network === "testnet"
        ? process.env.NEXT_PUBLIC_MANTLE_TESTNET_RPC || "https://rpc.sepolia.mantle.xyz"
        : process.env.NEXT_PUBLIC_MANTLE_MAINNET_RPC || "https://rpc.mantle.xyz";

    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    return Number(receipt.blockNumber);
  } catch (error) {
    console.error("Error fetching block number from tx:", error);
    return null;
  }
}

/**
 * Get transaction receipt with block number
 */
export async function getDeploymentInfo(
  txHash: string,
  network: "testnet" | "mainnet"
): Promise<{
  blockNumber: number;
  contractAddress: string;
  deployer: string;
} | null> {
  try {
    const chain = network === "testnet" ? mantleSepoliaTestnet : mantle;
    const rpcUrl =
      network === "testnet"
        ? process.env.NEXT_PUBLIC_MANTLE_TESTNET_RPC || "https://rpc.sepolia.mantle.xyz"
        : process.env.NEXT_PUBLIC_MANTLE_MAINNET_RPC || "https://rpc.mantle.xyz";

    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    const tx = await publicClient.getTransaction({
      hash: txHash as `0x${string}`,
    });

    return {
      blockNumber: Number(receipt.blockNumber),
      contractAddress: receipt.contractAddress || "",
      deployer: tx.from,
    };
  } catch (error) {
    console.error("Error fetching deployment info:", error);
    return null;
  }
}
