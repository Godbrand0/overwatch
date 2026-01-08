"use client";

import { useEffect, useState } from "react";
import { FileCode, Folder, ChevronLeft, Loader2, Search, AlertCircle, ChevronRight, Cpu } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GitHubFile {
  name: string;
  path: string;
  type: "file" | "dir";
  sha: string;
}

interface ContractSelectorProps {
  repoId: string;
  selectedContract: string | null;
  onSelect: (contract: string) => void;
}

export function ContractSelector({
  repoId,
  selectedContract,
  onSelect,
}: ContractSelectorProps) {
  const [currentPath, setCurrentPath] = useState("");
  const [contents, setContents] = useState<GitHubFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchContents() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/repos/${repoId}/contents?path=${currentPath}`);
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error(`Server returned an invalid response: ${text.substring(0, 100)}...`);
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch repository contents");
        }

        setContents(data.contents);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchContents();
  }, [repoId, currentPath]);

  const navigateBack = () => {
    const parts = currentPath.split("/");
    parts.pop();
    setCurrentPath(parts.join("/"));
  };

  const filteredContents = contents.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const folders = filteredContents.filter(item => item.type === "dir");
  const files = filteredContents.filter(item => item.type === "file" && item.name.endsWith(".sol"));

  if (error) {
    return (
      <div className="glass-card hud-border p-10 text-center bg-red-500/[0.02] border-red-500/20">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
        <p className="text-slate-500 font-mono text-sm mb-6">{error}</p>
        <Button onClick={() => setCurrentPath("")} variant="outline" className="border-white/10 hover:bg-white/5">
          Reset to Root
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-mantle-green transition-colors" />
          <Input
            placeholder="Search repository manifest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-white/5 border-white/10 text-white rounded-xl focus:border-mantle-green/50 focus:ring-mantle-green/20 transition-all"
          />
        </div>
        {currentPath && (
          <Button
            variant="outline"
            onClick={navigateBack}
            className="h-12 px-6 border-white/10 bg-white/5 hover:bg-white/10 font-bold rounded-xl flex gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-lg border border-white/5 font-mono text-[10px] tracking-widest text-slate-500">
        <span className="text-mantle-green">ROOT</span>
        {currentPath.split('/').filter(Boolean).map((part, i) => (
          <span key={i} className="flex items-center gap-2">
            <ChevronRight className="w-3 h-3 text-slate-700" />
            <span className="text-slate-300">{part.toUpperCase()}</span>
          </span>
        ))}
      </div>

      {loading ? (
        <div className="glass-card hud-border flex flex-col items-center justify-center py-20 bg-white/[0.01]">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-mantle-green animate-spin" />
            <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-mantle-green/50 animate-pulse" />
          </div>
          <p className="mt-6 text-slate-500 font-mono text-[10px] tracking-[0.3em] uppercase animate-pulse">Scanning Directory...</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {folders.map((folder) => (
            <div
              key={folder.path}
              onClick={() => setCurrentPath(folder.path)}
              className="glass-card p-4 flex items-center justify-between cursor-pointer group hover:bg-white/[0.03] border-white/5 hover:border-mantle-green/20 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-mantle-green/10 group-hover:text-mantle-green transition-all border border-white/5 group-hover:border-mantle-green/20">
                  <Folder className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{folder.name}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-mantle-green transition-all group-hover:translate-x-1" />
            </div>
          ))}

          {files.map((file) => {
            const isSelected = selectedContract === file.path;
            return (
              <div
                key={file.path}
                onClick={() => onSelect(file.path)}
                className={cn(
                  "glass-card p-4 flex items-center justify-between cursor-pointer group transition-all",
                  isSelected
                    ? "bg-mantle-green/10 border-mantle-green/30 shadow-[0_0_20px_rgba(0,255,209,0.1)]"
                    : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/10"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all border",
                    isSelected 
                      ? "bg-mantle-green text-mantle-dark border-mantle-green" 
                      : "bg-white/5 text-slate-500 border-white/5 group-hover:text-white group-hover:bg-white/10"
                  )}>
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className={cn(
                      "font-bold transition-colors",
                      isSelected ? "text-white" : "text-slate-300 group-hover:text-white"
                    )}>
                      {file.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mt-0.5">Solidity Asset</span>
                  </div>
                </div>
                {isSelected && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-mantle-green uppercase tracking-widest">Selected</span>
                    <div className="w-2 h-2 rounded-full bg-mantle-green animate-pulse shadow-[0_0_8px_rgba(0,255,209,0.8)]" />
                  </div>
                )}
              </div>
            );
          })}

          {folders.length === 0 && files.length === 0 && (
            <div className="glass-card hud-border py-20 text-center bg-white/[0.01] border-dashed border-white/10">
              <FileCode className="w-16 h-16 text-slate-700 mx-auto mb-6 opacity-20" />
              <h4 className="text-xl font-bold text-slate-500">No Assets Detected</h4>
              <p className="text-slate-600 text-sm mt-2">No Solidity contracts found in this directory.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
