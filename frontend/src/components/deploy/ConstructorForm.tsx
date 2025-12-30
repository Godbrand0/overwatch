"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
      <div className="space-y-4">
        <p className="text-gray-400">This contract has no constructor parameters.</p>
        <Button
          onClick={() => onDeploy([])}
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Deploying..." : "Deploy Contract"}
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {inputs.map((input: any) => (
          <div key={input.name} className="space-y-2">
            <Label htmlFor={input.name} className="text-gray-300">
              {input.name} <span className="text-gray-500 text-xs">({input.type})</span>
            </Label>
            <Input
              id={input.name}
              placeholder={`Enter ${input.name}`}
              className="bg-gray-800 border-gray-700 text-white"
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
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Deploying..." : "Deploy Contract"}
      </Button>
    </form>
  );
}
