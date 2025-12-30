"use client";

import { useEffect, useState, use } from "react";
import { useParams, useRouter } from "next/navigation";
import { ContractSelector } from "@/components/deploy/ContractSelector";
import { ConstructorForm } from "@/components/deploy/ConstructorForm";
import { DeployProgress, DeployStep } from "@/components/deploy/DeployProgress";
import { GitHubRepo } from "@/types/github";
import { Loader2, ArrowLeft, Rocket, ShieldCheck, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAccount, useDeployContract } from "wagmi";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function DeployPage({ params }: { params: Promise<{ repoId: string }> }) {
  const { repoId } = use(params);
  const router = useRouter();
  const { address, isConnected } = useAccount();
  
  const [repo, setRepo] = useState<GitHubRepo | null>(null);
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [deploying, setDeploying] = useState(false);
  const [showVerifyPrompt, setShowVerifyPrompt] = useState(false);
  const [pendingDeployData, setPendingDeployData] = useState<any>(null);
  const [steps, setSteps] = useState<DeployStep[]>([
    { id: "compile", label: "Compiling Contract", status: "pending" },
    { id: "deploy", label: "Deploying to Mantle", status: "pending" },
    { id: "verify", label: "Verifying on Explorer", status: "pending" },
  ]);

  useEffect(() => {
    async function fetchRepo() {
      try {
        const response = await fetch(`/api/repos/${repoId}/contracts`);
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error(`Server returned an invalid response: ${text.substring(0, 100)}...`);
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch repository data");
        }

        setRepo(data.repo);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (repoId) fetchRepo();
  }, [repoId]);

  const handleDeploy = async (args: any[]) => {
    if (!selectedContract || !repo) return;
    
    setDeploying(true);
    updateStep("compile", "loading");

    try {
      // 1. Get source code and compile
      const sourceResponse = await fetch(`/api/repos/${repoId}/file?path=${selectedContract}`);
      
      const sourceContentType = sourceResponse.headers.get("content-type");
      if (!sourceContentType || !sourceContentType.includes("application/json")) {
        const text = await sourceResponse.text();
        throw new Error(`Server returned an invalid response while fetching file: ${text.substring(0, 100)}...`);
      }

      const sourceData = await sourceResponse.json();
      
      const deployResponse = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repositoryId: repoId,
          sourceCode: sourceData.content,
          contractName: selectedContract.split("/").pop()?.replace(".sol", ""),
          network: "testnet", // Default to testnet for now
          constructorArgs: args,
        }),
      });

      const deployContentType = deployResponse.headers.get("content-type");
      if (!deployContentType || !deployContentType.includes("application/json")) {
        const text = await deployResponse.text();
        throw new Error(`Server returned an invalid response while deploying: ${text.substring(0, 100)}...`);
      }

      const deployData = await deployResponse.json();
      
      if (!deployResponse.ok) {
        throw new Error(deployData.error || "Deployment failed");
      }

      updateStep("compile", "success");
      updateStep("deploy", "loading");

      // In a real app, we would use wagmi to send the transaction here
      // For the MVP, the API handles the compilation and we mock the deployment
      
      // Simulate deployment time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      updateStep("deploy", "success");
      
      // Store data for potential verification and show prompt
      setPendingDeployData({
        ...deployData,
        sourceCode: sourceData.content,
        constructorArgs: args
      });
      setShowVerifyPrompt(true);
      setDeploying(false);

    } catch (err: any) {
      const currentStep = steps.find(s => s.status === "loading")?.id || "compile";
      updateStep(currentStep, "error", err.message);
      setDeploying(false);
    }
  };

  const handleConfirmVerify = async () => {
    if (!pendingDeployData) return;
    
    setShowVerifyPrompt(false);
    setDeploying(true);
    updateStep("verify", "loading");

    try {
      // In a real app, this would call the verification API
      // For now, we simulate verification time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      updateStep("verify", "success");
      
      // Redirect to contract dashboard after success
      setTimeout(() => {
        router.push(`/contract/${pendingDeployData.contract.address}`);
      }, 2000);
    } catch (err: any) {
      updateStep("verify", "error", err.message);
      setDeploying(false);
    }
  };

  const handleSkipVerify = () => {
    if (!pendingDeployData) return;
    router.push(`/contract/${pendingDeployData.contract.address}`);
  };

  const updateStep = (id: string, status: DeployStep["status"], error?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, status, error } : step
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-400 text-lg">Loading repository details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/repos" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Repositories
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Deploy Contract</h1>
            <p className="text-gray-400">
              {repo?.full_name} • {selectedContract || "Select a contract to begin"}
            </p>
          </div>
          <div className="hidden md:flex gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm">
              <Rocket className="w-4 h-4" />
              Mantle Testnet
            </div>
          </div>
        </div>

        {!isConnected && (
          <Alert className="mb-8 bg-yellow-900/20 border-yellow-900/50 text-yellow-500">
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>Wallet Not Connected</AlertTitle>
            <AlertDescription>
              Please connect your wallet to deploy contracts to Mantle Network.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-sm">1</span>
                Select Contract
              </h2>
              <ContractSelector
                repoId={repoId}
                selectedContract={selectedContract}
                onSelect={setSelectedContract}
              />
            </section>

            {selectedContract && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-sm">2</span>
                  Configure & Deploy
                </h2>
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <ConstructorForm
                    abi={[]} // We should fetch the ABI after selection or from the compilation API
                    onDeploy={handleDeploy}
                    loading={deploying}
                  />
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Deployment Progress
              </h3>
              <DeployProgress steps={steps} />

              {showVerifyPrompt && (
                <div className="mt-8 p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg animate-in fade-in slide-in-from-top-4">
                  <p className="text-sm text-blue-200 mb-4">
                    Contract deployed successfully! Would you like to verify it on the Mantle Explorer?
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={handleConfirmVerify}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm h-9"
                    >
                      Yes, Verify Now
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleSkipVerify}
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 text-sm h-9"
                    >
                      No, Skip for Now
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
