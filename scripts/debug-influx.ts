import { InfluxDB } from '@influxdata/influxdb-client';
import * as dotenv from 'dotenv';
dotenv.config();

const token = process.env.INFLUXDB_TOKEN;
const org = process.env.INFLUXDB_ORG;

const targets = [
  'http://localhost:8086',
  'http://127.0.0.1:8086',
  'http://172.26.24.157:8086',
  'http://host.docker.internal:8086'
];

async function testTarget(url: string) {
  console.log(`Testing: ${url}...`);
  const client = new InfluxDB({ url, token: token! });
  const queryApi = client.getQueryApi(org!);
  try {
    await queryApi.collectRows('buckets() |> limit(n: 1)');
    console.log(`✅ SUCCESS: ${url}`);
    return true;
  } catch (err: any) {
    console.log(`❌ FAILED: ${url} (${err.message || err.code})`);
    return false;
  }
}

async function run() {
  for (const url of targets) {
    await testTarget(url);
  }
}

run();
