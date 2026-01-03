"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Clock, TestTube } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TestResult {
  success: boolean;
  total: number;
  passed: number;
  failed: number;
  coverage?: number;
  results: Array<{
    name: string;
    status: "Success" | "Failure";
    duration: string;
    error?: string;
  }>;
  error?: string;
}

interface TestDashboardProps {
  results: TestResult;
  isLoading?: boolean;
}

export function TestDashboard({ results, isLoading }: TestDashboardProps) {
  if (isLoading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="py-12 text-center">
          <TestTube className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Running tests...</p>
        </CardContent>
      </Card>
    );
  }

  if (results.error) {
    return (
      <Card className="bg-red-900/10 border-red-900/50">
        <CardContent className="py-8 flex items-center gap-4 text-red-400">
          <AlertCircle className="w-8 h-8 shrink-0" />
          <div>
            <h3 className="font-bold text-lg">Test Execution Failed</h3>
            <p className="text-sm opacity-90">{results.error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const passRate = results.total > 0 ? (results.passed / results.total) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total Tests</span>
              <TestTube className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{results.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Passed</span>
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-400">{results.passed}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Failed</span>
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-red-400">{results.failed}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Pass Rate</span>
              <div className={`text-xs font-bold px-2 py-0.5 rounded ${passRate === 100 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {passRate.toFixed(0)}%
              </div>
            </div>
            <Progress value={passRate} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {results.results.map((test, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    {test.status === "Success" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium text-gray-200">{test.name}</div>
                      {test.error && (
                        <div className="text-xs text-red-400 mt-1">{test.error}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {test.duration}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
