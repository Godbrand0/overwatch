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
  RefreshCw,
  Cpu,
  Activity
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
        <div className="glass-card hud-border p-12 text-center bg-red-500/[0.02] border-red-500/20">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Mission Failed</h2>
          <p className="text-slate-400 max-w-md mx-auto mb-8 text-lg">
            The deployment sequence was aborted due to a critical error.
          </p>

          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-left max-w-2xl mx-auto mb-8">
            <div className="flex items-start gap-4">
              <Terminal className="w-6 h-6 text-red-500 mt-1 shrink-0" />
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-red-400">Error Log</p>
                <p className="text-sm text-red-200 font-mono break-all leading-relaxed">
                  {error || "Unknown deployment error. Please check your wallet and network connection."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onRetry}
              className="bg-red-500 hover:bg-red-600 text-white h-12 px-8 font-bold rounded-xl shadow-lg shadow-red-500/20"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Retry Sequence
            </Button>
            <Link href="/repos">
              <Button variant="outline" className="h-12 border-white/10 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl">
                Abort to Base
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="glass-card hud-border p-12 text-center bg-mantle-green/[0.02] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-mantle-green to-transparent opacity-50" />
        
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-mantle-green/10 border border-mantle-green/20 mb-6 shadow-[0_0_30px_rgba(0,255,209,0.2)] animate-pulse">
          <CheckCircle2 className="w-12 h-12 text-mantle-green" />
        </div>
        <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Mission Accomplished</h2>
        <p className="text-slate-400 max-w-md mx-auto text-lg">
          Asset successfully deployed and active on Mantle Sepolia Testnet.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="glass-card p-8 space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-mantle-green" />
            <h3 className="text-lg font-bold uppercase tracking-widest">Deployment Telemetry</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2 group">
              <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase tracking-widest font-bold group-hover:text-mantle-green transition-colors">
                <Hash className="w-3.5 h-3.5" />
                Contract Address
              </div>
              <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5 group-hover:border-mantle-green/30 transition-colors">
                <code className="text-mantle-green text-sm font-mono truncate flex-1">
                  {contractAddress}
                </code>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 hover:text-white text-slate-500" onClick={() => copyToClipboard(contractAddress!, setCopiedAddr)}>
                    {copiedAddr ? <Check className="w-4 h-4 text-mantle-green" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <a href={`${explorerUrl}/address/${contractAddress}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-white/10 hover:text-white text-slate-500 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-2 group">
              <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase tracking-widest font-bold group-hover:text-mantle-green transition-colors">
                <Layers className="w-3.5 h-3.5" />
                Transaction Hash
              </div>
              <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5 group-hover:border-mantle-green/30 transition-colors">
                <code className="text-blue-400 text-sm font-mono truncate flex-1">
                  {txHash}
                </code>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 hover:text-white text-slate-500" onClick={() => copyToClipboard(txHash!, setCopiedTx)}>
                    {copiedTx ? <Check className="w-4 h-4 text-mantle-green" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <a href={`${explorerUrl}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-white/10 hover:text-white text-slate-500 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-white/5">
            <TelemetryItem label="Block Height" value={blockNumber?.toString() || "Pending"} />
            <TelemetryItem label="Nonce" value={nonce?.toString() || "0"} />
            <TelemetryItem label="Network" value="Mantle Sepolia" highlight />
            <TelemetryItem label="Status" value="Confirmed" success />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card p-6 flex flex-col justify-between group hover:border-white/20 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">Contract ABI</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Interface Definition</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full border-white/10 hover:bg-white/5 text-slate-300 hover:text-white h-10"
              onClick={() => copyToClipboard(JSON.stringify(abi), setCopiedAbi)}
            >
              {copiedAbi ? <Check className="w-4 h-4 mr-2 text-mantle-green" /> : <Copy className="w-4 h-4 mr-2" />}
              Copy JSON
            </Button>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between group hover:border-white/20 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">Bytecode</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Compiled Binary</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full border-white/10 hover:bg-white/5 text-slate-300 hover:text-white h-10"
              onClick={() => copyToClipboard(bytecode!, setCopiedBytecode)}
            >
              {copiedBytecode ? <Check className="w-4 h-4 mr-2 text-mantle-green" /> : <Copy className="w-4 h-4 mr-2" />}
              Copy Hex
            </Button>
          </div>
        </div>
      </div>

      <div className="glass-card hud-border p-8 text-center space-y-8 bg-blue-500/[0.02] border-blue-500/20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 mb-2 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
          <ShieldCheck className="w-8 h-8 text-blue-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">Verify Asset Source</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Verification publishes your source code to Mantlescan, enabling public auditability and unlocking interaction features in Mission Control.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onVerify}
            disabled={verifying}
            className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 font-bold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:scale-105"
          >
            {verifying ? "Verifying Source..." : "Verify Now"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Link href={`/contract/${contractAddress}`}>
            <Button variant="ghost" className="h-12 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl">
              Skip to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function TelemetryItem({ label, value, highlight = false, success = false }: { label: string, value: string, highlight?: boolean, success?: boolean }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{label}</p>
      <p className={cn(
        "text-sm font-bold font-mono",
        highlight ? "text-blue-400" : success ? "text-mantle-green" : "text-slate-300"
      )}>
        {value}
      </p>
    </div>
  );
}
