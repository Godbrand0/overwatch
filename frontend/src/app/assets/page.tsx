"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Building2,
  FileText,
  TrendingUp,
  ShieldCheck,
  ExternalLink,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface Asset {
  id: string;
  name: string;
  symbol: string;
  category: string;
  contractAddress: string;
  deployer: string;
  deployedAt: string;
  isAnchored: boolean;
  isVerified: boolean;
  totalSupply: string;
  description?: string;
  explorerUrl: string;
  docsHash?: string;
  trustScore?: number;
  nav?: string;
  jurisdiction?: string;
  // New fields from database
  tokenName?: string;
  tokenSymbol?: string;
  rwaType?: string;
  legalRight?: string;
  custodian?: string;
  offchainAssetId?: string;
  legalDocHash?: string;
}

// Mock data for demonstration
const mockAssets: Asset[] = [
  {
    id: "1",
    name: "Manhattan Prime Real Estate",
    symbol: "MPRE",
    category: "Real Estate",
    contractAddress: "0x1234567890123456789012345678901234567890",
    deployer: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    deployedAt: "2024-01-15T10:30:00Z",
    isAnchored: true,
    isVerified: true,
    totalSupply: "1000000",
    description:
      "Tokenized ownership of premium commercial real estate in Manhattan",
    explorerUrl:
      "https://sepolia.mantlescan.xyz/address/0x1234567890123456789012345678901234567890",
    docsHash: "QmXxx...xxx",
    trustScore: 95,
    nav: "$125,000,000",
    jurisdiction: "Delaware, USA",
  },
  {
    id: "2",
    name: "US Treasury Bonds 2024",
    symbol: "USTB24",
    category: "Treasuries",
    contractAddress: "0x2345678901234567890123456789012345678901",
    deployer: "0xbcdefabcdefabcdefabcdefabcdefabcdefabcdef",
    deployedAt: "2024-02-20T14:45:00Z",
    isAnchored: true,
    isVerified: true,
    totalSupply: "50000000",
    description: "Tokenized US Treasury bonds with 2.5% annual yield",
    explorerUrl:
      "https://sepolia.mantlescan.xyz/address/0x2345678901234567890123456789012345678901",
    docsHash: "QmYyy...yyy",
    trustScore: 98,
    nav: "$50,000,000",
    jurisdiction: "Federal, USA",
  },
  {
    id: "3",
    name: "Gold Reserve Fund",
    symbol: "GRF",
    category: "Commodities",
    contractAddress: "0x3456789012345678901234567890123456789012",
    deployer: "0xcdefabcdefabcdefabcdefabcdefabcdefabcdef1",
    deployedAt: "2024-03-10T09:15:00Z",
    isAnchored: true,
    isVerified: false,
    totalSupply: "100000",
    description: "Fully backed physical gold reserves stored in secure vaults",
    explorerUrl:
      "https://sepolia.mantlescan.xyz/address/0x3456789012345678901234567890123456789012",
    docsHash: "QmZzz...zzz",
    trustScore: 92,
    nav: "$200,000,000",
    jurisdiction: "Switzerland",
  },
  {
    id: "4",
    name: "Corporate Bond Portfolio",
    symbol: "CBP",
    category: "Fixed Income",
    contractAddress: "0x4567890123456789012345678901234567890123",
    deployer: "0xdefabcdefabcdefabcdefabcdefabcdefabcdef12",
    deployedAt: "2024-04-05T16:20:00Z",
    isAnchored: false,
    isVerified: true,
    totalSupply: "25000000",
    description: "Diversified portfolio of investment-grade corporate bonds",
    explorerUrl:
      "https://sepolia.mantlescan.xyz/address/0x4567890123456789012345678901234567890123",
    trustScore: 85,
    nav: "$25,000,000",
    jurisdiction: "New York, USA",
  },
  {
    id: "5",
    name: "Renewable Energy Credits",
    symbol: "REC",
    category: "Energy",
    contractAddress: "0x5678901234567890123456789012345678901234",
    deployer: "0xefabcdefabcdefabcdefabcdefabcdefabcdef123",
    deployedAt: "2024-05-12T11:30:00Z",
    isAnchored: true,
    isVerified: true,
    totalSupply: "10000000",
    description:
      "Tokenized renewable energy certificates from solar and wind projects",
    explorerUrl:
      "https://sepolia.mantlescan.xyz/address/0x5678901234567890123456789012345678901234",
    docsHash: "QmAaa...aaa",
    trustScore: 88,
    nav: "$10,000,000",
    jurisdiction: "California, USA",
  },
  {
    id: "6",
    name: "Fine Art Collection",
    symbol: "FAC",
    category: "Art & Collectibles",
    contractAddress: "0x6789012345678901234567890123456789012345",
    deployer: "0xfabcdefabcdefabcdefabcdefabcdefabcdef1234",
    deployedAt: "2024-06-18T13:45:00Z",
    isAnchored: true,
    isVerified: true,
    totalSupply: "10000",
    description: "Curated collection of authenticated fine art pieces",
    explorerUrl:
      "https://sepolia.mantlescan.xyz/address/0x6789012345678901234567890123456789012345",
    docsHash: "QmBbb...bbb",
    trustScore: 90,
    nav: "$50,000,000",
    jurisdiction: "Luxembourg",
  },
];

const categories = [
  "All",
  "Real Estate",
  "Treasuries",
  "Commodities",
  "Fixed Income",
  "Energy",
  "Art & Collectibles",
];

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAssets(mockAssets);
      setFilteredAssets(mockAssets);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = assets;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (asset) => asset.category === selectedCategory
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (asset) =>
          asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAssets(filtered);
  }, [assets, searchTerm, selectedCategory]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Real Estate":
        return <Building2 className="w-5 h-5" />;
      case "Treasuries":
      case "Fixed Income":
        return <FileText className="w-5 h-5" />;
      case "Commodities":
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <ShieldCheck className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Real Estate":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Treasuries":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "Commodities":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "Fixed Income":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Energy":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "Art & Collectibles":
        return "bg-pink-500/10 text-pink-400 border-pink-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mantle-dark text-white bg-grid flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-mantle-green/20 border-t-mantle-green rounded-full animate-spin mx-auto mb-4" />
          <p className="text-mantle-green font-mono tracking-widest animate-pulse">
            LOADING ASSETS...
          </p>
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
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
                Verified Assets
              </span>
            </div>
            <h2 className="text-4xl font-black tracking-tight">RWA Assets</h2>
            <p className="text-slate-400 mt-1">
              Explore{" "}
              <span className="text-white font-medium">
                {filteredAssets.length}
              </span>{" "}
              deployed, verified, and anchored real-world assets.
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or symbol..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-mantle-green/50 focus:bg-white/10 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`${
                  selectedCategory === category
                    ? "bg-mantle-green text-mantle-dark hover:bg-mantle-green/90"
                    : "border-white/10 bg-white/5 hover:bg-white/10 text-white"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Assets Grid */}
        {filteredAssets.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map((asset) => (
              <Card
                key={asset.id}
                className="glass-card hud-border hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              >
                <Link href={`/assets/${asset.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(
                            asset.category
                          )}`}
                        >
                          {getCategoryIcon(asset.category)}
                        </div>
                        <div>
                          <CardTitle className="text-lg text-white group-hover:text-mantle-green transition-colors">
                            {asset.name}
                          </CardTitle>
                          <p className="text-sm text-slate-400 font-mono">
                            {asset.symbol}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        {asset.isAnchored && (
                          <Badge className="bg-mantle-green/10 text-mantle-green border-mantle-green/20 px-2 py-0.5 text-[10px]">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Anchored
                          </Badge>
                        )}
                        {asset.isVerified && (
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-2 py-0.5 text-[10px]">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Category</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getCategoryColor(
                            asset.category
                          )}`}
                        >
                          {asset.category}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <ExternalLink className="w-4 h-4 text-slate-400 hover:text-mantle-green transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <div className="glass-card hud-border p-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
              <AlertCircle className="w-10 h-10 text-slate-600" />
            </div>
            <h4 className="text-xl font-bold mb-2">No Assets Found</h4>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Try adjusting your search or filter criteria to find the assets
              you're looking for.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              className="bg-white/5 hover:bg-white/10 border border-white/10 font-bold px-8 h-12 rounded-xl"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
