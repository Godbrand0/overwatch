/**
 * RWA Compliance Utility
 * Detects RWA-specific patterns in contract ABIs
 */

export interface RWAComplianceReport {
  isCompliant: boolean;
  confidence: number; // 0.0 to 1.0
  detectedFeatures: string[];
  standard?: "ERC-3643" | "ERC-1400" | "Custom RWA";
}

export function checkRWACompliance(abi: any[]): RWAComplianceReport {
  if (!abi || !Array.isArray(abi)) {
    return { isCompliant: false, confidence: 0, detectedFeatures: [] };
  }

  const features: string[] = [];
  let score = 0;

  // 1. ERC-3643 (T-REX) Detection - High Weight
  const erc3643Signatures = [
    "identityRegistry",
    "compliance",
    "isVerified",
    "setIdentityRegistry",
    "batchFreeze",
    "batchUnfreeze",
    "forceTransfer",
    "recoverTokens",
  ];
  
  const erc3643Matches = abi.filter((item) => 
    item.type === "function" && erc3643Signatures.includes(item.name)
  );

  if (erc3643Matches.length >= 3) {
    features.push("ERC-3643 Standard Detected");
    score += 0.6;
  }

  // 2. ERC-1400 (Security Token) Detection - High Weight
  const erc1400Signatures = [
    "getDocument",
    "setDocument",
    "issueByPartition",
    "redeemByPartition",
    "canTransferByPartition",
    "isIssuable",
    "isControllable"
  ];

  const erc1400Matches = abi.filter((item) => 
    item.type === "function" && erc1400Signatures.includes(item.name)
  );

  if (erc1400Matches.length >= 3) {
    features.push("ERC-1400 Standard Detected");
    score += 0.6;
  }

  // 3. RWA Specific Keywords - Medium Weight
  const rwaKeywords = [
    "asset", "custodian", "redeem", "redemption", "isin", "cusip", 
    "nav", "valuation", "maturity", "issuance", "tranche", "documentUri"
  ];

  const keywordMatches = abi.filter((item) => {
    if (item.type !== "function" && item.type !== "event") return false;
    const name = item.name.toLowerCase();
    return rwaKeywords.some(kw => name.includes(kw));
  });

  if (keywordMatches.length > 0) {
    const uniqueKeywords = new Set(
      keywordMatches.map(m => rwaKeywords.find(kw => m.name.toLowerCase().includes(kw)))
    );
    features.push(`RWA Keywords: ${Array.from(uniqueKeywords).join(", ")}`);
    score += Math.min(0.4, uniqueKeywords.size * 0.1); // Up to 0.4 for multiple keywords
  }

  // 4. Oracle / Data Feeds - Low Weight
  const oracleSignatures = ["getLatestPrice", "latestRoundData", "getTimestamp", "updateNAV"];
  const oracleMatches = abi.filter((item) => 
    item.type === "function" && oracleSignatures.includes(item.name)
  );

  if (oracleMatches.length > 0) {
    features.push("Oracle/NAV Integration");
    score += 0.1;
  }

  // 5. Compliance / Control Patterns - Low Weight
  const controlSignatures = ["pause", "unpause", "freeze", "blacklist", "whitelist"];
  const controlMatches = abi.filter((item) => 
    item.type === "function" && controlSignatures.includes(item.name)
  );

  if (controlMatches.length >= 2) {
    features.push("Compliance Controls (Pause/Freeze)");
    score += 0.1;
  }

  // Determine Standard
  let standard: RWAComplianceReport["standard"] = "Custom RWA";
  if (erc3643Matches.length >= 3) standard = "ERC-3643";
  else if (erc1400Matches.length >= 3) standard = "ERC-1400";

  // Final Decision
  // Threshold: 0.3 (e.g., just keywords might be enough if strong, or mix of patterns)
  const isCompliant = score >= 0.3; 
  const finalConfidence = Math.min(0.99, score); // Cap at 0.99

  return {
    isCompliant,
    confidence: parseFloat(finalConfidence.toFixed(2)),
    detectedFeatures: features,
    standard: isCompliant ? standard : undefined
  };
}
