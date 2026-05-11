import { NextResponse } from 'next/server';
import { influxClient } from '@/lib/influx-client';

export const dynamic = 'force-dynamic';

/**
 * Health check endpoint for system diagnostics.
 * Verifies connectivity to InfluxDB and returns overall status.
 */
export async function GET() {
  try {
    let influxError = null;
    let isInfluxHealthy = false;
    
    try {
      isInfluxHealthy = await influxClient.ping();
    } catch (e) {
      influxError = e instanceof Error ? e.message : String(e);
    }
    
    const status = isInfluxHealthy ? 'healthy' : 'degraded';
    
    return NextResponse.json({
      status,
      timestamp: new Date().toISOString(),
      services: {
        influxdb: isInfluxHealthy ? 'UP' : 'DOWN',
        anthropic: 'OK',
      },
      debug: influxError ? { influx: influxError } : undefined,
    }, {
      status: isInfluxHealthy ? 200 : 503,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, {
      status: 500,
    });
  }
}
