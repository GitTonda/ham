'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Save, Trash2, Search, RefreshCw, Palette, Grid3X3, CircleDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/store/useAppStore';
import { DashboardCard, ChartType } from '@/types';
import { CONSTANTS } from '@/config/constants';
import { generateId } from '@/lib/utils';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  sourceType: z.string().min(1, { message: 'Source type is required.' }),
  metricCategory: z.string().min(1, { message: 'Metric category is required.' }),
  host: z.string().min(1, { message: 'Host is required.' }),
  metricName: z.string().min(1, { message: 'Metric name is required.' }),
  chartType: z.enum(['line', 'step', 'badge', 'text'] as const),
  timeRange: z.string().min(1, { message: 'Time range is required.' }),
  refreshInterval: z.preprocess((val) => Number(val), z.number().min(5, { message: 'Interval must be at least 5s.' })),
  width: z.preprocess((val) => Number(val), z.number().min(1).max(4).default(1)),
  color: z.string().optional(),
  showGrid: z.boolean().default(true),
  showPoints: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface CardEditorFormProps {
  card?: DashboardCard;
  onComplete?: () => void;
}

/**
 * Card Editor Form component.
 * Features a full sensor picker and expanded visualization settings.
 */
export const CardEditorForm = ({ card, onComplete }: CardEditorFormProps) => {
  const addCard = useAppStore((state) => state.addCard);
  const updateCard = useAppStore((state) => state.updateCard);
  const removeCard = useAppStore((state) => state.removeCard);

  const [sensors, setSensors] = useState<string[]>([]);
  const [loadingSensors, setLoadingSensors] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchSensors = async () => {
      setLoadingSensors(true);
      try {
        const res = await fetch('/api/sensors');
        const data = await res.json();
        if (data.sensors) setSensors(data.sensors);
      } catch (err) {
        console.error('Failed to fetch sensors:', err);
      } finally {
        setLoadingSensors(false);
      }
    };
    fetchSensors();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: (card as any) || {
      title: '',
      sourceType: 'sensor',
      metricCategory: 'ha_pfd',
      host: 'mqtt_broker',
      metricName: '',
      chartType: 'line' as const,
      timeRange: '-1h',
      refreshInterval: 60,
      color: '#3b82f6',
      showGrid: true,
      showPoints: false,
    },
  });

  const onSubmit = (values: FormValues) => {
    if (card) {
      updateCard(card.id, values);
    } else {
      addCard({
        ...values,
        id: generateId(),
      });
    }
    form.reset();
    if (onComplete) onComplete();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400 text-[10px] uppercase font-black tracking-widest">Display Identifier</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Load Balancer Output" className="bg-zinc-900 border-zinc-800 h-10 font-bold" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metricName"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-zinc-400 text-[10px] uppercase font-black tracking-widest">InfluxDB Data Point (Topic)</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <button
                        type="button"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                          "w-full flex items-center justify-between rounded-lg border bg-clip-padding font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 h-10 px-3 bg-zinc-900 border-zinc-800 font-mono text-xs text-zinc-300",
                          !field.value && "text-zinc-500"
                        )}
                      >
                        <span className="truncate">
                          {field.value
                            ? sensors.find((s) => s === field.value) || field.value
                            : "Search telemetry streams..."}
                        </span>
                        {loadingSensors ? <RefreshCw className="ml-2 h-4 w-4 shrink-0 animate-spin" /> : <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
                      </button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-zinc-950 border-zinc-800 shadow-2xl">
                    <Command className="bg-transparent">
                      <CommandInput placeholder="Filter sensors..." className="h-10 text-zinc-300" />
                      <CommandList className="max-h-[300px]">
                        <CommandEmpty>No telemetry stream found.</CommandEmpty>
                        <CommandGroup>
                          {sensors.map((sensor) => (
                            <CommandItem
                              key={sensor}
                              value={sensor}
                              onSelect={() => {
                                form.setValue("metricName", sensor);
                                if (!form.getValues("title")) {
                                  const parts = sensor.split('/');
                                  form.setValue("title", parts[parts.length - 2]?.replace(/_/g, ' ').toUpperCase() || sensor);
                                }
                                setOpen(false);
                              }}
                              className="text-[10px] font-mono text-zinc-500 hover:text-zinc-100 cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-3 w-3",
                                  sensor === field.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {sensor}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="chartType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400 text-[10px] uppercase font-black tracking-widest">Visualization</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-xs h-10 font-bold">
                      <SelectValue placeholder="Format" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                    {CONSTANTS.CHART_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-[10px] uppercase font-black">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timeRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400 text-[10px] uppercase font-black tracking-widest">Time Window</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-xs h-10 font-bold">
                      <SelectValue placeholder="Range" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                    {CONSTANTS.TIME_RANGES.map((range) => (
                      <SelectItem key={range.value} value={range.value} className="text-[10px] font-black uppercase">
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="refreshInterval"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400 text-[10px] uppercase font-black tracking-widest">Poling Rate (s)</FormLabel>
                <FormControl>
                  <Input type="number" className="bg-zinc-900 border-zinc-800 h-10 text-xs font-mono font-bold text-blue-500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="width"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400 text-[10px] uppercase font-black tracking-widest">Card Span</FormLabel>
                <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value.toString()}>
                  <FormControl>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-xs h-10 font-bold">
                      <SelectValue placeholder="Size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                    <SelectItem value="1" className="text-[10px] font-black uppercase">Standard (1x)</SelectItem>
                    <SelectItem value="2" className="text-[10px] font-black uppercase">Wide (2x)</SelectItem>
                    <SelectItem value="3" className="text-[10px] font-black uppercase">Large (3x)</SelectItem>
                    <SelectItem value="4" className="text-[10px] font-black uppercase">Full (4x)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-y border-zinc-900">
           <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <Palette className="size-3" /> Appearance Options
              </h4>
              
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0 rounded-lg border border-zinc-900 p-3 bg-zinc-900/20">
                    <FormLabel className="text-xs font-bold text-zinc-400">Accent Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                         <div className="size-4 rounded-full" style={{ backgroundColor: field.value }} />
                         <Input type="text" className="h-8 w-24 text-[10px] font-mono bg-zinc-950 border-zinc-800" {...field} />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
           </div>

           <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <Grid3X3 className="size-3" /> Grid Settings
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="showGrid"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-900 p-3 bg-zinc-900/20">
                      <FormLabel className="text-[10px] font-bold text-zinc-400 uppercase">Show Grid</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="scale-75"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="showPoints"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-900 p-3 bg-zinc-900/20">
                      <FormLabel className="text-[10px] font-bold text-zinc-400 uppercase">Points</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="scale-75"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
           </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {card && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                removeCard(card.id);
                if (onComplete) onComplete();
              }}
              className="bg-red-500/5 text-red-500 hover:bg-red-500/10 border border-red-500/10 text-[10px] font-black uppercase tracking-widest px-4"
            >
              <Trash2 className="size-3 mr-2" /> Decommission
            </Button>
          )}
          <div className="flex-1" />
          <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-8 h-10 shadow-lg shadow-blue-900/20">
            <Save className="size-3 mr-2" /> {card ? 'Push Configuration' : 'Initialize Monitor'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
