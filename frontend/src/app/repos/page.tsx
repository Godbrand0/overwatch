"use client";

import { useEffect, useState } from "react";
import { RepoList } from "@/components/github/RepoList";
import { GitHubRepo } from "@/types/github";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function ReposPage() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const response = await fetch("/api/repos");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch repositories");
        }

        setRepos(data.repos);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRepos();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Repositories</h1>
          <p className="text-gray-400">
            Select a repository to deploy your smart contracts to Mantle Network.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-400 text-lg">Loading your repositories...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="bg-red-900/20 border-red-900/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <RepoList repos={repos} />
        )}
      </div>
    </div>
  );
}
