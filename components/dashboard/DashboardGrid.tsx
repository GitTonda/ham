'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ChartCard } from './ChartCard';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * DashboardGrid component.
 * Arranges ChartCards in a responsive grid layout.
 */
export const DashboardGrid = () => {
  const cards = useAppStore((state) => state.cards);
  const toggleSettings = useAppStore((state) => state.toggleSettings);

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-zinc-800 rounded-lg p-12 text-center">
        <div className="bg-zinc-900 p-4 rounded-full mb-4">
          <Plus className="size-8 text-zinc-500" />
        </div>
        <h3 className="text-xl font-medium text-zinc-200 mb-2">Empty Dashboard</h3>
        <p className="text-zinc-500 max-w-sm mb-6">
          You haven't added any monitor cards yet. Use the "ASK ON HOUSE" bar or manually create cards in settings.
        </p>
        <Button 
          onClick={toggleSettings}
          className="bg-blue-600 hover:bg-blue-500 text-white"
        >
          Add Your First Card
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-fr">
      {cards.map((card) => {
        const colSpan = card.width === 2 ? 'sm:col-span-2' : 
                        card.width === 3 ? 'lg:col-span-3 sm:col-span-2' : 
                        card.width === 4 ? '2xl:col-span-4 lg:col-span-3 sm:col-span-2' : '';
        
        return (
          <div key={card.id} className={`min-h-[300px] ${colSpan}`}>
            <ChartCard card={card} />
          </div>
        );
      })}
    </div>
  );
};
