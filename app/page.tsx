'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GlobalNav } from "@/components/layout/GlobalNav";
import { GlobalSettings } from "@/components/modals/GlobalSettings";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { QueryInsightOverlay } from "@/components/modals/QueryInsightOverlay";
import { DrilldownPopup } from "@/components/modals/DrilldownPopup";
import { InsightResponse, ChatMessage } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, User, Sparkles, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [isInsightOpen, setIsInsightOpen] = useState(false);
  
  const setQuerying = useAppStore((state) => state.setQuerying);
  const chatHistory = useAppStore((state) => state.chatHistory);
  const addChatMessage = useAppStore((state) => state.addChatMessage);
  const clearChatHistory = useAppStore((state) => state.clearChatHistory);
  const updateTokenUsage = useAppStore((state) => state.updateTokenUsage);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const generateId = () => typeof crypto.randomUUID === 'function' 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 11);

  const handleSearch = async (query: string) => {
    if (!query) return;
    
    // Add user message
    addChatMessage({
      id: generateId(),
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    });

    setQuerying(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      
      if (!res.ok) throw new Error('Search failed');
      
      const data: InsightResponse = await res.json();
      
      // Update tokens
      if (data.usage) {
        updateTokenUsage(data.usage.input_tokens, data.usage.output_tokens);
      }

      // Add assistant message
      addChatMessage({
        id: generateId(),
        role: 'assistant',
        content: data.insightText,
        timestamp: new Date().toISOString(),
        insight: data,
      });

      setInsight(data);
      setIsInsightOpen(true);
    } catch (err) {
      console.error('Search error:', err);
      addChatMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'I encountered an error trying to process that query. Please check your connection and try again.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setQuerying(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-300">
      <GlobalNav onSearch={handleSearch} />
      
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-hidden">
        <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col gap-8">
          
          {/* Chat History Section - Responsive & High Signal */}
          {chatHistory.length > 0 && (
            <div className="w-full max-w-4xl mx-auto space-y-4 mb-8 border border-zinc-800/50 bg-zinc-900/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-widest font-bold">
                  <Sparkles className="size-3 text-blue-500" />
                  Interaction Stream
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearChatHistory}
                  className="text-zinc-600 hover:text-red-400 h-6 px-2"
                >
                  <Trash2 className="size-3 mr-1" /> Clear
                </Button>
              </div>
              
              <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-zinc-800">
                {chatHistory.map((msg) => (
                  <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${
                        msg.role === 'user' ? 'bg-zinc-800' : 'bg-blue-600/20 border border-blue-500/30'
                      }`}>
                        {msg.role === 'user' ? <User className="size-4 text-zinc-400" /> : <Brain className="size-4 text-blue-400" />}
                      </div>
                      <div className={`p-3 rounded-2xl text-sm ${
                        msg.role === 'user' 
                          ? 'bg-zinc-900 text-zinc-200 rounded-tr-none border border-zinc-800' 
                          : 'bg-zinc-900/50 text-zinc-300 rounded-tl-none border border-zinc-800/50'
                      }`}>
                        {msg.content}
                        {msg.insight && (
                          <div className="mt-2 pt-2 border-t border-zinc-800/50">
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="h-auto p-0 text-blue-500 text-xs hover:text-blue-400"
                              onClick={() => {
                                setInsight(msg.insight!);
                                setIsInsightOpen(true);
                              }}
                            >
                              Re-view Data
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </div>
          )}

          {/* Dashboard Section */}
          <div className="flex-1">
             <div className="flex items-center gap-2 mb-6">
               <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Live Dashboard</h2>
               <div className="h-px flex-1 bg-zinc-900" />
             </div>
             <DashboardGrid />
          </div>
        </div>
      </main>

      <GlobalSettings />
      <QueryInsightOverlay 
        isOpen={isInsightOpen} 
        onClose={() => setIsInsightOpen(false)} 
        insight={insight}
        query={chatHistory.filter(m => m.role === 'user').slice(-1)[0]?.content || ''}
      />
      <DrilldownPopup />
    </div>
  );
}
