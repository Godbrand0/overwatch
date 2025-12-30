"use client";

import { GitHubRepo } from "@/types/github";
import { RepoCard } from "./RepoCard";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

interface RepoListProps {
  repos: GitHubRepo[];
}

const ITEMS_PER_PAGE = 10;

export function RepoList({ repos }: RepoListProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredRepos = useMemo(() => {
    return repos.filter((repo) =>
      repo.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [repos, search]);

  // Reset to first page when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filteredRepos.length / ITEMS_PER_PAGE);
  
  const paginatedRepos = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRepos.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRepos, currentPage]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search repositories..."
          className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {paginatedRepos.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No repositories found matching your search.
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedRepos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
