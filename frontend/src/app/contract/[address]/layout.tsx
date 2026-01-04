"use client";

import { useEffect, useState, use } from "react";
import { Loader2, AlertCircle, ShieldAlert, ShieldCheck } from "lucide-react";
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

  const isVerified = !!contract.verified_at;

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 space-y-8">
        <ContractOverview contract={contract} />

        {!isVerified && (
          <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-400 animate-in fade-in slide-in-from-top-4 duration-500">
            <ShieldAlert className="h-5 w-5" />
            <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4 ml-2">
              <div>
                <AlertTitle className="text-lg font-bold">Contract Not Verified</AlertTitle>
                <AlertDescription className="text-blue-300/80">
                  This contract has not been verified on Mantlescan. Verification is required to interact with read and write functions.
                </AlertDescription>
              </div>
              <Button
                onClick={handleVerify}
                disabled={verifying}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 shrink-0"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Verify Now
                  </>
                )}
              </Button>
            </div>
          </Alert>
        )}

        <ContractNav address={address} isVerified={isVerified} />

        <div className="contract-content">{children}</div>
      </div>
    </div>
  );
}
