"use client";

import { useAppSelector } from "@/store/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Network, CheckCircle, AlertCircle } from "lucide-react";

export function WalletStatus() {
  const { address, isConnected, chainId, isConnecting, error } = useAppSelector(
    (state) => state.wallet
  );

  const getChainName = (chainId: number | null) => {
    switch (chainId) {
      case 5001: // Mantle Sepolia Testnet
        return "Mantle Sepolia";
      case 5000: // Mantle Mainnet
        return "Mantle Mainnet";
      default:
        return "Unknown Network";
    }
  };
  //new qaYBJSDV

  const formatAddress = (address: string | null) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Wallet Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Connection Status:</span>
          <Badge
            variant={isConnected ? "default" : "secondary"}
            className="flex items-center gap-1"
          >
            {isConnected ? (
              <>
                <CheckCircle className="w-3 h-3" />
                Connected
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3" />
                Disconnected
              </>
            )}
          </Badge>
        </div>

        {/* Wallet Address */}
        {address && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Address:</span>
            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
              {formatAddress(address)}
            </span>
          </div>
        )}

        {/* Loading State */}
        {isConnecting && (
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm">Connecting to wallet...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Instructions when disconnected */}
        {!isConnected && !isConnecting && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-3">
              Connect your wallet to interact with smart contracts
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
