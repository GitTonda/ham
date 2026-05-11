'use client';

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from '@/components/ui/dialog';
import { useAppStore } from '@/store/useAppStore';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

/**
 * DrilldownPopup component.
 * Displays detailed, expanded view of metric data.
 */
export const DrilldownPopup = () => {
  const activeData = useAppStore((state) => state.activeDrilldownData);
  const setDrilldown = useAppStore((state) => state.setDrilldown);

  if (!activeData) return null;

  return (
    <Dialog open={!!activeData} onOpenChange={() => setDrilldown(null)}>
      <DialogContent className="max-w-6xl bg-zinc-950 border-zinc-800 h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl text-zinc-100">
            {activeData.title || 'Data Drilldown'}
          </DialogTitle>
          <DialogDescription className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
            {activeData.metricName} • Detailed Analysis
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 w-full mt-6 bg-zinc-900/20 rounded-lg p-6 border border-zinc-800/50">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activeData.data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
              <XAxis 
                dataKey="_time" 
                stroke="#52525b" 
                fontSize={12}
                tickFormatter={(val) => new Date(val).toLocaleTimeString()}
              />
              <YAxis 
                stroke="#52525b" 
                fontSize={12}
                tickFormatter={(val) => val.toFixed(1)}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                labelFormatter={(label) => new Date(label).toLocaleString()}
              />
              <Legend verticalAlign="top" height={36}/>
              <Line 
                name={activeData.metricName}
                type="monotone" 
                dataKey="_value" 
                stroke="#3b82f6" 
                dot={{ r: 4, strokeWidth: 0, fill: '#3b82f6' }} 
                activeDot={{ r: 6, strokeWidth: 0 }}
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="p-4 rounded-md border border-zinc-800 bg-zinc-900/50">
            <p className="text-[10px] text-zinc-500 uppercase">Average</p>
            <p className="text-xl font-bold text-zinc-100">{activeData.signature?.avg || 'N/A'}</p>
          </div>
          <div className="p-4 rounded-md border border-zinc-800 bg-zinc-900/50">
            <p className="text-[10px] text-zinc-500 uppercase">Minimum</p>
            <p className="text-xl font-bold text-zinc-100">{activeData.signature?.min || 'N/A'}</p>
          </div>
          <div className="p-4 rounded-md border border-zinc-800 bg-zinc-900/50">
            <p className="text-[10px] text-zinc-500 uppercase">Maximum</p>
            <p className="text-xl font-bold text-zinc-100">{activeData.signature?.max || 'N/A'}</p>
          </div>
          <div className="p-4 rounded-md border border-zinc-800 bg-zinc-900/50">
            <p className="text-[10px] text-zinc-500 uppercase">Sample Count</p>
            <p className="text-xl font-bold text-zinc-100">{activeData.signature?.count || '0'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
