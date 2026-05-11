'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Save, Trash2, Search, RefreshCw } from 'lucide-react';
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
import { useAppStore } from '@/store/useAppStore';
import { DashboardCard, ChartType } from '@/types';
import { CONSTANTS } from '@/config/constants';
import { Combobox } from '@/components/ui/combobox'; // Assuming we have one or will create a simple one
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
});

type FormValues = z.infer<typeof formSchema>;

interface CardEditorFormProps {
  card?: DashboardCard;
  onComplete?: () => void;
}

/**
 * Card Editor Form component.
 * Features a full sensor picker connected to InfluxDB.
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
    defaultValues: (card as FormValues) || {
      title: '',
      sourceType: 'sensor',
      metricCategory: 'ha_pfd',
      host: 'mqtt_broker',
      metricName: '',
      chartType: 'line' as const,
      timeRange: '-1h',
      refreshInterval: 60,
    },
  });

  const onSubmit = (values: FormValues) => {
    const generateId = () => typeof crypto.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 11);

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400">Display Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Living Room Temperature" className="bg-zinc-900 border-zinc-800" {...field} />
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
                <FormLabel className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Select Sensor (from InfluxDB)</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger>
                    <FormControl>
                      <button
                        type="button"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                          "w-full flex items-center justify-between rounded-lg border bg-clip-padding font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 gap-1.5 px-2.5 h-10 bg-zinc-900 border-zinc-800 font-mono text-xs text-zinc-300",
                          !field.value && "text-zinc-500"
                        )}
                      >
                        <span className="truncate">
                          {field.value
                            ? sensors.find((s) => s === field.value) || field.value
                            : "Search sensors..."}
                        </span>
                        {loadingSensors ? <RefreshCw className="ml-2 h-4 w-4 shrink-0 animate-spin" /> : <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
                      </button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-zinc-950 border-zinc-800">
                    <Command className="bg-transparent">
                      <CommandInput placeholder="Search sensors..." className="h-9 text-zinc-300" />
                      <CommandList>
                        <CommandEmpty>No sensor found.</CommandEmpty>
                        <CommandGroup>
                          {sensors.map((sensor) => (
                            <CommandItem
                              key={sensor}
                              value={sensor}
                              onSelect={() => {
                                form.setValue("metricName", sensor);
                                if (!form.getValues("title")) {
                                  // Auto-generate title from topic if empty
                                  const parts = sensor.split('/');
                                  form.setValue("title", parts[parts.length - 2]?.replace(/_/g, ' ') || sensor);
                                }
                                setOpen(false);
                              }}
                              className="text-xs font-mono text-zinc-400 hover:text-zinc-100"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
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
                <FormDescription className="text-[10px] text-zinc-600">
                  Pick a topic from your MQTT consumer bucket.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="chartType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Visualization</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-xs h-10">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                    {CONSTANTS.CHART_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-xs uppercase">
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
                <FormLabel className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Range</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-xs h-10">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                    {CONSTANTS.TIME_RANGES.map((range) => (
                      <SelectItem key={range.value} value={range.value} className="text-xs">
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
                <FormLabel className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Rate (s)</FormLabel>
                <FormControl>
                  <Input type="number" className="bg-zinc-900 border-zinc-800 h-10 text-xs font-mono" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-zinc-900">
          {card && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                removeCard(card.id);
                if (onComplete) onComplete();
              }}
              className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 text-[10px] uppercase font-bold"
            >
              <Trash2 className="size-3 mr-2" /> Remove Card
            </Button>
          )}
          <div className="flex-1" />
          <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] uppercase font-bold px-4">
            <Save className="size-3 mr-2" /> {card ? 'Save Changes' : 'Create Monitor'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
