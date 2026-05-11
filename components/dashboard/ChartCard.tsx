'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
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
  const [isClient, setIsClient] = useState(false);
  const setDrilldown = useAppStore((state) => state.setDrilldown);
  const removeCard = useAppStore((state) => state.removeCard);
  const [isEditing, setIsEditing] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
        res = await fetch(`/api/data?bucket=${card.metricCategory}&metric=${encodeURIComponent(card.metricName)}&range=${card.timeRange}`);
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
  }, [card.id, card.timeRange, card.refreshInterval, card.fluxQuery, card.metricName]);

  const signature = useMemo(() => summarizeData(data, card.metricName), [data, card.metricName]);

  const renderChart = () => {
    if (!isClient) return <div className="h-48" />;

    if (loading && data.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-zinc-600">
          <RefreshCw className="size-5 animate-spin mr-2" /> Loading...
        </div>
      );
    }

    if (error && data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-zinc-600">
          <AlertCircle className="size-8 text-red-500/50 mb-2" />
          <p className="text-xs uppercase tracking-wider text-red-500/50 font-black">Link Broken</p>
          <p className="text-[10px] text-zinc-700 mt-1 max-w-[150px] text-center">{error}</p>
        </div>
      );
    }

    if (card.chartType === 'badge' || card.chartType === 'text') {
      return (
        <div className="flex flex-col items-center justify-center h-48">
          <div className="text-5xl font-black text-zinc-100 tracking-tighter" style={{ color: card.color }}>
            {signature.endVal}
          </div>
          <div className="mt-4">
             <Badge className={`text-[10px] font-black uppercase ${signature.pctChange >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
               {signature.pctChange >= 0 ? '+' : ''}{signature.pctChange}%
             </Badge>
          </div>
        </div>
      );
    }

    const mainColor = card.color || '#3b82f6';

    return (
      <div ref={containerRef} className="h-48 min-h-[192px] w-full mt-4">
        {containerRef.current && (
          <ResponsiveContainer width="100%" height="100%">
            {card.chartType === 'step' ? (
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={`grad-${card.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={mainColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={mainColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                {card.showGrid !== false && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.5} />}
                <XAxis dataKey="_time" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: mainColor, fontSize: '12px' }}
                />
                <Area 
                  type="stepAfter" 
                  dataKey="_value" 
                  stroke={mainColor} 
                  fillOpacity={1} 
                  fill={`url(#grad-${card.id})`} 
                  strokeWidth={2}
                  dot={card.showPoints ? { r: 2, fill: mainColor } : false}
                  animationDuration={500}
                />
              </AreaChart>
            ) : (
              <LineChart data={data}>
                {card.showGrid !== false && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.5} />}
                <XAxis dataKey="_time" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: mainColor, fontSize: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="_value" 
                  stroke={mainColor} 
                  dot={card.showPoints ? { r: 2, fill: mainColor } : false} 
                  strokeWidth={2}
                  animationDuration={500}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    );
  };

  return (
    <>
      <Card 
        className={`border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-all duration-300 group cursor-pointer h-full flex flex-col relative overflow-hidden`}
        onClick={() => setDrilldown({
          title: card.title,
          metricName: card.metricName,
          data: data,
          signature: signature
        })}
      >
        <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 shrink-0 z-10">
          <div className="overflow-hidden">
            <CardTitle className="text-sm font-black text-zinc-400 group-hover:text-zinc-100 transition-colors truncate uppercase tracking-wider">
              {card.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
               <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-[9px] uppercase tracking-[0.15em] text-zinc-600 font-bold truncate">
                 {card.metricName.split('/').pop()}
               </p>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-7 text-zinc-700 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
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
              className="size-7 text-zinc-700 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                removeCard(card.id);
              }}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-between relative z-10">
          {renderChart()}
          <div className="flex items-center justify-between mt-6 shrink-0 pt-4 border-t border-zinc-800/30">
            <div className="flex flex-col">
               <span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">Statistical Avg</span>
               <span className="text-xs text-zinc-300 font-mono font-bold">{signature.avg}</span>
            </div>
            <div className="flex flex-col text-right">
               <span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">Window</span>
               <span className="text-xs text-zinc-400 font-mono">{card.timeRange === 'custom' ? 'LIVE' : card.timeRange}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="bg-zinc-950 border-zinc-800 sm:max-w-xl shadow-2xl">
           <DialogHeader>
             <DialogTitle className="text-xl font-black uppercase tracking-tighter text-zinc-100">Configure Monitor</DialogTitle>
           </DialogHeader>
           <div className="mt-4">
             <CardEditorForm card={card} onComplete={() => setIsEditing(false)} />
           </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
