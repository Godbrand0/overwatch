"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  Terminal, 
  ShieldCheck, 
  ArrowRight, 
  Hash, 
  Layers, 
  RefreshCw 
} from "lucide-react";
import Link from "next/link";

interface DeploymentStatusProps {
  status: "success" | "error";
  error?: string;
  contractAddress?: string;
  txHash?: string;
  blockNumber?: number;
  nonce?: number;
  abi?: any[];
  bytecode?: string;
  onVerify?: () => void;
  onRetry?: () => void;
  verifying?: boolean;
}

export function DeploymentStatus({ 
  status,
  error,
  contractAddress, 
  txHash, 
  blockNumber,
  nonce,
  abi, 
  bytecode, 
  onVerify, 
  onRetry,
  verifying 
}: DeploymentStatusProps) {
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);
  const [copiedAbi, setCopiedAbi] = useState(false);
  const [copiedBytecode, setCopiedBytecode] = useState(false);

  const copyToClipboard = (text: string, setter: (v: boolean) => void) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const explorerUrl = `https://sepolia.mantlescan.xyz`;

  if (status === "error") {
    return (
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-white">Deployment Failed</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            The transaction could not be completed on the network.
          </p>
        </div>

        <div className="bg-red-900/10 border border-red-900/20 rounded-xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Terminal className="w-5 h-5 text-red-500 mt-1 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-red-200">Error Reason</p>
              <p className="text-sm text-red-300/80 font-mono break-all">
                {error || "Unknown deployment error. Please check your wallet and network connection."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 px-8 h-12 text-lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Retry Deployment
          </Button>
          <Link href="/repos">
            <Button variant="ghost" className="h-12 text-gray-400 hover:text-white">
              Back to Repos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold">Deployment Successful!</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Your contract has been successfully deployed to Mantle Sepolia Testnet.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-widest font-bold">
                <Hash className="w-3.5 h-3.5" />
                Contract Address
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-gray-900 px-2 py-1 rounded text-blue-400 text-xs font-mono truncate">
                  {contractAddress}
                </code>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => copyToClipboard(contractAddress!, setCopiedAddr)}>
                  {copiedAddr ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
                <a href={`${explorerUrl}/address/${contractAddress}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-widest font-bold">
                <Layers className="w-3.5 h-3.5" />
                Transaction Hash
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-gray-900 px-2 py-1 rounded text-gray-400 text-xs font-mono truncate">
                  {txHash?.substring(0, 10)}...{txHash?.substring(txHash.length - 8)}
                </code>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => copyToClipboard(txHash!, setCopiedTx)}>
                  {copiedTx ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
                <a href={`${explorerUrl}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-700/50">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Block Number</p>
              <p className="text-sm font-mono text-gray-300">{blockNumber?.toString() || "Pending"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Nonce</p>
              <p className="text-sm font-mono text-gray-300">{nonce?.toString() || "0"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Network</p>
              <p className="text-sm text-blue-400">Mantle Sepolia</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Status</p>
              <p className="text-sm text-green-500">Confirmed</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold">Contract ABI</h3>
            </div>
            <Button 
              variant="outline" 
              className="w-full border-gray-700 hover:bg-gray-700"
              onClick={() => copyToClipboard(JSON.stringify(abi), setCopiedAbi)}
            >
              {copiedAbi ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              Copy ABI
            </Button>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold">Bytecode</h3>
            </div>
            <Button 
              variant="outline" 
              className="w-full border-gray-700 hover:bg-gray-700"
              onClick={() => copyToClipboard(bytecode!, setCopiedBytecode)}
            >
              {copiedBytecode ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              Copy Bytecode
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-8 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mb-2">
          <ShieldCheck className="w-6 h-6 text-blue-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Verify Your Contract</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            Verification allows users to interact with your contract directly on the explorer and builds trust.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onVerify}
            disabled={verifying}
            className="bg-blue-600 hover:bg-blue-700 px-8 h-12 text-lg"
          >
            {verifying ? "Verifying..." : "Verify Now"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Link href={`/contract/${contractAddress}`}>
            <Button variant="ghost" className="h-12 text-gray-400 hover:text-white">
              Skip for now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
