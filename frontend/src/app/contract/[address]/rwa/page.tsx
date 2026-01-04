"use client";

import { useEffect, useState, use } from "react";
import { ShieldCheck, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function RWAPage({ params }: { params: Promise<{ address: string }> }) {
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

  if (!isCompliant) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
        <ShieldAlert className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Not RWA Compliant</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          This contract does not appear to implement standard RWA interfaces (e.g., ERC-3643).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Mantle RWA Compliant</h3>
            <p className="text-blue-400">
              This contract meets the standards for Real-World Assets on Mantle.
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {contract.rwa_compliance.detectedFeatures.map((feature: string, i: number) => (
            <div
              key={i}
              className="flex items-center gap-2 text-gray-300 bg-gray-900/50 p-3 rounded-lg border border-gray-700/50"
            >
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              {feature}
            </div>
          ))}
        </div>
      </div>

      {contract.rwa_proof && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Asset Proof Anchored</h3>
              <p className="text-purple-400">
                Cryptographic proof of asset backing linked to this deployment.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                Asset Type
              </p>
              <p className="text-lg font-mono text-white">{contract.rwa_proof.assetType}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                Custodian
              </p>
              <p className="text-lg font-mono text-white">{contract.rwa_proof.custodian}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                Initial NAV
              </p>
              <p className="text-lg font-mono text-white">
                {contract.rwa_proof.nav} {contract.rwa_proof.currency}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                Redemption Terms
              </p>
              <p className="text-lg font-mono text-white">
                {contract.rwa_proof.redemptionTerms}
              </p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                Proof Timestamp
              </p>
              <p className="text-sm font-mono text-gray-400">
                {new Date(contract.rwa_proof.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
