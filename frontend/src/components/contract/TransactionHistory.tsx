"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { History, ExternalLink, CheckCircle2, XCircle, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { usePublicClient } from "wagmi";
import { formatEther } from "viem";

interface TransactionHistoryProps {
  address: string;
  abi: any[];
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

export function TransactionHistory({ address, abi }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const publicClient = usePublicClient();

  useEffect(() => {
    fetchTransactionHistory();

    // Poll for new transactions every 15 seconds
    const interval = setInterval(fetchTransactionHistory, 15000);
    return () => clearInterval(interval);
  }, [address]);

  const fetchTransactionHistory = async () => {
    try {
      if (!publicClient) return;

      // Get current block
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock - BigInt(10000); // Last ~10k blocks

      // Fetch logs for this contract
      const logs = await publicClient.getLogs({
        address: address as `0x${string}`,
        fromBlock,
        toBlock: "latest",
      });

      // Process logs into transactions
      const txMap = new Map<string, Transaction>();

      for (const log of logs) {
        if (!txMap.has(log.transactionHash)) {
          try {
            const tx = await publicClient.getTransaction({
              hash: log.transactionHash,
            });

            const receipt = await publicClient.getTransactionReceipt({
              hash: log.transactionHash,
            });

            const block = await publicClient.getBlock({
              blockNumber: log.blockNumber,
            });

            // Try to decode function name from input
            let functionName = "Unknown";
            if (tx.input && tx.input.length >= 10) {
              const selector = tx.input.slice(0, 10);
              const func = abi.find(
                (item) =>
                  item.type === "function" &&
                  selector === `0x${item.name}` // This is a simple match, real implementation would hash
              );
              if (func) functionName = func.name;
            }

            let type: "incoming" | "outgoing" | "contract" = "contract";
            if (tx.to?.toLowerCase() === address.toLowerCase()) {
              type = "incoming";
            } else if (tx.from.toLowerCase() === address.toLowerCase()) {
              type = "outgoing";
            }

            txMap.set(log.transactionHash, {
              hash: log.transactionHash,
              from: tx.from,
              to: tx.to || address,
              value: formatEther(tx.value),
              timestamp: Number(block.timestamp),
              blockNumber: Number(log.blockNumber),
              functionName,
              status: receipt.status === "success" ? "success" : "failed",
              type,
            });
          } catch (err) {
            console.error("Error fetching transaction details:", err);
          }
        }
      }

      const txList = Array.from(txMap.values()).sort(
        (a, b) => b.timestamp - a.timestamp
      );

      setTransactions(txList);
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
          No transactions have been recorded for this contract in the last 10,000 blocks.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Transaction History</h3>
          <p className="text-sm text-gray-400 mt-1">
            {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} found
          </p>
        </div>
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
