"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { History, ExternalLink, CheckCircle2, XCircle, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { usePublicClient } from "wagmi";
import { formatEther, getFunctionSelector } from "viem";
import { MANTLE_NETWORKS } from "@/lib/mantle";

interface TransactionHistoryProps {
  address: string;
  abi: any[];
  deployedBlockNumber?: number | string | null;
  deployTxHash?: string | null;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  blockNumber: number;
  functionName?: string;
  status: "success" | "failed" | "pending";
  type: "incoming" | "outgoing" | "contract";
}

export function TransactionHistory({ address, abi, deployedBlockNumber, deployTxHash }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFromBlock, setSearchFromBlock] = useState<bigint | null>(null);
  const publicClient = usePublicClient();

  useEffect(() => {
    fetchTransactionHistory();

    // Poll for new transactions every 15 seconds
    const interval = setInterval(fetchTransactionHistory, 15000);
    return () => clearInterval(interval);
  }, [address, deployedBlockNumber]);

  const fetchTransactionHistory = async () => {
    try {
      if (!publicClient) return;

      const chainId = await publicClient.getChainId();
      const isTestnet = chainId === 5003;
      const explorerApiUrl = isTestnet 
        ? MANTLE_NETWORKS.testnet.explorerApiUrl 
        : MANTLE_NETWORKS.mainnet.explorerApiUrl;

      // Fetch transactions from Proxy API
      const startBlock = deployedBlockNumber || 0;
      const chainIdParam = isTestnet ? MANTLE_NETWORKS.testnet.chainId : MANTLE_NETWORKS.mainnet.chainId;
      
      const apiUrl = `/api/contracts/${address}/history?chainid=${chainIdParam}&startblock=${startBlock}`;

      const response = await fetch(apiUrl);
      
      const data = await response.json();
      
      if (data.status === "1" && Array.isArray(data.result)) {
        const txList: Transaction[] = data.result.map((tx: any) => {
          // Determine transaction type
          let type: "incoming" | "outgoing" | "contract" = "contract";
          if (tx.to.toLowerCase() === address.toLowerCase()) {
            type = "incoming";
          } else if (tx.from.toLowerCase() === address.toLowerCase()) {
            type = "outgoing";
          }

          // Try to decode function name if input exists
          let functionName = tx.functionName;
          if (!functionName && tx.input && tx.input.length >= 10) {
             const selector = tx.input.slice(0, 10);
             const func = abi.find((item) => {
               if (item.type !== "function") return false;
               try {
                 return getFunctionSelector(item) === selector;
               } catch {
                 return false;
               }
             });
             if (func) functionName = func.name;
          }
          
          // Clean up function name if it contains arguments (e.g. "method(uint256)")
          if (functionName && functionName.includes("(")) {
            functionName = functionName.split("(")[0];
          }

          return {
            hash: tx.hash,
            from: tx.from,
            to: tx.to || address,
            value: formatEther(BigInt(tx.value)),
            timestamp: Number(tx.timeStamp),
            blockNumber: Number(tx.blockNumber),
            functionName: functionName || "Contract Interaction",
            status: tx.isError === "0" ? "success" : "failed",
            type,
          };
        });

        setTransactions(txList);
      } else {
        console.warn("Explorer API returned no transactions or error:", data);
        // Fallback or empty list
        if (data.message === "No transactions found") {
           setTransactions([]);
        }
      }
    } catch (error) {
      console.error("Error fetching transaction history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-400">Loading transaction history...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
        <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Transactions Found</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          {deployedBlockNumber 
            ? `No transactions have been recorded for this contract since its deployment at block ${deployedBlockNumber}.`
            : "No transactions have been recorded for this contract in the last 10,000 blocks."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">Transaction History</h3>
          <p className="text-sm text-gray-400 mt-1">
            {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} found
          </p>
        </div>
        {searchFromBlock && (
          <div className="text-xs text-gray-500 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700/50">
            Searching from block <span className="text-blue-400 font-mono">{searchFromBlock.toString()}</span> to <span className="text-blue-400 font-mono">latest</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {transactions.map((tx) => (
          <Card key={tx.hash} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    tx.status === "success"
                      ? "bg-green-500/10 text-green-400"
                      : tx.status === "failed"
                      ? "bg-red-500/10 text-red-400"
                      : "bg-yellow-500/10 text-yellow-400"
                  }`}>
                    {tx.status === "success" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : tx.status === "failed" ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-white font-medium">
                        {tx.functionName || "Contract Interaction"}
                      </span>
                      {tx.type === "incoming" && (
                        <ArrowDownRight className="w-4 h-4 text-green-400" />
                      )}
                      {tx.type === "outgoing" && (
                        <ArrowUpRight className="w-4 h-4 text-orange-400" />
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">From:</span>
                        <code className="font-mono">{tx.from.slice(0, 10)}...{tx.from.slice(-8)}</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">To:</span>
                        <code className="font-mono">{tx.to.slice(0, 10)}...{tx.to.slice(-8)}</code>
                      </div>
                      {parseFloat(tx.value) > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Value:</span>
                          <code className="font-mono text-blue-400">{parseFloat(tx.value).toFixed(6)} MNT</code>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-gray-500 mb-2">
                    {new Date(tx.timestamp * 1000).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">Block {tx.blockNumber}</span>
                    <a
                      href={`https://sepolia.mantlescan.xyz/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
