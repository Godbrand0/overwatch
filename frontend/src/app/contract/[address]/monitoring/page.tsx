"use client";

import { useEffect, useState, use } from "react";
import { ContractMonitoring } from "@/components/contract/ContractMonitoring";
import { Activity } from "lucide-react";

export default function MonitoringPage({ params }: { params: Promise<{ address: string }> }) {
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

  const isVerified = !!contract.verified_at;

  if (!isVerified) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
        <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Monitoring Locked</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Contract must be verified to access monitoring features.
        </p>
      </div>
    );
  }

  return (
    <ContractMonitoring
      address={contract.address}
      abi={contract.abi}
      contractName={contract.name}
    />
  );
}
