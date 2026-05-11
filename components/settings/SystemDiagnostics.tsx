'use client';

import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, XCircle, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface HealthStatus {
  status: string;
  services: {
    influxdb: string;
    anthropic: string;
  };
}

/**
 * System Diagnostics component.
 * Displays real-time health status of backend services.
 */
export const SystemDiagnostics = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data);
    } catch (error) {
      console.error('Failed to fetch health status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const getBadge = (status: string) => {
    if (status === 'UP' || status === 'OK') {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1">
          <CheckCircle2 className="size-3" /> PASS
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 gap-1">
        <XCircle className="size-3" /> FAIL
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-zinc-100">Service Connectivity</h3>
          <p className="text-sm text-zinc-500">Monitor external integration status</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={checkHealth}
          disabled={loading}
          className="bg-zinc-900 border-zinc-800"
        >
          <RefreshCcw className={`size-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Run Ping Tests
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">InfluxDB (TSDB)</CardTitle>
              {getBadge(health?.services.influxdb || 'DOWN')}
            </div>
            <CardDescription className="text-xs">
              Primary time-series storage
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Claude (LLM)</CardTitle>
              {getBadge(health?.services.anthropic || 'DOWN')}
            </div>
            <CardDescription className="text-xs">
              Natural language translation
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};
