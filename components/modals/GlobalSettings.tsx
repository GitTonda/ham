'use client';

import React from 'react';
import { Settings, Palette, Database, Brain, Layout, Activity } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/useAppStore';
import { SystemDiagnostics } from '@/components/settings/SystemDiagnostics';
import { CardEditorForm } from '@/components/forms/CardEditorForm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

/**
 * Global Settings component.
 * Features a tabbed interface for system configuration.
 */
export const GlobalSettings = () => {
  const isOpen = useAppStore((state) => state.isSettingsOpen);
  const toggleSettings = useAppStore((state) => state.toggleSettings);
  const cards = useAppStore((state) => state.cards);
  const removeCard = useAppStore((state) => state.removeCard);

  return (
    <Sheet open={isOpen} onOpenChange={toggleSettings}>
      <SheetContent className="w-full sm:max-w-2xl bg-zinc-950 border-zinc-800 p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Settings className="size-5 text-blue-500" />
            <SheetTitle className="text-zinc-100">System Control Panel</SheetTitle>
          </div>
          <SheetDescription className="text-zinc-500">
            Manage your dashboard, database connections, and AI preferences.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="diagnostics" className="flex-1 flex flex-col h-full">
          <div className="px-6 py-2 bg-zinc-900/50 border-b border-zinc-800">
            <TabsList className="bg-transparent gap-2 h-auto p-0">
              <TabsTrigger
                value="appearance"
                className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500 px-3 py-1.5 text-xs uppercase tracking-wider"
              >
                <Palette className="size-3 mr-2" /> Appearance
              </TabsTrigger>
              <TabsTrigger
                value="database"
                className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500 px-3 py-1.5 text-xs uppercase tracking-wider"
              >
                <Database className="size-3 mr-2" /> Database
              </TabsTrigger>
              <TabsTrigger
                value="llm"
                className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500 px-3 py-1.5 text-xs uppercase tracking-wider"
              >
                <Brain className="size-3 mr-2" /> LLM
              </TabsTrigger>
              <TabsTrigger
                value="cards"
                className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500 px-3 py-1.5 text-xs uppercase tracking-wider"
              >
                <Layout className="size-3 mr-2" /> Cards
              </TabsTrigger>
              <TabsTrigger
                value="diagnostics"
                className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500 px-3 py-1.5 text-xs uppercase tracking-wider"
              >
                <Activity className="size-3 mr-2" /> Diagnostics
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-6">
            <TabsContent value="appearance" className="mt-0 outline-none">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-zinc-100">UI Preferences</h3>
                <p className="text-sm text-zinc-500">Customize the visual density and theme.</p>
                <div className="p-4 rounded-md border border-zinc-800 bg-zinc-900/50">
                  <span className="text-sm text-zinc-400">Current Theme: </span>
                  <span className="text-sm font-bold text-blue-500 uppercase">Dark (Forced)</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="database" className="mt-0 outline-none">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-zinc-100">InfluxDB Configuration</h3>
                <p className="text-sm text-zinc-500">Manage your connection to the time-series engine.</p>
                <div className="grid gap-3 p-4 rounded-md border border-zinc-800 bg-zinc-900/50">
                   <div className="flex justify-between text-xs">
                     <span className="text-zinc-500">ORG:</span>
                     <span className="text-zinc-300 font-mono">{process.env.NEXT_PUBLIC_INFLUXDB_ORG || 'Adenda-Monitor'}</span>
                   </div>
                   <div className="flex justify-between text-xs">
                     <span className="text-zinc-500">BUCKET:</span>
                     <span className="text-zinc-300 font-mono">{process.env.NEXT_PUBLIC_INFLUXDB_BUCKET || 'ha_pfd'}</span>
                   </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="llm" className="mt-0 outline-none">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-zinc-100">AI Engine</h3>
                <p className="text-sm text-zinc-500">Configure your natural language translation settings.</p>
                <div className="p-4 rounded-md border border-zinc-800 bg-zinc-900/50">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">MODEL:</span>
                    <span className="text-zinc-300 font-mono">{process.env.NEXT_PUBLIC_LLM_MODEL || 'claude-opus-4-7'}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cards" className="mt-0 outline-none">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-zinc-100">Card Management</h3>
                  <p className="text-sm text-zinc-500">Manually add or edit your dashboard tiles.</p>
                </div>
                
                <CardEditorForm />

                {cards.length > 0 && (
                  <div className="space-y-4 mt-8">
                    <Separator className="bg-zinc-800" />
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-zinc-400">Existing Cards ({cards.length})</h4>
                      <div className="grid gap-2">
                        {cards.map((card) => (
                          <div key={card.id} className="p-3 rounded-md bg-zinc-900 border border-zinc-800 flex justify-between items-center group">
                            <div>
                              <p className="text-sm font-medium text-zinc-200">{card.title}</p>
                              <p className="text-xs text-zinc-500">{card.metricName} • {card.chartType}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeCard(card.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="diagnostics" className="mt-0 outline-none">
              <SystemDiagnostics />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
