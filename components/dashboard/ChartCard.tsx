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
import { MoreHorizontal, RefreshCw, AlertCircle, Edit3, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardCard, DataSignature } from '@/types';
import { summarizeData } from '@/lib/data-summarizer';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CardEditorForm } from '@/components/forms/CardEditorForm';

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
  const removeCard = useAppStore((state) => state.removeCard);
  const [isEditing, setIsEditing] = useState(false);

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
  }, [card.id, card.timeRange, card.refreshInterval, card.fluxQuery]);

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
          <p className="text-xs uppercase tracking-wider text-red-500/50 font-bold">Connection Lost</p>
          <p className="text-[10px] text-zinc-700 mt-1 max-w-[150px] text-center">{error}</p>
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
      <div className="h-48 min-h-[192px] w-full mt-4 flex items-center justify-center">
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
    <>
      <Card 
        className={`border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-all group cursor-pointer h-full flex flex-col`}
        onClick={() => setDrilldown({
          title: card.title,
          metricName: card.metricName,
          data: data,
          signature: signature
        })}
      >
        <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="overflow-hidden">
            <CardTitle className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors truncate">
              {card.title}
            </CardTitle>
            <p className="text-[10px] uppercase tracking-widest text-zinc-600 mt-1 truncate">
              {card.host} • {card.metricName}
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-7 text-zinc-600 hover:text-blue-400"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              <Edit3 className="size-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-7 text-zinc-600 hover:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                removeCard(card.id);
              }}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-between">
          {renderChart()}
          <div className="flex items-center justify-between mt-4 shrink-0">
            <div className="text-[10px] text-zinc-500 uppercase tracking-tighter">
              AVG: <span className="text-zinc-300 font-mono">{signature.avg}</span>
            </div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-tighter">
              RANGE: <span className="text-zinc-300 font-mono">{card.timeRange}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="bg-zinc-950 border-zinc-800 sm:max-w-xl">
           <DialogHeader>
             <DialogTitle>Edit Monitor Card</DialogTitle>
           </DialogHeader>
           <div className="mt-4">
             <CardEditorForm card={card} onComplete={() => setIsEditing(false)} />
           </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
