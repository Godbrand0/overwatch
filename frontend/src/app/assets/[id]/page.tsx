"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  FileText,
  TrendingUp,
  ShieldCheck,
  ExternalLink,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Copy,
  Globe,
  FileCheck,
  Hash,
  Activity,
  DollarSign,
  BarChart3,
  Code,
  Link as LinkIcon,
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
  contractCode?: string;
  abi?: any[];
  compiledCode?: string;
  legalDocuments?: Array<{
    name: string;
    hash: string;
    url: string;
  }>;
  legalDocHashes?: string[];
  prizeDetails?: {
    apr: string;
    maturity: string;
    riskLevel: string;
  };
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
const mockAsset: Asset = {
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
    "Tokenized ownership of premium commercial real estate located in the heart of Manhattan's financial district. This 50,000 sq ft property includes office spaces, retail units, and luxury apartments, generating stable rental income from high-quality tenants.",
  explorerUrl:
    "https://sepolia.mantlescan.xyz/address/0x1234567890123456789012345678901234567890",
  docsHash: "QmXxx...xxx",
  trustScore: 95,
  nav: "$125,000,000",
  jurisdiction: "Delaware, USA",
  contractCode: `pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ManhattanPrimeRealEstate is ERC20, Ownable, ReentrancyGuard {
    struct Property {
        string location;
        uint256 valuation;
        uint256 lastValuationDate;
    }
    
    Property public property;
    mapping(address => uint256) public tokenHoldings;
    
    event PropertyValuated(uint256 newValuation, uint256 timestamp);
    event TokensRedeemed(address indexed to, uint256 amount);
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        string memory _propertyLocation,
        uint256 _initialValuation
    ) ERC20(_name, _symbol) {
        _mint(msg.sender, _initialSupply);
        property = Property({
            location: _propertyLocation,
            valuation: _initialValuation,
            lastValuationDate: block.timestamp
        });
    }
    
    function updatePropertyValuation(uint256 _newValuation) external onlyOwner {
        property.valuation = _newValuation;
        property.lastValuationDate = block.timestamp;
        emit PropertyValuated(_newValuation, block.timestamp);
    }
    
    function redeemTokens(uint256 _amount) external nonReentrant {
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        _burn(msg.sender, _amount);
        emit TokensRedeemed(msg.sender, _amount);
    }
}`,
  abi: [
    {
      type: "function",
      name: "updatePropertyValuation",
      inputs: [
        { name: "_newValuation", type: "uint256", internalType: "uint256" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "redeemTokens",
      inputs: [{ name: "_amount", type: "uint256", internalType: "uint256" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
  ],
  legalDocuments: [
    {
      name: "Property Deed",
      hash: "QmDeed123...abc",
      url: "https://ipfs.io/ipfs/QmDeed123...abc",
    },
    {
      name: "Legal Opinion",
      hash: "QmLegal456...def",
      url: "https://ipfs.io/ipfs/QmLegal456...def",
    },
    {
      name: "Valuation Report",
      hash: "QmVal789...ghi",
      url: "https://ipfs.io/ipfs/QmVal789...ghi",
    },
  ],
  prizeDetails: {
    apr: "7.5%",
    maturity: "5 years",
    riskLevel: "Low-Medium",
  },
  // RWA Information
  rwaType: "Real Estate",
  legalRight: "Ownership Rights",
  custodian: "0xCustodian12345678901234567890123456789012345678",
  offchainAssetId: "RE-MANHATTAN-2024-001",
  legalDocHashes: [
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12"
  ],
};

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAsset(mockAsset);
      setLoading(false);
    }, 1000);
  }, [params.id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            LOADING ASSET DETAILS...
          </p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-mantle-dark text-white bg-grid flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Asset Not Found</h2>
          <p className="text-slate-400 mb-6">
            The asset you're looking for doesn't exist or has been removed.
          </p>
          <Button
            onClick={() => router.back()}
            className="bg-mantle-green text-mantle-dark hover:bg-mantle-green/90"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mantle-dark text-white bg-grid">
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 text-slate-400 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assets
          </Button>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center ${getCategoryColor(
                  asset.category
                )}`}
              >
                {getCategoryIcon(asset.category)}
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">
                  {asset.name}
                </h1>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl font-mono text-slate-400">
                    {asset.symbol}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-sm ${getCategoryColor(asset.category)}`}
                  >
                    {asset.category}
                  </Badge>
                  {asset.isAnchored && (
                    <Badge className="bg-mantle-green/10 text-mantle-green border-mantle-green/20">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Anchored
                    </Badge>
                  )}
                  {asset.isVerified && (
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-slate-400 max-w-3xl">{asset.description}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {asset.nav && (
                <div className="text-right">
                  <p className="text-sm text-slate-500 mb-1">Net Asset Value</p>
                  <p className="text-3xl font-black text-mantle-green">
                    {asset.nav}
                  </p>
                </div>
              )}
              {asset.trustScore && (
                <div className="text-right">
                  <p className="text-sm text-slate-500 mb-1">Trust Score</p>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-2xl font-bold text-white">
                      {asset.trustScore}%
                    </span>
                    <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          asset.trustScore >= 90
                            ? "bg-mantle-green"
                            : asset.trustScore >= 70
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${asset.trustScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card hud-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Supply
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {asset.totalSupply}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hud-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Deployer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-white truncate">
                  {asset.deployer}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(asset.deployer)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hud-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Jurisdiction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-white">
                {asset.jurisdiction}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hud-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Deployed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-white">
                {new Date(asset.deployedAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prize Details */}
        {asset.prizeDetails && (
          <Card className="glass-card hud-border mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-mantle-green" />
                Investment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1">
                    Annual Percentage Rate
                  </p>
                  <p className="text-2xl font-bold text-mantle-green">
                    {asset.prizeDetails.apr}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Maturity Period</p>
                  <p className="text-2xl font-bold text-white">
                    {asset.prizeDetails.maturity}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Risk Level</p>
                  <Badge
                    className={`${
                      asset.prizeDetails.riskLevel === "Low"
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : asset.prizeDetails.riskLevel === "Medium"
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}
                  >
                    {asset.prizeDetails.riskLevel}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contract Information */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="glass-card hud-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-400" />
                Contract Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-2">Contract Address</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-white bg-white/5 px-3 py-2 rounded-lg flex-1 truncate">
                    {asset.contractAddress}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(asset.contractAddress)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" asChild>
                    <a
                      href={asset.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>

              {asset.docsHash && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">Document Hash</p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-white bg-white/5 px-3 py-2 rounded-lg flex-1 truncate">
                      {asset.docsHash}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyToClipboard(asset.docsHash!)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-slate-500 mb-2">Contract Status</p>
                <div className="flex gap-2">
                  {asset.isAnchored && (
                    <Badge className="bg-mantle-green/10 text-mantle-green border-mantle-green/20">
                      <Hash className="w-3 h-3 mr-1" />
                      Anchored
                    </Badge>
                  )}
                  {asset.isVerified && (
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                      <FileCheck className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hud-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Legal Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Display legal documents with names and URLs if available */}
                {asset.legalDocuments?.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {doc.name}
                        </p>
                        <p className="text-xs text-slate-500 font-mono truncate">
                          {doc.hash}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(doc.hash)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button size="icon" variant="ghost" asChild>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Display additional document hashes if they exist */}
                {asset.legalDocHashes && asset.legalDocHashes.length > 0 && (
                  <>
                    {asset.legalDocHashes.map((hash, index) => (
                      <div
                        key={`hash-${index}`}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-sm font-medium text-white">
                              Legal Document {asset.legalDocuments ? asset.legalDocuments.length + index + 1 : index + 1}
                            </p>
                            <p className="text-xs text-slate-500 font-mono truncate">
                              {hash}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => copyToClipboard(hash)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RWA Information */}
        <Card className="glass-card hud-border mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-mantle-green" />
              RWA Trust Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-2">RWA Type</p>
                <p className="text-lg font-semibold text-white">{asset.rwaType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-2">Legal Right</p>
                <p className="text-lg font-semibold text-white">{asset.legalRight || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-2">Custodian</p>
                <p className="text-lg font-semibold text-white font-mono">{asset.custodian || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-2">Off-chain Asset ID</p>
                <p className="text-lg font-semibold text-white">{asset.offchainAssetId || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contract Code */}
        {asset.contractCode && (
          <Card className="glass-card hud-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-cyan-400" />
                Contract Source Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black/50 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-slate-300 font-mono">
                  <code>{asset.contractCode}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
