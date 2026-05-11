import { NextRequest, NextResponse } from 'next/server';
import { influxClient } from '@/lib/influx-client';
import { env } from '@/config/env';

/**
 * Data API Route.
 * Fetches time-series data for a specific metric.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bucket = searchParams.get('bucket') || env.influx.bucket;
    const metric = searchParams.get('metric');
    const range = searchParams.get('range') || '-1h';

    if (!metric) {
      return NextResponse.json({ error: 'Metric name is required' }, { status: 400 });
    }

    const fluxQuery = `
      from(bucket: "${bucket}")
      |> range(start: ${range})
      |> filter(fn: (r) => r["_field"] == "${metric}")
      |> aggregateWindow(every: 1m, fn: mean, createEmpty: false)
      |> yield(name: "mean")
    `;

    const data = await influxClient.query(fluxQuery);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Data API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * Handle custom flux queries.
 */
export async function POST(req: NextRequest) {
  try {
    const { fluxQuery } = await req.json();

    if (!fluxQuery) {
      return NextResponse.json({ error: 'Flux query is required' }, { status: 400 });
    }

    const data = await influxClient.query(fluxQuery);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Data API (POST) Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
