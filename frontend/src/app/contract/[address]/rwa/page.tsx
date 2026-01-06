"use client";

import { useEffect, useState, use } from "react";
import { ShieldCheck, ShieldAlert, CheckCircle2, Link as LinkIcon, Scale } from "lucide-react";
import { ComplianceForm } from "@/components/contract/ComplianceForm";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function RWAPage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (address) fetchContract();
  }, [address]);

  const handleAnchored = async (txHash: string, profile: any) => {
    // In a real app, we would call a backend API to save the anchored status
    // For now, we'll just refresh the data
    await fetchContract();
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-800 rounded w-1/4"></div>
        <div className="h-64 bg-gray-800 rounded"></div>
      </div>
    );
  }

  if (!contract) {
    return <div className="text-gray-400">Contract not found</div>;
  }

  const isCompliant = contract.rwa_compliance?.isCompliant;

  return (
    <div className="space-y-8">
      {/* 1. Anchored Status (The Trust Layer) */}
      {contract.is_anchored ? (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-bold text-white">Verified RWA Anchor</h3>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Immutable</Badge>
                </div>
                <p className="text-green-400/80">
                  This asset is legally anchored on the Mantle RWA Trust Layer.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <a 
                href={`https://sepolia.mantlescan.xyz/tx/${contract.anchor_tx_hash}`}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
                View Transaction
              </a>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Asset Type</p>
              <p className="text-lg font-semibold text-white">{contract.rwa_type}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Legal Right</p>
              <p className="text-lg font-semibold text-white">{contract.legal_right}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Jurisdiction</p>
              <p className="text-lg font-semibold text-white">{contract.jurisdiction}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Custodian</p>
              <p className="text-sm font-mono text-gray-300 break-all">{contract.custodian}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Off-chain ID</p>
              <p className="text-lg font-semibold text-white">{contract.offchain_asset_id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Legal Doc Hash</p>
              <p className="text-xs font-mono text-gray-400 break-all">{contract.legal_doc_hash || "0x..."}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ComplianceForm contractAddress={address} onAnchored={handleAnchored} />
          </div>
          <div className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
              <Scale className="w-8 h-8 text-blue-400 mb-4" />
              <h4 className="font-bold text-white mb-2">Why Anchor?</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Anchoring creates an immutable link between your smart contract and the legal documents that back it. 
                This builds institutional trust and allows dApps to verify your asset's legal structure on-chain.
              </p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h4 className="font-bold text-white mb-4">Enforced Schema</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  Standardized Asset Types
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  Verified Legal Rights
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  Cryptographic Doc Hashing
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 2. ABI Detection Status */}
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            isCompliant ? "bg-blue-500/20 text-blue-400" : "bg-gray-700 text-gray-500"
          )}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">ABI Compliance Detection</h3>
            <p className="text-sm text-gray-400">
              {isCompliant 
                ? "Standard RWA interfaces detected in contract bytecode." 
                : "No standard RWA interfaces detected."}
            </p>
          </div>
        </div>
        
        {isCompliant && (
          <div className="grid md:grid-cols-2 gap-3">
            {contract.rwa_compliance.detectedFeatures.map((feature: string, i: number) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-gray-300 bg-gray-900/30 p-2 rounded-lg border border-gray-700/30"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                {feature}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
