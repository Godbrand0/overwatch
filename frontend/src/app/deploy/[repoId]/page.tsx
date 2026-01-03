"use client";

import { useEffect, useState, use, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ContractSelector } from "@/components/deploy/ContractSelector";
import { ContractDetails } from "@/components/deploy/ContractDetails";
import { DeploymentStatus } from "@/components/deploy/DeploymentStatus";
import { CompilationError } from "@/components/deploy/CompilationError";
import { DeployProgress, DeployStep } from "@/components/deploy/DeployProgress";
import { GitHubRepo } from "@/types/github";
import { Loader2, ArrowLeft, Rocket, ShieldCheck, Activity, Cpu, Send, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAccount, useDeployContract, useWaitForTransactionReceipt } from "wagmi";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { TestDashboard } from "@/components/deploy/TestDashboard";
import { ProofWizard, RWAProof } from "@/components/deploy/ProofWizard";

export default function DeployPage({ params }: { params: Promise<{ repoId: string }> }) {
  const { repoId } = use(params);
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const [repo, setRepo] = useState<GitHubRepo | null>(null);
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [compiling, setCompiling] = useState(false);
  const [isCompiled, setIsCompiled] = useState(false);
  const [compilationError, setCompilationError] = useState<string | null>(null);

  const [deploying, setDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<"pending" | "success" | "error">("pending");
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const [compiledData, setCompiledData] = useState<any>(null);
  const [deploymentData, setDeploymentData] = useState<any>(null);

  // Test State
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  // RWA Proof State
  const [proofWizardOpen, setProofWizardOpen] = useState(false);
  const [rwaProof, setRwaProof] = useState<RWAProof | null>(null);

  const [steps, setSteps] = useState<DeployStep[]>([
    { id: "compile", label: "Compiling Contract", status: "pending" },
    { id: "deploy", label: "Deploying to Mantle", status: "pending" },
    { id: "verify", label: "Verifying on Explorer", status: "pending" },
  ]);

  const { deployContract, data: deployHash, error: deployError } = useDeployContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } = useWaitForTransactionReceipt({
    hash: deployHash,
  });

  // Trigger Proof Wizard if RWA detected
  useEffect(() => {
    if (isCompiled && compiledData?.rwaCompliance?.isCompliant && !rwaProof) {
      setProofWizardOpen(true);
    }
  }, [isCompiled, compiledData, rwaProof]);

  const handleProofGenerate = (proof: RWAProof) => {
    setRwaProof(proof);
  };

  // Update deploy step when transaction is sent and confirming
  useEffect(() => {
    if (deployHash && isConfirming) {
      const explorerUrl = `https://sepolia.mantlescan.xyz/tx/${deployHash}`;
      updateStep("deploy", "loading", `Confirming transaction... [View on Explorer](${explorerUrl})`);
    }
  }, [deployHash, isConfirming]);

  useEffect(() => {
    async function fetchRepo() {
      try {
        const response = await fetch(`/api/repos/${repoId}/contracts`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch repository data");
        setRepo(data.repo);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (repoId) fetchRepo();
  }, [repoId]);

  // Reset state when contract selection changes
  useEffect(() => {
    setIsCompiled(false);
    setCompilationError(null);
    setDeploymentStatus("pending");
    setDeploymentError(null);
    setCompiledData(null);
    setDeploymentData(null);
    setTestResults(null); // Reset tests
    setRwaProof(null); // Reset proof
    setSteps([
      { id: "compile", label: "Compiling Contract", status: "pending" },
      { id: "deploy", label: "Deploying to Mantle", status: "pending" },
      { id: "verify", label: "Verifying on Explorer", status: "pending" },
    ]);
  }, [selectedContract]);

  // Handle deployment error (e.g. user rejected)
  useEffect(() => {
    if (deployError) {
      updateStep("deploy", "error", deployError.message);
      setDeploymentError(deployError.message);
      setDeploymentStatus("error");
      setDeploying(false);
    }
  }, [deployError]);

  // Handle transaction confirmation
  useEffect(() => {
    async function handleConfirmation() {
      if (isConfirmed && receipt && compiledData) {
        try {
          if (receipt.status === 'reverted') {
            updateStep("deploy", "error", "Transaction reverted on-chain");
            setDeploymentError("Transaction reverted - check constructor arguments and contract logic");
            setDeploymentStatus("error");
            setDeploying(false);
            return;
          }

          const contractAddress = receipt.contractAddress;
          if (!contractAddress) {
            updateStep("deploy", "error", "No contract address returned");
            setDeploymentError("Deployment failed - no contract address was generated");
            setDeploymentStatus("error");
            setDeploying(false);
            return;
          }

          updateStep("deploy", "success");

          // Save to DB
          const saveResponse = await fetch("/api/deploy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              repositoryId: repoId,
              sourceCode: compiledData.sourceCode,
              contractName: compiledData.contractName,
              network: "testnet",
              deployTxHash: receipt.transactionHash,
              contractAddress,
              constructorArgs: compiledData.constructorArgs,
              rwaProof, // Pass the proof to be saved
            }),
          });

          const saveData = await saveResponse.json();

          setDeploymentData({
            contractAddress,
            txHash: receipt.transactionHash,
            blockNumber: Number(receipt.blockNumber),
            nonce: 0, // Nonce is not directly in receipt, would need to fetch from provider if critical
            abi: compiledData.abi,
            bytecode: compiledData.bytecode,
            sourceCode: compiledData.sourceCode,
            contractName: compiledData.contractName,
            constructorArgs: compiledData.constructorArgs,
          });

          setDeploymentStatus("success");
          setDeploying(false);
        } catch (err: any) {
          updateStep("deploy", "error", err.message);
          setDeploymentError(err.message);
          setDeploymentStatus("error");
          setDeploying(false);
        }
      }
    }
    handleConfirmation();
  }, [isConfirmed, receipt, compiledData, rwaProof]);

  const handleCompile = async () => {
    if (!selectedContract || !repo) return;

    setCompiling(true);
    setCompilationError(null);
    updateStep("compile", "loading");

    try {
      const sourceResponse = await fetch(`/api/repos/${repoId}/file?path=${selectedContract}`);
      const sourceData = await sourceResponse.json();
      const contractName = selectedContract.split("/").pop()?.replace(".sol", "");

      const compileResponse = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repositoryId: repoId,
          sourceCode: sourceData.content,
          contractName,
          network: "testnet",
          compileOnly: true,
        }),
      });

      const compileData = await compileResponse.json();
      if (!compileResponse.ok) throw new Error(compileData.error || "Compilation failed");

      setCompiledData({
        ...compileData,
        sourceCode: sourceData.content,
        contractName,
      });
      setIsCompiled(true);
      updateStep("compile", "success");
    } catch (err: any) {
      updateStep("compile", "error", err.message);
      setCompilationError(err.message);
    } finally {
      setCompiling(false);
    }
  };

  const handleRunTests = async () => {
    if (!compiledData || !selectedContract) return;
    
    setTesting(true);
    setTestResults(null);

    try {
      // For MVP, we assume a test file exists with standard naming convention
      // In a real app, we'd let user select test file or auto-detect
      const testFileName = selectedContract.replace(".sol", ".t.sol").replace("src/", "test/");
      
      // Try to fetch test file content
      let testCode = "";
      try {
        const testResponse = await fetch(`/api/repos/${repoId}/file?path=${testFileName}`);
        if (testResponse.ok) {
          const testData = await testResponse.json();
          testCode = testData.content;
        }
      } catch (e) {
        console.log("No test file found");
      }

      // If no test file found, we can't run tests (or we could run a generic test)
      if (!testCode) {
        // For demo purposes, if no test file, we might want to show a message
        // Or we could just try to run tests if the backend handles it differently
        // But our backend expects testCode.
        // Let's create a dummy test if none exists just to show the UI? No, that's misleading.
        // We'll just alert for now.
        alert("No matching test file found (expected " + testFileName + ")");
        setTesting(false);
        return;
      }

      const response = await fetch("/api/deploy/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceCode: compiledData.sourceCode,
          contractName: compiledData.contractName,
          testCode,
        }),
      });

      const data = await response.json();
      setTestResults(data);
    } catch (err: any) {
      console.error(err);
      setTestResults({ error: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleDeploy = async (args: any[]) => {
    if (!compiledData || !isConnected) return;

    setDeploying(true);
    setDeploymentStatus("pending");
    setDeploymentError(null);
    updateStep("deploy", "loading");

    try {
      setCompiledData((prev: any) => ({ ...prev, constructorArgs: args }));
      
      deployContract({
        abi: compiledData.abi,
        bytecode: compiledData.bytecode as `0x${string}`,
        args: args.length > 0 ? args : undefined,
      });
    } catch (err: any) {
      updateStep("deploy", "error", err.message);
      setDeploymentError(err.message);
      setDeploymentStatus("error");
      setDeploying(false);
    }
  };

  const handleVerify = async () => {
    if (!deploymentData) return;

    setVerifying(true);
    updateStep("verify", "loading");

    try {
      const verifyResponse = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractAddress: deploymentData.contractAddress,
          sourceCode: deploymentData.sourceCode,
          contractName: deploymentData.contractName,
          constructorArgs: deploymentData.constructorArgs,
          network: "testnet",
        }),
      });

      const verifyData = await verifyResponse.json();
      if (!verifyResponse.ok) throw new Error(verifyData.error || "Verification failed");

      updateStep("verify", "success");
      setTimeout(() => {
        router.push(`/contract/${deploymentData.contractAddress}`);
      }, 2000);
    } catch (err: any) {
      updateStep("verify", "error", err.message);
    } finally {
      setVerifying(false);
    }
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
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-2">
            <Link href="/repos" className="inline-flex items-center text-gray-400 hover:text-white transition-colors text-sm mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Repositories
            </Link>
            <h1 className="text-4xl font-bold tracking-tight">
              {deploymentStatus === "success" ? "Deployment Complete" : "Deploy Contract"}
            </h1>
            <p className="text-gray-400">
              {repo?.full_name} {selectedContract && `• ${selectedContract}`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {deploymentStatus !== "success" && isCompiled && !compilationError && (
              <Button 
                onClick={() => document.getElementById('deploy-btn')?.click()}
                disabled={deploying || !isConnected}
                className="bg-blue-600 hover:bg-blue-700 h-11 px-6 font-semibold shadow-lg shadow-blue-500/20"
              >
                {deploying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Deploy Contract
              </Button>
            )}
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium">
              <Rocket className="w-4 h-4" />
              Mantle Testnet
            </div>
          </div>
        </div>

        {!isConnected && deploymentStatus !== "success" && (
          <Alert className="mb-8 bg-yellow-900/20 border-yellow-900/50 text-yellow-500">
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>Wallet Not Connected</AlertTitle>
            <AlertDescription>
              Please connect your wallet to deploy contracts to Mantle Network.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {deploymentStatus !== "pending" ? (
              <DeploymentStatus 
                status={deploymentStatus === "success" ? "success" : "error"}
                error={deploymentError || undefined}
                contractAddress={deploymentData?.contractAddress}
                txHash={deploymentData?.txHash}
                blockNumber={deploymentData?.blockNumber}
                nonce={deploymentData?.nonce}
                abi={deploymentData?.abi}
                bytecode={deploymentData?.bytecode}
                onVerify={handleVerify}
                onRetry={() => handleDeploy(compiledData?.constructorArgs || [])}
                verifying={verifying}
              />
            ) : compilationError ? (
              <CompilationError 
                error={compilationError}
                contractName={selectedContract?.split('/').pop() || "Contract"}
                onRetry={handleCompile}
              />
            ) : (
              <>
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-blue-500">1</div>
                    <h2 className="text-2xl font-bold">Select Contract</h2>
                  </div>
                  <ContractSelector
                    repoId={repoId}
                    selectedContract={selectedContract}
                    onSelect={setSelectedContract}
                  />
                  {selectedContract && !isCompiled && !compiling && (
                    <div className="flex justify-end animate-in fade-in slide-in-from-right-4">
                      <Button 
                        onClick={handleCompile}
                        disabled={compiling}
                        className="bg-blue-600 hover:bg-blue-700 h-12 px-8 text-lg"
                      >
                        {compiling ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Cpu className="w-5 h-5 mr-2" />}
                        Compile Contract
                      </Button>
                    </div>
                  )}
                </section>

                {isCompiled && (
                  <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-blue-500">2</div>
                      <h2 className="text-2xl font-bold">Review & Configure</h2>
                    </div>
                    
                    {/* Test Runner Section */}
                    <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <TestTube className="w-5 h-5 text-purple-400" />
                          Contract Tests
                        </h3>
                        {!testResults && (
                          <Button 
                            onClick={handleRunTests}
                            disabled={testing}
                            variant="outline"
                            size="sm"
                            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                          >
                            {testing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Run Tests
                          </Button>
                        )}
                      </div>
                      
                      {(testing || testResults) && (
                        <TestDashboard results={testResults} isLoading={testing} />
                      )}
                    </div>

                    <ContractDetails 
                      abi={compiledData.abi}
                      bytecode={compiledData.bytecode}
                      onDeploy={handleDeploy}
                      deploying={deploying}
                    />
                    {/* Hidden button for the top corner trigger */}
                    <button id="deploy-btn" className="hidden" onClick={() => {}} />
                  </section>
                )}
              </>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 sticky top-8 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                <Activity className="w-6 h-6 text-blue-500" />
                Process Status
              </h3>
              <DeployProgress steps={steps} />
              
              <div className="mt-12 pt-8 border-t border-gray-700/50">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Network</span>
                    <span className="text-blue-400 font-medium">Mantle Sepolia</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Status</span>
                    <span className="text-green-400 font-medium">Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <ProofWizard 
          isOpen={proofWizardOpen} 
          onClose={() => setProofWizardOpen(false)}
          onGenerate={handleProofGenerate}
        />
      </div>
    </div>
  );
}
