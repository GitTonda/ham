import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { DashboardCard } from '@/types';

// Mock global fetch
global.fetch = jest.fn();

// Mock Recharts to avoid rendering issues in Jest
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  LineChart: () => <div data-testid="line-chart" />,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
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

  it('renders card title and metadata', () => {
    render(<ChartCard card={mockCard} />);
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText(/home_assistant • temp/i)).toBeInTheDocument();
  });

  it('fetches data on mount', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: [{ _time: '2024-01-01', _value: 20 }] }),
    });

    render(<ChartCard card={mockCard} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/data'));
    });
  });

  it('displays error state on fetch failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<ChartCard card={mockCard} />);

    await waitFor(() => {
      expect(screen.getByText(/Connection Lost/i)).toBeInTheDocument();
    });
  });
});
