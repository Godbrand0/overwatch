"use client";

import { GitHubRepo } from "@/types/github";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Lock, Unlock, Star, GitBranch } from "lucide-react";
import Link from "next/link";

interface RepoCardProps {
  repo: GitHubRepo;
}

export function RepoCard({ repo }: RepoCardProps) {
  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5 text-gray-400" />
            <CardTitle className="text-xl font-bold text-white">
              {repo.name}
            </CardTitle>
          </div>
          {repo.private ? (
            <Lock className="w-4 h-4 text-yellow-500" />
          ) : (
            <Unlock className="w-4 h-4 text-green-500" />
          )}
        </div>
        <CardDescription className="text-gray-400 line-clamp-2">
          {repo.description || "No description provided."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          {repo.language && (
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              {repo.language}
            </div>
          )}
          <div className="flex items-center gap-1">
            <GitBranch className="w-4 h-4" />
            {repo.default_branch}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/deploy/${repo.id}`} className="w-full">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Select Repository
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
