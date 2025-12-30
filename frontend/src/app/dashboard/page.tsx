"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Loader2, Plus, ExternalLink, ShieldCheck, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch("/api/user");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch dashboard data");
        }

        setUserData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-400 text-lg">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            MantleForge
          </Link>
          <div className="flex items-center gap-4">
            {userData?.user && (
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
                <img src={userData.user.avatar_url} alt={userData.user.github_username} className="w-6 h-6 rounded-full" />
                <span className="text-sm font-medium">{userData.user.github_username}</span>
              </div>
            )}
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
            <p className="text-gray-400">
              Manage your smart contracts on Mantle Network
            </p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Link href="/repos">
              <Plus className="w-4 h-4" />
              New Deployment
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <DashboardCard
            title="Total Contracts"
            value={userData?.stats.totalContracts.toString() || "0"}
            description="Deployed contracts"
          />
          <DashboardCard
            title="Active Deployments"
            value={userData?.stats.activeDeployments.toString() || "0"}
            description="Currently deploying"
          />
          <DashboardCard
            title="Verified Contracts"
            value={userData?.stats.verifiedContracts.toString() || "0"}
            description="On Mantle Explorer"
          />
        </div>

        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-xl font-semibold">Recent Activity</h3>
            <Button variant="ghost" size="sm" asChild className="text-blue-400 hover:text-blue-300">
              <Link href="/repos">View All Repos</Link>
            </Button>
          </div>
          
          <div className="p-0">
            {userData?.recentActivity.length > 0 ? (
              <div className="divide-y divide-gray-700">
                {userData.recentActivity.map((activity: any) => (
                  <div key={activity.id} className="p-4 hover:bg-gray-700/30 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <Github className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{activity.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{activity.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {activity.verified_at && (
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </Badge>
                      )}
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/contract/${activity.address}`}>
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Github className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400 mb-4">No recent activity. Start by deploying a contract from your GitHub!</p>
                <Button asChild variant="outline" className="border-gray-700 hover:bg-gray-700">
                  <Link href="/repos">Browse Repositories</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 hover:border-blue-500/50 transition-colors group">
      <h3 className="text-sm font-medium text-gray-400 mb-2 group-hover:text-blue-400 transition-colors">{title}</h3>
      <p className="text-4xl font-bold mb-1">{value}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
