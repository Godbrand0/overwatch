"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, Activity, History, TestTube, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContractNavProps {
  address: string;
  isVerified: boolean;
}

const navItems = [
  {
    href: "",
    label: "Dashboard",
    icon: Terminal,
    requiresVerification: false,
  },
  {
    href: "/tests",
    label: "Tests",
    icon: TestTube,
    requiresVerification: false,
  },
  {
    href: "/rwa",
    label: "RWA Compliance",
    icon: ShieldCheck,
    requiresVerification: false,
  },
  {
    href: "/monitoring",
    label: "Monitoring",
    icon: Activity,
    requiresVerification: true,
  },
  {
    href: "/history",
    label: "History",
    icon: History,
    requiresVerification: true,
  },
];

export function ContractNav({ address, isVerified }: ContractNavProps) {
  const pathname = usePathname();
  const basePath = `/contract/${address}`;

  return (
    <nav className="bg-gray-800/50 border border-gray-700 rounded-xl p-2 mb-8">
      <div className="flex items-center gap-2 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = pathname === `${basePath}${item.href}`;
          const isLocked = item.requiresVerification && !isVerified;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={isLocked ? "#" : `${basePath}${item.href}`}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap",
                isActive && !isLocked
                  ? "bg-blue-600 text-white shadow-lg"
                  : isLocked
                  ? "bg-gray-700/30 text-gray-500 cursor-not-allowed"
                  : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
              )}
              onClick={(e) => isLocked && e.preventDefault()}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {isLocked && (
                <span className="ml-1 text-xs opacity-60">🔒</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
