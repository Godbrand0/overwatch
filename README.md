# MantleForge

> GitHub-native DevOps dashboard for deploying, verifying, and monitoring smart contracts on Mantle Network

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black)](https://nextjs.org/)
[![Powered by Mantle](https://img.shields.io/badge/Powered%20by-Mantle-blue)](https://www.mantle.xyz/)

## What is MantleForge?

MantleForge is a unified developer dashboard that consolidates the entire smart contract lifecycle on Mantle Network:

- **Connect** GitHub repositories with one click
- **Deploy** contracts to Mantle with automatic compilation
- **Verify** contracts automatically on Mantle Explorer
- **Monitor** contract health with real-time tracking
- **Interact** with deployed contracts via intuitive UI
- **Alert** on anomalies and transaction errors

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Foundry ([Installation Guide](https://book.getfoundry.sh/getting-started/installation))
- MetaMask wallet with MNT tokens

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mantleforge.git
cd mantleforge

# Install frontend dependencies
cd frontend
pnpm install

# Install Foundry dependencies for contracts
cd ../contract
forge install

# Return to root
cd ..
```

### Configuration

1. Create a `.env.local` file in the frontend directory:

```bash
# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# GitHub OAuth
GITHUB_CLIENT_ID="your_github_oauth_client_id"
GITHUB_CLIENT_SECRET="your_github_oauth_client_secret"

# Mantle Networks
NEXT_PUBLIC_MANTLE_TESTNET_RPC="https://rpc.sepolia.mantle.xyz"
NEXT_PUBLIC_MANTLE_MAINNET_RPC="https://rpc.mantle.xyz"

# Mantle Explorer
MANTLESCAN_API_KEY="your_mantlescan_api_key"
```

2. Set up Mantle Testnet in MetaMask:
   - Network Name: `Mantle Testnet`
   - RPC URL: `https://rpc.sepolia.mantle.xyz`
   - Chain ID: `5003`
   - Currency Symbol: `MNT`
   - Block Explorer: `https://sepolia.mantlescan.xyz`

### Running the App

```bash
# Start the frontend development server
cd frontend
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
mantleforge/
├── contract/              # Smart contracts (Foundry)
│   ├── src/              # Solidity contracts
│   ├── test/             # Contract tests
│   ├── script/           # Deployment scripts
│   └── foundry.toml      # Foundry configuration
│
├── frontend/             # Next.js application
│   ├── src/
│   │   ├── app/         # Next.js App Router pages
│   │   ├── components/  # React components
│   │   ├── lib/         # Backend logic & utilities
│   │   ├── hooks/       # Custom React hooks
│   │   └── types/       # TypeScript types
│   └── package.json
│
└── README.md            # You are here
```

## Key Features


whiefkwfwhigigoyghgsdbggilsbgbsgbsfgibslghbsklbgs

### 🔗 GitHub Integration
Connect your GitHub account and browse repositories directly from the dashboard. MantleForge automatically detects Solidity contracts in your repos.

### ⚡ One-Click Deployment
Deploy contracts to Mantle Network with a single click. The platform handles compilation, gas estimation, and transaction submission.

### ✅ Automatic Verification
Contracts are automatically verified on Mantle Explorer after deployment, making your source code publicly available.

### 📊 Real-Time Monitoring
Track contract interactions, transaction history, and event logs in real-time with an intuitive dashboard.

### 🎯 Contract Interaction
Read and write to your deployed contracts directly from the UI without writing any code.

## Technology Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, shadcn/ui
- **Blockchain**: Mantle Network, wagmi, viem, RainbowKit
- **Smart Contracts**: Solidity, Foundry
- **Database**: Supabase (PostgreSQL)
- **API**: GitHub API (Octokit), Mantle Explorer API
- **Deployment**: Vercel

## Documentation

- [Complete Development Guide](README_GUIDE.md) - Comprehensive guide for building MantleForge
- [Mantle Network Docs](https://docs.mantle.xyz/network)
- [Foundry Book](https://book.getfoundry.sh/)

## Getting Testnet Tokens

Get free MNT tokens for testing:
- Faucet: [https://faucet.sepolia.mantle.xyz](https://faucet.sepolia.mantle.xyz)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built for the Mantle Network Hackathon
- Powered by [Mantle Network](https://www.mantle.xyz/)
- Uses [Foundry](https://book.getfoundry.sh/) for smart contract development
- UI components from [shadcn/ui](https://ui.shadcn.com/)

## Support

- Documentation: [README_GUIDE.md](README_GUIDE.md)
- Issues: [GitHub Issues](https://github.com/yourusername/mantleforge/issues)
- Mantle Discord: [Join Here](https://discord.gg/mantle)

---

Built with ❤️ for the Mantle Network ecosystem




