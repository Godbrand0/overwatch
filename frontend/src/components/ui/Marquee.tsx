"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

// Mock RWA Data
const rwaStats = [
  { name: "Tokenized Gold", symbol: "tGOLD", price: "$2,450.00", change: "+1.25%", positive: true },
  { name: "Mantle Real Estate", symbol: "mRE", price: "$150.25", change: "-0.45%", positive: false },
  { name: "US Treasury Bond (10Y)", symbol: "USB10", price: "$98.50", change: "+0.05%", positive: true },
  { name: "Corporate Debt Fund", symbol: "CDF", price: "$1,200.10", change: "+0.80%", positive: true },
  { name: "Green Energy Bond", symbol: "GEB", price: "$105.30", change: "+2.10%", positive: true },
  { name: "Art Fractional", symbol: "ARTf", price: "$50.00", change: "-1.20%", positive: false },
  { name: "Private Credit Pool", symbol: "PCP", price: "$1.02", change: "+0.15%", positive: true },
  { name: "Agri-Commodities", symbol: "AGRI", price: "$45.60", change: "-0.30%", positive: false },
];

const Marquee = () => {
  // Duplicate data for seamless loop
  const allStats = [...rwaStats, ...rwaStats, ...rwaStats, ...rwaStats];

  return (
    <div className="w-full bg-black/90 border-b border-white/10 overflow-hidden z-40 relative">
      <div className="flex items-center h-10">
        <motion.div
          className="flex space-x-8 whitespace-nowrap"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            duration: 30, // Adjust speed here
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {allStats.map((stat, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm font-mono">
              <span className="text-gray-400 font-bold">{stat.symbol}</span>
              <span className="text-white">{stat.price}</span>
              <span
                className={`flex items-center ${
                  stat.positive ? "text-green-400" : "text-red-400"
                }`}
              >
                {stat.positive ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {stat.change}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Marquee;
