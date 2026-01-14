# 🛰️ Overwatch: Institutional RWA Mission Control

Overwatch is a premium, institutional-grade "Mission Control" for Real-World Assets (RWA) on the **Mantle Network**. It provides a secure, transparent, and highly visual interface for deploying, monitoring, and managing RWA-compliant smart contracts.

Built for the Mantle Hackathon, Overwatch bridges the gap between complex blockchain data and institutional-level decision-making, offering a "Digital Twin" experience for on-chain assets.

## 🚀 Key Features

-   **Mission Control Dashboard**: A high-impact, HUD-style command center for real-time contract monitoring.
-   **RWA Compliance Detector**: Automatically detects RWA-specific signatures (ERC-3643) and keywords (NAV, Custodian) in smart contracts.
-   **Institutional Gateway**: A premium landing page designed for high-trust institutional interactions.
-   **Live Event HUD**: Real-time tracking of contract events, compliance triggers, and network health metrics.
-   **Proof Wizard**: A structured interface for generating and storing RWA-specific metadata and proofs.
-   **Foundry Integration**: Seamlessly detects and interacts with Foundry-based projects.

## 🏗️ Project Architecture

### High-Level System Design

Overwatch follows a modular architecture that separates concerns while maintaining tight integration between components:

```
┌─────────────────────────────────────────────────────────┐
│                     USER INTERFACE                     │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           FRONTEND (Next.js 15)                  │  │
│  │                                                   │  │
│  │  - Mission Control Dashboard                      │  │
│  │  - RWA Asset Management                          │  │
│  │  - Contract Deployment Interface                 │  │
│  │  - Compliance Monitoring                         │  │
│  │                                                   │  │
│  │  Libraries:                                      │  │
│  │  • RainbowKit (wallet connection)               │  │
│  │  • wagmi (contract interaction)                 │  │
│  │  • viem (Ethereum interactions)                 │  │
│  │  • Supabase (real-time data)                    │  │
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
│  - Users, Contracts, RWA Profiles, Proofs                │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                       │
│                                                          │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────┐ │
│  │ GitHub API   │  │ Mantle RPC    │  │ IPFS/Pinata │ │
│  │              │  │ Testnet/Main  │  │             │ │
│  └──────────────┘  └───────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 📁 Directory Structure

### `/contract` - Smart Contracts
The contract directory contains all Solidity smart contracts and Foundry configuration:

-   **[`src/MantleRWAAsset.sol`](./contract/src/MantleRWAAsset.sol)**: Sample RWA-compliant token contract implementing ERC-3643 signatures
-   **[`src/RWAAnchor.sol`](./contract/src/RWAAnchor.sol)**: Registry contract for anchoring RWA legal and technical profiles on-chain
-   **[`test/`](./contract/test/)**: Foundry test suites for all contracts
-   **[`foundry.toml`](./contract/foundry.toml)**: Foundry configuration optimized for Mantle Network

### `/frontend` - Web Application
The frontend directory contains the Next.js web application:

-   **[`src/app/`](./frontend/src/app/)**: Next.js 15 App Router pages and API routes
    -   **[`deploy/`](./frontend/src/app/deploy/)**: Contract deployment interface
    -   **[`assets/`](./frontend/src/app/assets/)**: RWA asset management pages
    -   **[`api/`](./frontend/src/app/api/)**: Backend API endpoints
-   **[`src/components/`](./frontend/src/components/)**: Reusable React components
    -   **[`deploy/`](./frontend/src/components/deploy/)**: Deployment-specific components
    -   **[`contract/`](./frontend/src/components/contract/)**: Contract interaction components
-   **[`src/lib/`](./frontend/src/lib/)**: Utility libraries and services
    -   **[`blockchain-utils.ts`](./frontend/src/lib/blockchain-utils.ts)**: Blockchain interaction utilities
    -   **[`contracts/`](./frontend/src/lib/contracts/)**: Contract ABIs and types

### Database Schema
The project uses Supabase PostgreSQL with the following key tables:

-   **Users**: GitHub authentication and user profiles
-   **Contracts**: Deployed contract metadata and ABIs
-   **RWA Profiles**: Asset metadata and legal document hashes
-   **Proofs**: ZK-proof storage and verification status

## 🛠️ Technical Stack

### Frontend Technologies
-   **Next.js 15**: React framework with App Router for optimal performance
-   **TypeScript**: Type-safe development for enhanced reliability
-   **Tailwind CSS**: Utility-first CSS framework for rapid UI development
-   **RainbowKit**: Elegant wallet connection UI supporting multiple wallets
-   **wagmi**: React hooks for Ethereum interactions
-   **viem**: Low-level TypeScript interface for Ethereum

### Blockchain & Smart Contracts
-   **Solidity**: Smart contract programming language
-   **Foundry**: Development framework for testing, deployment, and verification
-   **OpenZeppelin**: Secure, audited contract libraries
-   **ERC-3643**: Tokenized securities standard for RWA compliance

### Backend & Storage
-   **Supabase**: Backend-as-a-Service providing PostgreSQL database, authentication, and real-time subscriptions
-   **IPFS/Pinata**: Decentralized storage for RWA legal documents and proofs
-   **Next.js API Routes**: Serverless backend functions

### Network Integration
-   **Mantle Network**: High-performance L2 blockchain with low fees and fast finality
-   **Mantle Sepolia Testnet**: Testing environment for development and staging

## 🧡 Mantle Network Integration

Overwatch is deeply integrated with the Mantle ecosystem, leveraging its high throughput and low fees to provide a seamless institutional experience.

### 1. Network Configuration
Native support for both Mantle Mainnet and Mantle Sepolia Testnet:
-   **Configuration**: Located in [`frontend/src/lib/wagmi.ts`](./frontend/src/lib/wagmi.ts) and [`frontend/src/lib/mantle.ts`](./frontend/src/lib/mantle.ts)
-   **RPC Endpoints**: Optimized for Mantle's infrastructure to ensure low-latency data fetching
-   **Gas Optimization**: Specialized gas estimation for Mantle's L2 gas model

### 2. Mantle Service Layer
A dedicated `MantleService` ([`frontend/src/lib/mantle.ts`](./frontend/src/lib/mantle.ts)) abstracts complex interactions:
-   **Gas Estimation**: Optimized for Mantle's L2 gas model
-   **Bytecode Verification**: Fetches and verifies contract bytecode directly from Mantle RPCs
-   **Log Fetching**: Efficiently retrieves historical events using Mantle-specific explorer APIs

### 3. Real-time Monitoring HUD
The contract monitoring components provide a live feed of the Mantle network:
-   **Live Events**: Uses `watchContractEvent` to stream events in real-time
-   **Network Health**: Displays current Mantle gas prices and block times
-   **MantleScan Integration**: Direct links to transactions and addresses on MantleScan

### 4. RWA Compliance on Mantle
We've developed specialized RWA contracts for the Mantle ecosystem:
-   **[`MantleRWAAsset.sol`](./contract/src/MantleRWAAsset.sol)**: Implements ERC-3643 signatures and custom RWA keywords
-   **[`RWAAnchor.sol`](./contract/src/RWAAnchor.sol)**: Registry for anchoring RWA legal and technical profiles
-   **Compliance Detection**: Automatic recognition of RWA-specific patterns in deployed contracts

## 🔮 Future Roadmap

### Phase 1: Enhanced ZK-Privacy Integration
Overwatch is evolving to incorporate zero-knowledge proof systems for enhanced privacy and compliance:

1. **ZK-Proof Generation**
    - Integration with zk-SNARKs for confidential RWA transactions
    - On-chain verification of ownership without revealing sensitive information
    - Selective disclosure mechanisms for regulatory compliance

2. **Privacy-Preserving Compliance**
    - ZK-based identity verification systems
    - Confidential transfer mechanisms for sensitive RWA assets
    - Audit trails with zero-knowledge proofs of compliance

3. **Technical Implementation**
    - Integration with Circom or similar ZK-circuit development frameworks
    - Hardware acceleration for proof generation
    - Optimized verifier contracts for Mantle Network

### Phase 2: Mainnet Deployment Strategy

1. **Security Audits**
    - Third-party security audits of all smart contracts
    - Formal verification of critical components
    - Bug bounty program implementation

2. **Institutional Onboarding**
    - KYC/AML integration with traditional financial systems
    - Multi-signature wallet support for institutional custody
    - Insurance integration for RWA assets

3. **Regulatory Compliance Framework**
    - Jurisdiction-specific compliance modules
    - Automated reporting to regulatory bodies
    - Cross-border transaction compliance

### Phase 3: Advanced Features

1. **AI-Powered Analytics**
    - Machine learning models for RWA valuation
    - Predictive compliance monitoring
    - Anomaly detection for suspicious activities

2. **Cross-Chain Expansion**
    - Bridge to other L2 networks and sidechains
    - Unified RWA registry across multiple chains
    - Cross-chain compliance verification

3. **DeFi Integration**
    - RWA-backed lending protocols
    - Fractionalization of high-value assets
    - Liquidity pools for institutional assets

## 📦 Getting Started

### Prerequisites
-   Node.js 18+
-   Foundry (for contract development)
-   Mantle Sepolia Testnet funds (MNT)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-repo/overwatch.git
    cd overwatch
    ```

2.  **Install dependencies**:
    ```bash
    cd frontend
    npm install
    ```

3.  **Install Foundry dependencies**:
    ```bash
    cd contract
    forge install OpenZeppelin/openzeppelin-contracts --no-commit
    ```

4.  **Configure Environment Variables**:
    Create a `.env.local` in the `frontend` directory:
    ```env
    NEXT_PUBLIC_MANTLE_TESTNET_RPC=https://rpc.sepolia.mantle.xyz
    NEXT_PUBLIC_MANTLE_MAINNET_RPC=https://rpc.mantle.xyz
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
    PINATA_API_KEY=your_pinata_api_key
    PINATA_SECRET_API_KEY=your_pinata_secret_key
    ```

5.  **Set up the database**:
    - Create a Supabase project
    - Run the SQL schema from [`supabase_schema.sql`](./supabase_schema.sql)
    - Apply any migration files from the root directory

6.  **Run the development server**:
    ```bash
    cd frontend
    npm run dev
    ```

## 🛡️ Security & Compliance

Overwatch prioritizes security with:
-   **Identity Verification**: Integration hooks for Mantle-based identity registries
-   **Compliance HUD**: Dedicated monitoring for restriction and freeze events
-   **Secure Vault Experience**: UI designed to emphasize trust and security cues
-   **Multi-Signature Support**: Enhanced security for institutional deployments
-   **Audit Trails**: Comprehensive logging of all contract interactions

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for the **Mantle Hackathon**.
