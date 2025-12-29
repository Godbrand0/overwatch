# MantleForge - Complete Development Guide

> **GitHub-native DevOps dashboard for deploying, verifying, and monitoring smart contracts on Mantle Network**

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Project Structure](#project-structure)
5. [Smart Contract Setup](#smart-contract-setup)
6. [Backend Development](#backend-development)
7. [Frontend Development](#frontend-development)
8. [Mantle Integration](#mantle-integration)
9. [Deployment Guide](#deployment-guide)
10. [Testing Strategy](#testing-strategy)
11. [Demo Preparation](#demo-preparation)

---

## Project Overview

### What We're Building

MantleForge is a unified developer dashboard that consolidates the entire smart contract lifecycle:

- **Connect** GitHub repositories
- **Deploy** contracts to Mantle with one click
- **Verify** automatically on Mantle Explorer
- **Monitor** contract health in real-time
- **Interact** with read/write functions
- **Alert** on anomalies and errors

### Why This Matters for Mantle

- Reduces developer onboarding friction
- Leverages Mantle's modular architecture
- Showcases Mantle SDK capabilities
- Aligns with Mantle's institutional-grade infrastructure narrative
- Supports the RWA ecosystem by making deployment accessible

### Target Prize Categories

1. **Infrastructure & Tooling** ($15,000) - Primary
2. **Best Mantle Integration** ($4,000) - Secondary
3. **Best UX/Demo** ($5,000) - Secondary

### Core User Flow

```
1. User connects GitHub → OAuth
2. Select repository → Auto-detect contracts
3. Click Deploy → MetaMask signs transaction
4. Contract deploys → Auto-verify on explorer
5. Dashboard loads → Read/write/monitor interface
6. Live updates → Real-time transaction tracking
```

---

## Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────┐
│                     USER BROWSER                        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           FRONTEND (Next.js 14)                  │  │
│  │                                                   │  │
│  │  - GitHub OAuth UI                               │  │
│  │  - Repository Browser                            │  │
│  │  - Contract Deployment Interface                 │  │
│  │  - Contract Dashboard                            │  │
│  │  - Monitoring/Analytics                          │  │
│  │                                                   │  │
│  │  Libraries:                                      │  │
│  │  • RainbowKit (wallet connection)               │  │
│  │  • wagmi (contract interaction)                 │  │
│  │  • viem (Ethereum interactions)                 │  │
│  │  • shadcn/ui (components)                       │  │
│  │  • Recharts (analytics)                         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/WebSocket
                          ↓
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Next.js API Routes)               │
│                                                          │
│  ┌─────────────────┐  ┌──────────────────┐            │
│  │ GitHub Service  │  │ Mantle Service   │            │
│  │ - OAuth         │  │ - RPC Provider   │            │
│  │ - Repo Access   │  │ - Contract Deploy│            │
│  │ - Code Reading  │  │ - Verification   │            │
│  └─────────────────┘  └──────────────────┘            │
│                                                          │
│  ┌─────────────────┐  ┌──────────────────┐            │
│  │ Compiler Service│  │ Monitor Service  │            │
│  │ - Foundry       │  │ - Event Listener │            │
│  │ - ABI Extract   │  │ - Tx Tracking    │            │
│  └─────────────────┘  └──────────────────┘            │
│                                                          │
│  Database: PostgreSQL (Supabase)                        │
│  - Users, Repos, Contracts, Transactions, Alerts        │
└─────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                       │
│                                                          │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────┐ │
│  │ GitHub API   │  │ Mantle RPC    │  │ Mantle      │ │
│  │              │  │ Testnet/Main  │  │ Explorer API│ │
│  └──────────────┘  └───────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**

- Next.js 14 (App Router) - React framework
- TypeScript - Type safety
- TailwindCSS - Styling
- shadcn/ui - Component library
- RainbowKit - Wallet connection UI
- wagmi v2 - React hooks for Ethereum
- viem - Low-level Ethereum library
- Recharts - Data visualization

**Backend:**

- Next.js API Routes - Serverless functions
- Foundry - Solidity compilation
- Octokit - GitHub API client
- viem - Contract deployment
- ws - WebSocket server

**Database:**

- PostgreSQL (via Supabase)
- Supabase Client (No ORM needed)

**DevOps:**

- Vercel - Frontend/backend hosting
- GitHub Actions - CI/CD

---

## Prerequisites

### Required Tools

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **pnpm** - `npm install -g pnpm`
3. **Foundry** - [Installation Guide](https://book.getfoundry.sh/getting-started/installation)
4. **Git** - [Download](https://git-scm.com/)

### Required Accounts

1. **GitHub Account** - [Sign up](https://github.com/signup)
2. **GitHub OAuth App** - [Create OAuth App](https://github.com/settings/developers)
3. **Supabase Account** - [Sign up](https://supabase.com/)
4. **Vercel Account** - [Sign up](https://vercel.com/signup)
5. **MetaMask Wallet** - [Install](https://metamask.io/)

### Mantle Network Setup

1. **Add Mantle Testnet to MetaMask:**

   - Network Name: `Mantle Testnet`
   - RPC URL: `https://rpc.sepolia.mantle.xyz`
   - Chain ID: `5003`
   - Currency Symbol: `MNT`
   - Block Explorer: `https://sepolia.mantlescan.xyz`

2. **Add Mantle Mainnet:**

   - Network Name: `Mantle Mainnet`
   - RPC URL: `https://rpc.mantle.xyz`
   - Chain ID: `5000`
   - Currency Symbol: `MNT`
   - Block Explorer: `https://mantlescan.xyz`

3. **Get Testnet MNT:**
   - Faucet: [https://faucet.sepolia.mantle.xyz](https://faucet.sepolia.mantle.xyz)

### Essential Mantle Documentation

- **Official Docs:** https://docs.mantle.xyz/network
- **Architecture Overview:** https://docs.mantle.xyz/network/system-information/architecture
- **Transaction Lifecycle:** https://docs.mantle.xyz/network/system-information/transaction-lifecycle
- **Deploy Smart Contracts:** https://docs.mantle.xyz/network/for-developers/how-to-guides/how-to-deploy-smart-contracts
- **Verify Contracts:** https://docs.mantle.xyz/network/for-developers/how-to-guides/how-to-verify-smart-contracts
- **Mantle SDK:** https://docs.mantle.xyz/network/for-developers/how-to-guides/how-to-use-mantle-sdk
- **Mantle Viem:** https://docs.mantle.xyz/network/for-developers/how-to-guides/how-to-use-mantle-viem
- **Testnet Explorer:** https://sepolia.mantlescan.xyz
- **Mainnet Explorer:** https://mantlescan.xyz
- **Quick Access Resources:** https://docs.mantle.xyz/network/for-developers/quick-access

---

## Project Structure

### Complete Directory Layout

```
mantleforge/
├── README.md
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── .env.local
├── .gitignore
│
├── contracts/                    # Smart contracts for testing
│   ├── src/
│   │   ├── SimpleToken.sol      # ERC20 example
│   │   ├── Staking.sol          # Staking example
│   │   └── NFT.sol              # ERC721 example
│   ├── test/
│   ├── foundry.toml
│   └── README.md
│
├── public/                       # Static assets
│   ├── logo.svg
│   └── demo-video.mp4
│
└── src/
    ├── app/                      # Next.js App Router
    │   ├── layout.tsx           # Root layout
    │   ├── page.tsx             # Landing page
    │   ├── dashboard/           # Main dashboard
    │   │   ├── page.tsx
    │   │   └── layout.tsx
    │   ├── repos/               # Repository browser
    │   │   └── page.tsx
    │   ├── deploy/              # Deployment flow
    │   │   └── [repoId]/
    │   │       └── page.tsx
    │   ├── contract/            # Contract dashboard
    │   │   └── [address]/
    │   │       ├── page.tsx
    │   │       └── layout.tsx
    │   └── api/                 # API Routes
    │       ├── auth/
    │       │   ├── github/
    │       │   │   └── route.ts
    │       │   └── callback/
    │       │       └── route.ts
    │       ├── repos/
    │       │   ├── route.ts
    │       │   └── [repoId]/
    │       │       ├── route.ts
    │       │       └── contracts/
    │       │           └── route.ts
    │       ├── deploy/
    │       │   └── route.ts
    │       ├── verify/
    │       │   └── route.ts
    │       ├── contracts/
    │       │   └── [address]/
    │       │       ├── route.ts
    │       │       ├── transactions/
    │       │       │   └── route.ts
    │       │       └── events/
    │       │           └── route.ts
    │       └── monitor/
    │           └── ws/
    │               └── route.ts
    │
    ├── components/              # React components
    │   ├── ui/                 # shadcn/ui components
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── input.tsx
    │   │   ├── dialog.tsx
    │   │   ├── alert.tsx
    │   │   └── ... (other shadcn components)
    │   ├── layout/
    │   │   ├── Header.tsx
    │   │   ├── Sidebar.tsx
    │   │   └── Footer.tsx
    │   ├── github/
    │   │   ├── RepoList.tsx
    │   │   ├── RepoCard.tsx
    │   │   └── BranchSelector.tsx
    │   ├── deploy/
    │   │   ├── ContractSelector.tsx
    │   │   ├── NetworkSelector.tsx
    │   │   ├── ConstructorForm.tsx
    │   │   ├── DeployButton.tsx
    │   │   └── DeployProgress.tsx
    │   ├── contract/
    │   │   ├── ContractOverview.tsx
    │   │   ├── ReadFunctions.tsx
    │   │   ├── WriteFunctions.tsx
    │   │   ├── TransactionHistory.tsx
    │   │   ├── EventLog.tsx
    │   │   └── Analytics.tsx
    │   ├── monitoring/
    │   │   ├── LiveFeed.tsx
    │   │   ├── GasChart.tsx
    │   │   ├── AlertPanel.tsx
    │   │   └── HealthStatus.tsx
    │   └── wallet/
    │       └── ConnectButton.tsx
    │
    ├── lib/                     # Utility libraries
    │   ├── utils.ts            # General utilities
    │   ├── github.ts           # GitHub API client
    │   ├── mantle.ts           # Mantle RPC client
    │   ├── compiler.ts         # Foundry integration
    │   ├── verification.ts     # Contract verification
    │   ├── monitor.ts          # Event monitoring
    │   ├── supabase.ts         # Supabase client
    │   └── wagmi.ts            # wagmi configuration
    │
    ├── hooks/                   # Custom React hooks
    │   ├── useGitHub.ts
    │   ├── useContract.ts
    │   ├── useDeployment.ts
    │   ├── useMonitoring.ts
    │   └── useAnalytics.ts
    │
    ├── types/                   # TypeScript types
    │   ├── github.ts
    │   ├── contract.ts
    │   ├── deployment.ts
    │   └── monitoring.ts
    │
    └── styles/
        └── globals.css          # Global styles
```

---

## Smart Contract Setup

### Example Contracts for Testing

These contracts will be used to demonstrate MantleForge's capabilities during the demo.

#### 1. Simple Token Contract (`contracts/src/SimpleToken.sol`)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleToken
 * @dev Basic ERC20 token for testing MantleForge deployment
 */
contract SimpleToken is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18;

    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
        emit TokensMinted(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @dev Mint new tokens (only owner)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Burn tokens from caller's balance
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev Get token info
     */
    function getInfo() external view returns (
        string memory tokenName,
        string memory tokenSymbol,
        uint256 totalSupply,
        uint8 decimals
    ) {
        return (name(), symbol(), totalSupply(), decimals());
    }
}
```

#### 2. Staking Contract (`contracts/src/Staking.sol`)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Staking
 * @dev Staking contract with reward distribution
 * Perfect for demonstrating MantleForge's monitoring capabilities
 */
contract Staking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken;
    uint256 public rewardRate; // Rewards per second per token
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    uint256 public totalStaked;

    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 newRate);

    constructor(
        address _stakingToken,
        uint256 _rewardRate
    ) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Invalid token address");
        stakingToken = IERC20(_stakingToken);
        rewardRate = _rewardRate;
        lastUpdateTime = block.timestamp;
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;

        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    /**
     * @dev Calculate reward per token
     */
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }

        return rewardPerTokenStored + (
            (block.timestamp - lastUpdateTime) * rewardRate * 1e18 / totalStaked
        );
    }

    /**
     * @dev Calculate earned rewards for an account
     */
    function earned(address account) public view returns (uint256) {
        return (
            stakedBalance[account] *
            (rewardPerToken() - userRewardPerTokenPaid[account]) / 1e18
        ) + rewards[account];
    }

    /**
     * @dev Stake tokens
     */
    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");

        totalStaked += amount;
        stakedBalance[msg.sender] += amount;

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    /**
     * @dev Unstake tokens
     */
    function unstake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot unstake 0");
        require(stakedBalance[msg.sender] >= amount, "Insufficient balance");

        totalStaked -= amount;
        stakedBalance[msg.sender] -= amount;

        stakingToken.safeTransfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    /**
     * @dev Claim rewards
     */
    function claimRewards() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards available");

        rewards[msg.sender] = 0;
        stakingToken.safeTransfer(msg.sender, reward);

        emit RewardPaid(msg.sender, reward);
    }

    /**
     * @dev Update reward rate (only owner)
     */
    function setRewardRate(uint256 _rewardRate) external onlyOwner updateReward(address(0)) {
        rewardRate = _rewardRate;
        emit RewardRateUpdated(_rewardRate);
    }

    /**
     * @dev Get staking info for an account
     */
    function getStakingInfo(address account) external view returns (
        uint256 staked,
        uint256 earnedRewards,
        uint256 currentRewardRate,
        uint256 totalStakedAmount
    ) {
        return (
            stakedBalance[account],
            earned(account),
            rewardRate,
            totalStaked
        );
    }
}
```

#### 3. Foundry Configuration (`contracts/foundry.toml`)

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.20"
optimizer = true
optimizer_runs = 200
via_ir = false

# Mantle Testnet
[rpc_endpoints]
mantle_testnet = "https://rpc.sepolia.mantle.xyz"
mantle_mainnet = "https://rpc.mantle.xyz"

# Mantle Explorer for verification
[etherscan]
mantle_testnet = { key = "${MANTLESCAN_API_KEY}", url = "https://api-sepolia.mantlescan.xyz/api" }
mantle_mainnet = { key = "${MANTLESCAN_API_KEY}", url = "https://api.mantlescan.xyz/api" }

# Gas settings optimized for Mantle
[profile.default.optimizer_details]
peephole = true
inliner = true
jumpdestRemover = true
orderLiterals = true
deduplicate = true
cse = true
constantOptimizer = true
yul = true

[profile.default.optimizer_details.yulDetails]
stackAllocation = true
optimizerSteps = 'dhfoDgvulfnTUtnIf'
```

#### 4. Installation Script (`contracts/install.sh`)

```bash
#!/bin/bash

# Install Foundry dependencies
forge install OpenZeppelin/openzeppelin-contracts --no-commit

echo "✅ Smart contract dependencies installed"
echo "📝 To compile: forge build"
echo "🧪 To test: forge test"
echo "🚀 To deploy: Use MantleForge dashboard!"
```

---

## Backend Development

### Why Supabase (Recommended for Hackathon)

For the **MantleForge hackathon MVP**, Supabase is the recommended database solution as it simplifies development significantly:

**Benefits of Supabase:**
- **Free PostgreSQL database** with generous limits
- **Built-in authentication** (can replace custom GitHub OAuth sessions)
- **Real-time subscriptions** for live contract monitoring
- **Auto-generated REST API** - no backend code needed for basic CRUD
- **Instant setup** - no complex database migrations required

**What you skip with Supabase:**
- Prisma ORM entirely
- Complex database schema management
- Most backend boilerplate code
- Database hosting and maintenance

**Example using Supabase directly:**
```typescript
// No Prisma, just Supabase client
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Save contract (no Prisma schema needed)
const { data, error } = await supabase
  .from('contracts')
  .insert({
    user_id: userId,
    address: contractAddress,
    abi: contractAbi,
    network: 'mantle_testnet'
  })
```

### Environment Variables (`.env.local`)

```bash
# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# GitHub OAuth
GITHUB_CLIENT_ID="your_github_oauth_app_client_id"
GITHUB_CLIENT_SECRET="your_github_oauth_app_client_secret"
GITHUB_CALLBACK_URL="http://localhost:3000/api/auth/callback"

# Mantle Networks
NEXT_PUBLIC_MANTLE_TESTNET_RPC="https://rpc.sepolia.mantle.xyz"
NEXT_PUBLIC_MANTLE_MAINNET_RPC="https://rpc.mantle.xyz"
NEXT_PUBLIC_MANTLE_TESTNET_CHAIN_ID="5003"
NEXT_PUBLIC_MANTLE_MAINNET_CHAIN_ID="5000"

# Mantle Explorer API (for verification)
MANTLESCAN_API_KEY="your_mantlescan_api_key"
MANTLE_TESTNET_EXPLORER_API="https://api-sepolia.mantlescan.xyz/api"
MANTLE_MAINNET_EXPLORER_API="https://api.mantlescan.xyz/api"

# NextAuth (for session management)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate_random_secret_here"

# Foundry path
FOUNDRY_PATH="/usr/local/bin/forge"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Database Schema (Supabase SQL)

```sql
-- Run this in Supabase SQL editor

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id TEXT UNIQUE NOT NULL,
  github_username TEXT NOT NULL,
  avatar_url TEXT,
  access_token TEXT, -- Encrypt in production!
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contracts table
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  network TEXT NOT NULL,
  name TEXT NOT NULL,
  abi JSONB NOT NULL,
  source_code TEXT,
  deployed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(address, network)
);

-- Index for quick lookups
CREATE INDEX idx_contracts_user ON contracts(user_id);
CREATE INDEX idx_contracts_address ON contracts(address);
```

### Supabase Client (`src/lib/supabase.ts`)

```typescript
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// TypeScript types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          github_id: string;
          github_username: string;
          avatar_url: string | null;
          access_token: string | null;
          created_at: string;
        };
        Insert: {
          github_id: string;
          github_username: string;
          avatar_url?: string;
          access_token?: string;
        };
      };
      contracts: {
        Row: {
          id: string;
          user_id: string;
          address: string;
          network: string;
          name: string;
          abi: any;
          source_code: string | null;
          deployed_at: string;
        };
        Insert: {
          user_id: string;
          address: string;
          network: string;
          name: string;
          abi: any;
          source_code?: string;
        };
      };
    };
  };
};
```

### Example Usage with Supabase

```typescript
// Save contract (no Prisma!)
const { data, error } = await supabase
  .from("contracts")
  .insert({
    user_id: userId,
    address: contractAddress,
    network: "mantle_testnet",
    name: "MyContract",
    abi: contractAbi,
    source_code: sourceCode,
  })
  .select()
  .single();

if (error) {
  throw new Error(`Database error: ${error.message}`);
}

return data;
```

### Core Backend Services

#### 1. GitHub Service (`src/lib/github.ts`)

```typescript
import { Octokit } from "@octokit/rest";

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  default_branch: string;
  language: string | null;
}

export interface GitHubFile {
  name: string;
  path: string;
  type: "file" | "dir";
  content?: string;
  sha: string;
}

export class GitHubService {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
  }

  /**
   * Get user's repositories
   */
  async getRepositories(): Promise<GitHubRepo[]> {
    const { data } = await this.octokit.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
      type: "all",
    });

    return data as GitHubRepo[];
  }

  /**
   * Get repository contents
   */
  async getRepositoryContents(
    owner: string,
    repo: string,
    path: string = ""
  ): Promise<GitHubFile[]> {
    const { data } = await this.octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    if (Array.isArray(data)) {
      return data.map((item) => ({
        name: item.name,
        path: item.path,
        type: item.type as "file" | "dir",
        sha: item.sha,
      }));
    }

    return [];
  }

  /**
   * Get file content
   */
  async getFileContent(
    owner: string,
    repo: string,
    path: string
  ): Promise<string> {
    const { data } = await this.octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    if ("content" in data && data.type === "file") {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }

    throw new Error("Not a file");
  }

  /**
   * Detect Solidity contracts in repository
   */
  async detectContracts(owner: string, repo: string): Promise<string[]> {
    const contracts: string[] = [];

    try {
      // Check common contract directories
      const directories = ["contracts", "src", "contracts/src"];

      for (const dir of directories) {
        try {
          const files = await this.getRepositoryContents(owner, repo, dir);

          for (const file of files) {
            if (file.type === "file" && file.name.endsWith(".sol")) {
              contracts.push(file.path);
            }
          }
        } catch (error) {
          // Directory doesn't exist, continue
          continue;
        }
      }
    } catch (error) {
      console.error("Error detecting contracts:", error);
    }

    return contracts;
  }

  /**
   * Check if repository has Foundry setup
   */
  async hasFoundrySetup(owner: string, repo: string): Promise<boolean> {
    try {
      await this.getFileContent(owner, repo, "foundry.toml");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get Foundry configuration
   */
  async getFoundryConfig(owner: string, repo: string): Promise<string | null> {
    try {
      return await this.getFileContent(owner, repo, "foundry.toml");
    } catch {
      return null;
    }
  }
}
```

#### 2. Mantle RPC Service (`src/lib/mantle.ts`)

```typescript
import {
  createPublicClient,
  createWalletClient,
  http,
  type Address,
  type Hash,
  type TransactionReceipt,
} from "viem";
import { mantle, mantleSepoliaTestnet } from "viem/chains";

/**
 * Mantle Network Configuration
 * Reference: https://docs.mantle.xyz/network/for-developers/quick-access
 */
export const MANTLE_NETWORKS = {
  testnet: {
    chain: mantleSepoliaTestnet,
    rpcUrl: process.env.NEXT_PUBLIC_MANTLE_TESTNET_RPC!,
    explorerUrl: "https://sepolia.mantlescan.xyz",
    explorerApiUrl: process.env.MANTLE_TESTNET_EXPLORER_API!,
  },
  mainnet: {
    chain: mantle,
    rpcUrl: process.env.NEXT_PUBLIC_MANTLE_MAINNET_RPC!,
    explorerUrl: "https://mantlescan.xyz",
    explorerApiUrl: process.env.MANTLE_MAINNET_EXPLORER_API!,
  },
} as const;

export type MantleNetwork = keyof typeof MANTLE_NETWORKS;

export class MantleService {
  private publicClient;
  private network: MantleNetwork;

  constructor(network: MantleNetwork = "testnet") {
    this.network = network;
    const config = MANTLE_NETWORKS[network];

    this.publicClient = createPublicClient({
      chain: config.chain,
      transport: http(config.rpcUrl),
    });
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(hash: Hash): Promise<TransactionReceipt> {
    return await this.publicClient.getTransactionReceipt({ hash });
  }

  /**
   * Get current block number
   */
  async getBlockNumber(): Promise<bigint> {
    return await this.publicClient.getBlockNumber();
  }

  /**
   * Get contract bytecode
   */
  async getBytecode(address: Address): Promise<string> {
    const code = await this.publicClient.getBytecode({ address });
    return code || "0x";
  }

  /**
   * Estimate gas for deployment
   */
  async estimateDeployGas(
    bytecode: string,
    constructorArgs?: string
  ): Promise<bigint> {
    const data = constructorArgs ? `${bytecode}${constructorArgs}` : bytecode;

    return await this.publicClient.estimateGas({
      data: data as `0x${string}`,
    });
  }

  /**
   * Get transaction by hash
   */
  async getTransaction(hash: Hash) {
    return await this.publicClient.getTransaction({ hash });
  }

  /**
   * Get logs for contract
   */
  async getLogs(params: {
    address?: Address;
    fromBlock?: bigint;
    toBlock?: bigint;
    event?: any;
  }) {
    return await this.publicClient.getLogs({
      address: params.address,
      fromBlock: params.fromBlock,
      toBlock: params.toBlock,
    });
  }

  /**
   * Watch for new blocks
   */
  watchBlocks(callback: (block: any) => void) {
    return this.publicClient.watchBlocks({
      onBlock: callback,
    });
  }

  /**
   * Get network config
   */
  getNetworkConfig() {
    return MANTLE_NETWORKS[this.network];
  }
}
```

#### 3. Compiler Service (`src/lib/compiler.ts`)

```typescript
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

export interface CompilationResult {
  success: boolean;
  abi: any[];
  bytecode: string;
  contractName: string;
  compilerVersion: string;
  sourceCode: string;
  error?: string;
}

/**
 * Foundry Compiler Service
 * Reference: https://book.getfoundry.sh/reference/forge/forge-build
 */
export class CompilerService {
  private foundryPath: string;
  private tempDir: string;

  constructor() {
    this.foundryPath = process.env.FOUNDRY_PATH || "forge";
    this.tempDir = path.join(process.cwd(), ".temp");
  }

  /**
   * Initialize temp directory
   */
  private async initTempDir(): Promise<void> {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error("Failed to create temp directory:", error);
    }
  }

  /**
   * Clean up temp files
   */
  private async cleanup(projectPath: string): Promise<void> {
    try {
      await fs.rm(projectPath, { recursive: true, force: true });
    } catch (error) {
      console.error("Cleanup failed:", error);
    }
  }

  /**
   * Compile Solidity contract using Foundry
   */
  async compileContract(
    sourceCode: string,
    contractName: string,
    solcVersion: string = "0.8.20"
  ): Promise<CompilationResult> {
    await this.initTempDir();

    const projectId = `compile_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;
    const projectPath = path.join(this.tempDir, projectId);

    try {
      // Create project structure
      await fs.mkdir(path.join(projectPath, "src"), { recursive: true });
      await fs.mkdir(path.join(projectPath, "out"), { recursive: true });

      // Write source code
      const contractPath = path.join(projectPath, "src", `${contractName}.sol`);
      await fs.writeFile(contractPath, sourceCode);

      // Create foundry.toml
      const foundryConfig = `
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "${solcVersion}"
optimizer = true
optimizer_runs = 200
via_ir = false
      `.trim();

      await fs.writeFile(path.join(projectPath, "foundry.toml"), foundryConfig);

      // Compile with Foundry
      const { stdout, stderr } = await execAsync(
        `${this.foundryPath} build --root ${projectPath} --force`
      );

      // Read compilation output
      const artifactPath = path.join(
        projectPath,
        "out",
        `${contractName}.sol`,
        `${contractName}.json`
      );

      const artifactContent = await fs.readFile(artifactPath, "utf-8");
      const artifact = JSON.parse(artifactContent);

      const result: CompilationResult = {
        success: true,
        abi: artifact.abi,
        bytecode: artifact.bytecode.object,
        contractName,
        compilerVersion: solcVersion,
        sourceCode,
      };

      // Cleanup
      await this.cleanup(projectPath);

      return result;
    } catch (error: any) {
      // Cleanup on error
      await this.cleanup(projectPath);

      return {
        success: false,
        abi: [],
        bytecode: "",
        contractName,
        compilerVersion: solcVersion,
        sourceCode,
        error: error.message || "Compilation failed",
      };
    }
  }

  /**
   * Extract constructor parameters from ABI
   */
  extractConstructorParams(abi: any[]): any[] {
    const constructor = abi.find((item) => item.type === "constructor");
    return constructor?.inputs || [];
  }

  /**
   * Encode constructor arguments
   */
  async encodeConstructorArgs(abi: any[], args: any[]): Promise<string> {
    // This would use ethers or viem to encode
    // For now, returning placeholder
    // TODO: Implement actual encoding
    return "0x";
  }
}
```

#### 4. Verification Service (`src/lib/verification.ts`)

```typescript
import axios from "axios";

export interface VerificationParams {
  contractAddress: string;
  sourceCode: string;
  contractName: string;
  compilerVersion: string;
  constructorArgs?: string;
  network: "testnet" | "mainnet";
}

export interface VerificationResult {
  success: boolean;
  message: string;
  guid?: string;
}

/**
 * Mantle Contract Verification Service
 * Reference: https://docs.mantle.xyz/network/for-developers/how-to-guides/how-to-verify-smart-contracts
 */
export class VerificationService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.MANTLESCAN_API_KEY || "";
  }

  /**
   * Get explorer API URL for network
   */
  private getExplorerApiUrl(network: "testnet" | "mainnet"): string {
    return network === "testnet"
      ? process.env.MANTLE_TESTNET_EXPLORER_API!
      : process.env.MANTLE_MAINNET_EXPLORER_API!;
  }

  /**
   * Verify contract on Mantle Explorer
   */
  async verifyContract(
    params: VerificationParams
  ): Promise<VerificationResult> {
    const apiUrl = this.getExplorerApiUrl(params.network);

    try {
      // Step 1: Submit verification request
      const response = await axios.post(
        `${apiUrl}`,
        new URLSearchParams({
          apikey: this.apiKey,
          module: "contract",
          action: "verifysourcecode",
          contractaddress: params.contractAddress,
          sourceCode: params.sourceCode,
          codeformat: "solidity-single-file",
          contractname: params.contractName,
          compilerversion: `v${params.compilerVersion}`,
          optimizationUsed: "1",
          runs: "200",
          constructorArguements: params.constructorArgs || "",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (response.data.status === "1") {
        const guid = response.data.result;

        // Step 2: Check verification status
        const statusResult = await this.checkVerificationStatus(
          guid,
          params.network
        );

        return {
          success: statusResult.success,
          message: statusResult.message,
          guid,
        };
      } else {
        return {
          success: false,
          message: response.data.result || "Verification failed",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Verification request failed",
      };
    }
  }

  /**
   * Check verification status
   */
  async checkVerificationStatus(
    guid: string,
    network: "testnet" | "mainnet"
  ): Promise<{ success: boolean; message: string }> {
    const apiUrl = this.getExplorerApiUrl(network);

    try {
      // Poll for verification result (max 10 attempts, 3s interval)
      for (let i = 0; i < 10; i++) {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const response = await axios.get(`${apiUrl}`, {
          params: {
            apikey: this.apiKey,
            module: "contract",
            action: "checkverifystatus",
            guid,
          },
        });

        const result = response.data.result;

        if (result === "Pass - Verified") {
          return {
            success: true,
            message: "Contract verified successfully",
          };
        } else if (result.includes("Fail")) {
          return {
            success: false,
            message: result,
          };
        }
        // If pending, continue polling
      }

      return {
        success: false,
        message: "Verification timeout",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Status check failed",
      };
    }
  }

  /**
   * Flatten Solidity source code
   * (Required for verification)
   */
  async flattenSource(sourcePath: string): Promise<string> {
    // This would use forge flatten or similar
    // For now, returning the source as-is
    // TODO: Implement actual flattening
    return "";
  }
}
```

### API Routes

#### 1. GitHub OAuth (`src/app/api/auth/github/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL!;

/**
 * Initiate GitHub OAuth flow
 * GET /api/auth/github
 */
export async function GET(request: NextRequest) {
  const scope = "repo read:user user:email";
  const state = Math.random().toString(36).substring(7);

  const authUrl = new URL("https://github.com/login/oauth/authorize");
  authUrl.searchParams.set("client_id", GITHUB_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", GITHUB_CALLBACK_URL);
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}
```

#### 2. GitHub OAuth Callback (`src/app/api/auth/callback/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { supabase } from "@/lib/supabase";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;

/**
 * Handle GitHub OAuth callback
 * GET /api/auth/callback
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect("/error?message=No code provided");
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error("Failed to get access token");
    }

    // Get user info
    const octokit = new Octokit({ auth: accessToken });
    const { data: userData } = await octokit.users.getAuthenticated();

    // Create or update user in database using Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({
        github_id: userData.id.toString(),
        github_username: userData.login,
        avatar_url: userData.avatar_url,
        email: userData.email,
        access_token: accessToken, // In production, encrypt this!
      })
      .select()
      .single();

    if (userError) {
      throw new Error(`Database error: ${userError.message}`);
    }

    // Set session cookie
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect("/error?message=Authentication failed");
  }
}
```

#### 3. Get Repositories (`src/app/api/repos/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { GitHubService } from "@/lib/github";

/**
 * Get user's GitHub repositories
 * GET /api/repos
 */
export async function GET(request: NextRequest) {
  const userId = request.cookies.get("userId")?.value;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user || !user.accessToken) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const github = new GitHubService(user.access_token);
    const repos = await github.getRepositories();

    // For hackathon simplicity, we'll skip repository sync to database
    // In production, you'd implement similar logic with Supabase

    return NextResponse.json({ repos });
  } catch (error: any) {
    console.error("Error fetching repos:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}
```

#### 4. Detect Contracts (`src/app/api/repos/[repoId]/contracts/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { GitHubService } from "@/lib/github";

/**
 * Detect Solidity contracts in repository
 * GET /api/repos/[repoId]/contracts
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { repoId: string } }
) {
  const userId = request.cookies.get("userId")?.value;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // For hackathon simplicity, we'll get user directly
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // For hackathon, we'll use a demo repo path instead of full database sync
    const repoPath = 'owner/repo'; // Replace with actual logic
    const [owner, repo] = repoPath.split('/');
    const github = new GitHubService(user.access_token);

    // Detect contracts
    const contractPaths = await github.detectContracts(owner, repo);

    // Get contract contents
    const contracts = await Promise.all(
      contractPaths.map(async (contractPath) => {
        const content = await github.getFileContent(owner, repo, contractPath);
        const fileName = contractPath.split("/").pop() || "";
        const contractName = fileName.replace(".sol", "");

        return {
          path: contractPath,
          name: contractName,
          content,
        };
      })
    );

    return NextResponse.json({ contracts });
  } catch (error: any) {
    console.error("Error detecting contracts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to detect contracts" },
      { status: 500 }
    );
  }
}
```

#### 5. Deploy Contract (`src/app/api/deploy/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { CompilerService } from "@/lib/compiler";
import { VerificationService } from "@/lib/verification";

/**
 * Deploy and verify contract
 * POST /api/deploy
 */
export async function POST(request: NextRequest) {
  const userId = request.cookies.get("userId")?.value;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      repositoryId,
      sourceCode,
      contractName,
      network,
      deployTxHash,
      contractAddress,
      constructorArgs,
      compilerVersion = "0.8.20",
    } = body;

    // Compile contract
    const compiler = new CompilerService();
    const compilationResult = await compiler.compileContract(
      sourceCode,
      contractName,
      compilerVersion
    );

    if (!compilationResult.success) {
      return NextResponse.json(
        { error: compilationResult.error || "Compilation failed" },
        { status: 400 }
      );
    }

    // Save contract to database using Supabase
    const { data: contract, error: dbError } = await supabase
      .from('contracts')
      .insert({
        user_id: userId,
        address: contractAddress,
        network: network,
        name: contractName,
        abi: compilationResult.abi,
        source_code: sourceCode,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue with deployment even if database fails for hackathon
    }

    // Verify contract (async, don't wait if no contract saved)
    if (contract) {
      const verifier = new VerificationService();
      verifier
        .verifyContract({
          contractAddress,
          sourceCode,
          contractName,
          compilerVersion,
          constructorArgs,
          network: network === 'mainnet' ? 'mainnet' : 'testnet',
        })
        .then(async (result) => {
          if (result.success && contract) {
            // Optionally mark as verified in Supabase
            await supabase
              .from('contracts')
              .update({ verified_at: new Date() })
              .eq('id', contract.id);
          }
        });
    }

    return NextResponse.json({ contract });
  } catch (error: any) {
    console.error("Deployment error:", error);
    return NextResponse.json(
      { error: error.message || "Deployment failed" },
      { status: 500 }
    );
  }
}
```

---

## Frontend Development

### Package.json Dependencies

```json
{
  "name": "mantleforge",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@octokit/rest": "^20.0.2",
    "@supabase/supabase-js": "^2.42.0",
    "@rainbow-me/rainbowkit": "^2.0.0",
    "@tanstack/react-query": "^5.17.0",
    "axios": "^1.6.5",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.303.0",
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.10.4",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7",
    "viem": "^2.7.0",
    "wagmi": "^2.5.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.1.0",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
```

### Wagmi Configuration (`src/lib/wagmi.ts`)

```typescript
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mantle, mantleSepoliaTestnet } from "wagmi/chains";

/**
 * Wagmi & RainbowKit Configuration
 * Reference: https://www.rainbowkit.com/docs/installation
 */
export const config = getDefaultConfig({
  appName: "MantleForge",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID", // Get from https://cloud.walletconnect.com/
  chains: [mantleSepoliaTestnet, mantle],
  ssr: true,
});
```

### Root Layout (`src/app/layout.tsx`)

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MantleForge - Deploy to Mantle in One Click",
  description: "GitHub-native DevOps dashboard for Mantle smart contracts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Providers Component (`src/components/Providers.tsx`)

```typescript
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { config } from "@/lib/wagmi";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### Landing Page (`src/app/page.tsx`)

```typescript
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, Zap, Shield, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Deploy to Mantle in One Click
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            GitHub-native DevOps dashboard for deploying, verifying, and
            monitoring smart contracts on Mantle Network
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/api/auth/github">
              <Button size="lg" className="gap-2">
                <Github className="w-5 h-5" />
                Connect GitHub
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <FeatureCard
            icon={<Zap className="w-10 h-10" />}
            title="One-Click Deploy"
            description="Deploy from GitHub to Mantle with automatic verification in seconds"
          />
          <FeatureCard
            icon={<Shield className="w-10 h-10" />}
            title="Auto-Verify"
            description="Contracts are automatically verified on Mantle Explorer"
          />
          <FeatureCard
            icon={<Activity className="w-10 h-10" />}
            title="Live Monitoring"
            description="Real-time transaction tracking and smart alerts"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="text-blue-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
```

---

## Mantle Integration

### Key Integration Points

1. **Mantle RPC for Contract Deployment**

   - Use viem with Mantle RPC endpoints
   - Reference: https://docs.mantle.xyz/network/for-developers/quick-access

2. **Mantle Explorer API for Verification**

   - Submit verification requests
   - Reference: https://docs.mantle.xyz/network/for-developers/how-to-guides/how-to-verify-smart-contracts

3. **Mantle SDK Usage** (Optional Enhancement)

   - Use official Mantle SDK for optimizations
   - Reference: https://docs.mantle.xyz/network/for-developers/how-to-guides/how-to-use-mantle-sdk

4. **Transaction Lifecycle Monitoring**
   - Follow Mantle's transaction flow
   - Reference: https://docs.mantle.xyz/network/system-information/transaction-lifecycle

---

## Deployment Guide

### Development Setup

```bash
# 1. Clone repository
git clone https://github.com/yourusername/mantleforge.git
cd mantleforge

# 2. Install dependencies
pnpm install

# 3. Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# 4. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 5. Setup database tables in Supabase
# Run the SQL schema from this README in your Supabase SQL editor


# 6. Run development server
pnpm dev
```

### Production Deployment (Vercel)

```bash
# 1. Connect GitHub repository to Vercel

# 2. Configure environment variables in Vercel dashboard

# 3. Deploy
vercel --prod
```

---

## Testing Strategy

### Manual Testing Checklist

- [ ] GitHub OAuth login works
- [ ] Repositories load correctly
- [ ] Contract detection finds .sol files
- [ ] Compilation succeeds
- [ ] Deployment via MetaMask works
- [ ] Contract appears on explorer
- [ ] Verification completes
- [ ] Dashboard loads contract info
- [ ] Read functions work
- [ ] Write functions execute
- [ ] Transaction history updates
- [ ] Monitoring shows live data

---

## Demo Preparation

### Demo Script Outline

1. **Problem Statement** (30s)

   - Show current deployment friction
   - Multiple tools, context switching

2. **Solution Demo** (2min)

   - Login with GitHub
   - Select repository
   - One-click deploy
   - Auto-verification
   - Dashboard tour

3. **Mantle Integration** (30s)

   - Highlight Mantle-specific features
   - Reference documentation usage

4. **Call to Action** (15s)
   - Links to GitHub, demo site
   - Invitation to try

### Demo Video Checklist

- [ ] Record in 1080p
- [ ] Clear audio narration
- [ ] Show actual deployment (not mock)
- [ ] Highlight unique features
- [ ] Keep under 5 minutes
- [ ] Add captions
- [ ] Include GitHub/demo links

---

## Additional Resources

### Mantle Documentation

- Main docs: https://docs.mantle.xyz/network
- Developer guides: https://docs.mantle.xyz/network/for-developers/how-to-guides
- Tutorials: https://github.com/mantlenetworkio/mantle-tutorial

### Development Tools

- Foundry Book: https://book.getfoundry.sh/
- Viem Docs: https://viem.sh/
- RainbowKit Docs: https://www.rainbowkit.com/docs
- Supabase Docs: https://supabase.com/docs

---

## Recommendation Summary

### Supabase vs Prisma for MantleForge

For **hackathon development speed**, Supabase provides significant advantages:

| Area | Prisma | Supabase |
|------|--------|----------|
| **Setup Time** | 30-60 min | 10-15 min |
| **Backend Code** | Complex ORM queries | Direct client calls |
| **Real-time Features** | Manual implementation | Built-in subscriptions |
| **Type Safety** | Excellent | Good (with generated types) |
| **Database Setup** | Complex migrations | Simple SQL tables |

### Why Supabase Wins for Hackathons:
1. **Instant PostgreSQL** - No database setup required
2. **Real-time subscriptions** - Perfect for contract monitoring
3. **Built-in auth** - Can replace session management
4. **No migrations** - Just run SQL in the Supabase dashboard
5. **Less code** - Direct client usage eliminates backend boilerplate

### Simplified Stack with Supabase:
```
Frontend → Supabase Client → PostgreSQL Database
         ↘ Mantle RPC (for live blockchain data)
```

**This README provides complete implementation guidance for building MantleForge using Supabase for maximum hackathon velocity. Follow each section sequentially for successful development and deployment.**
