import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mantle, mantleSepoliaTestnet } from "wagmi/chains";
import { http } from "wagmi";

/**
 * Wagmi & RainbowKit Configuration
 * Reference: https://www.rainbowkit.com/docs/installation
 */
export const config = getDefaultConfig({
  appName: "MantleForge",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_WALLETCONNECT_PROJECT_ID", // Get from https://cloud.walletconnect.com/
  chains: [mantleSepoliaTestnet, mantle],
  transports: {
    [mantleSepoliaTestnet.id]: http(process.env.NEXT_PUBLIC_MANTLE_TESTNET_RPC || "https://rpc.sepolia.mantle.xyz"),
    [mantle.id]: http(process.env.NEXT_PUBLIC_MANTLE_MAINNET_RPC || "https://rpc.mantle.xyz"),
  },
  ssr: true,
});
