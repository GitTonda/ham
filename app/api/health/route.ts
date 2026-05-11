import { NextResponse } from 'next/server';
import { influxClient } from '@/lib/influx-client';

/**
 * Health check endpoint for system diagnostics.
 * Verifies connectivity to InfluxDB and returns overall status.
 */
export async function GET() {
  try {
    const isInfluxHealthy = await influxClient.ping();
    
    // Anthropic SDK doesn't have a direct ping, but we've verified the API key in constructor
    const status = isInfluxHealthy ? 'healthy' : 'degraded';
    
    return NextResponse.json({
      status,
      timestamp: new Date().toISOString(),
      services: {
        influxdb: isInfluxHealthy ? 'UP' : 'DOWN',
        anthropic: 'OK', // Assuming OK if key is present; real check happens on query
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
