"use client";

import { useEffect, useState } from "react";
import { FileCode, Folder, ChevronLeft, Loader2, Search, AlertCircle } from "lucide-react";
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
        
        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error("Non-JSON response:", text);
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
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-xl">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-400 font-medium mb-4">{error}</p>
        <Button onClick={() => setCurrentPath("")} variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10">
          Back to Root
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {currentPath && (
          <Button
            variant="ghost"
            size="icon"
            onClick={navigateBack}
            className="text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>

      <div className="text-sm text-gray-500 font-mono bg-gray-900/50 p-2 rounded border border-gray-800">
        root/{currentPath}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
          <p className="text-gray-400">Loading contents...</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {folders.map((folder) => (
            <div
              key={folder.path}
              onClick={() => setCurrentPath(folder.path)}
              className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700/50 hover:border-gray-600 transition-all group"
            >
              <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                <Folder className="w-4 h-4" />
              </div>
              <span className="font-medium text-gray-200">{folder.name}</span>
            </div>
          ))}

          {files.map((file) => {
            const isSelected = selectedContract === file.path;
            return (
              <div
                key={file.path}
                onClick={() => onSelect(file.path)}
                className={cn(
                  "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all group",
                  isSelected
                    ? "bg-blue-500/10 border-blue-500"
                    : "bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 hover:border-gray-600"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  isSelected 
                    ? "bg-blue-500 text-white" 
                    : "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white"
                )}>
                  <FileCode className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium truncate",
                    isSelected ? "text-white" : "text-gray-200"
                  )}>
                    {file.name}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                )}
              </div>
            );
          })}

          {folders.length === 0 && files.length === 0 && (
            <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-dashed border-gray-700">
              <FileCode className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No Solidity contracts found in this directory.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
