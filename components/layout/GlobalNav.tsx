'use client';

import React from 'react';
import { Settings, Home, Search, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/useAppStore';
import { siteConfig } from '@/config/site';

/**
 * Global Navigation component.
 * Features the "ASK ON HOUSE" search bar and access to settings.
 */
export const GlobalNav = ({ onSearch }: { onSearch?: (query: string) => void }) => {
  const toggleSettings = useAppStore((state) => state.toggleSettings);
  const isQuerying = useAppStore((state) => state.isQuerying);
  const [query, setQuery] = React.useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(query);
      setQuery('');
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-2 font-bold text-zinc-100 mr-8">
          <Activity className="size-5 text-blue-500" />
          <span className="hidden md:inline-block tracking-tighter text-xl">
            {siteConfig.name}
          </span>
        </div>

        <div className="flex flex-1 items-center max-w-2xl mx-auto px-4 group">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
            <Input
              placeholder="ASK ON HOUSE (e.g., 'Show me power usage today')"
              className="w-full bg-zinc-900/50 border-zinc-800 pl-10 focus-visible:ring-1 focus-visible:ring-blue-500/50 h-10 text-zinc-200"
              disabled={isQuerying}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-8">
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
            onClick={toggleSettings}
          >
            <Settings className="size-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};
