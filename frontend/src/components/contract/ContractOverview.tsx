"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, ShieldCheck, Clock, FileCode, Zap, BarChart3, Box, Globe, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ContractOverviewProps {
  contract: {
    address: string;
    name: string;
    network: string;
    deployed_at: string;
    verified_at?: string;
    abi?: any[];
    is_anchored?: boolean;
    rwa_compliance?: {
      isCompliant: boolean;
      detectedFeatures: string[];
      standard?: string;
    };
    rwa_proof?: any;
    rwa_type?: string;
    legal_right?: string;
    jurisdiction?: string;
    custodian?: string;
    offchain_asset_id?: string;
    legal_doc_hash?: string;
  };
}

export function ContractOverview({ contract }: ContractOverviewProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const explorerUrl = `https://sepolia.mantlescan.xyz/address/${contract.address}`;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 glass-card hud-border p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <ShieldCheck className="w-48 h-48 text-mantle-green" />
        </div>
        
        <div className="relative z-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-black tracking-tight text-white">
                  {contract.name}
                </h1>
                <div className="flex flex-wrap gap-2">
                  {contract.is_anchored && (
                    <Badge className="bg-mantle-green/20 text-mantle-green border-mantle-green/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1">
                      <ShieldCheck className="w-3 h-3 mr-1.5" />
                      Anchored
                    </Badge>
                  )}
                  {contract.verified_at && (
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold uppercase tracking-widest text-[10px] px-3 py-1">
                      Verified
                    </Badge>
                  )}
                  {contract.rwa_compliance?.isCompliant && (
                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 font-bold uppercase tracking-widest text-[10px] px-3 py-1">
                      RWA Compliant
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3 group">
                <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg flex items-center gap-3 transition-colors group-hover:bg-white/10 group-hover:border-white/20">
                  <code className="text-xs text-slate-400 font-mono tracking-wider">{contract.address}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-500 hover:text-white"
                    onClick={() => copyToClipboard(contract.address)}
                  >
                    <Copy className={cn("w-3.5 h-3.5 transition-colors", copied ? 'text-mantle-green' : '')} />
                  </Button>
                </div>
                <Badge variant="outline" className="border-white/10 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                  {contract.network}
                </Badge>
              </div>
            </div>

            <div className="flex gap-3">
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="h-11 px-6 border-white/10 bg-white/5 hover:bg-white/10 font-bold rounded-xl backdrop-blur-sm transition-all hover:scale-105">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Explorer
                </Button>
              </a>
            </div>
          </div>

          {contract.is_anchored && (
            <div className="pt-8 border-t border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-mantle-green animate-pulse" />
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Asset Manifest</h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-6">
                <ManifestItem icon={<Box className="w-4 h-4" />} label="Asset Type" value={contract.rwa_type || "N/A"} />
                <ManifestItem icon={<UserCheck className="w-4 h-4" />} label="Custodian" value={contract.custodian || "N/A"} mono />
                <ManifestItem icon={<Globe className="w-4 h-4" />} label="Jurisdiction" value={contract.jurisdiction || "N/A"} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card hud-border p-8 space-y-8">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold tracking-tight">Deployment Log</h3>
        </div>
        
        <div className="space-y-6">
          <LogItem label="Timestamp" value={new Date(contract.deployed_at).toLocaleString()} />
          
          {contract.verified_at && (
            <LogItem label="Verification" value={new Date(contract.verified_at).toLocaleString()} highlight />
          )}

          <div className="pt-6 border-t border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Compiler</span>
              <span className="text-xs font-mono text-slate-300">v0.8.20</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Optimization</span>
              <span className="text-xs text-slate-300">Enabled (200 runs)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">EVM Version</span>
              <span className="text-xs text-slate-300">Paris</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ManifestItem({ icon, label, value, mono = false }: { icon: React.ReactNode, label: string, value: string, mono?: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-slate-600">
        {icon}
        <p className="text-[9px] uppercase tracking-widest font-black">{label}</p>
      </div>
      <p className={cn(
        "font-bold text-white tracking-tight",
        mono ? "font-mono text-[10px] break-all text-slate-400" : "text-sm"
      )}>
        {value}
      </p>
    </div>
  );
}

function LogItem({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[9px] uppercase tracking-widest text-slate-600 font-black">{label}</p>
      <p className={cn(
        "text-sm font-bold",
        highlight ? "text-mantle-green" : "text-slate-300"
      )}>
        {value}
      </p>
    </div>
  );
}
