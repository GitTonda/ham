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

    // Provide rich context about the schema to the LLM
    const schemaContext = `
      Bucket: ${env.influx.bucket}
      Primary Measurement: 'mqtt_consumer'
      Primary Tag: 'topic' (contains the Home Assistant entity path)
      Primary Field: 'value' (numeric strings or status strings)
      
      Topic Structure Guidelines:
      - Sensors: 'homeassistant/sensor/[entity_name]/state'
      - Weather: 'homeassistant/weather/[location]/[attribute]'
      - Automation: 'homeassistant/automation/[name]/current'
      
      When generating Flux:
      - Always use range(start: [requested_range])
      - Filter by measurement 'mqtt_consumer'
      - Filter by topic tag using regex or exact match
      - Filter by field 'value'
      - If user asks for temperature, look for topics containing 'temperature' or 'temp'.
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
