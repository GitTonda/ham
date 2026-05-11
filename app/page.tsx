'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GlobalNav } from "@/components/layout/GlobalNav";
import { GlobalSettings } from "@/components/modals/GlobalSettings";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { QueryInsightOverlay } from "@/components/modals/QueryInsightOverlay";
import { DrilldownPopup } from "@/components/modals/DrilldownPopup";
import { InsightResponse, ChatMessage } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { Brain, User, Sparkles, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateId } from '@/lib/utils';

export default function Home() {
  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [isInsightOpen, setIsInsightOpen] = useState(false);
  
  const setQuerying = useAppStore((state) => state.setQuerying);
  const isQuerying = useAppStore((state) => state.isQuerying);
  const chatHistory = useAppStore((state) => state.chatHistory);
  const addChatMessage = useAppStore((state) => state.addChatMessage);
  const clearChatHistory = useAppStore((state) => state.clearChatHistory);
  const updateTokenUsage = useAppStore((state) => state.updateTokenUsage);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isQuerying]);

  const handleSearch = async (query: string) => {
    if (!query || isQuerying) return;
    
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
        id: generateId(),
        role: 'assistant',
        content: 'I encountered an error trying to process that query. This usually happens if the database is disconnected or the AI engine timed out.',
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
          {(chatHistory.length > 0 || isQuerying) && (
            <div className="w-full max-w-4xl mx-auto space-y-4 mb-8 border border-zinc-800/50 bg-zinc-900/10 rounded-xl p-6 relative shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black">
                  <Sparkles className="size-3 text-blue-500 animate-pulse" />
                  Interaction Stream
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearChatHistory}
                  className="text-zinc-600 hover:text-red-400 h-6 px-2 text-[10px] font-bold uppercase tracking-wider"
                >
                  <Trash2 className="size-3 mr-1" /> Clear Session
                </Button>
              </div>
              
              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-zinc-800">
                {chatHistory.map((msg) => (
                  <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${
                        msg.role === 'user' ? 'bg-zinc-800 border border-zinc-700' : 'bg-blue-600/10 border border-blue-500/20'
                      }`}>
                        {msg.role === 'user' ? <User className="size-4 text-zinc-500" /> : <Brain className="size-4 text-blue-500" />}
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-zinc-900 text-zinc-200 rounded-tr-none border border-zinc-800 shadow-sm' 
                          : 'bg-zinc-900/40 text-zinc-300 rounded-tl-none border border-zinc-800/50'
                      }`}>
                        {msg.content}
                        {msg.insight && (
                          <div className="mt-4 pt-4 border-t border-zinc-800/50 flex flex-col gap-3">
                             <div className="flex items-center gap-4">
                                <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Analysis Engine Result</div>
                                <div className="h-px flex-1 bg-zinc-800/50" />
                             </div>
                             <div className="flex gap-2">
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  className="h-8 bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600/20 text-[10px] font-black uppercase tracking-wider"
                                  onClick={() => {
                                    setInsight(msg.insight!);
                                    setIsInsightOpen(true);
                                  }}
                                >
                                  Explore Data View
                                </Button>
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isQuerying && (
                  <div className="flex gap-4 justify-start animate-in fade-in slide-in-from-left-2 duration-500">
                    <div className="flex gap-3 max-w-[85%]">
                      <div className="size-8 rounded-full flex items-center justify-center shrink-0 bg-blue-600/10 border border-blue-500/20">
                        <RefreshCw className="size-4 text-blue-500 animate-spin" />
                      </div>
                      <div className="p-4 rounded-2xl rounded-tl-none bg-zinc-900/40 border border-zinc-800/50 flex items-center gap-3">
                        <span className="text-sm text-zinc-500 italic">Synthesizing insight from InfluxDB...</span>
                        <div className="flex gap-1">
                          <span className="size-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="size-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="size-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} className="h-4" />
              </div>
            </div>
          )}

          {/* Dashboard Section */}
          <div className="flex-1">
             <div className="flex items-center gap-2 mb-6">
               <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Active Monitoring Grid</h2>
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
