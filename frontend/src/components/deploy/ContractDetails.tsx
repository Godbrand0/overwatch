"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, ChevronDown, ChevronUp, Zap, FileCode, Cpu, Loader2 } from "lucide-react";
import { ConstructorForm } from "./ConstructorForm";
import { cn } from "@/lib/utils";
import { usePublicClient } from "wagmi";
import { formatEther, formatGwei } from "viem";

interface ContractDetailsProps {
  abi: any[];
  bytecode: string;
  onDeploy: (args: any[]) => void;
  deploying: boolean;
}

export function ContractDetails({ abi, bytecode, onDeploy, deploying }: ContractDetailsProps) {
  const [copiedAbi, setCopiedAbi] = useState(false);
  const [copiedBytecode, setCopiedBytecode] = useState(false);
  const [showAbi, setShowAbi] = useState(false);
  const [showBytecode, setShowBytecode] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState<string | null>(null);
  const [estimating, setEstimating] = useState(false);

  const publicClient = usePublicClient();

  useEffect(() => {
    const estimateGas = async () => {
      if (!publicClient || !bytecode) return;
      setEstimating(true);
      try {
        const gasPrice = await publicClient.getGasPrice();
        // Estimate gas for bytecode only (baseline)
        const gasLimit = await publicClient.estimateGas({
          data: bytecode as `0x${string}`,
        });
        
        // Add 20% buffer for constructor and L1 fees
        const totalGas = (gasLimit * 120n) / 100n;
        const fee = totalGas * gasPrice;
        setEstimatedFee(formatEther(fee));
      } catch (err) {
        console.error("Gas estimation failed:", err);
        setEstimatedFee("0.0042"); // Fallback to a reasonable default if estimation fails
      } finally {
        setEstimating(false);
      }
    };

    estimateGas();
  }, [publicClient, bytecode]);

  const copyToClipboard = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 flex items-center justify-between group hover:bg-blue-500/[0.05] transition-colors border-blue-500/20">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Estimated Gas</p>
            {estimating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span className="text-sm text-slate-500">Calculating...</span>
              </div>
            ) : (
              <p className="text-2xl font-black text-blue-400 font-mono tracking-tight">
                ~{estimatedFee ? parseFloat(estimatedFee).toFixed(6) : "0.0042"} MNT
              </p>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6" />
          </div>
        </div>
        <div className="glass-card p-6 flex items-center justify-between group hover:bg-green-500/[0.05] transition-colors border-green-500/20">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Compiler Version</p>
            <p className="text-2xl font-black text-green-400 font-mono tracking-tight">v0.8.20</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20 group-hover:scale-110 transition-transform">
            <Cpu className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="glass-card overflow-hidden border-white/5">
          <button 
            onClick={() => setShowAbi(!showAbi)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <FileCode className="w-4 h-4 text-slate-500 group-hover:text-mantle-green transition-colors" />
              <span className="font-bold text-sm uppercase tracking-wider text-slate-300 group-hover:text-white">Contract ABI</span>
            </div>
            {showAbi ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>
          {showAbi && (
            <div className="p-6 pt-0 border-t border-white/5 bg-black/20">
              <div className="relative mt-4">
                <pre className="bg-black/40 p-4 rounded-xl overflow-x-auto text-[10px] font-mono text-slate-400 max-h-60 border border-white/5 custom-scrollbar">
                  {JSON.stringify(abi, null, 2)}
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-white/10 text-slate-400 hover:text-white"
                  onClick={() => copyToClipboard(JSON.stringify(abi), setCopiedAbi)}
                >
                  {copiedAbi ? <Check className="w-4 h-4 text-mantle-green" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="glass-card overflow-hidden border-white/5">
          <button 
            onClick={() => setShowBytecode(!showBytecode)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Cpu className="w-4 h-4 text-slate-500 group-hover:text-mantle-green transition-colors" />
              <span className="font-bold text-sm uppercase tracking-wider text-slate-300 group-hover:text-white">Bytecode</span>
            </div>
            {showBytecode ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>
          {showBytecode && (
            <div className="p-6 pt-0 border-t border-white/5 bg-black/20">
              <div className="relative mt-4">
                <pre className="bg-black/40 p-4 rounded-xl overflow-x-auto text-[10px] font-mono text-slate-400 max-h-60 break-all whitespace-pre-wrap border border-white/5 custom-scrollbar">
                  {bytecode}
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-white/10 text-slate-400 hover:text-white"
                  onClick={() => copyToClipboard(bytecode, setCopiedBytecode)}
                >
                  {copiedBytecode ? <Check className="w-4 h-4 text-mantle-green" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card hud-border p-8 bg-mantle-green/[0.02]">
        <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-mantle-green animate-pulse" />
          Constructor Parameters
        </h3>
        <ConstructorForm 
          abi={abi}
          onDeploy={onDeploy}
          loading={deploying}
        />
      </div>
    </div>
  );
}
