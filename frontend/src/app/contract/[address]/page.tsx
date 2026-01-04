"use client";

import { useEffect, useState, use } from "react";
import { ReadFunctions } from "@/components/contract/ReadFunctions";
import { WriteFunctions } from "@/components/contract/WriteFunctions";
import { Terminal } from "lucide-react";

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

  return (
    <div className="space-y-8">
      {isVerified ? (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Read Functions
            </h3>
            <ReadFunctions abi={contract.abi} address={contract.address} />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              Write Functions
            </h3>
            <WriteFunctions abi={contract.abi} address={contract.address} />
          </div>
        </div>
      ) : (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-12 text-center space-y-6 backdrop-blur-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700/50 mb-2">
            <Terminal className="w-8 h-8 text-gray-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Interaction Locked</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              You must verify the contract source code before you can interact with its functions through this dashboard.
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Click the "Verify Now" button above to unlock contract interaction features.
          </p>
        </div>
      )}
    </div>
  );
}
