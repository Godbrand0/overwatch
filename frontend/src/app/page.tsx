import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Zap, BarChart3, Globe, Lock, Cpu } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-grid">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-24 pb-32 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-24 left-1/4 w-64 h-64 bg-mantle-green/10 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-24 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mantle-green/10 border border-mantle-green/20 text-mantle-green text-xs font-bold tracking-widest uppercase mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mantle-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-mantle-green"></span>
            </span>
            Institutional-Grade RWA Infrastructure
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-[1.1]">
            The Trust Layer for <br />
            <span className="text-mantle-green text-glow">Real World Assets</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Deploy, anchor, and monitor institutional-grade RWAs on Mantle Network. 
            Bridge the gap between physical assets and on-chain liquidity with immutable legal linkage.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/api/auth/github">
              <Button size="lg" className="h-14 px-8 bg-mantle-green text-mantle-dark hover:bg-mantle-green/90 font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(0,255,209,0.3)] transition-all hover:scale-105">
                Launch Mission Control
              </Button>
            </a>
            <Link href="#ecosystem">
              <Button size="lg" variant="outline" className="h-14 px-8 border-white/10 bg-white/5 hover:bg-white/10 font-bold text-lg rounded-xl backdrop-blur-sm">
                Explore Ecosystem
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Ticker */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <StatBox label="Total Anchored" value="124" sub="Assets" />
          <StatBox label="TVL Secured" value="$1.2B" sub="USD" />
          <StatBox label="Jurisdictions" value="18" sub="Global" />
          <StatBox label="Uptime" value="99.9%" sub="Network" />
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Core Infrastructure</h2>
          <p className="text-slate-400">Everything you need to tokenize and manage real-world value.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<ShieldCheck className="w-8 h-8" />}
            title="RWA Trust Anchor"
            description="Immutable on-chain linkage between smart contracts and legal documentation with SHA-256 verification."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Rapid Deployment"
            description="GitHub-native workflow for deploying and verifying RWA-compliant contracts in seconds."
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Real-time Analytics"
            description="Institutional-grade monitoring of asset performance, NAV updates, and compliance status."
          />
          <FeatureCard
            icon={<Globe className="w-8 h-8" />}
            title="Global Compliance"
            description="Support for multi-jurisdictional legal frameworks and KYC/AML identity registries."
          />
          <FeatureCard
            icon={<Lock className="w-8 h-8" />}
            title="Secure Custody"
            description="Integrated custodian management and multi-sig authorization for asset operations."
          />
          <FeatureCard
            icon={<Cpu className="w-8 h-8" />}
            title="Mantle Optimized"
            description="Deeply integrated with Mantle's modular architecture for high performance and low costs."
          />
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, sub }: { label: string, value: string, sub: string }) {
  return (
    <div className="glass-card p-4 text-center hud-border">
      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">{label}</p>
      <p className="text-2xl font-black text-white leading-none mb-1">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-mantle-green font-bold">{sub}</p>
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
    <div className="glass-card p-8 group">
      <div className="w-14 h-14 rounded-xl bg-mantle-green/10 flex items-center justify-center text-mantle-green mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">{description}</p>
    </div>
  );
}
