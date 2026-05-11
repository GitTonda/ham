import { NextRequest, NextResponse } from 'next/server';
import { llmService } from '@/lib/llm-service';
import { influxClient } from '@/lib/influx-client';
import { summarizeData } from '@/lib/data-summarizer';
import { env } from '@/config/env';

/**
 * Chat API Route.
 * Translates natural language queries to data insights.
 */
export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Provide context about the schema to the LLM
    const schemaContext = `
      Bucket: ${env.influx.bucket}
      Measurements: 'mqtt_consumer'
      Fields: 'value' (often string-wrapped numbers or status strings)
      Key Tags: 'topic', 'host'
      Topic Structure examples:
      - 'homeassistant/sensor/pi_hole_dns_queries_today/state'
      - 'homeassistant/weather/forecast_casa/temperature'
      - 'homeassistant/automation/accendi_freecooling/current'
    `;

    // 1. Get Flux Query and Insight from LLM
    const llmInsight = await llmService.processQuery(query, schemaContext);

    const fluxQuery = llmInsight.fluxQuery || `from(bucket: "${env.influx.bucket}") |> range(start: -1h) |> limit(n: 10)`;

    // 2. Execute Flux Query
    const rawData = await influxClient.query(fluxQuery);

    // 3. Summarize Data
    const signature = summarizeData(rawData, 'Result');

    return NextResponse.json({
      insightText: llmInsight.insightText,
      suggestedChartType: llmInsight.suggestedChartType,
      data: rawData,
      signature,
      fluxQuery: llmInsight.fluxQuery, // Ensure fluxQuery is returned
      usage: llmInsight.usage, // Pass through usage from service
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
