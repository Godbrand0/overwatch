"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContractOverviewProps {
  contract: {
    address: string;
    name: string;
    network: string;
    deployed_at: string;
    verified_at?: string;
  };
}

export function ContractOverview({ contract }: ContractOverviewProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="md:col-span-2 bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold text-white mb-1">
                {contract.name}
              </CardTitle>
              <div className="flex items-center gap-2 text-gray-400 font-mono text-sm">
                {contract.address}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(contract.address)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                {contract.network}
              </Badge>
              {contract.verified_at && (
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 flex gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline" className="gap-2 border-gray-700 hover:bg-gray-700">
              <ExternalLink className="w-4 h-4" />
              View on Explorer
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Deployment Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-gray-400">
            <Clock className="w-4 h-4" />
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">Deployed At</p>
              <p className="text-sm">{new Date(contract.deployed_at).toLocaleString()}</p>
            </div>
          </div>
          {contract.verified_at && (
            <div className="flex items-center gap-3 text-gray-400">
              <ShieldCheck className="w-4 h-4" />
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">Verified At</p>
                <p className="text-sm">{new Date(contract.verified_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
