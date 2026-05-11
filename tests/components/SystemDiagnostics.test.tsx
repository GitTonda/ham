import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { SystemDiagnostics } from '@/components/settings/SystemDiagnostics';

// Mock global fetch
global.fetch = jest.fn();

describe('SystemDiagnostics', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders correctly and fetches health data', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        status: 'healthy',
        services: {
          influxdb: 'UP',
          anthropic: 'OK',
        },
      }),
    });

    await act(async () => {
      render(<SystemDiagnostics />);
    });

    expect(screen.getByText(/Service Connectivity/i)).toBeInTheDocument();
    
    await waitFor(() => {
      const passBadges = screen.getAllByText(/PASS/i);
      expect(passBadges).toHaveLength(2);
    });
  });

  it('displays FAIL badges when services are down', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        status: 'degraded',
        services: {
          influxdb: 'DOWN',
          anthropic: 'DOWN',
        },
      }),
    });

    await act(async () => {
      render(<SystemDiagnostics />);
    });

    await waitFor(() => {
      const failBadges = screen.getAllByText(/FAIL/i);
      expect(failBadges).toHaveLength(2);
    });
  });

  it('triggers a re-fetch when clicking Run Ping Tests', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        status: 'healthy',
        services: { influxdb: 'UP', anthropic: 'OK' },
      }),
    });

    await act(async () => {
      render(<SystemDiagnostics />);
    });
    
    const refreshButton = screen.getByRole('button', { name: /Run Ping Tests/i });
    
    await act(async () => {
      fireEvent.click(refreshButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
