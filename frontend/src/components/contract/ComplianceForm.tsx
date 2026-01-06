"use client";

import { useState } from "react";
import { ShieldCheck, FileText, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Enums matching RWAAnchor.sol
export enum RWAType {
  UNDEFINED = 0,
  REAL_ESTATE = 1,
  TREASURY = 2,
  INVOICE = 3,
  GOLD = 4,
  EQUITY = 5,
  DEBT = 6,
  OTHER = 7
}

export enum LegalRight {
  UNDEFINED = 0,
  EQUITY = 1,
  DEBT = 2,
  REVENUE_SHARE = 3,
  BENEFICIAL_OWNERSHIP = 4,
  OTHER = 5
}

interface ComplianceFormProps {
  contractAddress: string;
  onAnchored: (txHash: string, profile: any) => void;
}

export function ComplianceForm({ contractAddress, onAnchored }: ComplianceFormProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    rwaType: RWAType.REAL_ESTATE.toString(),
    legalRight: LegalRight.EQUITY.toString(),
    jurisdiction: "",
    redeemable: "true",
    custodian: "",
    offchainAssetId: "",
    appraiserId: ""
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Generate SHA-256 hash locally
      const arrayBuffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      setFileHash("0x" + hashHex);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. In a real app, we would upload to IPFS here
      // const ipfsHash = await uploadToIPFS(file);
      
      // 2. Trigger Smart Contract Transaction (Mocked for now)
      console.log("Anchoring Asset:", {
        contractAddress,
        ...formData,
        fileHash
      });
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockTxHash = "0x" + Math.random().toString(16).slice(2, 66);

      // 3. Save to Backend
      const response = await fetch(`/api/contracts/${contractAddress}/anchor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anchorTxHash: mockTxHash,
          rwaType: formData.rwaType === RWAType.REAL_ESTATE.toString() ? "Real Estate" : 
                   formData.rwaType === RWAType.TREASURY.toString() ? "Treasury Bills" :
                   formData.rwaType === RWAType.INVOICE.toString() ? "Invoices" :
                   formData.rwaType === RWAType.GOLD.toString() ? "Gold" :
                   formData.rwaType === RWAType.EQUITY.toString() ? "Private Equity" : "Private Debt",
          legalRight: formData.legalRight === LegalRight.EQUITY.toString() ? "Equity Ownership" :
                      formData.legalRight === LegalRight.DEBT.toString() ? "Debt / Bond" :
                      formData.legalRight === LegalRight.REVENUE_SHARE.toString() ? "Revenue Share" : "Beneficial Ownership",
          jurisdiction: formData.jurisdiction,
          custodian: formData.custodian,
          offchainAssetId: formData.offchainAssetId,
          legalDocHash: fileHash,
          appraiserId: formData.appraiserId
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save anchor data to backend");
      }
      
      onAnchored(mockTxHash, formData);
      
    } catch (err) {
      console.error("Anchoring failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <ShieldCheck className="w-6 h-6 text-blue-400" />
          Anchor RWA Trust Profile
        </CardTitle>
        <CardDescription className="text-gray-400">
          Link this contract to its legal foundation on-chain. This action is immutable.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Asset Type</Label>
              <Select 
                value={formData.rwaType} 
                onValueChange={(val) => setFormData({...formData, rwaType: val})}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  <SelectItem value={RWAType.REAL_ESTATE.toString()}>Real Estate</SelectItem>
                  <SelectItem value={RWAType.TREASURY.toString()}>Treasury Bills</SelectItem>
                  <SelectItem value={RWAType.INVOICE.toString()}>Invoices / Receivables</SelectItem>
                  <SelectItem value={RWAType.GOLD.toString()}>Gold / Commodities</SelectItem>
                  <SelectItem value={RWAType.EQUITY.toString()}>Private Equity</SelectItem>
                  <SelectItem value={RWAType.DEBT.toString()}>Private Debt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Legal Right</Label>
              <Select 
                value={formData.legalRight} 
                onValueChange={(val) => setFormData({...formData, legalRight: val})}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  <SelectItem value={LegalRight.EQUITY.toString()}>Equity Ownership</SelectItem>
                  <SelectItem value={LegalRight.DEBT.toString()}>Debt / Bond</SelectItem>
                  <SelectItem value={LegalRight.REVENUE_SHARE.toString()}>Revenue Share</SelectItem>
                  <SelectItem value={LegalRight.BENEFICIAL_OWNERSHIP.toString()}>Beneficial Ownership</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Jurisdiction (ISO Code)</Label>
              <Input 
                placeholder="e.g. UK, US, SG" 
                className="bg-gray-900 border-gray-700"
                value={formData.jurisdiction}
                onChange={(e) => setFormData({...formData, jurisdiction: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Redeemable</Label>
              <Select 
                value={formData.redeemable} 
                onValueChange={(val) => setFormData({...formData, redeemable: val})}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Custodian Address</Label>
              <Input 
                placeholder="0x..." 
                className="bg-gray-900 border-gray-700 font-mono"
                value={formData.custodian}
                onChange={(e) => setFormData({...formData, custodian: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Off-chain Asset ID</Label>
              <Input 
                placeholder="Registry Ref / ID" 
                className="bg-gray-900 border-gray-700"
                value={formData.offchainAssetId}
                onChange={(e) => setFormData({...formData, offchainAssetId: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-700">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Legal Documentation
            </Label>
            
            <div className="grid gap-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-900/50 hover:bg-gray-900 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">Legal Agreement, SPV Bylaws, or Deed (PDF)</p>
                  </div>
                  <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf" />
                </label>
              </div>

              {file && (
                <Alert className="bg-blue-500/10 border-blue-500/20">
                  <CheckCircle2 className="h-4 w-4 text-blue-400" />
                  <AlertTitle className="text-blue-400">File Prepared</AlertTitle>
                  <AlertDescription className="text-gray-400 break-all">
                    {file.name} <br />
                    <span className="text-xs font-mono mt-1 block">SHA-256: {fileHash}</span>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-bold gap-2"
            disabled={loading || !file}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Anchoring Asset...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                Seal RWA Trust Profile
              </>
            )}
          </Button>

          <p className="text-center text-xs text-gray-500">
            By anchoring, you attest that the information provided is legally binding and accurate.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
