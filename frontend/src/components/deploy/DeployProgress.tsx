"use client";

import { CheckCircle2, Circle, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type DeployStepStatus = "pending" | "loading" | "success" | "error";

export interface DeployStep {
  id: string;
  label: string;
  status: DeployStepStatus;
  error?: string;
}

interface DeployProgressProps {
  steps: DeployStep[];
}

export function DeployProgress({ steps }: DeployProgressProps) {
  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-start gap-4">
          <div className="relative flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center z-10",
                step.status === "success"
                  ? "bg-green-500 text-white"
                  : step.status === "loading"
                  ? "bg-blue-500 text-white"
                  : step.status === "error"
                  ? "bg-red-500 text-white"
                  : "bg-gray-700 text-gray-500"
              )}
            >
              {step.status === "success" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : step.status === "loading" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : step.status === "error" ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-0.5 h-10 -mt-1",
                  step.status === "success" ? "bg-green-500" : "bg-gray-700"
                )}
              />
            )}
          </div>
          <div className="pt-1">
            <p
              className={cn(
                "font-medium",
                step.status === "pending" ? "text-gray-500" : "text-white"
              )}
            >
              {step.label}
            </p>
            {step.error && (
              <p className="text-sm text-red-400 mt-1">{step.error}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
