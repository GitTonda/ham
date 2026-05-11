'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { MoreHorizontal, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardCard, DataSignature } from '@/types';
import { summarizeData } from '@/lib/data-summarizer';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';

interface ChartCardProps {
  card: DashboardCard;
}

/**
 * ChartCard component.
 * Displays data visualization for a specific metric.
 */
export const ChartCard = ({ card }: ChartCardProps) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setDrilldown = useAppStore((state) => state.setDrilldown);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (card.fluxQuery) {
        res = await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fluxQuery: card.fluxQuery }),
        });
      } else {
        res = await fetch(`/api/data?bucket=${card.metricCategory}&metric=${card.metricName}&range=${card.timeRange}`);
      }
      
      if (!res.ok) throw new Error('Failed to fetch data');
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, card.refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [card.id, card.timeRange, card.refreshInterval]);

  const signature = useMemo(() => summarizeData(data, card.metricName), [data, card.metricName]);

  const renderChart = () => {
    if (loading && data.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-zinc-600">
          <RefreshCw className="size-5 animate-spin mr-2" /> Loading data...
        </div>
      );
    }

    if (error && data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-zinc-600">
          <AlertCircle className="size-8 text-red-500/50 mb-2" />
          <p className="text-xs uppercase tracking-wider">Connection Lost</p>
        </div>
      );
    }

    if (card.chartType === 'badge' || card.chartType === 'text') {
      return (
        <div className="flex flex-col items-center justify-center h-48">
          <div className="text-4xl font-bold text-zinc-100">
            {signature.endVal}
          </div>
          <div className="mt-2">
             <Badge className={signature.pctChange >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}>
               {signature.pctChange >= 0 ? '+' : ''}{signature.pctChange}%
             </Badge>
          </div>
        </div>
      );
    }

    return (
      <div className="h-48 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          {card.chartType === 'step' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
              <XAxis dataKey="_time" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <Area 
                type="stepAfter" 
                dataKey="_value" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
              <XAxis dataKey="_time" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <Line 
                type="monotone" 
                dataKey="_value" 
                stroke="#3b82f6" 
                dot={false} 
                strokeWidth={2}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Card 
      className="border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors group cursor-pointer"
      onClick={() => setDrilldown({
        title: card.title,
        metricName: card.metricName,
        data: data,
        signature: signature
      })}
    >
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
            {card.title}
          </CardTitle>
          <p className="text-[10px] uppercase tracking-widest text-zinc-600 mt-1">
            {card.host} • {card.metricName}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="size-8 text-zinc-600 hover:text-zinc-300"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {renderChart()}
        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-zinc-500">
            AVG: <span className="text-zinc-300 font-mono">{signature.avg}</span>
          </div>
          <div className="text-xs text-zinc-500">
            RANGE: <span className="text-zinc-300 font-mono">{card.timeRange}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
