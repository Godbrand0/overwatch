"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, ShieldCheck, Clock, FileCode, Zap, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ContractOverviewProps {
  contract: {
    address: string;
    name: string;
    network: string;
    deployed_at: string;
    verified_at?: string;
    abi?: any[];
    rwa_compliance?: {
      isCompliant: boolean;
      detectedFeatures: string[];
      standard?: string;
    };
    rwa_proof?: any;
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
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="md:col-span-2 bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-3xl font-bold text-white">
                  {contract.name}
                </CardTitle>
                <div className="flex gap-2">
                  {contract.verified_at && (
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 flex gap-1 px-2 py-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified
                    </Badge>
                  )}
                  {contract.rwa_compliance?.isCompliant && (
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 flex gap-1 px-2 py-0.5">
                      <Zap className="w-3.5 h-3.5 text-blue-400" />
                      Mantle RWA
                    </Badge>
                  )}
                  {contract.rwa_proof && (
                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 flex gap-1 px-2 py-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                      Proof Anchored
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400 font-mono text-sm">
                {contract.address}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-700/50"
                  onClick={() => copyToClipboard(contract.address)}
                >
                  <Copy className={`w-3.5 h-3.5 ${copied ? 'text-green-500' : ''}`} />
                </Button>
              </div>
            </div>
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1">
              {contract.network}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2 border-gray-700 hover:bg-gray-700 h-10">
                <ExternalLink className="w-4 h-4" />
                View on Explorer
              </Button>
            </a>
            <Button variant="outline" className="gap-2 border-gray-700 hover:bg-gray-700 h-10">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              Analytics
            </Button>
            <Button variant="outline" className="gap-2 border-gray-700 hover:bg-gray-700 h-10">
              <Zap className="w-4 h-4 text-yellow-400" />
              Gas Usage
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            Deployment Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Deployed At</p>
            <p className="text-sm text-gray-300">{new Date(contract.deployed_at).toLocaleString()}</p>
          </div>
          
          {contract.verified_at && (
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Verified At</p>
              <p className="text-sm text-gray-300">{new Date(contract.verified_at).toLocaleString()}</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-700/50 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Compiler</span>
              <span className="text-gray-300 font-mono">v0.8.20</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Optimization</span>
              <span className="text-gray-300">Enabled (200 runs)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
