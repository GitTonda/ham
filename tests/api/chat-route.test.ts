/**
 * @jest-environment node
 */

// Mock dependencies before importing anything else
jest.mock('@/lib/llm-service', () => ({
  llmService: {
    processQuery: jest.fn(),
  },
}));
jest.mock('@/lib/influx-client', () => ({
  influxClient: {
    query: jest.fn(),
  },
}));

import { POST } from '@/app/api/chat/route';
import { llmService } from '@/lib/llm-service';
import { influxClient } from '@/lib/influx-client';
import { NextRequest } from 'next/server';

describe('Chat API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 if query is missing', async () => {
    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Query is required');
  });

  it('successfully processes a query and returns data', async () => {
    (llmService.processQuery as jest.Mock).mockResolvedValue({
      insightText: 'High temperature detected',
      suggestedChartType: 'line',
      fluxQuery: 'from(bucket: "ha") |> range(start: -1h)',
    });

    (influxClient.query as jest.Mock).mockResolvedValue([
      { _time: '2024-01-01T00:00:00Z', _value: 25 },
    ]);

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ query: 'how hot is it?' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data.insightText).toBe('High temperature detected');
    expect(data.data).toHaveLength(1);
  });

  it('returns 500 if an error occurs', async () => {
    (llmService.processQuery as jest.Mock).mockRejectedValue(new Error('LLM Error'));

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ query: 'test' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('LLM Error');
  });
});
