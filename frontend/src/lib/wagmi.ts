import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mantle, mantleSepoliaTestnet } from "wagmi/chains";

/**
 * Wagmi & RainbowKit Configuration
 * Reference: https://www.rainbowkit.com/docs/installation
 */
export const config = getDefaultConfig({
  appName: "MantleForge",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_WALLETCONNECT_PROJECT_ID", // Get from https://cloud.walletconnect.com/
  chains: [mantleSepoliaTestnet, mantle],
  ssr: true,
});
