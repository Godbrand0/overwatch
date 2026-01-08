"use client";

import { useEffect, useState, use } from "react";
import { ReadFunctions } from "@/components/contract/ReadFunctions";
import { WriteFunctions } from "@/components/contract/WriteFunctions";
import { Terminal, Info, ShieldCheck, Zap, Cpu, HelpCircle, Lock as LockIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ContractDashboard({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const response = await fetch(`/api/contracts/${address}`);
        const data = await response.json();
        if (response.ok) {
          setContract(data.contract);
        }
      } catch (err) {
        console.error("Error fetching contract:", err);
      } finally {
        setLoading(false);
      }
    };

    if (address) fetchContract();
  }, [address]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-32 glass-card hud-border" />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="h-96 glass-card" />
          <div className="h-96 glass-card" />
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center glass-card hud-border p-12">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold">Asset Not Found</h3>
        <p className="text-slate-500 mt-2">The requested contract address does not exist in our registry.</p>
      </div>
    );
  }

  const isVerified = !!contract.verified_at;

  return (
    <div className="space-y-10">
      {/* Digital Twin Header */}
      <div className="glass-card hud-border p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Cpu className="w-32 h-32 text-mantle-green" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-mantle-green/10 text-mantle-green border-mantle-green/20 font-bold uppercase tracking-widest text-[10px]">
                Digital Twin Active
              </Badge>
              {contract.is_anchored && (
                <Badge className="bg-mantle-gold/10 text-mantle-gold border-mantle-gold/20 font-bold uppercase tracking-widest text-[10px]">
                  Legal Anchor Verified
                </Badge>
              )}
            </div>
            <h2 className="text-3xl font-black tracking-tight">{contract.name}</h2>
            <p className="text-slate-400 font-mono text-sm tracking-wider">{contract.address}</p>
          </div>
          
          <div className="flex gap-4">
            <InfoBox label="Network" value="Mantle Sepolia" />
            <InfoBox label="Standard" value={contract.rwa_compliance?.standard || "Custom"} />
          </div>
        </div>
      </div>

      {/* Main Interaction Area */}
      {isVerified ? (
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Read Functions */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Query Asset State</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Read-Only Operations</p>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-5 h-5 text-slate-600 hover:text-slate-400 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-slate-900 border-white/10 text-slate-300 p-4">
                    <p className="font-bold text-white mb-1">What are Read Functions?</p>
                    <p className="text-xs">These allow you to view the current status of the asset (e.g., total supply, owner, or valuation) without spending gas or changing any data.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="glass-card p-1">
              <ReadFunctions abi={contract.abi} address={contract.address} />
            </div>
          </section>

          {/* Write Functions */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-mantle-green/10 flex items-center justify-center text-mantle-green border border-mantle-green/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Execute Asset Actions</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">State-Changing Operations</p>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-5 h-5 text-slate-600 hover:text-slate-400 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-slate-900 border-white/10 text-slate-300 p-4">
                    <p className="font-bold text-white mb-1">What are Write Functions?</p>
                    <p className="text-xs">These are actions that modify the asset's state (e.g., minting new tokens, updating NAV, or changing ownership). These require a wallet signature and gas fees.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="glass-card p-1">
              <WriteFunctions abi={contract.abi} address={contract.address} />
            </div>
          </section>
        </div>
      ) : (
        <div className="glass-card hud-border p-16 text-center max-w-3xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8 border border-white/10">
            <LockIcon className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-3xl font-black mb-4">Interaction Locked</h3>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            To ensure institutional security and transparency, contract interaction is disabled until the source code is verified on the Mantle Network.
          </p>
          <div className="bg-mantle-green/5 border border-mantle-green/10 rounded-xl p-6 mb-8 text-left">
            <h4 className="text-mantle-green font-bold flex items-center gap-2 mb-2">
              <Info className="w-4 h-4" />
              Why verify?
            </h4>
            <p className="text-sm text-slate-400">
              Verification proves that the code running on-chain matches your source code. This is a critical step for RWA compliance and investor trust.
            </p>
          </div>
          <p className="text-sm text-slate-500 font-mono italic">
            &gt; Use the "Verify Contract" action in the header to proceed.
          </p>
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-center min-w-[120px]">
      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">{label}</p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}
