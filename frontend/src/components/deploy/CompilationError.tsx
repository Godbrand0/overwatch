"use client";

import { AlertCircle, Terminal, RefreshCw, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompilationErrorProps {
  error: string;
  contractName: string;
  onRetry: () => void;
}

export function CompilationError({ error, contractName, onRetry }: CompilationErrorProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-2">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Compilation Failed</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            We encountered an error while compiling <span className="text-red-400 font-mono">{contractName}</span>. 
            Please check your Solidity code for syntax errors.
          </p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <Terminal className="w-3.5 h-3.5" />
            Compiler Output
          </div>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
          </div>
        </div>
        <div className="p-6">
          <pre className="text-sm font-mono text-red-400 whitespace-pre-wrap break-all leading-relaxed">
            {error}
          </pre>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Button 
          onClick={onRetry}
          className="bg-gray-800 hover:bg-gray-700 text-white px-8 h-12"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        <Button 
          variant="outline"
          className="border-gray-700 hover:bg-gray-700 px-8 h-12"
          onClick={() => window.location.reload()}
        >
          <FileCode className="w-4 h-4 mr-2" />
          Edit Source
        </Button>
      </div>
    </div>
  );
}
