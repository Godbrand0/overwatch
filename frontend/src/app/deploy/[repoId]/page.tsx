"use client";

import { useEffect, useState, use, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ContractSelector } from "@/components/deploy/ContractSelector";
import { ContractDetails } from "@/components/deploy/ContractDetails";
import { DeploymentStatus } from "@/components/deploy/DeploymentStatus";
import { CompilationError } from "@/components/deploy/CompilationError";
import { DeployProgress, DeployStep } from "@/components/deploy/DeployProgress";
import { GitHubRepo } from "@/types/github";
import { Loader2, ArrowLeft, Rocket, ShieldCheck, Activity, Cpu, Send, TestTube, Box, ChevronRight } from "lucide-react";
import { formatTransactionError } from "@/lib/error-handler";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAccount, useDeployContract, useWaitForTransactionReceipt } from "wagmi";
import { keccak256, encodePacked } from "viem";
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
    const manifest = {
      chain: "Mantle Sepolia",
      deployer: address,
      ...proof
    };
    
    const hash = keccak256(encodePacked(
      ['string', 'string', 'string', 'string', 'string'],
      [proof.assetId, proof.custodian, proof.nav, proof.assetType, address || ""]
    ));
    
    setRwaProof({
      ...proof,
      manifestHash: hash
    });
  };

  useEffect(() => {
    if (deployHash && isConfirming) {
      const explorerUrl = `https://sepolia.mantlescan.xyz/tx/${deployHash}`;
      updateStep("deploy", "loading", undefined, explorerUrl, "Confirming transaction...");
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

  useEffect(() => {
    setIsCompiled(false);
    setCompilationError(null);
    setDeploymentStatus("pending");
    setDeploymentError(null);
    setCompiledData(null);
    setDeploymentData(null);
    setTestResults(null);
    setRwaProof(null);
    setSteps([
      { id: "compile", label: "Compiling Contract", status: "pending" },
      { id: "deploy", label: "Deploying to Mantle", status: "pending" },
      { id: "verify", label: "Verifying on Explorer", status: "pending" },
    ]);
  }, [selectedContract]);

  useEffect(() => {
    if (deployError) {
      const formattedError = formatTransactionError(deployError);
      updateStep("deploy", "error", formattedError);
      setDeploymentError(formattedError);
      setDeploymentStatus("error");
      setDeploying(false);
    }
  }, [deployError]);

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

          updateStep("deploy", "success", undefined, undefined, "Contract Deployed");

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
              rwaProof,
              testResults,
              deployedBlockNumber: Number(receipt.blockNumber),
            }),
          });

          const saveData = await saveResponse.json();
          if (!saveResponse.ok) {
            throw new Error(saveData.error || "Failed to save contract to database");
          }

          setDeploymentData({
            contractAddress,
            txHash: receipt.transactionHash,
            blockNumber: Number(receipt.blockNumber),
            nonce: 0,
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
      
      if (!sourceResponse.ok) {
        throw new Error(sourceData.error || "Failed to fetch contract source code");
      }

      if (!sourceData.content) {
        throw new Error("Contract source code is empty or could not be retrieved");
      }

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
      updateStep("compile", "success", undefined, undefined, "Contract Compiled");
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
      const testFileName = selectedContract.replace(".sol", ".t.sol").replace("src/", "test/");
      
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

      if (!testCode) {
        setTestResults({ 
          error: `No matching test file found (expected ${testFileName})`,
          success: false,
          total: 0,
          passed: 0,
          failed: 0,
          results: []
        });
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

    if (!deploymentData || !deploymentData.contractAddress || !deploymentData.sourceCode || !deploymentData.contractName) {
      const errorMsg = "Missing required deployment data for verification";
      updateStep("verify", "error", errorMsg);
      setVerifying(false);
      return;
    }

    try {
      const verifyResponse = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractAddress: deploymentData.contractAddress,
          sourceCode: deploymentData.sourceCode,
          contractName: deploymentData.contractName,
          constructorArgs: deploymentData.constructorArgs || [],
          abi: deploymentData.abi,
          network: "testnet",
        }),
      });

      const verifyData = await verifyResponse.json();
      
      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || "Verification failed");
      }

      updateStep("verify", "success", undefined, undefined, "Contract Verified");
      setTimeout(() => {
        router.push(`/contract/${deploymentData.contractAddress}`);
      }, 2000);
    } catch (err: any) {
      updateStep("verify", "error", err.message);
    } finally {
      setVerifying(false);
    }
  };

  const updateStep = (id: string, status: DeployStep["status"], error?: string, link?: string, label?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, status, error, link, label: label || step.label } : step
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mantle-dark flex flex-col items-center justify-center bg-grid">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-mantle-green/20 border-t-mantle-green rounded-full animate-spin" />
          <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-mantle-green animate-pulse" />
        </div>
        <p className="mt-8 text-mantle-green font-mono tracking-widest animate-pulse uppercase">Initializing Deployment Mission...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mantle-dark text-white py-12 bg-grid">
      <div className="container mx-auto px-4 max-w-8xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-3">
            <Link href="/repos" className="inline-flex items-center text-slate-500 hover:text-mantle-green transition-colors text-xs font-bold uppercase tracking-widest group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Abort to Repositories
            </Link>
            <h1 className="text-5xl font-black tracking-tight">
              {deploymentStatus === "success" ? "Mission Accomplished" : "Deploy Asset"}
            </h1>
            <div className="flex items-center gap-3 text-slate-400 font-medium">
              <Github className="w-4 h-4" />
              <span>{repo?.full_name}</span>
              {selectedContract && (
                <>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                  <span className="text-mantle-green font-mono text-sm">{selectedContract}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {deploymentStatus !== "success" && isCompiled && !compilationError && (
              <Button 
                onClick={() => document.getElementById('deploy-btn')?.click()}
                disabled={deploying || !isConnected}
                className="bg-mantle-green text-mantle-dark hover:bg-mantle-green/90 h-14 px-8 font-black text-lg rounded-xl shadow-[0_0_20px_rgba(0,255,209,0.3)] transition-all hover:scale-105"
              >
                {deploying ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                Initiate Deployment
              </Button>
            )}
            <div className="flex items-center gap-2 px-4 py-2 bg-mantle-green/10 border border-mantle-green/20 rounded-full text-mantle-green text-[10px] font-bold uppercase tracking-[0.2em]">
              <Rocket className="w-3 h-3" />
              Mantle Sepolia
            </div>
          </div>
        </div>

        {!isConnected && deploymentStatus !== "success" && (
          <div className="glass-card hud-border p-6 bg-yellow-500/[0.03] border-yellow-500/20 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">Wallet Connection Required</h3>
                <p className="text-yellow-500/60 text-sm font-medium">
                  Please connect your institutional wallet to authorize the deployment mission.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-16">
            {deploymentStatus !== "pending" ? (
              <div className="animate-in fade-in zoom-in-95 duration-700">
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
              </div>
            ) : compilationError ? (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <CompilationError 
                  error={compilationError}
                  contractName={selectedContract?.split('/').pop() || "Contract"}
                  onRetry={handleCompile}
                />
              </div>
            ) : (
              <>
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-mantle-green text-xl shadow-[0_0_15px_rgba(0,255,209,0.1)]">01</div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">Select Asset Core</h2>
                      <p className="text-slate-500 text-sm">Choose the smart contract file from your repository.</p>
                    </div>
                  </div>
                  <div className="glass-card p-1">
                    <ContractSelector
                      repoId={repoId}
                      selectedContract={selectedContract}
                      onSelect={setSelectedContract}
                    />
                  </div>
                  {selectedContract && !isCompiled && !compiling && (
                    <div className="flex justify-end animate-in fade-in slide-in-from-right-4">
                      <Button 
                        onClick={handleCompile}
                        disabled={compiling}
                        className="bg-mantle-green text-mantle-dark hover:bg-mantle-green/90 h-14 px-10 text-lg font-black rounded-xl shadow-[0_0_20px_rgba(0,255,209,0.3)] transition-all hover:scale-105"
                      >
                        {compiling ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Cpu className="w-5 h-5 mr-2" />}
                        Compile Asset
                      </Button>
                    </div>
                  )}
                </section>

                {isCompiled && (
                  <section className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-mantle-green text-xl shadow-[0_0_15px_rgba(0,255,209,0.1)]">02</div>
                      <div>
                        <h2 className="text-2xl font-black tracking-tight">Configure & Validate</h2>
                        <p className="text-slate-500 text-sm">Run tests and set constructor parameters.</p>
                      </div>
                    </div>
                    
                    {/* Test Runner Section */}
                    <div className="glass-card hud-border p-8 bg-purple-500/[0.02]">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                            <TestTube className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">Asset Validation</h3>
                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Automated Test Suite</p>
                          </div>
                        </div>
                        {!testResults && (
                          <Button 
                            onClick={handleRunTests}
                            disabled={testing}
                            variant="outline"
                            className="h-10 px-6 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 font-bold rounded-lg transition-all"
                          >
                            {testing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Run Validation
                          </Button>
                        )}
                      </div>
                      
                      {(testing || testResults) && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                          <TestDashboard results={testResults} isLoading={testing} />
                        </div>
                      )}
                    </div>

                    <div className="glass-card p-1">
                      <ContractDetails 
                        abi={compiledData.abi}
                        bytecode={compiledData.bytecode}
                        onDeploy={handleDeploy}
                        deploying={deploying}
                      />
                    </div>
                    <button id="deploy-btn" className="hidden" onClick={() => {}} />
                  </section>
                )}
              </>
            )}
          </div>

          <div className="space-y-8">
            <div className="glass-card hud-border p-8 sticky top-8 bg-white/[0.02]">
              <div className="flex items-center gap-3 mb-10">
                <Activity className="w-6 h-6 text-mantle-green" />
                <h3 className="text-xl font-black tracking-tight">Mission Status</h3>
              </div>
              
              <DeployProgress steps={steps} />
              
              <div className="mt-12 pt-8 border-t border-white/5 space-y-6">
                <StatusItem label="Target Network" value="Mantle Sepolia" highlight />
                <StatusItem label="Wallet Status" value={isConnected ? "Authorized" : "Unauthorized"} error={!isConnected} />
                <StatusItem label="Asset Type" value={compiledData?.rwaCompliance?.isCompliant ? "RWA Standard" : "Generic Contract"} />
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

function StatusItem({ label, value, highlight = false, error = false }: { label: string, value: string, highlight?: boolean, error?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
      <span className={cn(
        "text-xs font-bold uppercase tracking-wider",
        highlight ? "text-mantle-green" : error ? "text-red-500" : "text-slate-300"
      )}>{value}</span>
    </div>
  );
}

function Github(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}
