"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WriteFunctionsProps {
  abi: any[];
  address: string;
}

export function WriteFunctions({ abi, address }: WriteFunctionsProps) {
  const writeFunctions = abi.filter(
    (item) =>
      item.type === "function" &&
      item.stateMutability !== "view" &&
      item.stateMutability !== "pure"
  );

  return (
    <div className="space-y-4">
      {writeFunctions.map((fn) => (
        <FunctionCard key={fn.name} fn={fn} address={address} />
      ))}
    </div>
  );
}

function FunctionCard({ fn, address }: { fn: any; address: string }) {
  const [expanded, setExpanded] = useState(false);
  const [args, setArgs] = useState<Record<string, string>>({});
  
  const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  });

  const handleWrite = async () => {
    try {
      // Prepare args array in correct order
      const argsArray = fn.inputs.map((input: any) => args[input.name]);
      
      writeContract({
        address: address as `0x${string}`,
        abi: [fn],
        functionName: fn.name,
        args: argsArray,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const isLoading = isWritePending || isConfirming;
  const error = writeError || receiptError;

  return (
    <Card className="bg-gray-800/50 border-gray-700 overflow-hidden">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-700/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center text-orange-400">
            <Send className="w-4 h-4" />
          </div>
          <span className="font-mono font-medium text-white">{fn.name}</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </div>

      {expanded && (
        <CardContent className="p-4 border-t border-gray-700 bg-gray-900/30">
          <div className="space-y-4">
            {fn.inputs.map((input: any) => (
              <div key={input.name} className="space-y-2">
                <Label className="text-xs text-gray-400">
                  {input.name || "input"} ({input.type})
                </Label>
                <Input
                  placeholder={input.type}
                  className="bg-gray-800 border-gray-700 h-8 text-sm"
                  value={args[input.name] || ""}
                  onChange={(e) => setArgs({ ...args, [input.name]: e.target.value })}
                />
              </div>
            ))}
            <Button
              size="sm"
              className="bg-orange-600 hover:bg-orange-700"
              onClick={handleWrite}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isWritePending ? "Confirming..." : "Processing..."}
                </>
              ) : (
                "Write"
              )}
            </Button>

            {error && (
              <div className="mt-4 p-3 bg-red-900/20 rounded border border-red-900/50">
                <p className="text-xs text-red-500 uppercase mb-1">Error</p>
                <p className="font-mono text-sm text-red-400 break-all">{error.message}</p>
              </div>
            )}

            {hash && (
              <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700">
                <p className="text-xs text-gray-500 uppercase mb-1">Transaction Hash</p>
                <a 
                  href={`https://sepolia.mantlescan.xyz/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-orange-400 break-all hover:underline"
                >
                  {hash}
                </a>
                {isConfirmed && (
                  <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Confirmed
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
