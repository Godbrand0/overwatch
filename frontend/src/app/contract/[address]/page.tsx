"use client";

import { useEffect, useState, use } from "react";
import { useParams } from "next/navigation";
import { ContractOverview } from "@/components/contract/ContractOverview";
import { ReadFunctions } from "@/components/contract/ReadFunctions";
import { WriteFunctions } from "@/components/contract/WriteFunctions";
import { Loader2, AlertCircle, Terminal, Activity, History } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ContractDashboard({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContract() {
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
    }

    if (address) fetchContract();
  }, [address]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-400 text-lg">Loading contract dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <Alert variant="destructive" className="bg-red-900/20 border-red-900/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 space-y-8">
        <ContractOverview contract={contract} />

        <Tabs defaultValue="interact" className="w-full">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="interact" className="data-[state=active]:bg-gray-700">
              <Terminal className="w-4 h-4 mr-2" />
              Interact
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-gray-700">
              <Activity className="w-4 h-4 mr-2" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gray-700">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interact" className="mt-6">
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
          </TabsContent>

          <TabsContent value="monitoring" className="mt-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
              <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-Time Monitoring</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Monitoring is currently being initialized. You will see live transaction feeds and event logs here soon.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
              <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Transaction History</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                No transactions found for this contract yet.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
