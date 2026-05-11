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
    const requestedBucket = searchParams.get('bucket');
    const metric = searchParams.get('metric');
    let range = searchParams.get('range') || '-1h';

    if (range === 'custom' || !range) range = '-1h';

    // If it's an AI insight card being refreshed, it MUST use POST with fluxQuery.
    // If it hits GET by mistake, we need to handle it gracefully.
    if (requestedBucket === 'ai') {
      return NextResponse.json({ data: [] });
    }

    const bucket = requestedBucket || env.influx.bucket;

    if (!metric) {
      return NextResponse.json({ error: 'Metric name is required' }, { status: 400 });
    }

    // Determine measurement - default to mqtt_consumer which we know exists
    const measurement = 'mqtt_consumer';

    // For Home Assistant InfluxDB, we usually filter by _field and often topic/entity_id.
    // If the 'metric' matches a known field, we query it.
    const fluxQuery = `
      from(bucket: "${bucket}")
      |> range(start: ${range})
      |> filter(fn: (r) => r["_measurement"] == "${measurement}")
      |> filter(fn: (r) => r["_field"] == "value")
      // If metric looks like a topic, filter by it, otherwise assume it's a field or part of topic
      |> filter(fn: (r) => r["topic"] =~ /${metric}/)
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
