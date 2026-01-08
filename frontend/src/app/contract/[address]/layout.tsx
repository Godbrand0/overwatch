"use client";

import { useEffect, useState, use } from "react";
import { Loader2, AlertCircle, ShieldAlert, ShieldCheck, Activity, Cpu } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ContractOverview } from "@/components/contract/ContractOverview";
import { ContractNav } from "@/components/contract/ContractNav";

export default function ContractLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const fetchContract = async () => {
    try {
      const response = await fetch(`/api/contracts/${address}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch contract data");
      }

      setContract(data.contract);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) fetchContract();
  }, [address]);

  const handleVerify = async () => {
    if (!contract) return;
    setVerifying(true);

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractAddress: contract.address,
          sourceCode: contract.source_code,
          contractName: contract.name,
          network: contract.network,
          constructorArgs: contract.constructor_args,
          abi: contract.abi,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Verification failed");

      await fetchContract();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mantle-dark flex flex-col items-center justify-center bg-grid">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-mantle-green/20 border-t-mantle-green rounded-full animate-spin" />
          <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-mantle-green animate-pulse" />
        </div>
        <p className="mt-8 text-mantle-green font-mono tracking-widest animate-pulse uppercase">Synchronizing Asset Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-mantle-dark py-12 bg-grid">
        <div className="container mx-auto px-4">
          <div className="glass-card hud-border p-8 border-red-500/20 bg-red-500/[0.02] max-w-2xl mx-auto text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">System Error</h2>
            <p className="text-slate-400 font-mono text-sm mb-6">{error}</p>
            <Button asChild variant="outline" className="border-white/10 hover:bg-white/5">
              <a href="/dashboard">Return to Mission Control</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isVerified = !!contract.verified_at;

  return (
    <div className="min-h-screen bg-mantle-dark text-white pb-20 bg-grid">
      <div className="container mx-auto px-4 space-y-10 py-12">
        <ContractOverview contract={contract} />

        {!isVerified && (
          <div className="glass-card hud-border p-6 bg-blue-500/[0.03] border-blue-500/20 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Source Verification Required</h3>
                  <p className="text-blue-300/60 text-sm font-medium">
                    Interaction features are locked until the contract source is verified on Mantlescan.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleVerify}
                disabled={verifying}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold h-12 px-8 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all hover:scale-105"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying Source...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Verify Now
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <ContractNav address={address} isVerified={isVerified} />

        <div className="contract-content animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </div>
    </div>
  );
}
