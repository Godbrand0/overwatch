"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LayoutDashboard, Rocket, Github, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function GlobalNavbar() {
  const pathname = usePathname();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (err) {
        console.error("Failed to fetch user data for navbar:", err);
      }
    }
    fetchUserData();
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-600">
              MantleForge
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/" active={pathname === "/"}>
              <Home className="w-4 h-4" />
              Home
            </NavLink>
            <NavLink href="/dashboard" active={pathname.startsWith("/dashboard")}>
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </NavLink>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {userData?.user ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
              <img 
                src={userData.user.avatar_url} 
                alt={userData.user.github_username} 
                className="w-6 h-6 rounded-full" 
              />
              <span className="text-sm font-medium hidden sm:inline">
                {userData.user.github_username}
              </span>
            </div>
          ) : (
            <Link href="/api/auth/github">
              <Button variant="outline" size="sm" className="gap-2 border-gray-700 hover:bg-gray-800">
                <Github className="w-4 h-4" />
                Connect
              </Button>
            </Link>
          )}
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "text-white bg-gray-800"
          : "text-gray-400 hover:text-white hover:bg-gray-800/50"
      }`}
    >
      {children}
    </Link>
  );
}
