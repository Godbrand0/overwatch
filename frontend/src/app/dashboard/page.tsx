"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">MantleForge</h1>
          <ConnectButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-gray-400">
            Manage your smart contracts on Mantle Network
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <DashboardCard
            title="Total Contracts"
            value="0"
            description="Deployed contracts"
          />
          <DashboardCard
            title="Active Deployments"
            value="0"
            description="Currently deploying"
          />
          <DashboardCard
            title="Verified Contracts"
            value="0"
            description="On Mantle Explorer"
          />
        </div>

        <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <p className="text-gray-400">No recent activity. Connect your GitHub to get started!</p>
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
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <h3 className="text-sm font-medium text-gray-400 mb-2">{title}</h3>
      <p className="text-4xl font-bold mb-1">{value}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
