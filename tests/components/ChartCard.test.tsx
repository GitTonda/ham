import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { DashboardCard } from '@/types';

// Mock global fetch
global.fetch = jest.fn();

// Mock Recharts to avoid rendering issues in Jest
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => <div>Line</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => <div>Area</div>,
}));

const mockCard: DashboardCard = {
  id: '1',
  title: 'Test Card',
  sourceType: 'sensor',
  metricCategory: 'temperature',
  host: 'home_assistant',
  metricName: 'temp',
  chartType: 'line',
  timeRange: '-1h',
  refreshInterval: 60,
};

describe('ChartCard', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders card title', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });

    render(<ChartCard card={mockCard} />);
    expect(screen.getByText('Test Card')).toBeInTheDocument();
  });

  it('fetches data on mount', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ _time: '2024-01-01T00:00:00Z', _value: 20 }] }),
    });

    render(<ChartCard card={mockCard} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/data?bucket=temperature&metric=temp&range=-1h')
      );
    });
  });

  it('displays error state on fetch failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<ChartCard card={mockCard} />);

    await waitFor(() => {
      expect(screen.getByText(/Link Broken/i)).toBeInTheDocument();
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });
});
