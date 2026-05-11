'use client';

import React, { useState } from 'react';
import { GlobalNav } from "@/components/layout/GlobalNav";
import { GlobalSettings } from "@/components/modals/GlobalSettings";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { QueryInsightOverlay } from "@/components/modals/QueryInsightOverlay";
import { DrilldownPopup } from "@/components/modals/DrilldownPopup";
import { siteConfig } from "@/config/site";
import { InsightResponse } from '@/types';
import { useAppStore } from '@/store/useAppStore';

export default function Home() {
  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [isInsightOpen, setIsInsightOpen] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  
  const setQuerying = useAppStore((state) => state.setQuerying);

  const handleSearch = async (query: string) => {
    if (!query) return;
    
    setLastQuery(query);
    setQuerying(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      
      if (!res.ok) throw new Error('Search failed');
      
      const data = await res.json();
      setInsight(data);
      setIsInsightOpen(true);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setQuerying(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <GlobalNav onSearch={handleSearch} />
      
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto">
          <DashboardGrid />
        </div>
      </main>

      <GlobalSettings />
      <QueryInsightOverlay 
        isOpen={isInsightOpen} 
        onClose={() => setIsInsightOpen(false)} 
        insight={insight}
        query={lastQuery}
      />
      <DrilldownPopup />
    </div>
  );
}
