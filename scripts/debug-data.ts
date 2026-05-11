import { influxClient } from '../lib/influx-client';
import { llmService } from '../lib/llm-service';
import { env } from '../config/env';

async function debug() {
  console.log('--- STARTING DIAGNOSTICS ---\n');

  // 1. InfluxDB Test
  console.log('1. Testing InfluxDB Connectivity...');
  const isHealthy = await influxClient.ping();
  console.log('InfluxDB Healthy:', isHealthy);

  if (isHealthy) {
    console.log('\nFetching sample data from bucket: "' + env.influx.bucket + '"...');
    // Generic query to see what we have
    const sampleQuery = 'from(bucket: "' + env.influx.bucket + '") |> range(start: -1h) |> limit(n: 5)';
    try {
      const data = await influxClient.query(sampleQuery);
      console.log('Raw InfluxDB Rows (First 2):');
      console.log(JSON.stringify(data.slice(0, 2), null, 2));
    } catch (e) {
      console.error('InfluxDB Query Failed:', e);
    }
  }

  // 2. Claude Test
  console.log('\n2. Testing Claude Translation...');
  const userQuery = 'Show me the temperature in the living room for the last hour';
  const schemaContext = 'Bucket: ' + env.influx.bucket + ', Measurements: sensor, Fields: temperature';
  
  try {
    const llmResponse = await llmService.processQuery(userQuery, schemaContext);
    console.log('Claude Response for: "' + userQuery + '"');
    console.log(JSON.stringify(llmResponse, null, 2));
  } catch (e) {
    console.error('Claude Request Failed:', e);
  }

  console.log('\n--- DIAGNOSTICS COMPLETE ---');
}

debug();
