'use client';

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, X, BarChart3, Info } from 'lucide-react';
import { InsightResponse } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { generateId } from '@/lib/utils';

interface QueryInsightOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  insight: InsightResponse | null;
  query: string;
}

/**
 * QueryInsightOverlay component.
 * Displays AI insights and data preview for natural language queries.
 */
export const QueryInsightOverlay = ({ 
  isOpen, 
  onClose, 
  insight, 
  query 
}: QueryInsightOverlayProps) => {
  const addCard = useAppStore((state) => state.addCard);

  if (!insight) return null;

  const handleAddCard = () => {
    addCard({
      id: generateId(),
      title: query,
      sourceType: 'ai_query',
      metricCategory: 'ai',
      host: 'ai_engine',
      metricName: 'insight',
      chartType: insight.suggestedChartType,
      timeRange: 'custom',
      refreshInterval: 300,
      fluxQuery: insight.fluxQuery,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-zinc-950 border-zinc-800 text-zinc-300">
        <DialogHeader>
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <BarChart3 className="size-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Analysis Result</span>
          </div>
          <DialogTitle className="text-2xl font-black tracking-tighter text-zinc-100">
            {query}
          </DialogTitle>
          <DialogDescription className="text-zinc-500 mt-2 leading-relaxed">
            {insight.insightText}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <Info className="size-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Suggested Configuration</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-zinc-600 uppercase font-black">Chart Type</span>
              <span className="text-sm font-mono text-zinc-300 uppercase">{insight.suggestedChartType}</span>
            </div>
            <div className="flex flex-col gap-1 text-right">
              <span className="text-[10px] text-zinc-600 uppercase font-black">Data Source</span>
              <span className="text-sm font-mono text-zinc-300">InfluxDB (Flux)</span>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-8 flex gap-3 sm:justify-end">
          <Button variant="ghost" onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            Dismiss
          </Button>
          <Button onClick={handleAddCard} className="bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider px-6 h-10">
            <Plus className="size-4 mr-2" /> Pin to Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
