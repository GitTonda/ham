import { InfluxDB } from '@influxdata/influxdb-client';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.INFLUXDB_URL;
const token = process.env.INFLUXDB_TOKEN;
const org = process.env.INFLUXDB_ORG;

console.log('Testing InfluxDB Connection...');
console.log('URL:', url);
console.log('Org:', org);
console.log('Token length:', token?.length);
if (token?.endsWith('>')) {
  console.log('WARNING: Token ends with ">". This is likely a copy-paste error.');
}

const client = new InfluxDB({ url: url!, token: token! });
const queryApi = client.getQueryApi(org!);

const fluxQuery = 'buckets() |> limit(n: 1)';

async function test() {
  try {
    const rows = await queryApi.collectRows(fluxQuery);
    console.log('SUCCESS: Connected to InfluxDB.');
    console.log('Buckets found:', rows.length);
  } catch (err: any) {
    console.error('FAILURE: Could not connect to InfluxDB.');
    console.error('Error Code:', err.code);
    console.error('Error Message:', err.message);
    if (err.message.includes('401')) {
      console.log('Suggestion: Check your Token and Org name.');
    } else if (err.code === 'ECONNREFUSED' || err.message.includes('fetch failed')) {
      console.log('Suggestion: Check if InfluxDB is running and the URL is correct.');
      console.log('If running in Docker, "localhost" refers to the container, not the host.');
    }
  }
}

test();
