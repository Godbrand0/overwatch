"use client";

import { useEffect, useState, use } from "react";
import { TestTube } from "lucide-react";
import { TestDashboard } from "@/components/deploy/TestDashboard";

export default function TestsPage({ params }: { params: Promise<{ address: string }> }) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Contract Tests</h2>
      </div>

      {contract.test_results ? (
        <TestDashboard results={contract.test_results} />
      ) : (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
          <TestTube className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Test Results</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            No test results available for this contract. Run tests during deployment to see them here.
          </p>
        </div>
      )}
    </div>
  );
}
