"use client";

import { useEffect } from "react";
import {
  Loader2,
  Plus,
  ExternalLink,
  ShieldCheck,
  Github,
  AlertCircle,
  Activity,
  Box,
  Lock,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchUserData, loginWithGithub } from "@/store/slices/authSlice";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { user, stats, recentActivity, isLoading, error } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // Try to fetch user data on component mount
    dispatch(fetchUserData());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mantle-dark flex flex-col items-center justify-center bg-grid">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-mantle-green/20 border-t-mantle-green rounded-full animate-spin" />
          <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-mantle-green animate-pulse" />
        </div>
        <p className="mt-8 text-mantle-green font-mono tracking-widest animate-pulse">
          INITIALIZING MISSION CONTROL...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-mantle-dark flex flex-col items-center justify-center p-4 bg-grid">
        <div className="glass-card hud-border p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">System Alert</h2>
          <p className="text-slate-400 mb-6 font-mono text-sm">{error}</p>
          <div className="flex flex-col gap-3">
            <Button
              asChild
              className="bg-mantle-green text-mantle-dark hover:bg-mantle-green/90 font-bold"
              onClick={() => dispatch(loginWithGithub())}
              disabled={isLoading}
            >
              <Link href="/api/auth/github">
                <Github className="w-4 h-4 mr-2" />
                Re-authenticate Session
              </Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className="text-slate-500 hover:text-white"
            >
              <Link href="/">Abort to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mantle-dark text-white bg-grid">
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-mantle-green mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
                System Active
              </span>
            </div>
            <h2 className="text-4xl font-black tracking-tight">
              Mission Control
            </h2>
            <p className="text-slate-400 mt-1">
              Overseeing{" "}
              <span className="text-white font-medium">
                {stats?.totalContracts || 0}
              </span>{" "}
              active RWA deployments on Mantle.
            </p>
          </div>
          <Button
            asChild
            className="bg-mantle-green text-mantle-dark hover:bg-mantle-green/90 font-bold h-12 px-6 rounded-xl shadow-[0_0_15px_rgba(0,255,209,0.2)]"
          >
            <Link href="/repos">
              <Plus className="w-5 h-5 mr-2" />
              New RWA Deployment
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <DashboardCard
            icon={<Box className="w-5 h-5" />}
            title="Total Deployments"
            value={stats?.totalContracts.toString() || "0"}
            sub="Active Contracts"
          />
          <DashboardCard
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Anchored Assets"
            value={stats?.rwaContracts?.toString() || "0"}
            sub="Verified Trust Layer"
            highlight
          />
          <DashboardCard
            icon={<Lock className="w-5 h-5" />}
            title="Explorer Verified"
            value={stats?.verifiedContracts?.toString() || "0"}
            sub="Source Code Public"
          />
        </div>

        {/* Recent Activity */}
        <div className="glass-card hud-border overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-mantle-green animate-pulse" />
              <h3 className="text-lg font-bold tracking-tight">
                Live Asset Feed
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-mantle-green hover:bg-mantle-green/10 font-bold uppercase tracking-widest text-[10px]"
            >
              <Link href="/repos">Access All Repositories</Link>
            </Button>
          </div>

          <div className="p-0">
            {recentActivity && recentActivity.length > 0 ? (
              <div className="divide-y divide-white/5">
                {recentActivity.map((activity: any) => (
                  <div
                    key={activity.id}
                    className="p-6 hover:bg-white/[0.03] transition-all flex items-center justify-between group"
                  >
                    <Link
                      href={`/contract/${activity.address}`}
                      className="flex items-center gap-6 flex-1"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-mantle-green/10 group-hover:text-mantle-green transition-all border border-white/5 group-hover:border-mantle-green/20">
                        <Github className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-white group-hover:text-mantle-green transition-colors">
                          {activity.name}
                        </p>
                        <p className="text-xs text-slate-500 font-mono mt-1 tracking-wider">
                          {activity.address}
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-4">
                      {activity.is_anchored ? (
                        <Badge className="bg-mantle-green/10 text-mantle-green border-mantle-green/20 px-3 py-1 font-bold uppercase tracking-widest text-[10px]">
                          <ShieldCheck className="w-3 h-3 mr-1.5" />
                          Anchored
                        </Badge>
                      ) : activity.verified_at ? (
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1 font-bold uppercase tracking-widest text-[10px]">
                          Verified
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-slate-500 border-white/10 px-3 py-1 font-bold uppercase tracking-widest text-[10px]"
                        >
                          Pending
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="text-slate-500 hover:text-white hover:bg-white/5 rounded-lg"
                      >
                        <Link href={`/contract/${activity.address}`}>
                          <ExternalLink className="w-5 h-5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <Github className="w-10 h-10 text-slate-600" />
                </div>
                <h4 className="text-xl font-bold mb-2">
                  No Active Deployments
                </h4>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                  Your RWA command center is ready. Start by deploying a
                  contract from your GitHub repository.
                </p>
                <Button
                  asChild
                  className="bg-white/5 hover:bg-white/10 border border-white/10 font-bold px-8 h-12 rounded-xl"
                >
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
  icon,
  title,
  value,
  sub,
  highlight = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`glass-card p-6 hud-border group transition-all ${
        highlight ? "bg-mantle-green/[0.02]" : ""
      }`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors ${
          highlight
            ? "bg-mantle-green/20 text-mantle-green"
            : "bg-white/5 text-slate-400 group-hover:text-white group-hover:bg-white/10"
        }`}
      >
        {icon}
      </div>
      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">
        {title}
      </h3>
      <div className="flex items-baseline gap-2">
        <p className="text-4xl font-black text-white tracking-tight">{value}</p>
        <p className="text-[10px] font-bold text-mantle-green uppercase tracking-widest">
          {sub}
        </p>
      </div>
    </div>
  );
}
