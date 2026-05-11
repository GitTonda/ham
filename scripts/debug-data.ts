import * as dotenv from 'dotenv';
dotenv.config();
import { influxClient } from '../lib/influx-client';
import { summarizeData } from '../lib/data-summarizer';

async function debugData() {
  console.log('Sampling data from InfluxDB...');
  const bucket = process.env.INFLUXDB_BUCKET || 'ha_pfd';
  
  try {
    // 1. List Measurements
    console.log(`\n--- Measurements in bucket "${bucket}" ---`);
    const measurementsQuery = `import "influxdata/influxdb/schema"
schema.measurements(bucket: "${bucket}")`;
    const measurements = await influxClient.query(measurementsQuery);
    console.log(measurements.map(m => m._value).slice(0, 10));

    // 2. Sample 5 points from a common measurement
    console.log('\n--- Raw Data Sample (First 5 points) ---');
    const rawSampleQuery = `from(bucket: "${bucket}") 
  |> range(start: -24h) 
  |> limit(n: 5)`;
    const rawData = await influxClient.query(rawSampleQuery);
    console.log(JSON.stringify(rawData, null, 2));

    // 3. Test App Interpretation (Summarizer)
    if (rawData.length > 0) {
      console.log('\n--- App Summary Interpretation ---');
      const signature = summarizeData(rawData, rawData[0]._field || 'unknown');
      console.log(signature);
    }

  } catch (error: any) {
    console.error('Error during data sampling:', error.message);
  }
}

debugData();
