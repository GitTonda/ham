import { NextResponse } from 'next/server';
import { influxClient } from '@/lib/influx-client';
import { env } from '@/config/env';

export const dynamic = 'force-dynamic';

/**
 * API to list all available sensors (topics) from InfluxDB.
 */
export async function GET() {
  try {
    const bucket = env.influx.bucket;
    const fluxQuery = `
      import "influxdata/influxdb/schema"
      schema.tagValues(bucket: "${bucket}", tag: "topic")
    `;

    const data = await influxClient.query(fluxQuery);
    const sensors = data.map(d => d._value).filter(Boolean);

    return NextResponse.json({ sensors });
  } catch (error) {
    console.error('Sensors API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch sensors' }, { status: 500 });
  }
}
