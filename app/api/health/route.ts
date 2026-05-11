import { NextResponse } from 'next/server';
import { influxClient } from '@/lib/influx-client';
import { env } from '@/config/env';

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
      version: '1.2.0-url-debug',
      timestamp: new Date().toISOString(),
      services: {
        influxdb: isInfluxHealthy ? 'UP' : 'DOWN',
        anthropic: 'OK',
      },
      debug: {
        influx_url: env.influx.url,
        influx_error: influxError || (isInfluxHealthy ? null : 'Unknown failure (ping returned false without error)'),
      },
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
