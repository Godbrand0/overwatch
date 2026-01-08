"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Zap, TrendingUp, Users, DollarSign, AlertCircle, CheckCircle2, Radio, Gauge, Clock, Database } from "lucide-react";
import { usePublicClient } from "wagmi";
import { formatEther, decodeEventLog } from "viem";
import { MANTLE_NETWORKS } from "@/lib/mantle";

interface ContractMonitoringProps {
  address: string;
  abi: any[];
  contractName?: string;
  deployedBlockNumber?: number | null;
}

interface EventLog {
  id: string;
  eventName: string;
  args: any;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
}

interface ContractStats {
  totalTransactions: number;
  totalValue: string;
  uniqueInteractors: number;
  lastActivity: number;
  eventCount: number;
}

export function ContractMonitoring({ address, abi, contractName, deployedBlockNumber }: ContractMonitoringProps) {
  const [events, setEvents] = useState<EventLog[]>([]);
  const [stats, setStats] = useState<ContractStats>({
    totalTransactions: 0,
    totalValue: "0",
    uniqueInteractors: 0,
    lastActivity: 0,
    eventCount: 0,
  });
  const [networkStats, setNetworkStats] = useState({
    gasPrice: "0",
    avgGasPrice: "0",
    blockTime: 0,
    avgBlockTime: 0,
  });
  const [oracleData, setOracleData] = useState<{ price: string; lastUpdate: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const publicClient = usePublicClient();

  // Get all events from ABI
  const contractEvents = abi.filter((item) => item.type === "event");

  // Watch for new events in real-time
  useEffect(() => {
    if (!isLive || contractEvents.length === 0 || !publicClient) return;

    const unwatch = publicClient.watchContractEvent({
      address: address as `0x${string}`,
      abi,
      onLogs: (logs) => {
        const newEvents = logs.map((log) => {
          let eventName = "Contract Event";
          let decodedArgs: any = {};

          try {
            const decoded: any = decodeEventLog({
              abi,
              data: log.data,
              topics: log.topics,
            });
            eventName = decoded.eventName || "Contract Event";
            decodedArgs = decoded.args || {};
          } catch {
            // If decoding fails, use raw log data
          }

          return {
            id: `${log.transactionHash}-${log.logIndex}`,
            eventName,
            args: decodedArgs,
            timestamp: Date.now() / 1000,
            transactionHash: log.transactionHash,
            blockNumber: Number(log.blockNumber),
          };
        });

        setEvents((prev) => [...newEvents, ...prev].slice(0, 50));
        setStats((prev) => ({
          ...prev,
          eventCount: prev.eventCount + newEvents.length,
          lastActivity: Date.now() / 1000,
        }));
      },
    });

    return () => {
      unwatch();
    };
  }, [address, abi, isLive, publicClient, contractEvents.length]);

  // Fetch historical events and stats
  useEffect(() => {
    fetchHistoricalData();
  }, [address]);

  const fetchHistoricalData = async () => {
    try {
      if (!publicClient) return;

      const chainId = await publicClient.getChainId();
      const isTestnet = chainId === 5003;
      const explorerApiUrl = isTestnet 
        ? MANTLE_NETWORKS.testnet.explorerApiUrl 
        : MANTLE_NETWORKS.mainnet.explorerApiUrl;

      // Fetch transactions from Proxy API for stats
      const chainIdParam = isTestnet ? MANTLE_NETWORKS.testnet.chainId : MANTLE_NETWORKS.mainnet.chainId;
      const response = await fetch(
        `/api/contracts/${address}/history?chainid=${chainIdParam}&startblock=0`
      );
      
      const data = await response.json();
      
      if (data.status === "1" && Array.isArray(data.result)) {
        const txs = data.result;
        const interactors = new Set<string>();
        let totalValue = BigInt(0);

        txs.forEach((tx: any) => {
          interactors.add(tx.from.toLowerCase());
          totalValue += BigInt(tx.value);
        });

        // Also fetch events for the event feed
        // We can still use getLogs for events, or use the explorer API for logs if preferred.
        // For now, let's keep getLogs for events but limit the range to recent blocks for performance,
        // OR use the explorer API for logs too if we want full history without RPC limits.
        
        // Let's stick to RPC for events for now but only recent ones to populate the feed
        // Fetch events using Proxy API (Explorer API) to bypass RPC limits
        const logsResponse = await fetch(
          `/api/contracts/${address}/history?chainid=${chainIdParam}&module=logs&action=getLogs&fromBlock=0&toBlock=latest`
        );
        const logsData = await logsResponse.json();
        
        let logs: any[] = [];
        if (logsData.status === "1" && Array.isArray(logsData.result)) {
           logs = logsData.result;
        } else {
           console.warn("Failed to fetch logs from explorer:", logsData);
           // Fallback to RPC if explorer fails (optional, but good for robustness)
           // For now, let's just log it.
        }
        console.log("Fetched logs from explorer:", logs);

        const eventLogs: EventLog[] = [];
        
        for (const log of logs.slice(0, 50)) { // Process recent logs
           try {
             // Explorer API logs usually have timeStamp. If not, fetch block.
             let timestamp = 0;
             if (log.timeStamp) {
                // Explorer API returns timestamp in hex or decimal string (seconds)
                timestamp = Number(log.timeStamp);
             } else {
                const block = await publicClient.getBlock({ blockNumber: BigInt(log.blockNumber) });
                timestamp = Number(block.timestamp);
             }
             
             let eventName = "Unknown Event";
             let decodedArgs: any = {};

             try {
                const decoded: any = decodeEventLog({
                  abi,
                  data: log.data,
                  topics: log.topics,
                });
                eventName = decoded.eventName || "Unknown Event";
                decodedArgs = decoded.args || {};
             } catch {
                // ignore
             }

             eventLogs.push({
               id: `${log.transactionHash}-${log.logIndex}`,
               eventName,
               args: decodedArgs,
               timestamp,
               transactionHash: log.transactionHash,
               blockNumber: Number(log.blockNumber),
             });
           } catch (err) {
             console.error("Error processing log:", err);
           }
        }
         console.log("Processed event logs:", eventLogs);

        setEvents(eventLogs.sort((a, b) => b.timestamp - a.timestamp));
        setStats({
          totalTransactions: txs.length,
          totalValue: formatEther(totalValue),
          uniqueInteractors: interactors.size,
          lastActivity: txs.length > 0 ? Number(txs[0].timeStamp) : 0,
          eventCount: logs.length, // This is just recent events count now, or we could fetch total event count from explorer if needed
        });
      }
    } catch (error) {
      console.error("Error fetching historical data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Network Health and Oracle Data
  useEffect(() => {
    const fetchNetworkAndOracle = async () => {
      if (!publicClient) return;

      try {
        // 1. Gas Price & Block Time
        const currentBlock = await publicClient.getBlock();
        const gasPrice = await publicClient.getGasPrice();
        
        // Fetch recent blocks for averages
        const blocksToFetch = 10;
        const recentBlocks = await Promise.all(
          Array.from({ length: blocksToFetch }).map((_, i) => 
            publicClient.getBlock({ blockNumber: currentBlock.number - BigInt(i) })
          )
        );

        // Calculate Block Times
        const currentBlockTime = Number(recentBlocks[0].timestamp) - Number(recentBlocks[1].timestamp);
        const avgBlockTime = (Number(recentBlocks[0].timestamp) - Number(recentBlocks[blocksToFetch - 1].timestamp)) / (blocksToFetch - 1);

        // Calculate Average Gas (Base Fee)
        // If baseFeePerGas is available, use it. Otherwise fallback to current gasPrice.
        const totalGas = recentBlocks.reduce((acc, b) => acc + (b.baseFeePerGas || gasPrice), 0n);
        const avgGas = totalGas / BigInt(blocksToFetch);

        setNetworkStats({
          gasPrice: formatEther(gasPrice, "gwei"),
          avgGasPrice: formatEther(avgGas, "gwei"),
          blockTime: currentBlockTime,
          avgBlockTime: avgBlockTime,
        });

        // 3. Oracle Data (if applicable)
        // Check for getLatestPrice or latestRoundData
        const oracleFunction = abi.find(item => item.name === "getLatestPrice" || item.name === "latestRoundData");
        if (oracleFunction) {
           try {
             const data = await publicClient.readContract({
               address: address as `0x${string}`,
               abi,
               functionName: oracleFunction.name,
             });
             // Assuming standard Chainlink-like response or simple price
             // If it's a struct (latestRoundData), it usually returns [roundId, answer, startedAt, updatedAt, answeredInRound]
             // If it's simple getLatestPrice, it returns int/uint.
             
             let price = "0";
             let lastUpdate = Date.now() / 1000;

             if (Array.isArray(data)) {
                // likely latestRoundData: [roundId, answer, startedAt, updatedAt, answeredInRound]
                // answer is usually index 1
                price = data[1].toString();
                lastUpdate = Number(data[3]);
             } else {
                price = (data as any).toString();
             }

             setOracleData({ price, lastUpdate });
           } catch (err) {
             console.warn("Failed to fetch oracle data", err);
           }
        }

      } catch (error) {
        console.error("Error fetching network stats:", error);
      }
    };

    fetchNetworkAndOracle();
    const interval = setInterval(fetchNetworkAndOracle, 15000); // Update every 15s
    return () => clearInterval(interval);
  }, [publicClient, address, abi]);

  if (loading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-400">Initializing monitoring...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Status Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Radio className={`w-5 h-5 ${isLive ? "text-green-400" : "text-gray-500"}`} />
              {isLive && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full animate-ping" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-white">
                {isLive ? "Live Monitoring Active" : "Monitoring Paused"}
              </h4>
              <p className="text-xs text-gray-400">
                {isLive
                  ? "Real-time contract events are being tracked"
                  : "Click to resume live monitoring"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isLive
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {isLive ? "Pause" : "Resume"}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.eventCount}</div>
            <p className="text-xs text-gray-500 mt-1">Last 5,000 blocks</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalTransactions}</div>
            <p className="text-xs text-gray-500 mt-1">Unique interactions</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Interactors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.uniqueInteractors}</div>
            <p className="text-xs text-gray-500 mt-1">Unique addresses</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {parseFloat(stats.totalValue).toFixed(4)}
            </div>
            <p className="text-xs text-gray-500 mt-1">MNT transferred</p>
          </CardContent>
        </Card>
      </div>

      {/* Network & Oracle Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              Gas Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end mb-1">
              <div>
                <div className="text-2xl font-bold text-white">
                  {parseFloat(networkStats.gasPrice).toFixed(4)}
                </div>
                <p className="text-xs text-gray-500">Current (MNT)</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-300">
                  {parseFloat(networkStats.avgGasPrice).toFixed(4)}
                </div>
                <p className="text-xs text-gray-500">Avg (10 blks)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Block Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end mb-1">
              <div>
                <div className="text-2xl font-bold text-white">
                  {networkStats.blockTime.toFixed(1)} <span className="text-sm font-normal text-gray-500">s</span>
                </div>
                <p className="text-xs text-gray-500">Current</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-300">
                  {networkStats.avgBlockTime.toFixed(1)} <span className="text-sm font-normal text-gray-500">s</span>
                </div>
                <p className="text-xs text-gray-500">Avg (10 blks)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {oracleData && (
          <Card className="bg-purple-500/5 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-400 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Oracle Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {/* Heuristic: if price is huge, might be 8 decimals. If small, maybe 18 or 0. 
                    For now just show raw or try to format if it looks like standard USD (8 decimals) */}
                {(Number(oracleData.price) / 1e8).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Updated {new Date(oracleData.lastUpdate * 1000).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Events */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Recent Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No events detected yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Events will appear here as they are emitted by the contract
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg border transition-all ${
                    index === 0 && isLive
                      ? "bg-green-500/5 border-green-500/20 animate-in fade-in slide-in-from-top-2"
                      : "bg-gray-900/50 border-gray-700/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm text-white font-medium">
                            {event.eventName}
                          </span>
                          {index === 0 && isLive && (
                            <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-400 font-medium">
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          Block {event.blockNumber} • {new Date(event.timestamp * 1000).toLocaleString()}
                        </div>
                        {Object.keys(event.args).length > 0 && (
                          <div className="mt-2 p-2 bg-gray-800/50 rounded border border-gray-700/50">
                            <code className="text-xs text-gray-400">
                              {JSON.stringify(event.args, null, 2)}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                    <a
                      href={`https://sepolia.mantlescan.xyz/tx/${event.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors text-xs flex-shrink-0"
                    >
                      View Tx →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* RWA-Specific Monitoring */}
      {contractName && (
        <Card className="bg-purple-500/5 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              RWA Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-400">Compliance Events</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {events.filter((e) => e.eventName.toLowerCase().includes("compliance")).length}
                </div>
              </div>

              <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Transfer Events</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {events.filter((e) => e.eventName.toLowerCase().includes("transfer")).length}
                </div>
              </div>

              <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-gray-400">Restriction Events</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {events.filter((e) =>
                    e.eventName.toLowerCase().includes("restrict") ||
                    e.eventName.toLowerCase().includes("freeze")
                  ).length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
