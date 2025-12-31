"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { ConstructorForm } from "./ConstructorForm";

interface ContractDetailsProps {
  abi: any[];
  bytecode: string;
  onDeploy: (args: any[]) => void;
  deploying: boolean;
}

export function ContractDetails({ abi, bytecode, onDeploy, deploying }: ContractDetailsProps) {
  const [copiedAbi, setCopiedAbi] = useState(false);
  const [copiedBytecode, setCopiedBytecode] = useState(false);
  const [showAbi, setShowAbi] = useState(false);
  const [showBytecode, setShowBytecode] = useState(false);

  const copyToClipboard = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Estimated Gas</p>
            <p className="text-xl font-mono text-blue-400">~0.0042 MNT</p>
          </div>
          <Zap className="w-8 h-8 text-blue-500/20" />
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Compiler</p>
            <p className="text-xl font-mono text-green-400">v0.8.20</p>
          </div>
          <Check className="w-8 h-8 text-green-500/20" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
          <button 
            onClick={() => setShowAbi(!showAbi)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
          >
            <span className="font-semibold">Contract ABI</span>
            {showAbi ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showAbi && (
            <div className="p-6 pt-0 border-t border-gray-700">
              <div className="relative mt-4">
                <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs font-mono text-gray-300 max-h-40">
                  {JSON.stringify(abi, null, 2)}
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                  onClick={() => copyToClipboard(JSON.stringify(abi), setCopiedAbi)}
                >
                  {copiedAbi ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
          <button 
            onClick={() => setShowBytecode(!showBytecode)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
          >
            <span className="font-semibold">Contract Bytecode</span>
            {showBytecode ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showBytecode && (
            <div className="p-6 pt-0 border-t border-gray-700">
              <div className="relative mt-4">
                <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs font-mono text-gray-300 max-h-40 break-all whitespace-pre-wrap">
                  {bytecode}
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                  onClick={() => copyToClipboard(bytecode, setCopiedBytecode)}
                >
                  {copiedBytecode ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Constructor Arguments</h3>
        <ConstructorForm 
          abi={abi}
          onDeploy={onDeploy}
          loading={deploying}
        />
      </div>
    </div>
  );
}
