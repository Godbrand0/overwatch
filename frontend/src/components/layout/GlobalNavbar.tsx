"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Rocket, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  fetchUserData,
  loginWithGithub,
  logout,
} from "@/store/slices/authSlice";

export function GlobalNavbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // Try to fetch user data on component mount
    dispatch(fetchUserData());
  }, [dispatch]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 flex items-center justify-center transition-transform group-hover:scale-110 overflow-hidden rounded-full">
              <img src="/logo.png" alt="Overwatch Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white -ml-1">
              verwatch
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavLink
              href="/dashboard"
              active={pathname.startsWith("/dashboard")}
            >
              Dashboard
            </NavLink>
            <NavLink
              href="/assets"
              active={pathname.startsWith("/assets")}
            >
              Assets
            </NavLink>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
              <img
                src={user.avatar_url}
                alt={user.github_username}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm font-medium hidden sm:inline">
                {user.github_username}
              </span>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-gray-700 hover:bg-gray-800"
              onClick={() => dispatch(loginWithGithub())}
              disabled={isLoading}
            >
              <Github className="w-4 h-4" />
              {isLoading ? "Connecting..." : "Connect"}
            </Button>
          )}
          <ConnectButton chainStatus="none" />
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active: boolean;
}) {
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
