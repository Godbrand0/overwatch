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
    label: "Compliance",
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
    <nav className="bg-gray-800/80 border-b border-gray-700 -mx-4 px-4 py-4 mb-8 backdrop-blur-sm">
      <div className="flex items-center gap-1 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = pathname === `${basePath}${item.href}`;
          const isLocked = item.requiresVerification && !isVerified;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={isLocked ? "#" : `${basePath}${item.href}`}
              className={cn(
                "flex items-center gap-2 px-6 py-3 font-semibold transition-all whitespace-nowrap relative",
                isActive && !isLocked
                  ? "text-blue-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-400"
                  : isLocked
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/30"
              )}
              onClick={(e) => isLocked && e.preventDefault()}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm uppercase tracking-wide">{item.label}</span>
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
