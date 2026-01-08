"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Rocket } from "lucide-react";

interface ConstructorFormProps {
  abi: any[];
  onDeploy: (args: any[]) => void;
  loading?: boolean;
}

export function ConstructorForm({ abi, onDeploy, loading }: ConstructorFormProps) {
  const constructor = abi.find((item) => item.type === "constructor");
  const inputs = constructor?.inputs || [];
  
  const [args, setArgs] = useState<Record<string, string>>({});

  if (inputs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
          <p className="text-slate-400 text-sm">No initialization parameters required for this asset.</p>
        </div>
        <Button
          onClick={() => onDeploy([])}
          className="w-full bg-mantle-green text-mantle-dark hover:bg-mantle-green/90 h-12 font-black text-lg rounded-xl shadow-[0_0_20px_rgba(0,255,209,0.3)] transition-all hover:scale-105"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Initiating Launch...
            </>
          ) : (
            <>
              <Rocket className="w-5 h-5 mr-2" />
              Deploy Asset
            </>
          )}
        </Button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderedArgs = inputs.map((input: any) => args[input.name] || "");
    onDeploy(orderedArgs);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        {inputs.map((input: any) => (
          <div key={input.name} className="space-y-2 group">
            <Label htmlFor={input.name} className="text-xs uppercase tracking-widest font-bold text-slate-500 group-focus-within:text-mantle-green transition-colors">
              {input.name} <span className="text-slate-600">({input.type})</span>
            </Label>
            <Input
              id={input.name}
              placeholder={`Enter ${input.name}`}
              className="bg-black/20 border-white/10 text-white h-12 rounded-xl focus:border-mantle-green/50 focus:ring-mantle-green/20 transition-all font-mono text-sm"
              value={args[input.name] || ""}
              onChange={(e) =>
                setArgs((prev) => ({ ...prev, [input.name]: e.target.value }))
              }
              required
            />
          </div>
        ))}
      </div>
      <Button
        type="submit"
        className="w-full bg-mantle-green text-mantle-dark hover:bg-mantle-green/90 h-12 font-black text-lg rounded-xl shadow-[0_0_20px_rgba(0,255,209,0.3)] transition-all hover:scale-105"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Initiating Launch...
          </>
        ) : (
          <>
            <Rocket className="w-5 h-5 mr-2" />
            Deploy Asset
          </>
        )}
      </Button>
    </form>
  );
}
