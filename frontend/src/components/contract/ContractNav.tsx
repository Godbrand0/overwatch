"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, Activity, History, TestTube, ShieldCheck, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContractNavProps {
  address: string;
  isVerified: boolean;
}

const navItems = [
  {
    href: "",
    label: "Overview",
    icon: Terminal,
    requiresVerification: false,
  },
  {
    href: "/tests",
    label: "Test Suite",
    icon: TestTube,
    requiresVerification: false,
  },
  {
    href: "/rwa",
    label: "Legal Vault",
    icon: ShieldCheck,
    requiresVerification: false,
  },
  {
    href: "/monitoring",
    label: "Live Feed",
    icon: Activity,
    requiresVerification: true,
  },
  {
    href: "/history",
    label: "Archive",
    icon: History,
    requiresVerification: true,
  },
];

export function ContractNav({ address, isVerified }: ContractNavProps) {
  const pathname = usePathname();
  const basePath = `/contract/${address}`;

  return (
    <nav className="glass-card hud-border p-1 bg-white/[0.02] overflow-hidden">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === `${basePath}${item.href}`;
          const isLocked = item.requiresVerification && !isVerified;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={isLocked ? "#" : `${basePath}${item.href}`}
              className={cn(
                "flex items-center gap-3 px-6 py-4 font-bold transition-all whitespace-nowrap relative group",
                isActive && !isLocked
                  ? "text-mantle-green bg-mantle-green/10"
                  : isLocked
                  ? "text-slate-600 cursor-not-allowed"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
              onClick={(e) => isLocked && e.preventDefault()}
            >
              <Icon className={cn(
                "w-4 h-4 transition-transform group-hover:scale-110",
                isActive ? "text-mantle-green" : "text-slate-500"
              )} />
              <span className="text-[10px] uppercase tracking-[0.2em]">{item.label}</span>
              
              {isActive && !isLocked && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-mantle-green shadow-[0_0_10px_rgba(0,255,209,0.5)]" />
              )}
              
              {isLocked && (
                <Lock className="w-3 h-3 ml-1 opacity-40" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
