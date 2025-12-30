"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadFunctionsProps {
  abi: any[];
  address: string;
}

export function ReadFunctions({ abi, address }: ReadFunctionsProps) {
  const readFunctions = abi.filter(
    (item) =>
      item.type === "function" &&
      (item.stateMutability === "view" || item.stateMutability === "pure")
  );

  return (
    <div className="space-y-4">
      {readFunctions.map((fn) => (
        <FunctionCard key={fn.name} fn={fn} address={address} />
      ))}
    </div>
  );
}

function FunctionCard({ fn, address }: { fn: any; address: string }) {
  const [expanded, setExpanded] = useState(false);
  const [args, setArgs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleRead = async () => {
    setLoading(true);
    try {
      // In a real app, we would use wagmi's useReadContract here
      // For the MVP, we simulate the read
      await new Promise((resolve) => setTimeout(resolve, 500));
      setResult("Sample Result");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700 overflow-hidden">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-700/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Play className="w-4 h-4" />
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
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleRead}
              disabled={loading}
            >
              {loading ? "Querying..." : "Query"}
            </Button>

            {result !== null && (
              <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700">
                <p className="text-xs text-gray-500 uppercase mb-1">Result</p>
                <p className="font-mono text-sm text-blue-400">{JSON.stringify(result)}</p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
