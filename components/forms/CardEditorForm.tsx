'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Save, Trash2 } from 'lucide-react';
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

const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  sourceType: z.string().min(1, { message: 'Source type is required.' }),
  metricCategory: z.string().min(1, { message: 'Metric category is required.' }),
  host: z.string().min(1, { message: 'Host is required.' }),
  metricName: z.string().min(1, { message: 'Metric name is required.' }),
  chartType: z.enum(['line', 'step', 'badge', 'text'] as const),
  timeRange: z.string().min(1, { message: 'Time range is required.' }),
  refreshInterval: z.coerce.number().min(5, { message: 'Interval must be at least 5s.' }),
});

interface CardEditorFormProps {
  card?: DashboardCard;
  onComplete?: () => void;
}

/**
 * Card Editor Form component.
 * Used for creating and editing dashboard cards manually.
 */
export const CardEditorForm = ({ card, onComplete }: CardEditorFormProps) => {
  const addCard = useAppStore((state) => state.addCard);
  const updateCard = useAppStore((state) => state.updateCard);
  const removeCard = useAppStore((state) => state.removeCard);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: card || {
      title: '',
      sourceType: 'sensor',
      metricCategory: 'temperature',
      host: 'home_assistant',
      metricName: '',
      chartType: 'line',
      timeRange: '-1h',
      refreshInterval: 60,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (card) {
      updateCard(card.id, values);
    } else {
      addCard({
        ...values,
        id: crypto.randomUUID(),
      });
    }
    form.reset();
    if (onComplete) onComplete();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control= {form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400">Card Title</FormLabel>
                <FormControl>
                  <Input placeholder="Living Room Temp" className="bg-zinc-900 border-zinc-800" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metricName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400">Metric Name (Field)</FormLabel>
                <FormControl>
                  <Input placeholder="temperature" className="bg-zinc-900 border-zinc-800" {...field} />
                </FormControl>
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
                <FormLabel className="text-zinc-400">Chart Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    {CONSTANTS.CHART_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
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
                <FormLabel className="text-zinc-400">Time Range</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    {CONSTANTS.TIME_RANGES.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
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
                <FormLabel className="text-zinc-400">Refresh (s)</FormLabel>
                <FormControl>
                  <Input type="number" className="bg-zinc-900 border-zinc-800" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          {card && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                removeCard(card.id);
                if (onComplete) onComplete();
              }}
              className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
            >
              <Trash2 className="size-4 mr-2" /> Delete Card
            </Button>
          )}
          <div className="flex-1" />
          <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
            <Save className="size-4 mr-2" /> {card ? 'Update Card' : 'Create Card'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
