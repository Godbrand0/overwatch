"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, FileJson } from "lucide-react";

export interface RWAProof {
  assetType: string;
  custodian: string;
  nav: string;
  currency: string;
  redemptionTerms: string;
  timestamp: number;
}

interface ProofWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (proof: RWAProof) => void;
}

export function ProofWizard({ isOpen, onClose, onGenerate }: ProofWizardProps) {
  const [formData, setFormData] = useState<Partial<RWAProof>>({
    assetType: "Treasury",
    currency: "USD",
  });

  const handleSubmit = () => {
    if (!formData.custodian || !formData.nav) return;
    
    const proof: RWAProof = {
      assetType: formData.assetType || "Treasury",
      custodian: formData.custodian,
      nav: formData.nav,
      currency: formData.currency || "USD",
      redemptionTerms: formData.redemptionTerms || "T+2",
      timestamp: Date.now(),
    };
    
    onGenerate(proof);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
            Generate RWA Proof
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a cryptographic proof of asset backing for this deployment. This will be anchored to your contract.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="assetType">Asset Type</Label>
            <Select 
              value={formData.assetType} 
              onValueChange={(val) => setFormData({...formData, assetType: val})}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select asset type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="Treasury">US Treasury Bills</SelectItem>
                <SelectItem value="RealEstate">Real Estate</SelectItem>
                <SelectItem value="PrivateCredit">Private Credit</SelectItem>
                <SelectItem value="Commodity">Commodity (Gold/Silver)</SelectItem>
                <SelectItem value="Equity">Private Equity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="custodian">Custodian / Trustee</Label>
            <Input
              id="custodian"
              placeholder="e.g. Onyx Trust Co."
              className="bg-gray-800 border-gray-700"
              value={formData.custodian || ""}
              onChange={(e) => setFormData({...formData, custodian: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nav">Initial NAV / Price</Label>
              <Input
                id="nav"
                type="number"
                placeholder="1.00"
                className="bg-gray-800 border-gray-700"
                value={formData.nav || ""}
                onChange={(e) => setFormData({...formData, nav: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(val) => setFormData({...formData, currency: val})}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="USD" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="ETH">ETH</SelectItem>
                  <SelectItem value="MNT">MNT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="redemption">Redemption Terms</Label>
            <Input
              id="redemption"
              placeholder="e.g. T+2 Business Days"
              className="bg-gray-800 border-gray-700"
              value={formData.redemptionTerms || ""}
              onChange={(e) => setFormData({...formData, redemptionTerms: e.target.value})}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-gray-700 hover:bg-gray-800">
            Skip
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 gap-2">
            <FileJson className="w-4 h-4" />
            Generate Proof
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
