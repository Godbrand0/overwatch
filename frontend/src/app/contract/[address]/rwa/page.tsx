"use client";

import { useEffect, useState, use } from "react";
import { ShieldCheck, ShieldAlert, CheckCircle2, Link as LinkIcon, Scale, Lock, FileText, Globe, UserCheck, Cpu, Box } from "lucide-react";
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
    await fetchContract();
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-64 glass-card hud-border" />
        <div className="h-96 glass-card" />
      </div>
    );
  }

  if (!contract) {
    return <div className="text-slate-500 font-mono">SYSTEM_ERROR: CONTRACT_NOT_FOUND</div>;
  }

  const isCompliant = contract.rwa_compliance?.isCompliant;

  return (
    <div className="space-y-10">
      {/* 1. Anchored Status (The Legal Vault) */}
      {contract.is_anchored ? (
        <div className="glass-card hud-border p-10 relative overflow-hidden bg-mantle-green/[0.02]">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Lock className="w-48 h-48 text-mantle-green" />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-mantle-green/10 flex items-center justify-center text-mantle-green border border-mantle-green/20 shadow-[0_0_20px_rgba(0,255,209,0.1)]">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-3xl font-black text-white tracking-tight">Verified Trust Anchor</h3>
                    <Badge className="bg-mantle-green/20 text-mantle-green border-mantle-green/30 font-bold uppercase tracking-widest text-[10px] px-3">
                      Immutable
                    </Badge>
                  </div>
                  <p className="text-mantle-green/70 font-medium max-w-lg">
                    This asset is cryptographically anchored to the Mantle RWA Trust Layer, ensuring verifiable legal backing.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <a 
                  href={`https://sepolia.mantlescan.xyz/tx/${contract.anchor_tx_hash}`}
                  target="_blank"
                  className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  <LinkIcon className="w-4 h-4" />
                  Proof of Transaction
                </a>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              <VaultItem icon={<Box className="w-4 h-4" />} label="Asset Classification" value={contract.rwa_type} />
              <VaultItem icon={<Scale className="w-4 h-4" />} label="Legal Framework" value={contract.legal_right} />
              <VaultItem icon={<Globe className="w-4 h-4" />} label="Jurisdiction" value={contract.jurisdiction} />
              <VaultItem icon={<UserCheck className="w-4 h-4" />} label="Designated Custodian" value={contract.custodian} mono />
              <VaultItem icon={<Cpu className="w-4 h-4" />} label="Off-chain Asset ID" value={contract.offchain_asset_id} />
              <VaultItem icon={<FileText className="w-4 h-4" />} label="Legal Document Hash" value={contract.legal_doc_hash || "0x..."} mono small />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h3 className="text-2xl font-black mb-2">Anchor Asset Profile</h3>
              <p className="text-slate-400">Initialize the on-chain legal linkage for this digital asset.</p>
            </div>
            <ComplianceForm contractAddress={address} onAnchored={handleAnchored} />
          </div>
          <div className="space-y-8">
            <div className="glass-card hud-border p-8 bg-blue-500/[0.02]">
              <Scale className="w-10 h-10 text-blue-400 mb-6" />
              <h4 className="font-bold text-xl text-white mb-3">Why Anchor?</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Anchoring creates an <span className="text-white font-medium">immutable cryptographic link</span> between your smart contract and the legal documents that back it. 
                This builds institutional trust and allows dApps to verify your asset's legal structure on-chain.
              </p>
            </div>
            <div className="glass-card p-8 bg-white/[0.02]">
              <h4 className="font-bold text-white mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-mantle-green" />
                Enforced Trust Schema
              </h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-mantle-green/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-mantle-green" />
                  </div>
                  Standardized Asset Types
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-mantle-green/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-mantle-green" />
                  </div>
                  Verified Legal Rights
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-mantle-green/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-mantle-green" />
                  </div>
                  Cryptographic Doc Hashing
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 2. ABI Detection Status */}
      <div className="glass-card p-8 bg-white/[0.01] border-white/5">
        <div className="flex items-center gap-6 mb-8">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center border",
            isCompliant ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-white/5 text-slate-600 border-white/5"
          )}>
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Automated ABI Analysis</h3>
            <p className="text-sm text-slate-500 font-medium">
              {isCompliant 
                ? "Standard RWA interfaces detected in contract bytecode." 
                : "No standard RWA interfaces detected in the current deployment."}
            </p>
          </div>
        </div>
        
        {isCompliant && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contract.rwa_compliance.detectedFeatures.map((feature: string, i: number) => (
              <div
                key={i}
                className="flex items-center gap-3 text-xs font-bold text-slate-300 bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-mantle-green/20 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-mantle-green" />
                {feature}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VaultItem({ icon, label, value, mono = false, small = false }: { icon: React.ReactNode, label: string, value: string, mono?: boolean, small?: boolean }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <p className="text-[10px] uppercase tracking-[0.2em] font-black">{label}</p>
      </div>
      <p className={cn(
        "font-bold text-white tracking-tight",
        mono ? "font-mono text-xs break-all text-slate-300" : "text-xl",
        small ? "text-[10px]" : ""
      )}>
        {value}
      </p>
    </div>
  );
}
