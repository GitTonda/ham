import { InfluxDB } from '@influxdata/influxdb-client';
import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

async function debug() {
  console.log('--- STARTING DIAGNOSTICS ---\n');

  const influxUrl = process.env.INFLUXDB_URL;
  const influxToken = process.env.INFLUXDB_TOKEN.trim();
  const influxOrg = process.env.INFLUXDB_ORG.trim();
  const influxBucket = process.env.INFLUXDB_BUCKET.trim();
  const anthropicKey = process.env.ANTHROPIC_API_KEY.trim();

  // 1. InfluxDB Test
  console.log('1. Testing InfluxDB Connectivity...');
  try {
    const influxClient = new InfluxDB({ url: influxUrl, token: influxToken });
    const queryApi = influxClient.getQueryApi(influxOrg);
    const sampleQuery = `from(bucket: "${influxBucket}") |> range(start: -24h) |> limit(n: 2)`;
    
    const rows = [];
    await new Promise((resolve, reject) => {
      queryApi.queryRows(sampleQuery, {
        next(row, tableMeta) { rows.push(tableMeta.toObject(row)); },
        error(err) { reject(err); },
        complete() { resolve(); },
      });
    });
    console.log('Raw InfluxDB Rows:');
    console.log(JSON.stringify(rows, null, 2));
  } catch (e) {
    console.error('InfluxDB Query Failed:', e.message);
  }

  // 2. Claude Test
  console.log('\n2. Testing Claude Translation...');
  try {
    const anthropic = new Anthropic({ apiKey: anthropicKey });
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      messages: [{ 
        role: 'user', 
        content: `Respond ONLY with a JSON object for query "Living room temperature" for bucket "${influxBucket}". Fields: fluxQuery, insightText, suggestedChartType.` 
      }],
    });
    console.log('Claude Response:');
    console.log(response.content[0].text);
  } catch (e) {
    console.error('Claude Request Failed:', e.message);
  }

  console.log('\n--- DIAGNOSTICS COMPLETE ---');
}

debug();
