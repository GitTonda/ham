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
import { InsightResponse, ChartType } from '@/types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Brain, Plus, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

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
      id: crypto.randomUUID(),
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
      <DialogContent className="max-w-4xl bg-zinc-950 border-zinc-800">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="size-5 text-purple-500" />
            <DialogTitle className="text-zinc-100 italic">" {query} "</DialogTitle>
          </div>
          <DialogDescription className="text-zinc-400 text-base">
            {insight.insightText}
          </DialogDescription>
        </DialogHeader>

        <div className="h-64 w-full mt-4 p-4 bg-zinc-900/30 border border-zinc-800 rounded-md">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={insight.data}>
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
                stroke="#8b5cf6" 
                dot={false} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="ghost" onClick={onClose} className="text-zinc-400">
            Dismiss
          </Button>
          <Button onClick={handleAddCard} className="bg-purple-600 hover:bg-purple-500 text-white">
            <Plus className="size-4 mr-2" /> Pin to Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
